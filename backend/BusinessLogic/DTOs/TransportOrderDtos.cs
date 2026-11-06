using System.ComponentModel.DataAnnotations;
using DataAccess.Data.Entities;

namespace BusinessLogic.DTOs;

public sealed class CreateTransportOrder
{
    [Range(1, int.MaxValue)]
    public int ClientCompanyId { get; set; }

    public int? FleetVehicleId { get; set; }

    public int? ClientContactId { get; set; }

    [Required]
    public string ManagerUserId { get; set; } = "";

    public List<string> AdditionalManagerUserIds { get; set; } = [];

    public int? SourceRequestId { get; set; }

    [MaxLength(100)]
    public string? ClientOrderNumber { get; set; }

    public DateOnly OrderDate { get; set; }

    [MaxLength(1000)]
    public string? Tags { get; set; }

    [MaxLength(100)]
    public string? ContractNumber { get; set; }

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal InitialRate { get; set; }

    [Required, RegularExpression("^(UAH|USD|EUR|PLN|GBP)$")]
    public string Currency { get; set; } = "UAH";

    [Range(typeof(decimal), "0", "100")]
    public decimal? VatRate { get; set; }

    [MaxLength(500)]
    public string? PaymentTerms { get; set; }

    [Range(0, 3650)]
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

    [Range(typeof(decimal), "0.001", "999999")]
    public decimal? WeightTons { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }
}

public sealed class UpdateTransportOrderStatus
{
    public TransportOrderStatus Status { get; set; }
}

public sealed class TransportOrderResponse
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public int ClientCompanyId { get; set; }
    public string ClientName { get; set; } = "";
    public int? ClientContactId { get; set; }
    public string? ClientContactName { get; set; }
    public string ManagerUserId { get; set; } = "";
    public string ManagerName { get; set; } = "";
    public List<string> AdditionalManagerUserIds { get; set; } = [];
    public List<string> AdditionalManagerNames { get; set; } = [];
    public string? ClientOrderNumber { get; set; }
    public DateOnly OrderDate { get; set; }
    public string? Tags { get; set; }
    public string? ContractNumber { get; set; }
    public decimal InitialRate { get; set; }
    public string Currency { get; set; } = "UAH";
    public decimal? VatRate { get; set; }
    public decimal? InitialRateWithVat { get; set; }
    public string? PaymentTerms { get; set; }
    public int? PaymentDelayDays { get; set; }
    public string? LoadingCity { get; set; }
    public string? LoadingAddress { get; set; }
    public DateOnly? LoadingDate { get; set; }
    public string? DeliveryCity { get; set; }
    public string? DeliveryAddress { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public string? CargoDescription { get; set; }
    public decimal? WeightTons { get; set; }
    public string? Comment { get; set; }
    public TransportOrderStatus Status { get; set; }
    public TransportOrderStatus? PreviousStatus { get; set; }
    public int? TripId { get; set; }
    public int? FleetVehicleId { get; set; }
    public string? FleetVehiclePlate { get; set; }
    public string? FleetTrailerPlate { get; set; }
    public int? SourceRequestId { get; set; }
    public List<TransportOrderDocumentResponse> Documents { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed record TransportOrderDocumentResponse(
    int Id,
    string Category,
    string OriginalFileName,
    string ContentType,
    long SizeBytes,
    DateTime UploadedAt);
