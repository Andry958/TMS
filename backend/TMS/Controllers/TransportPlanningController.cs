using System.Security.Claims;
using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TMS.Controllers;

[ApiController]
[Authorize]
[Route("api/transport-planning")]
public sealed class TransportPlanningController : ControllerBase
{
    private readonly TMSDbContext _db;

    public TransportPlanningController(TMSDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetBoard(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken cancellationToken)
    {
        var companyId = await GetCompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        if (from == default || to == default || to < from)
            return BadRequest(new { message = "Вкажіть коректний період календаря." });

        var vehicles = await _db.FleetVehicles.AsNoTracking()
            .Where(vehicle => vehicle.CompanyId == companyId.Value)
            .OrderBy(vehicle => vehicle.Plate)
            .Select(vehicle => new
            {
                vehicle.Id,
                vehicle.Plate,
                vehicle.TrailerPlate,
                vehicle.Status,
                Driver = _db.VehicleDriverAssignments
                    .Where(assignment => assignment.VehicleId == vehicle.Id &&
                                         assignment.CompanyId == companyId.Value &&
                                         assignment.EndedAt == null)
                    .Select(assignment => new { assignment.DriverId, assignment.Driver.FullName })
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var fromDate = from.ToDateTime(TimeOnly.MinValue);
        var toDate = to.ToDateTime(TimeOnly.MaxValue);
        var trips = await _db.Trips.AsNoTracking()
            .Where(trip => trip.CompanyId == companyId.Value &&
                           (!trip.PlannedEndAt.HasValue || trip.PlannedEndAt >= fromDate) &&
                           (!trip.PlannedStartAt.HasValue || trip.PlannedStartAt <= toDate))
            .Include(trip => trip.Driver)
            .Include(trip => trip.Orders)
                .ThenInclude(order => order.Client)
            .ToListAsync(cancellationToken);
        var orderPoints = await _db.TransportOrders.AsNoTracking()
            .Where(order => order.CompanyId == companyId.Value &&
                            order.TripId == null &&
                            order.Status != TransportOrderStatus.Completed &&
                            order.Status != TransportOrderStatus.Cancelled &&
                            (!order.LoadingDate.HasValue || order.LoadingDate <= to) &&
                            (!order.DeliveryDate.HasValue || order.DeliveryDate >= from))
            .Select(order => new
            {
                order.Id,
                order.Client.Name,
                order.LoadingCity,
                order.DeliveryCity,
                order.LoadingDate,
                order.DeliveryDate,
                order.CargoDescription,
                order.Status,
                order.TripId,
                order.SourceRequestId
            })
            .OrderBy(order => order.LoadingDate)
            .ThenBy(order => order.Id)
            .ToListAsync(cancellationToken);
        var requests = await _db.TransportRequests.AsNoTracking()
            .Where(request => request.CompanyId == companyId.Value &&
                              request.LoadingDate <= to &&
                              request.DeliveryDate >= from)
            .OrderBy(request => request.LoadingDate)
            .ThenBy(request => request.Id)
            .Select(request => new TransportPlanningRequest(
                request.Id,
                request.Client.Name,
                request.LoadingCity,
                request.DeliveryCity,
                request.LoadingDate,
                request.DeliveryDate,
                request.CargoDescription,
                request.Status.ToString()))
            .ToListAsync(cancellationToken);

        TransportPlanningOrder MapOrder(TransportOrder order) => new(
            order.Id,
            $"ORD-{order.Id:D6}",
            order.Client.Name,
            order.LoadingCity,
            order.DeliveryCity,
            order.LoadingDate,
            order.DeliveryDate,
            order.CargoDescription,
            order.Status.ToString(),
            order.TripId,
            order.SourceRequestId);

        var board = new TransportPlanningBoard(
            vehicles.Select(vehicle => new TransportPlanningVehicle(
                vehicle.Id,
                vehicle.Plate,
                vehicle.TrailerPlate,
                vehicle.Status,
                vehicle.Driver?.DriverId,
                vehicle.Driver?.FullName,
                trips.Where(trip => trip.VehicleId == vehicle.Id)
                    .Select(trip => new TransportPlanningTrip(
                        trip.Id,
                        trip.Title,
                        trip.Status,
                        trip.PlannedStartAt,
                        trip.PlannedEndAt,
                        trip.Driver.FullName,
                        trip.Orders.OrderBy(order => order.LoadingDate)
                            .Select(MapOrder)
                            .ToList()))
                    .ToList()))
                .ToList(),
            orderPoints.Select(order => new TransportPlanningOrder(
                order.Id,
                $"ORD-{order.Id:D6}",
                order.Name,
                order.LoadingCity,
                order.DeliveryCity,
                order.LoadingDate,
                order.DeliveryDate,
                order.CargoDescription,
                order.Status.ToString(),
                order.TripId,
                order.SourceRequestId))
                .ToList(),
            requests);

        return Ok(board);
    }

    [HttpPost("orders/{orderId:int}/schedule")]
    public async Task<IActionResult> ScheduleOrder(
        int orderId,
        [FromBody] ScheduleOrderRequest request,
        CancellationToken cancellationToken)
    {
        var companyId = await GetCompanyIdAsync(cancellationToken);
        if (!companyId.HasValue) return Forbid();
        if (request.VehicleId <= 0 || request.ScheduledDate == default)
            return BadRequest(new { message = "Вкажіть автопоїзд і дату планування." });

        await using var transaction = await _db.Database.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, cancellationToken);

        var order = await _db.TransportOrders
            .Include(item => item.Client)
            .FirstOrDefaultAsync(item =>
                item.Id == orderId && item.CompanyId == companyId.Value, cancellationToken);
        if (order is null) return NotFound();
        if (order.TripId.HasValue)
            return Conflict(new { message = "Це замовлення вже додано до рейсу." });
        if (order.Status is TransportOrderStatus.Completed or TransportOrderStatus.Cancelled)
            return BadRequest(new { message = "Завершене або скасоване замовлення не можна планувати." });

        var vehicle = await _db.FleetVehicles.FirstOrDefaultAsync(item =>
            item.Id == request.VehicleId && item.CompanyId == companyId.Value, cancellationToken);
        if (vehicle is null) return NotFound(new { message = "Автопоїзд не знайдено." });
        if (vehicle.Status == "Неактивний")
            return Conflict(new { message = "Неактивний автопоїзд не можна призначити на рейс." });

        var assignment = await _db.VehicleDriverAssignments
            .Where(item => item.VehicleId == vehicle.Id &&
                           item.CompanyId == companyId.Value &&
                           item.EndedAt == null)
            .Select(item => new { item.DriverId, item.Driver.FullName })
            .FirstOrDefaultAsync(cancellationToken);

        Trip? trip = null;
        if (request.TripId.HasValue)
        {
            trip = await _db.Trips
                .Include(item => item.Points)
                .FirstOrDefaultAsync(item =>
                    item.Id == request.TripId.Value &&
                    item.VehicleId == vehicle.Id &&
                    item.CompanyId == companyId.Value, cancellationToken);
            if (trip is null) return NotFound(new { message = "Рейс цього автопоїзда не знайдено." });
            if (trip.Status is "Завершений" or "Скасований")
                return Conflict(new { message = "До завершеного або скасованого рейсу не можна додати замовлення." });
        }
        var originalStart = order.LoadingDate ?? order.DeliveryDate ?? request.ScheduledDate;
        var originalEnd = order.DeliveryDate ?? order.LoadingDate ?? request.ScheduledDate;
        if (originalEnd < originalStart)
            return BadRequest(new { message = "Дата доставки не може бути раніше дати завантаження." });

        var shiftDays = request.ScheduledDate.DayNumber - originalStart.DayNumber;
        var scheduledStart = request.ScheduledDate;
        var scheduledEnd = originalEnd.AddDays(shiftDays);
        order.LoadingDate = order.LoadingDate.HasValue ? scheduledStart : null;
        order.DeliveryDate = order.DeliveryDate.HasValue ? scheduledEnd : null;
        order.FleetVehicleId = vehicle.Id;

        var points = trip?.Points.ToList() ?? [];
        if (!string.IsNullOrWhiteSpace(order.LoadingCity) || !string.IsNullOrWhiteSpace(order.LoadingAddress))
        {
            points.Add(new TripPoint
            {
                Type = points.Count == 0 ? "Початок рейсу" : "Довантаження",
                Address = JoinAddress(order.LoadingCity, order.LoadingAddress),
                ArrivalAt = scheduledStart.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
                Comment = $"Замовлення ORD-{order.Id:D6}"
            });
        }
        if (!string.IsNullOrWhiteSpace(order.DeliveryCity) || !string.IsNullOrWhiteSpace(order.DeliveryAddress))
        {
            points.Add(new TripPoint
            {
                Type = "Розвантаження",
                Address = JoinAddress(order.DeliveryCity, order.DeliveryAddress),
                ArrivalAt = scheduledEnd.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
                Comment = $"Замовлення ORD-{order.Id:D6}"
            });
        }

        var sortedPoints = points.OrderBy(point => point.ArrivalAt ?? DateTime.MaxValue)
            .ThenBy(point => point.Type == "Розвантаження" ? 1 : 0)
            .ToList();
        for (var index = 0; index < sortedPoints.Count; index++)
            sortedPoints[index].Order = index;

        if (trip is null)
        {
            if (assignment is null)
                return Conflict(new { message = "Спочатку призначте водія цьому автопоїзду." });

            trip = new Trip
            {
                CompanyId = companyId.Value,
                VehicleId = vehicle.Id,
                DriverId = assignment.DriverId,
                Title = $"ORD-{order.Id:D6} · {order.Client.Name}",
                Status = "Запланований",
                PlannedStartAt = scheduledStart.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
                PlannedEndAt = scheduledEnd.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc),
                IssuedAmount = 0,
                Currency = order.Currency,
                CreatedAt = DateTime.UtcNow
            };
            _db.Trips.Add(trip);
        }
        else
        {
            var existingOrderCount = await _db.TransportOrders.CountAsync(
                item => item.TripId == trip.Id && item.CompanyId == companyId.Value, cancellationToken);
            if (existingOrderCount == 0)
                trip.Title = $"ORD-{order.Id:D6} · {order.Client.Name}";
            else if (!trip.Title.StartsWith("Зведений рейс", StringComparison.Ordinal))
                trip.Title = $"Зведений рейс · {trip.Title}";

            var start = trip.PlannedStartAt.HasValue
                ? DateOnly.FromDateTime(trip.PlannedStartAt.Value)
                : scheduledStart;
            var end = trip.PlannedEndAt.HasValue
                ? DateOnly.FromDateTime(trip.PlannedEndAt.Value)
                : scheduledEnd;
            trip.PlannedStartAt = start < scheduledStart
                ? start.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc)
                : scheduledStart.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            trip.PlannedEndAt = end > scheduledEnd
                ? end.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc)
                : scheduledEnd.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
            trip.UpdatedAt = DateTime.UtcNow;
            _db.TripPoints.RemoveRange(trip.Points);
            await _db.SaveChangesAsync(cancellationToken);
        }

        trip.Points = sortedPoints.Select((point, index) => new TripPoint
        {
            Order = index,
            Type = point.Type,
            Address = point.Address,
            ArrivalAt = point.ArrivalAt,
            Comment = point.Comment
        }).ToList();
        order.Trip = trip;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Ok(new { tripId = trip.Id, orderId = order.Id });
    }

    private async Task<int?> GetCompanyIdAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userId is null
            ? null
            : await _db.Users.Where(user => user.Id == userId)
                .Select(user => user.CompanyId)
                .SingleOrDefaultAsync(cancellationToken);
    }

    private static string JoinAddress(string? city, string? address) =>
        string.Join(", ", new[] { city, address }.Where(value => !string.IsNullOrWhiteSpace(value)));
}
