using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TMS.Controllers;

[ApiController]
[Authorize]
[Route("api/requests")]
public sealed class RequestsController : ControllerBase
{
    private readonly TMSDbContext _db;

    public RequestsController(TMSDbContext db)
    {
        _db = db;
    }

    private async Task<int?> GetCompanyIdAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userId is null
            ? null
            : await _db.Users.Where(user => user.Id == userId)
                .Select(user => user.CompanyId)
                .SingleOrDefaultAsync();
    }

    [HttpGet]
    public async Task<IActionResult> GetRequests(
        [FromQuery] bool archived = false,
        [FromQuery] int? clientId = null,
        [FromQuery] string? city = null,
        [FromQuery] DateOnly? loadingFrom = null,
        [FromQuery] DateOnly? loadingTo = null,
        [FromQuery] TransportRequestStatus? status = null)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var query = _db.TransportRequests.AsNoTracking()
            .Where(request => request.CompanyId == companyId.Value);
        query = archived
            ? query.Where(request => request.Status == TransportRequestStatus.Rejected ||
                                     request.Status == TransportRequestStatus.Ordered)
            : query.Where(request => request.Status != TransportRequestStatus.Rejected &&
                                     request.Status != TransportRequestStatus.Ordered);

        if (clientId.HasValue) query = query.Where(request => request.ClientCompanyId == clientId.Value);
        if (!string.IsNullOrWhiteSpace(city))
        {
            var searchCity = city.Trim();
            query = query.Where(request => request.LoadingCity.Contains(searchCity) ||
                                           request.DeliveryCity.Contains(searchCity));
        }
        if (loadingFrom.HasValue) query = query.Where(request => request.LoadingDate >= loadingFrom.Value);
        if (loadingTo.HasValue) query = query.Where(request => request.LoadingDate <= loadingTo.Value);
        if (status.HasValue) query = query.Where(request => request.Status == status.Value);

        var requests = await query
            .OrderByDescending(request => request.CreatedAt)
            .Select(request => new TransportRequestResponse
            {
                Id = request.Id,
                ClientCompanyId = request.ClientCompanyId,
                ClientName = request.Client.Name,
                LoadingCity = request.LoadingCity,
                LoadingAddress = request.LoadingAddress,
                LoadingDate = request.LoadingDate,
                DeliveryCity = request.DeliveryCity,
                DeliveryAddress = request.DeliveryAddress,
                DeliveryDate = request.DeliveryDate,
                CargoDescription = request.CargoDescription,
                WeightTons = request.WeightTons,
                Rate = request.Rate,
                Currency = request.Currency,
                Comment = request.Comment,
                Status = request.Status,
                PreviousStatus = request.PreviousStatus,
                CreatedAt = request.CreatedAt,
                UpdatedAt = request.UpdatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRequest(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var request = await _db.TransportRequests.AsNoTracking()
            .Where(item => item.Id == id && item.CompanyId == companyId.Value)
            .Select(item => new TransportRequestResponse
            {
                Id = item.Id,
                ClientCompanyId = item.ClientCompanyId,
                ClientName = item.Client.Name,
                LoadingCity = item.LoadingCity,
                LoadingAddress = item.LoadingAddress,
                LoadingDate = item.LoadingDate,
                DeliveryCity = item.DeliveryCity,
                DeliveryAddress = item.DeliveryAddress,
                DeliveryDate = item.DeliveryDate,
                CargoDescription = item.CargoDescription,
                WeightTons = item.WeightTons,
                Rate = item.Rate,
                Currency = item.Currency,
                Comment = item.Comment,
                Status = item.Status,
                PreviousStatus = item.PreviousStatus,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            })
            .FirstOrDefaultAsync();

        return request is null ? NotFound() : Ok(request);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] CreateTransportRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (request.LoadingDate == default || request.DeliveryDate == default)
            return BadRequest(new { message = "Вкажіть дати завантаження та доставки." });
        if (request.DeliveryDate < request.LoadingDate)
            return BadRequest(new { message = "Дата доставки не може бути раніше дати завантаження." });

        var client = await _db.ClientCompanies.AsNoTracking()
            .FirstOrDefaultAsync(item =>
                item.Id == request.ClientCompanyId && item.ParentCompanyId == companyId.Value);
        if (client is null)
            return BadRequest(new { message = "Оберіть клієнта вашої компанії." });

        var now = DateTime.UtcNow;
        var entity = new TransportRequest
        {
            CompanyId = companyId.Value,
            ClientCompanyId = client.Id,
            LoadingCity = request.LoadingCity.Trim(),
            LoadingAddress = Clean(request.LoadingAddress),
            LoadingDate = request.LoadingDate,
            DeliveryCity = request.DeliveryCity.Trim(),
            DeliveryAddress = Clean(request.DeliveryAddress),
            DeliveryDate = request.DeliveryDate,
            CargoDescription = request.CargoDescription.Trim(),
            WeightTons = request.WeightTons,
            Rate = request.Rate,
            Currency = request.Currency,
            Comment = Clean(request.Comment),
            Status = TransportRequestStatus.New,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.TransportRequests.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRequest), new { id = entity.Id }, new TransportRequestResponse
        {
            Id = entity.Id,
            ClientCompanyId = client.Id,
            ClientName = client.Name,
            LoadingCity = entity.LoadingCity,
            LoadingAddress = entity.LoadingAddress,
            LoadingDate = entity.LoadingDate,
            DeliveryCity = entity.DeliveryCity,
            DeliveryAddress = entity.DeliveryAddress,
            DeliveryDate = entity.DeliveryDate,
            CargoDescription = entity.CargoDescription,
            WeightTons = entity.WeightTons,
            Rate = entity.Rate,
            Currency = entity.Currency,
            Comment = entity.Comment,
            Status = entity.Status,
            PreviousStatus = entity.PreviousStatus,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRequest(int id, CancellationToken cancellationToken)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var request = await _db.TransportRequests.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value, cancellationToken);
        if (request is null) return NotFound();

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        await _db.TransportOrders
            .Where(order => order.CompanyId == companyId.Value && order.SourceRequestId == id)
            .ExecuteUpdateAsync(update => update.SetProperty(order => order.SourceRequestId, (int?)null), cancellationToken);
        _db.TransportRequests.Remove(request);
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTransportRequestStatus update)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var request = await _db.TransportRequests.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value);
        if (request is null) return NotFound();

        if (update.Status == TransportRequestStatus.Ordered)
            return BadRequest(new { message = "Перетворіть запит на замовлення через кнопку «У замовлення»." });

        if (!CanTransition(request.Status, update.Status))
            return BadRequest(new { message = $"Не можна змінити статус «{Label(request.Status)}» на «{Label(update.Status)}»." });

        request.PreviousStatus = request.Status;
        request.Status = update.Status;
        request.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/status/undo")]
    public async Task<IActionResult> UndoStatus(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var request = await _db.TransportRequests.FirstOrDefaultAsync(item =>
            item.Id == id && item.CompanyId == companyId.Value);
        if (request is null) return NotFound();
        if (!request.PreviousStatus.HasValue || request.Status == TransportRequestStatus.Ordered)
            return BadRequest(new { message = "Для цього запиту немає статусу, який можна повернути." });

        request.Status = request.PreviousStatus.Value;
        request.PreviousStatus = null;
        request.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static bool CanTransition(TransportRequestStatus current, TransportRequestStatus next) =>
        (current, next) switch
        {
            (TransportRequestStatus.New, TransportRequestStatus.InProgress or TransportRequestStatus.Confirmed or TransportRequestStatus.Rejected) => true,
            (TransportRequestStatus.InProgress, TransportRequestStatus.Confirmed or TransportRequestStatus.Rejected) => true,
            (TransportRequestStatus.Confirmed, TransportRequestStatus.Rejected) => true,
            _ => false
        };

    private static string Label(TransportRequestStatus status) => status switch
    {
        TransportRequestStatus.New => "Новий",
        TransportRequestStatus.InProgress => "В роботі",
        TransportRequestStatus.Confirmed => "Підтверджено",
        TransportRequestStatus.Rejected => "Відхилено",
        TransportRequestStatus.Ordered => "Перенесено в замовлення",
        _ => status.ToString()
    };

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
