using System.Net.Mime;
using System.Security.Claims;
using System.Text.Json;
using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TMS.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly TMSDbContext _db;
    private readonly IWebHostEnvironment _environment;
    private static readonly HashSet<string> AllowedCategories = new(StringComparer.OrdinalIgnoreCase)
        { "transport", "trip", "vehicle", "client", "company", "cargo" };
    private const long MaxDocumentBytes = 20 * 1024 * 1024;

    public OrdersController(TMSDbContext db, IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<int?> GetCompanyIdAsync()
    {
        var userId = CurrentUserId;
        return userId is null
            ? null
            : await _db.Users.Where(user => user.Id == userId)
                .Select(user => user.CompanyId)
                .SingleOrDefaultAsync();
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions()
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var companyName = await _db.Companies
            .Where(company => company.Id == companyId.Value)
            .Select(company => company.Name)
            .SingleOrDefaultAsync();
        var managers = await _db.Users.AsNoTracking()
            .Where(user => user.CompanyId == companyId.Value)
            .OrderBy(user => user.LastName)
            .ThenBy(user => user.FirstName)
            .Select(user => new OrderManagerOption(
                user.Id,
                user.FirstName == null && user.LastName == null
                    ? user.Email ?? ""
                    : ((user.FirstName ?? "") + " " + (user.LastName ?? "")).Trim(),
                user.Email ?? ""))
            .ToListAsync();

        return Ok(new
        {
            companyName,
            currentUserId = CurrentUserId,
            managers
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int? clientId = null,
        [FromQuery] TransportOrderStatus? status = null,
        [FromQuery] string? search = null,
        [FromQuery] DateOnly? loadingFrom = null,
        [FromQuery] DateOnly? loadingTo = null)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var query = _db.TransportOrders.AsNoTracking()
            .Where(order => order.CompanyId == companyId.Value);
        if (clientId.HasValue) query = query.Where(order => order.ClientCompanyId == clientId.Value);
        if (status.HasValue) query = query.Where(order => order.Status == status.Value);
        if (loadingFrom.HasValue) query = query.Where(order =>
            (order.DeliveryDate ?? order.LoadingDate) >= loadingFrom.Value);
        if (loadingTo.HasValue) query = query.Where(order =>
            (order.LoadingDate ?? order.DeliveryDate) <= loadingTo.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(order =>
                order.Client.Name.Contains(term) ||
                (order.ClientOrderNumber != null && order.ClientOrderNumber.Contains(term)) ||
                order.LoadingCity!.Contains(term) ||
                order.DeliveryCity!.Contains(term));
        }

        var orders = await query
            .Include(order => order.Client)
            .Include(order => order.ClientContact)
            .Include(order => order.FleetVehicle)
            .Include(order => order.Documents)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync();
        return Ok(await ToResponsesAsync(orders, companyId.Value));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var order = await _db.TransportOrders.AsNoTracking()
            .Include(item => item.Client)
            .Include(item => item.ClientContact)
            .Include(item => item.FleetVehicle)
            .Include(item => item.Documents)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (order is null) return NotFound();

        return Ok((await ToResponsesAsync([order], companyId.Value)).Single());
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateTransportOrder request)
    {
        var companyId = await GetCompanyIdAsync();
        var currentUserId = CurrentUserId;
        if (!companyId.HasValue || currentUserId is null) return Forbid();
        if (request.OrderDate == default)
            return BadRequest(new { message = "Вкажіть дату замовлення." });
        if (request.DeliveryDate.HasValue && request.LoadingDate.HasValue &&
            request.DeliveryDate.Value < request.LoadingDate.Value)
            return BadRequest(new { message = "Дата доставки не може бути раніше дати завантаження." });

        var client = await _db.ClientCompanies.AsNoTracking()
            .FirstOrDefaultAsync(item =>
                item.Id == request.ClientCompanyId && item.ParentCompanyId == companyId.Value);
        if (client is null) return BadRequest(new { message = "Оберіть клієнта вашої компанії." });

        var contactValidation = await ValidateContactAsync(request.ClientContactId, client.Id);
        if (contactValidation is not null) return BadRequest(new { message = contactValidation });

        if (request.FleetVehicleId.HasValue &&
            !await _db.FleetVehicles.AnyAsync(vehicle =>
                vehicle.Id == request.FleetVehicleId.Value && vehicle.CompanyId == companyId.Value))
            return BadRequest(new { message = "Оберіть автопоїзд вашої компанії." });

        var managerIds = NormalizeManagerIds(request.AdditionalManagerUserIds, request.ManagerUserId);
        var managerValidation = await ValidateManagersAsync(companyId.Value, request.ManagerUserId, managerIds);
        if (managerValidation is not null) return BadRequest(new { message = managerValidation });

        TransportRequest? sourceRequest = null;
        if (request.SourceRequestId.HasValue)
        {
            sourceRequest = await _db.TransportRequests.FirstOrDefaultAsync(item =>
                item.Id == request.SourceRequestId.Value && item.CompanyId == companyId.Value);
            if (sourceRequest is null) return BadRequest(new { message = "Запит не знайдено." });
            if (sourceRequest.Status != TransportRequestStatus.Confirmed)
                return BadRequest(new { message = "До замовлення можна перевести лише підтверджений запит." });
            if (sourceRequest.ClientCompanyId != client.Id)
                return BadRequest(new { message = "Клієнт замовлення має збігатися з клієнтом запиту." });
            if (await _db.TransportOrders.AnyAsync(order => order.SourceRequestId == sourceRequest.Id))
                return Conflict(new { message = "Для цього запиту вже створено замовлення." });
        }

        var now = DateTime.UtcNow;
        var order = new TransportOrder
        {
            CompanyId = companyId.Value,
            ClientCompanyId = client.Id,
            FleetVehicleId = request.FleetVehicleId,
            ClientContactId = request.ClientContactId,
            ManagerUserId = request.ManagerUserId,
            AdditionalManagerUserIds = JsonSerializer.Serialize(managerIds),
            SourceRequest = sourceRequest,
            ClientOrderNumber = Clean(request.ClientOrderNumber),
            OrderDate = request.OrderDate,
            Tags = Clean(request.Tags),
            ContractNumber = Clean(request.ContractNumber),
            InitialRate = request.InitialRate,
            Currency = request.Currency,
            VatRate = request.VatRate,
            PaymentTerms = Clean(request.PaymentTerms),
            PaymentDelayDays = request.PaymentDelayDays,
            LoadingCity = Clean(request.LoadingCity) ?? sourceRequest?.LoadingCity,
            LoadingAddress = Clean(request.LoadingAddress) ?? sourceRequest?.LoadingAddress,
            LoadingDate = request.LoadingDate ?? sourceRequest?.LoadingDate,
            DeliveryCity = Clean(request.DeliveryCity) ?? sourceRequest?.DeliveryCity,
            DeliveryAddress = Clean(request.DeliveryAddress) ?? sourceRequest?.DeliveryAddress,
            DeliveryDate = request.DeliveryDate ?? sourceRequest?.DeliveryDate,
            CargoDescription = Clean(request.CargoDescription) ?? sourceRequest?.CargoDescription,
            WeightTons = request.WeightTons ?? sourceRequest?.WeightTons,
            Comment = Clean(request.Comment) ?? sourceRequest?.Comment,
            Status = TransportOrderStatus.New,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.TransportOrders.Add(order);
        if (sourceRequest is not null)
        {
            sourceRequest.Status = TransportRequestStatus.Ordered;
            sourceRequest.PreviousStatus = null;
            sourceRequest.UpdatedAt = now;
        }
        await _db.SaveChangesAsync();

        order.Client = client;
        if (order.FleetVehicleId.HasValue)
        {
            order.FleetVehicle = await _db.FleetVehicles.AsNoTracking()
                .FirstAsync(vehicle => vehicle.Id == order.FleetVehicleId.Value);
        }
        if (order.ClientContactId.HasValue)
        {
            order.ClientContact = await _db.ClientCompanyContacts.AsNoTracking()
                .FirstAsync(item => item.Id == order.ClientContactId.Value);
        }

        var response = (await ToResponsesAsync([order], companyId.Value)).Single();
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] CreateTransportOrder request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var order = await _db.TransportOrders.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value);
        if (order is null) return NotFound();
        if (request.SourceRequestId != order.SourceRequestId)
            return BadRequest(new { message = "Неможливо змінити джерело створення замовлення." });
        if (order.TripId.HasValue && request.FleetVehicleId != order.FleetVehicleId)
            return BadRequest(new { message = "Автопоїзд замовлення в рейсі змінити не можна." });
        if (request.OrderDate == default)
            return BadRequest(new { message = "Вкажіть дату замовлення." });
        if (request.DeliveryDate.HasValue && request.LoadingDate.HasValue &&
            request.DeliveryDate.Value < request.LoadingDate.Value)
            return BadRequest(new { message = "Дата доставки не може бути раніше дати завантаження." });

        var clientExists = await _db.ClientCompanies.AnyAsync(item =>
            item.Id == request.ClientCompanyId && item.ParentCompanyId == companyId.Value);
        if (!clientExists) return BadRequest(new { message = "Оберіть клієнта вашої компанії." });

        var contactValidation = await ValidateContactAsync(request.ClientContactId, request.ClientCompanyId);
        if (contactValidation is not null) return BadRequest(new { message = contactValidation });

        if (request.FleetVehicleId.HasValue &&
            !await _db.FleetVehicles.AnyAsync(vehicle =>
                vehicle.Id == request.FleetVehicleId.Value && vehicle.CompanyId == companyId.Value))
            return BadRequest(new { message = "Оберіть автопоїзд вашої компанії." });

        var managerIds = NormalizeManagerIds(request.AdditionalManagerUserIds, request.ManagerUserId);
        var managerValidation = await ValidateManagersAsync(companyId.Value, request.ManagerUserId, managerIds);
        if (managerValidation is not null) return BadRequest(new { message = managerValidation });

        order.ClientCompanyId = request.ClientCompanyId;
        order.FleetVehicleId = request.FleetVehicleId;
        order.ClientContactId = request.ClientContactId;
        order.ManagerUserId = request.ManagerUserId;
        order.AdditionalManagerUserIds = JsonSerializer.Serialize(managerIds);
        order.ClientOrderNumber = Clean(request.ClientOrderNumber);
        order.OrderDate = request.OrderDate;
        order.Tags = Clean(request.Tags);
        order.ContractNumber = Clean(request.ContractNumber);
        order.InitialRate = request.InitialRate;
        order.Currency = request.Currency;
        order.VatRate = request.VatRate;
        order.PaymentTerms = Clean(request.PaymentTerms);
        order.PaymentDelayDays = request.PaymentDelayDays;
        order.LoadingCity = Clean(request.LoadingCity);
        order.LoadingAddress = Clean(request.LoadingAddress);
        order.LoadingDate = request.LoadingDate;
        order.DeliveryCity = Clean(request.DeliveryCity);
        order.DeliveryAddress = Clean(request.DeliveryAddress);
        order.DeliveryDate = request.DeliveryDate;
        order.CargoDescription = Clean(request.CargoDescription);
        order.WeightTons = request.WeightTons;
        order.Comment = Clean(request.Comment);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var order = await _db.TransportOrders.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value);
        if (order is null) return NotFound();

        if (order.TripId.HasValue)
        {
            var trip = await _db.Trips
                .Include(item => item.Points)
                .FirstOrDefaultAsync(item =>
                    item.Id == order.TripId.Value && item.CompanyId == companyId.Value);
            if (trip is null)
                return Conflict(new { message = "Рейс замовлення не знайдено. Оновіть сторінку та спробуйте ще раз." });
            if (trip.Status == "Завершений")
                return Conflict(new { message = "Не можна видалити замовлення із завершеного рейсу." });

            var remainingOrders = await _db.TransportOrders
                .Where(item => item.TripId == trip.Id && item.CompanyId == companyId.Value && item.Id != id)
                .ToListAsync();
            if (remainingOrders.Count == 0)
            {
                if (await _db.TripExpenses.AnyAsync(item => item.TripId == trip.Id))
                    return Conflict(new { message = "Спочатку видаліть витрати рейсу, перш ніж видаляти останнє замовлення." });

                _db.Trips.Remove(trip);
            }
            else
            {
                var marker = $"Замовлення ORD-{order.Id:D6}";
                _db.TripPoints.RemoveRange(trip.Points.Where(point => point.Comment == marker));
                var remainingDates = remainingOrders
                    .SelectMany(item => new[] { item.LoadingDate, item.DeliveryDate })
                    .Where(date => date.HasValue)
                    .Select(date => date!.Value)
                    .ToList();
                remainingDates.AddRange(trip.Points
                    .Where(point => point.Comment != marker && point.ArrivalAt.HasValue)
                    .Select(point => DateOnly.FromDateTime(point.ArrivalAt!.Value)));
                trip.PlannedStartAt = remainingDates.Count == 0
                    ? null
                    : remainingDates.Min().ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                trip.PlannedEndAt = remainingDates.Count == 0
                    ? null
                    : remainingDates.Max().ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
                trip.UpdatedAt = DateTime.UtcNow;
            }
        }

        if (order.SourceRequestId.HasValue)
        {
            var sourceRequest = await _db.TransportRequests.FirstOrDefaultAsync(request =>
                request.Id == order.SourceRequestId.Value &&
                request.CompanyId == companyId.Value &&
                request.Status == TransportRequestStatus.Ordered);
            if (sourceRequest is not null)
            {
                sourceRequest.Status = TransportRequestStatus.Confirmed;
                sourceRequest.PreviousStatus = null;
                sourceRequest.UpdatedAt = DateTime.UtcNow;
            }
        }

        _db.TransportOrders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/documents")]
    [RequestSizeLimit(MaxDocumentBytes + 1024 * 1024)]
    public async Task<IActionResult> UploadDocument(int id, IFormFile? file, [FromForm] string category = "transport")
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!AllowedCategories.Contains(category)) return BadRequest(new { message = "Оберіть коректну категорію документа." });
        if (file is null || file.Length == 0) return BadRequest(new { message = "Оберіть файл." });
        if (file.Length > MaxDocumentBytes) return BadRequest(new { message = "Розмір файла не може перевищувати 20 МБ." });

        var order = await _db.TransportOrders.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (order is null) return NotFound();

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowed = new HashSet<string> { ".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg" };
        if (!allowed.Contains(extension)) return BadRequest(new { message = "Підтримуються PDF, DOC, DOCX, TXT, PNG та JPEG." });

        var storageName = $"{Guid.NewGuid():N}{extension}";
        var storagePath = Path.Combine(_environment.ContentRootPath, "App_Data", "OrderDocuments", storageName);
        Directory.CreateDirectory(Path.GetDirectoryName(storagePath)!);
        try
        {
            await using var stream = new FileStream(storagePath, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await file.CopyToAsync(stream, HttpContext.RequestAborted);
            var document = new TransportOrderDocument
            {
                TransportOrderId = order.Id,
                Category = category.ToLowerInvariant(),
                StorageFileName = storageName,
                OriginalFileName = Path.GetFileName(file.FileName),
                ContentType = file.ContentType == "application/octet-stream" ? GetContentType(extension) : file.ContentType,
                SizeBytes = file.Length,
                UploadedAt = DateTime.UtcNow
            };
            _db.TransportOrderDocuments.Add(document);
            await _db.SaveChangesAsync();
            return Ok(ToDocumentResponse(document));
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or DbUpdateException)
        {
            if (System.IO.File.Exists(storagePath)) System.IO.File.Delete(storagePath);
            return StatusCode(500, new { message = "Не вдалося зберегти файл документа." });
        }
    }

    [HttpGet("{id:int}/documents/{documentId:int}/file")]
    public async Task<IActionResult> DownloadDocument(int id, int documentId, [FromQuery] bool download = true)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.TransportOrderDocuments.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == documentId && item.TransportOrderId == id && item.TransportOrder.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var path = Path.Combine(_environment.ContentRootPath, "App_Data", "OrderDocuments", document.StorageFileName);
        if (!System.IO.File.Exists(path)) return NotFound(new { message = "Файл документа не знайдено у сховищі." });
        Response.Headers.ContentDisposition = $"{(download ? "attachment" : "inline")}; filename*=UTF-8''{Uri.EscapeDataString(document.OriginalFileName)}";
        return PhysicalFile(path, string.IsNullOrWhiteSpace(document.ContentType) ? GetContentType(Path.GetExtension(document.StorageFileName)) : document.ContentType);
    }

    [HttpDelete("{id:int}/documents/{documentId:int}")]
    public async Task<IActionResult> DeleteDocument(int id, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.TransportOrderDocuments
            .FirstOrDefaultAsync(item => item.Id == documentId && item.TransportOrderId == id && item.TransportOrder.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        _db.TransportOrderDocuments.Remove(document);
        await _db.SaveChangesAsync();
        var path = Path.Combine(_environment.ContentRootPath, "App_Data", "OrderDocuments", document.StorageFileName);
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
        return NoContent();
    }

    private static string GetContentType(string extension) => extension switch
    {
        ".pdf" => "application/pdf", ".png" => "image/png", ".jpg" or ".jpeg" => "image/jpeg",
        ".doc" => "application/msword", ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        _ => "text/plain"
    };

    private static TransportOrderDocumentResponse ToDocumentResponse(TransportOrderDocument document) => new(
        document.Id, document.Category, document.OriginalFileName, document.ContentType, document.SizeBytes, document.UploadedAt);

    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTransportOrderStatus update)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var order = await _db.TransportOrders.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value);
        if (order is null) return NotFound();
        if (!Enum.IsDefined(update.Status))
            return BadRequest(new { message = "Оберіть коректний статус замовлення." });
        if (!CanTransition(order.Status, update.Status))
            return BadRequest(new { message = "Недопустима зміна статусу замовлення." });

        order.PreviousStatus = order.Status;
        order.Status = update.Status;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/status/undo")]
    public async Task<IActionResult> UndoStatus(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var order = await _db.TransportOrders.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value);
        if (order is null) return NotFound();
        if (!order.PreviousStatus.HasValue)
            return BadRequest(new { message = "Для цього замовлення немає статусу, який можна повернути." });

        order.Status = order.PreviousStatus.Value;
        order.PreviousStatus = null;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<List<TransportOrderResponse>> ToResponsesAsync(
        List<TransportOrder> orders,
        int companyId)
    {
        var managerIds = orders
            .SelectMany(order => ParseManagerIds(order.AdditionalManagerUserIds).Append(order.ManagerUserId))
            .Distinct()
            .ToList();
        var users = await _db.Users.AsNoTracking()
            .Where(user => user.CompanyId == companyId && managerIds.Contains(user.Id))
            .ToDictionaryAsync(user => user.Id, user => FormatUserName(user));

        return orders.Select(order =>
        {
            var additionalIds = ParseManagerIds(order.AdditionalManagerUserIds);
            return new TransportOrderResponse
            {
                Id = order.Id,
                OrderNumber = $"ORD-{order.Id:D6}",
                ClientCompanyId = order.ClientCompanyId,
                ClientName = order.Client.Name,
                ClientContactId = order.ClientContactId,
                ClientContactName = order.ClientContact?.FullName,
                ManagerUserId = order.ManagerUserId,
                ManagerName = users.GetValueOrDefault(order.ManagerUserId, ""),
                AdditionalManagerUserIds = additionalIds,
                AdditionalManagerNames = additionalIds
                    .Where(users.ContainsKey)
                    .Select(userId => users[userId])
                    .ToList(),
                ClientOrderNumber = order.ClientOrderNumber,
                OrderDate = order.OrderDate,
                Tags = order.Tags,
                ContractNumber = order.ContractNumber,
                InitialRate = order.InitialRate,
                Currency = order.Currency,
                VatRate = order.VatRate,
                InitialRateWithVat = order.VatRate.HasValue
                    ? decimal.Round(order.InitialRate * (1 + order.VatRate.Value / 100), 2)
                    : null,
                PaymentTerms = order.PaymentTerms,
                PaymentDelayDays = order.PaymentDelayDays,
                LoadingCity = order.LoadingCity,
                LoadingAddress = order.LoadingAddress,
                LoadingDate = order.LoadingDate,
                DeliveryCity = order.DeliveryCity,
                DeliveryAddress = order.DeliveryAddress,
                DeliveryDate = order.DeliveryDate,
                CargoDescription = order.CargoDescription,
                WeightTons = order.WeightTons,
                Comment = order.Comment,
                Status = order.Status,
                PreviousStatus = order.PreviousStatus,
                TripId = order.TripId,
                FleetVehicleId = order.FleetVehicleId,
                FleetVehiclePlate = order.FleetVehicle?.Plate,
                FleetTrailerPlate = order.FleetVehicle?.TrailerPlate,
                SourceRequestId = order.SourceRequestId,
                Documents = order.Documents.OrderByDescending(document => document.UploadedAt).Select(ToDocumentResponse).ToList(),
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            };
        }).ToList();
    }

    private async Task<string?> ValidateContactAsync(int? contactId, int clientId)
    {
        if (!contactId.HasValue) return null;
        return await _db.ClientCompanyContacts.AnyAsync(contact =>
                contact.Id == contactId.Value && contact.ClientCompanyId == clientId)
            ? null
            : "Контактна особа не належить обраному клієнту.";
    }

    private async Task<string?> ValidateManagersAsync(int companyId, string managerId, List<string> additionalIds)
    {
        var ids = additionalIds.Append(managerId).Distinct().ToList();
        var count = await _db.Users.CountAsync(user =>
            user.CompanyId == companyId && ids.Contains(user.Id));
        return count == ids.Count ? null : "Оберіть менеджерів вашої компанії.";
    }

    private static List<string> NormalizeManagerIds(IEnumerable<string> ids, string managerId) =>
        ids.Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id.Trim())
            .Where(id => !string.Equals(id, managerId, StringComparison.Ordinal))
            .Distinct(StringComparer.Ordinal)
            .ToList();

    private static List<string> ParseManagerIds(string? ids) =>
        string.IsNullOrWhiteSpace(ids) ? [] : JsonSerializer.Deserialize<List<string>>(ids) ?? [];

    private static string FormatUserName(DataAccess.Data.Entities.User user)
    {
        var name = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrWhiteSpace(name) ? user.Email ?? "" : name;
    }

    private static bool CanTransition(TransportOrderStatus current, TransportOrderStatus next) =>
        (current, next) switch
        {
            (TransportOrderStatus.New, TransportOrderStatus.InProgress or TransportOrderStatus.Cancelled) => true,
            (TransportOrderStatus.InProgress, TransportOrderStatus.Completed or TransportOrderStatus.Cancelled) => true,
            _ => false
        };

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record OrderManagerOption(string Id, string Name, string Email);
}
