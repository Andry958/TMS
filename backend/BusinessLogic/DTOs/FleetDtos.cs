namespace BusinessLogic.DTOs;

public sealed class FleetVehicleRequest
{
    public string Type { get; set; } = "";
    public string Make { get; set; } = "";
    public int? Year { get; set; }
    public string Plate { get; set; } = "";
    public string? TrailerPlate { get; set; }
    public string? Vin { get; set; }
    public string? EuroClass { get; set; }
    public string? BodyType { get; set; }
    public string Status { get; set; } = "На базі";
    public string? Division { get; set; }
    public string? Mechanic { get; set; }
    public decimal? MileageKm { get; set; }
    public decimal? CapacityTons { get; set; }
    public decimal? VolumeM3 { get; set; }
    public int? PalletCapacity { get; set; }
    public string? CargoDimensions { get; set; }
    public string? DoorHeight { get; set; }
    public decimal? TareKg { get; set; }
    public decimal? GrossWeightKg { get; set; }
    public string? Equipment { get; set; }
    public string? RefrigerationType { get; set; }
    public string? TemperatureRange { get; set; }
    public string? TemperatureRecorder { get; set; }
    public string? DoubleDeck { get; set; }
    public decimal? HydraulicLiftCapacityKg { get; set; }
    public string? Extras { get; set; }
    public string? CustomsApproval { get; set; }
    public string? AdrClass { get; set; }
    public string? GpsProvider { get; set; }
    public string? GpsDeviceId { get; set; }
    public string? CanBusStatus { get; set; }
    public decimal? FuelTankLitres { get; set; }
    public decimal? FuelLevelLitres { get; set; }
    public decimal? AdblueTankLitres { get; set; }
    public decimal? ConsumptionLitresPer100Km { get; set; }
    public string? EQueueProfile { get; set; }
    public string? TransitSystems { get; set; }
    public string? TransitProfileId { get; set; }
    public string? LastGpsUpdate { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public decimal? NextServiceMileageKm { get; set; }
    public string? PlannedServiceWorks { get; set; }
    public string? TireAxles { get; set; }
    public string? TireTread { get; set; }
    public string? TireDetails { get; set; }
    public string? RepairHistory { get; set; }
    public string? OwnershipType { get; set; }
    public string? OwnershipDetails { get; set; }
    public string? Lessor { get; set; }
    public decimal? LeaseCost { get; set; }
    public string? LeaseCurrency { get; set; }
    public decimal? CostPerKm { get; set; }
    public string? CostCurrency { get; set; }
}

public sealed class DriverRequest
{
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public string? AdditionalContact { get; set; }
    public string? Notes { get; set; }
}

public sealed class DriverDocumentRequest
{
    public string Type { get; set; } = "";
    public string? Number { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public string? Comment { get; set; }
}

public sealed class VehicleAssignmentRequest
{
    public int DriverId { get; set; }
    public DateTime? StartedAt { get; set; }
    public string? ChangeReason { get; set; }
}

public sealed class TripRequest
{
    public int DriverId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "Запланований";
    public DateTime? PlannedStartAt { get; set; }
    public DateTime? PlannedEndAt { get; set; }
    public DateTime? ActualStartAt { get; set; }
    public DateTime? ActualEndAt { get; set; }
    public decimal IssuedAmount { get; set; }
    public string Currency { get; set; } = "UAH";
    public decimal? StartOdometerKm { get; set; }
    public decimal? EndOdometerKm { get; set; }
    public List<TripPointRequest> Points { get; set; } = [];
    public List<TripExpenseRequest> Expenses { get; set; } = [];
}

public sealed class TripPointRequest
{
    public int? Id { get; set; }
    public int Order { get; set; }
    public string Type { get; set; } = "";
    public string Address { get; set; } = "";
    public DateTime? ArrivalAt { get; set; }
    public string? Comment { get; set; }
}

public sealed class TripExpenseRequest
{
    public int? Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime SpentAt { get; set; }
    public string Description { get; set; } = "";
    public string? Category { get; set; }
}

public sealed class TripResponse
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string VehiclePlate { get; set; } = "";
    public int DriverId { get; set; }
    public string DriverName { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "";
    public DateTime? PlannedStartAt { get; set; }
    public DateTime? PlannedEndAt { get; set; }
    public DateTime? ActualStartAt { get; set; }
    public DateTime? ActualEndAt { get; set; }
    public decimal IssuedAmount { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "";
    public decimal? StartOdometerKm { get; set; }
    public decimal? EndOdometerKm { get; set; }
    public decimal? MileageKm { get; set; }
    public List<TripPointResponse>? Points { get; set; }
    public List<TripExpenseResponse>? Expenses { get; set; }
}

public sealed class TripPointResponse
{
    public int Id { get; set; }
    public int Order { get; set; }
    public string Type { get; set; } = "";
    public string Address { get; set; } = "";
    public DateTime? ArrivalAt { get; set; }
    public string? Comment { get; set; }
}

public sealed class TripExpenseResponse
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime SpentAt { get; set; }
    public string Description { get; set; } = "";
    public string? Category { get; set; }
}
