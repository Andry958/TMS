using System.Security.Claims;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;

namespace TMS.Controllers;

/// <summary>Company-scoped finance, warehouse, and document endpoints.</summary>
[ApiController]
[Authorize]
[Route("api")]
public sealed class BusinessModulesController : ControllerBase
{
    private const long MaxFileBytes = 20 * 1024 * 1024;
    private static readonly IReadOnlyDictionary<string, string> AllowedFileTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        [".pdf"] = "application/pdf",
        [".doc"] = "application/msword",
        [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".txt"] = "text/plain"
    };

    private readonly TMSDbContext _db;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<BusinessModulesController> _logger;

    public BusinessModulesController(TMSDbContext db, IWebHostEnvironment environment, ILogger<BusinessModulesController> logger)
    {
        _db = db;
        _environment = environment;
        _logger = logger;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<int?> CompanyIdAsync(CancellationToken cancellationToken) =>
        UserId is { } id
            ? await _db.Users.Where(user => user.Id == id).Select(user => user.CompanyId).SingleOrDefaultAsync(cancellationToken)
            : null;

    [HttpGet("finance")]
    public async Task<ActionResult<IReadOnlyList<FinanceEntryResponse>>> GetFinance(CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var rows = await _db.FinanceEntries.AsNoTracking()
            .Where(item => item.CompanyId == companyId.Value)
            .OrderByDescending(item => item.Date).ThenByDescending(item => item.Id)
            .Select(item => ToFinanceResponse(item))
            .ToListAsync(cancellationToken);
        return Ok(rows);
    }

    [HttpPost("finance")]
    public async Task<ActionResult<FinanceEntryResponse>> CreateFinance([FromBody] FinanceEntryRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        var userId = UserId;
        if (!companyId.HasValue || userId is null) return Forbid();
        var validation = ValidateFinance(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var entry = new FinanceEntry { CompanyId = companyId.Value, CreatedByUserId = userId };
        ApplyFinance(entry, request);
        _db.FinanceEntries.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetFinanceEntry), new { id = entry.Id }, ToFinanceResponse(entry));
    }

    [HttpGet("finance/{id:int}")]
    public async Task<ActionResult<FinanceEntryResponse>> GetFinanceEntry(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var entry = await _db.FinanceEntries.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        return entry is null ? NotFound() : Ok(ToFinanceResponse(entry));
    }

    [HttpPut("finance/{id:int}")]
    public async Task<ActionResult<FinanceEntryResponse>> UpdateFinance(int id, [FromBody] FinanceEntryRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var entry = await _db.FinanceEntries.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (entry is null) return NotFound();
        var validation = ValidateFinance(request);
        if (validation is not null) return BadRequest(new { message = validation });
        ApplyFinance(entry, request);
        entry.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(ToFinanceResponse(entry));
    }

    [HttpDelete("finance/{id:int}")]
    public async Task<IActionResult> DeleteFinance(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var entry = await _db.FinanceEntries.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (entry is null) return NotFound();
        _db.FinanceEntries.Remove(entry);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("warehouse/products")]
    public async Task<ActionResult<IReadOnlyList<WarehouseProductResponse>>> GetProducts(CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var products = await _db.WarehouseProducts.AsNoTracking()
            .Where(item => item.CompanyId == companyId.Value)
            .OrderBy(item => item.Name)
            .Select(item => ToProductResponse(item))
            .ToListAsync(cancellationToken);
        return Ok(products);
    }

    [HttpPost("warehouse/products")]
    public async Task<ActionResult<WarehouseProductResponse>> CreateProduct([FromBody] WarehouseProductRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        var userId = UserId;
        if (!companyId.HasValue || userId is null) return Forbid();
        var validation = ValidateProduct(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var product = new WarehouseProduct { CompanyId = companyId.Value, CreatedByUserId = userId };
        ApplyProduct(product, request);
        _db.WarehouseProducts.Add(product);
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (exception.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            _logger.LogWarning(exception, "Duplicate SKU creating warehouse product for company {CompanyId}.", companyId);
            return Conflict(new { message = "Такий артикул уже існує у вашому складі." });
        }
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, ToProductResponse(product));
    }

    [HttpGet("warehouse/products/{id:int}")]
    public async Task<ActionResult<WarehouseProductResponse>> GetProduct(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var product = await _db.WarehouseProducts.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        return product is null ? NotFound() : Ok(ToProductResponse(product));
    }

    [HttpPut("warehouse/products/{id:int}")]
    public async Task<ActionResult<WarehouseProductResponse>> UpdateProduct(int id, [FromBody] WarehouseProductRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var product = await _db.WarehouseProducts.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (product is null) return NotFound();
        var validation = ValidateProduct(request);
        if (validation is not null) return BadRequest(new { message = validation });
        ApplyProduct(product, request);
        product.UpdatedAt = DateTime.UtcNow;
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            _logger.LogWarning(exception, "Duplicate SKU updating warehouse product {ProductId}.", id);
            return Conflict(new { message = "Такий артикул уже існує у вашому складі." });
        }
        return Ok(ToProductResponse(product));
    }

    [HttpDelete("warehouse/products/{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var product = await _db.WarehouseProducts.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (product is null) return NotFound();
        if (await _db.WarehouseMovements.AnyAsync(item => item.ProductId == id && item.CompanyId == companyId.Value, cancellationToken))
            return Conflict(new { message = "Неможливо видалити товар, для якого вже є операції. Натомість встановіть нульовий залишок." });
        _db.WarehouseProducts.Remove(product);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("warehouse/movements")]
    public async Task<ActionResult<IReadOnlyList<WarehouseMovementResponse>>> GetMovements(CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var rows = await _db.WarehouseMovements.AsNoTracking()
            .Where(item => item.CompanyId == companyId.Value)
            .OrderByDescending(item => item.CreatedAt).ThenByDescending(item => item.Id)
            .Select(item => new WarehouseMovementResponse(item.Id, item.ProductId, item.Product.Name, item.Type, item.Quantity, item.Product.Unit, item.Comment, item.CreatedAt))
            .Take(500)
            .ToListAsync(cancellationToken);
        return Ok(rows);
    }

    [HttpPost("warehouse/products/{id:int}/movements")]
    public async Task<ActionResult<WarehouseMovementResponse>> CreateMovement(int id, [FromBody] WarehouseMovementRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        var userId = UserId;
        if (!companyId.HasValue || userId is null) return Forbid();
        if (request.Quantity <= 0 || request.Quantity > 1_000_000_000m)
            return BadRequest(new { message = "Кількість має бути більшою за нуль і не перевищувати 1 000 000 000." });
        if (request.Type is not ("in" or "out"))
            return BadRequest(new { message = "Тип операції має бути in або out." });
        await using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        var product = await _db.WarehouseProducts.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (product is null) return NotFound();
        var delta = request.Type == "in" ? request.Quantity : -request.Quantity;
        if (product.Quantity + delta < 0) return Conflict(new { message = "Недостатньо товару на залишку для видачі." });
        product.Quantity += delta;
        product.UpdatedAt = DateTime.UtcNow;
        var movement = new WarehouseMovement
        {
            CompanyId = companyId.Value,
            ProductId = product.Id,
            CreatedByUserId = userId,
            Type = request.Type,
            Quantity = request.Quantity,
            Comment = request.Comment?.Trim() ?? "",
            CreatedAt = DateTime.UtcNow
        };
        _db.WarehouseMovements.Add(movement);
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return CreatedAtAction(nameof(GetMovement), new { id = movement.Id },
            new WarehouseMovementResponse(movement.Id, product.Id, product.Name, movement.Type, movement.Quantity, product.Unit, movement.Comment, movement.CreatedAt));
    }

    [HttpGet("warehouse/movements/{id:int}")]
    public async Task<ActionResult<WarehouseMovementResponse>> GetMovement(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var item = await _db.WarehouseMovements.AsNoTracking()
            .Where(movement => movement.Id == id && movement.CompanyId == companyId.Value)
            .Select(movement => new WarehouseMovementResponse(movement.Id, movement.ProductId, movement.Product.Name,
                movement.Type, movement.Quantity, movement.Product.Unit, movement.Comment, movement.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("documents")]
    public async Task<ActionResult<IReadOnlyList<CompanyDocumentResponse>>> GetDocuments(CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var documents = await _db.CompanyDocuments.AsNoTracking()
            .Where(item => item.CompanyId == companyId.Value)
            .Include(item => item.Files)
            .OrderBy(item => item.ExpiryDate == null).ThenBy(item => item.ExpiryDate).ThenByDescending(item => item.CreatedAt)
            .Select(item => ToDocumentResponse(item))
            .ToListAsync(cancellationToken);
        return Ok(documents);
    }

    [HttpPost("documents")]
    public async Task<ActionResult<CompanyDocumentResponse>> CreateDocument([FromBody] CompanyDocumentRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        var userId = UserId;
        if (!companyId.HasValue || userId is null) return Forbid();
        var validation = ValidateDocument(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var document = new CompanyDocument { CompanyId = companyId.Value, CreatedByUserId = userId };
        ApplyDocument(document, request);
        _db.CompanyDocuments.Add(document);
        await _db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, ToDocumentResponse(document));
    }

    [HttpGet("documents/{id:int}")]
    public async Task<ActionResult<CompanyDocumentResponse>> GetDocument(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var document = await _db.CompanyDocuments.AsNoTracking().Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        return document is null ? NotFound() : Ok(ToDocumentResponse(document));
    }

    [HttpPut("documents/{id:int}")]
    public async Task<ActionResult<CompanyDocumentResponse>> UpdateDocument(int id, [FromBody] CompanyDocumentRequest request, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var document = await _db.CompanyDocuments.Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (document is null) return NotFound();
        var validation = ValidateDocument(request);
        if (validation is not null) return BadRequest(new { message = validation });
        ApplyDocument(document, request);
        document.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(ToDocumentResponse(document));
    }

    [HttpDelete("documents/{id:int}")]
    public async Task<IActionResult> DeleteDocument(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var document = await _db.CompanyDocuments.Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (document is null) return NotFound();
        var names = document.Files.Select(file => file.StorageFileName).ToList();
        _db.CompanyDocuments.Remove(document);
        await _db.SaveChangesAsync(cancellationToken);
        DeleteStoredFiles(names);
        return NoContent();
    }

    [HttpPost("documents/{id:int}/file")]
    [RequestSizeLimit(MaxFileBytes + 1024 * 1024)]
    public async Task<ActionResult<DocumentFileResponse>> UploadDocumentFile(int id, IFormFile? file, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var document = await _db.CompanyDocuments.Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (document is null) return NotFound();
        var validation = await ValidateUploadAsync(file, cancellationToken);
        if (validation is not null) return BadRequest(new { message = validation });

        var upload = file!;
        var extension = Path.GetExtension(upload.FileName).ToLowerInvariant();
        var storageName = $"{Guid.NewGuid():N}{extension}";
        var storagePath = GetStoragePath(storageName);
        Directory.CreateDirectory(Path.GetDirectoryName(storagePath)!);
        try
        {
            await using (var output = new FileStream(storagePath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
                await upload.CopyToAsync(output, cancellationToken);

            var previousNames = document.Files.Select(item => item.StorageFileName).ToList();
            _db.CompanyDocumentFiles.RemoveRange(document.Files);
            var metadata = new CompanyDocumentFile
            {
                CompanyDocumentId = document.Id,
                StorageFileName = storageName,
                OriginalFileName = Path.GetFileName(upload.FileName),
                ContentType = AllowedFileTypes[extension],
                SizeBytes = upload.Length,
                UploadedAt = DateTime.UtcNow
            };
            _db.CompanyDocumentFiles.Add(metadata);
            document.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
            DeleteStoredFiles(previousNames);
            return Ok(ToFileResponse(metadata));
        }
        catch (Exception exception) when (exception is IOException or DbUpdateException or UnauthorizedAccessException)
        {
            _logger.LogError(exception, "Could not save company document file for document {DocumentId}.", id);
            if (System.IO.File.Exists(storagePath)) System.IO.File.Delete(storagePath);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Не вдалося зберегти файл документа." });
        }
    }

    [HttpGet("documents/{id:int}/file")]
    public async Task<IActionResult> GetDocumentFile(int id, [FromQuery] bool download = false, CancellationToken cancellationToken = default)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var file = await _db.CompanyDocumentFiles.AsNoTracking()
            .Where(item => item.CompanyDocumentId == id && item.Document.CompanyId == companyId.Value)
            .OrderByDescending(item => item.UploadedAt).FirstOrDefaultAsync(cancellationToken);
        if (file is null) return NotFound();
        var path = GetStoragePath(file.StorageFileName);
        if (!System.IO.File.Exists(path)) return NotFound(new { message = "Файл документа не знайдено у сховищі." });
        var inline = !download && file.ContentType is ("application/pdf" or "image/png" or "image/jpeg" or "text/plain");
        var disposition = new ContentDispositionHeaderValue(inline ? "inline" : "attachment");
        disposition.SetHttpFileName(Path.GetFileName(file.OriginalFileName));
        Response.Headers.ContentDisposition = disposition.ToString();
        return PhysicalFile(path, file.ContentType, enableRangeProcessing: inline);
    }

    [HttpDelete("documents/{id:int}/file")]
    public async Task<IActionResult> DeleteDocumentFile(int id, CancellationToken cancellationToken)
    {
        var companyId = await CompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        var file = await _db.CompanyDocumentFiles.FirstOrDefaultAsync(item =>
            item.CompanyDocumentId == id && item.Document.CompanyId == companyId.Value, cancellationToken);
        if (file is null) return NotFound();
        var name = file.StorageFileName;
        _db.CompanyDocumentFiles.Remove(file);
        await _db.SaveChangesAsync(cancellationToken);
        DeleteStoredFiles([name]);
        return NoContent();
    }

    private static string? ValidateFinance(FinanceEntryRequest request)
    {
        if (request.Type is not ("income" or "expense")) return "Тип запису має бути income або expense.";
        if (string.IsNullOrWhiteSpace(request.Description)) return "Опис є обов'язковим.";
        if (request.Description.Length > 300 || request.Category?.Length > 80) return "Перевищено допустиму довжину тексту.";
        if (request.Amount <= 0 || request.Amount > 1_000_000_000m) return "Сума має бути більшою за нуль і не перевищувати 1 000 000 000.";
        if (request.Currency is not ("UAH" or "EUR" or "USD" or "PLN" or "GBP")) return "Непідтримувана валюта.";
        if (request.Status is not ("planned" or "paid")) return "Стан має бути planned або paid.";
        if (request.Date == default) return "Вкажіть дату запису.";
        return null;
    }

    private static void ApplyFinance(FinanceEntry entry, FinanceEntryRequest request)
    {
        entry.Type = request.Type;
        entry.Category = request.Category?.Trim() ?? "";
        entry.Description = request.Description.Trim();
        entry.Amount = request.Amount;
        entry.Currency = request.Currency;
        entry.Status = request.Status;
        entry.Date = request.Date;
        if (entry.CreatedAt == default) entry.CreatedAt = DateTime.UtcNow;
        entry.UpdatedAt = DateTime.UtcNow;
    }

    private static FinanceEntryResponse ToFinanceResponse(FinanceEntry entry) =>
        new(entry.Id, entry.Type, entry.Category, entry.Description, entry.Amount, entry.Currency, entry.Status, entry.Date, entry.CreatedAt, entry.UpdatedAt);

    private static string? ValidateProduct(WarehouseProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 200) return "Назва товару є обов'язковою і має бути до 200 символів.";
        if (request.Sku?.Length > 80 || request.Category?.Length > 100) return "Перевищено допустиму довжину артикулу або категорії.";
        if (string.IsNullOrWhiteSpace(request.Unit) || request.Unit.Length > 20) return "Вкажіть одиницю виміру до 20 символів.";
        if (request.Quantity < 0 || request.MinimumQuantity < 0) return "Залишки не можуть бути від'ємними.";
        return null;
    }

    private static void ApplyProduct(WarehouseProduct product, WarehouseProductRequest request)
    {
        product.Name = request.Name.Trim();
        product.Sku = request.Sku?.Trim() ?? "";
        product.Category = request.Category?.Trim() ?? "";
        product.Unit = request.Unit.Trim();
        product.Quantity = request.Quantity;
        product.MinimumQuantity = request.MinimumQuantity;
        if (product.CreatedAt == default) product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
    }

    private static WarehouseProductResponse ToProductResponse(WarehouseProduct product) =>
        new(product.Id, product.Name, product.Sku, product.Category, product.Unit, product.Quantity, product.MinimumQuantity, product.CreatedAt, product.UpdatedAt);

    private static string? ValidateDocument(CompanyDocumentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200) return "Назва документа є обов'язковою і має бути до 200 символів.";
        if (request.Type.Length > 40 || request.Number?.Length > 100 || request.Owner?.Length > 200 || request.Status.Length > 30 || request.Notes?.Length > 1000)
            return "Перевищено допустиму довжину одного з полів документа.";
        if (request.IssueDate.HasValue && request.ExpiryDate.HasValue && request.ExpiryDate < request.IssueDate)
            return "Дата завершення не може бути раніше дати документа.";
        return null;
    }

    private static void ApplyDocument(CompanyDocument document, CompanyDocumentRequest request)
    {
        document.Title = request.Title.Trim();
        document.Type = request.Type.Trim();
        document.Number = request.Number?.Trim() ?? "";
        document.Owner = request.Owner?.Trim() ?? "";
        document.IssueDate = request.IssueDate;
        document.ExpiryDate = request.ExpiryDate;
        document.Status = request.Status.Trim();
        document.Notes = request.Notes?.Trim() ?? "";
        if (document.CreatedAt == default) document.CreatedAt = DateTime.UtcNow;
        document.UpdatedAt = DateTime.UtcNow;
    }

    private static CompanyDocumentResponse ToDocumentResponse(CompanyDocument document) =>
        new(document.Id, document.Title, document.Type, document.Number, document.Owner, document.IssueDate, document.ExpiryDate,
            document.Status, document.Notes, document.CreatedAt, document.UpdatedAt, document.Files.Select(ToFileResponse).ToArray());

    private static DocumentFileResponse ToFileResponse(CompanyDocumentFile file) =>
        new(file.Id, file.OriginalFileName, file.ContentType, file.SizeBytes, file.UploadedAt);

    private async Task<string?> ValidateUploadAsync(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0) return "Оберіть файл.";
        if (file.Length > MaxFileBytes) return "Розмір файла не може перевищувати 20 МБ.";
        var extension = Path.GetExtension(file.FileName);
        if (!AllowedFileTypes.TryGetValue(extension, out var contentType)) return "Підтримуються PDF, DOC, DOCX, TXT, PNG та JPEG.";
        if (!string.IsNullOrWhiteSpace(file.ContentType) && file.ContentType != "application/octet-stream" &&
            !string.Equals(file.ContentType, contentType, StringComparison.OrdinalIgnoreCase))
            return "Тип вмісту файла не відповідає його розширенню.";
        await using var stream = file.OpenReadStream();
        var header = new byte[8];
        var read = await stream.ReadAsync(header.AsMemory(), cancellationToken);
        var valid = extension.ToLowerInvariant() switch
        {
            ".pdf" => read >= 4 && header.AsSpan(0, 4).SequenceEqual("%PDF"u8),
            ".png" => read >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".jpg" or ".jpeg" => read >= 3 && header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff,
            ".docx" => read >= 4 && header[0] == 0x50 && header[1] == 0x4b,
            ".doc" => read >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1 }),
            ".txt" => read > 0 && !header.AsSpan(0, read).Contains((byte)0),
            _ => false
        };
        return valid ? null : "Вміст файла не відповідає дозволеному формату.";
    }

    private string GetStoragePath(string fileName)
    {
        if (Path.GetFileName(fileName) != fileName) throw new InvalidOperationException("Invalid storage file name.");
        return Path.Combine(_environment.ContentRootPath, "App_Data", "CompanyDocuments", fileName);
    }

    private void DeleteStoredFiles(IEnumerable<string> names)
    {
        foreach (var name in names)
        {
            try
            {
                var path = GetStoragePath(name);
                if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
            }
            catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
            {
                _logger.LogError(exception, "Could not remove company document file {FileName}.", name);
            }
        }
    }
}

