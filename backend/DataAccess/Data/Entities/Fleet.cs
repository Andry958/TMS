using System.ComponentModel.DataAnnotations;

namespace DataAccess.Data.Entities;

public class FleetVehicle
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    [MaxLength(60)] public string Type { get; set; } = "";
    [MaxLength(160)] public string Make { get; set; } = "";
    public int? Year { get; set; }
    [MaxLength(30)] public string Plate { get; set; } = "";
    [MaxLength(30)] public string? TrailerPlate { get; set; }
    [MaxLength(40)] public string? Vin { get; set; }
    [MaxLength(30)] public string? EuroClass { get; set; }
    [MaxLength(60)] public string? BodyType { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "На базі";
    [MaxLength(160)] public string? Division { get; set; }
    [MaxLength(160)] public string? Mechanic { get; set; }
    public decimal? MileageKm { get; set; }
    public decimal? CapacityTons { get; set; }
    public decimal? VolumeM3 { get; set; }
    public int? PalletCapacity { get; set; }
    [MaxLength(160)] public string? CargoDimensions { get; set; }
    [MaxLength(80)] public string? DoorHeight { get; set; }
    public decimal? TareKg { get; set; }
    public decimal? GrossWeightKg { get; set; }
    [MaxLength(160)] public string? Equipment { get; set; }
    [MaxLength(160)] public string? RefrigerationType { get; set; }
    [MaxLength(100)] public string? TemperatureRange { get; set; }
    [MaxLength(160)] public string? TemperatureRecorder { get; set; }
    [MaxLength(160)] public string? DoubleDeck { get; set; }
    public decimal? HydraulicLiftCapacityKg { get; set; }
    public string? Extras { get; set; }
    [MaxLength(250)] public string? CustomsApproval { get; set; }
    [MaxLength(120)] public string? AdrClass { get; set; }
    [MaxLength(100)] public string? GpsProvider { get; set; }
    [MaxLength(100)] public string? GpsDeviceId { get; set; }
    [MaxLength(40)] public string? CanBusStatus { get; set; }
    public decimal? FuelTankLitres { get; set; }
    public decimal? FuelLevelLitres { get; set; }
    public decimal? AdblueTankLitres { get; set; }
    public decimal? ConsumptionLitresPer100Km { get; set; }
    [MaxLength(160)] public string? EQueueProfile { get; set; }
    [MaxLength(250)] public string? TransitSystems { get; set; }
    [MaxLength(160)] public string? TransitProfileId { get; set; }
    [MaxLength(80)] public string? LastGpsUpdate { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public decimal? NextServiceMileageKm { get; set; }
    public string? PlannedServiceWorks { get; set; }
    public string? TireAxles { get; set; }
    public string? TireTread { get; set; }
    public string? TireDetails { get; set; }
    public string? RepairHistory { get; set; }
    [MaxLength(30)] public string? OwnershipType { get; set; }
    [MaxLength(160)] public string? OwnershipDetails { get; set; }
    [MaxLength(160)] public string? Lessor { get; set; }
    public decimal? LeaseCost { get; set; }
    [MaxLength(20)] public string? LeaseCurrency { get; set; }
    public decimal? CostPerKm { get; set; }
    [MaxLength(20)] public string? CostCurrency { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<VehicleDriverAssignment> Assignments { get; set; } = [];
    public List<Trip> Trips { get; set; } = [];
    public List<FleetVehicleDocument> Documents { get; set; } = [];
}

public class GlobusTelemetryPoint
{
    public long Id { get; set; }
    public int CompanyId { get; set; }
    public string DeviceSerial { get; set; } = "";
    public DateTimeOffset RecordedAtUtc { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? SpeedKmh { get; set; }
    public double? CourseDegrees { get; set; }
    public double? AltitudeMeters { get; set; }
    public bool? IgnitionOn { get; set; }
    public string? SensorsJson { get; set; }
    public DateTimeOffset CollectedAtUtc { get; set; }
}

public class Driver
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    [MaxLength(160)] public string FullName { get; set; } = "";
    [MaxLength(40)] public string Phone { get; set; } = "";
    [MaxLength(160)] public string? Email { get; set; }
    [MaxLength(160)] public string? AdditionalContact { get; set; }
    public string? Notes { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<DriverDocument> Documents { get; set; } = [];
    public List<VehicleDriverAssignment> Assignments { get; set; } = [];
    public List<Trip> Trips { get; set; } = [];
}

public class DriverDocument
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;
    [MaxLength(80)] public string Type { get; set; } = "";
    [MaxLength(100)] public string? Number { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    [MaxLength(1000)] public string? Comment { get; set; }
    public List<DriverDocumentFile> Files { get; set; } = [];
}

public class DriverDocumentFile
{
    public int Id { get; set; }
    public int DriverDocumentId { get; set; }
    public DriverDocument DriverDocument { get; set; } = null!;
    [MaxLength(80)] public string StorageFileName { get; set; } = "";
    [MaxLength(255)] public string OriginalFileName { get; set; } = "";
    [MaxLength(120)] public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class FleetVehicleDocument
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public FleetVehicle Vehicle { get; set; } = null!;
    [MaxLength(100)] public string Type { get; set; } = "";
    [MaxLength(100)] public string? Number { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    [MaxLength(1000)] public string? Comment { get; set; }
    public List<FleetVehicleDocumentFile> Files { get; set; } = [];
}

public class FleetVehicleDocumentFile
{
    public int Id { get; set; }
    public int VehicleDocumentId { get; set; }
    public FleetVehicleDocument VehicleDocument { get; set; } = null!;
    [MaxLength(80)] public string StorageFileName { get; set; } = "";
    [MaxLength(255)] public string OriginalFileName { get; set; } = "";
    [MaxLength(120)] public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class VehicleDriverAssignment
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int VehicleId { get; set; }
    public FleetVehicle Vehicle { get; set; } = null!;
    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    [MaxLength(500)] public string? ChangeReason { get; set; }
}

public class Trip
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int VehicleId { get; set; }
    public FleetVehicle Vehicle { get; set; } = null!;
    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;
    [MaxLength(200)] public string Title { get; set; } = "";
    public string? Description { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "Запланований";
    public DateTime? PlannedStartAt { get; set; }
    public DateTime? PlannedEndAt { get; set; }
    public DateTime? ActualStartAt { get; set; }
    public DateTime? ActualEndAt { get; set; }
    public decimal IssuedAmount { get; set; }
    [MaxLength(20)] public string Currency { get; set; } = "UAH";
    public decimal? StartOdometerKm { get; set; }
    public decimal? EndOdometerKm { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TripPoint> Points { get; set; } = [];
    public List<TripExpense> Expenses { get; set; } = [];
    public List<TransportOrder> Orders { get; set; } = [];
}

public class TripPoint
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public int Order { get; set; }
    [MaxLength(30)] public string Type { get; set; } = "";
    [MaxLength(300)] public string Address { get; set; } = "";
    public DateTime? ArrivalAt { get; set; }
    [MaxLength(1000)] public string? Comment { get; set; }
}

public class TripExpense
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime SpentAt { get; set; }
    [MaxLength(500)] public string Description { get; set; } = "";
    [MaxLength(80)] public string? Category { get; set; }
}
