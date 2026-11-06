namespace BusinessLogic.DTOs;

public sealed record TransportPlanningOrder(
    int Id,
    string OrderNumber,
    string ClientName,
    string? LoadingCity,
    string? DeliveryCity,
    DateOnly? LoadingDate,
    DateOnly? DeliveryDate,
    string? CargoDescription,
    string Status,
    int? TripId,
    int? SourceRequestId);

public sealed record TransportPlanningRequest(
    int Id,
    string ClientName,
    string LoadingCity,
    string DeliveryCity,
    DateOnly LoadingDate,
    DateOnly DeliveryDate,
    string CargoDescription,
    string Status);

public sealed record TransportPlanningTrip(
    int Id,
    string Title,
    string Status,
    DateTime? PlannedStartAt,
    DateTime? PlannedEndAt,
    string DriverName,
    IReadOnlyList<TransportPlanningOrder> Orders);

public sealed record TransportPlanningVehicle(
    int Id,
    string Plate,
    string? TrailerPlate,
    string Status,
    int? DriverId,
    string? DriverName,
    IReadOnlyList<TransportPlanningTrip> Trips);

public sealed record TransportPlanningBoard(
    IReadOnlyList<TransportPlanningVehicle> Vehicles,
    IReadOnlyList<TransportPlanningOrder> AvailableOrders,
    IReadOnlyList<TransportPlanningRequest> Requests);

public sealed record ScheduleOrderRequest(int VehicleId, DateOnly ScheduledDate, int? TripId);