/// <summary>Request to create or update a company finance entry.</summary>
public sealed record FinanceEntryRequest(string Type, string? Category, string Description, decimal Amount, string Currency, string Status, DateOnly Date);

/// <summary>Finance entry returned by the API.</summary>
public sealed record FinanceEntryResponse(int Id, string Type, string Category, string Description, decimal Amount, string Currency, string Status, DateOnly Date, DateTime CreatedAt, DateTime UpdatedAt);

/// <summary>Request to create or update a warehouse product.</summary>
public sealed record WarehouseProductRequest(string Name, string? Sku, string? Category, string Unit, decimal Quantity, decimal MinimumQuantity);

/// <summary>Warehouse product returned by the API.</summary>
public sealed record WarehouseProductResponse(int Id, string Name, string Sku, string Category, string Unit, decimal Quantity, decimal MinimumQuantity, DateTime CreatedAt, DateTime UpdatedAt);

/// <summary>Request to record a stock-in or stock-out movement.</summary>
public sealed record WarehouseMovementRequest(string Type, decimal Quantity, string? Comment);

/// <summary>Warehouse movement returned by the API.</summary>
public sealed record WarehouseMovementResponse(int Id, int ProductId, string ProductName, string Type, decimal Quantity, string Unit, string Comment, DateTime CreatedAt);

/// <summary>Request to create or update a company document card.</summary>
public sealed record CompanyDocumentRequest(string Title, string Type, string? Number, string? Owner, DateOnly? IssueDate, DateOnly? ExpiryDate, string Status, string? Notes);

/// <summary>Stored document file metadata.</summary>
public sealed record DocumentFileResponse(int Id, string OriginalFileName, string ContentType, long SizeBytes, DateTime UploadedAt);

/// <summary>Company document returned by the API.</summary>
public sealed record CompanyDocumentResponse(int Id, string Title, string Type, string Number, string Owner, DateOnly? IssueDate, DateOnly? ExpiryDate, string Status, string Notes, DateTime CreatedAt, DateTime UpdatedAt, IReadOnlyList<DocumentFileResponse> Files);
