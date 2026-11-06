using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DataAccess.Data.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TransportOrderStatus
{
    New,
    InProgress,
    Completed,
    Cancelled
}

public sealed class TransportOrder
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int? FleetVehicleId { get; set; }
    public FleetVehicle? FleetVehicle { get; set; }
    public int? TripId { get; set; }
    public Trip? Trip { get; set; }
    public int ClientCompanyId { get; set; }
    public ClientCompany Client { get; set; } = null!;
    public int? ClientContactId { get; set; }
    public ClientCompanyContact? ClientContact { get; set; }

    public string ManagerUserId { get; set; } = "";
    public string? AdditionalManagerUserIds { get; set; }
    public int? SourceRequestId { get; set; }
    public TransportRequest? SourceRequest { get; set; }

    [MaxLength(100)]
    public string? ClientOrderNumber { get; set; }

    public DateOnly OrderDate { get; set; }

    [MaxLength(1000)]
    public string? Tags { get; set; }

    [MaxLength(100)]
    public string? ContractNumber { get; set; }

    public decimal InitialRate { get; set; }

    [MaxLength(3)]
    public string Currency { get; set; } = "UAH";

    public decimal? VatRate { get; set; }

    [MaxLength(500)]
    public string? PaymentTerms { get; set; }

    public int? PaymentDelayDays { get; set; }

    [MaxLength(160)]
    public string? LoadingCity { get; set; }

    [MaxLength(300)]
    public string? LoadingAddress { get; set; }

    public DateOnly? LoadingDate { get; set; }

    [MaxLength(160)]
    public string? DeliveryCity { get; set; }

    [MaxLength(300)]
    public string? DeliveryAddress { get; set; }

    public DateOnly? DeliveryDate { get; set; }

    [MaxLength(500)]
    public string? CargoDescription { get; set; }

    public decimal? WeightTons { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }

    public TransportOrderStatus Status { get; set; } = TransportOrderStatus.New;
    public TransportOrderStatus? PreviousStatus { get; set; }
    public List<TransportOrderDocument> Documents { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class TransportOrderDocument
{
    public int Id { get; set; }
    public int TransportOrderId { get; set; }
    public TransportOrder TransportOrder { get; set; } = null!;
    [MaxLength(30)] public string Category { get; set; } = "transport";
    [MaxLength(80)] public string StorageFileName { get; set; } = "";
    [MaxLength(255)] public string OriginalFileName { get; set; } = "";
    [MaxLength(120)] public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
