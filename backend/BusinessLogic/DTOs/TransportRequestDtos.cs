using System.ComponentModel.DataAnnotations;
using DataAccess.Data.Entities;

namespace BusinessLogic.DTOs;

public sealed class CreateTransportRequest
{
    [Range(1, int.MaxValue)]
    public int ClientCompanyId { get; set; }

    [Required, MaxLength(160)]
    public string LoadingCity { get; set; } = "";

    [MaxLength(300)]
    public string? LoadingAddress { get; set; }

    public DateOnly LoadingDate { get; set; }

    [Required, MaxLength(160)]
    public string DeliveryCity { get; set; } = "";

    [MaxLength(300)]
    public string? DeliveryAddress { get; set; }

    public DateOnly DeliveryDate { get; set; }

    [Required, MaxLength(500)]
    public string CargoDescription { get; set; } = "";

    [Range(typeof(decimal), "0.001", "999999", ParseLimitsInInvariantCulture = true)]
    public decimal? WeightTons { get; set; }

    [Range(typeof(decimal), "0.01", "999999999", ParseLimitsInInvariantCulture = true)]
    public decimal? Rate { get; set; }

    [Required, RegularExpression("^(UAH|USD|EUR|PLN|GBP)$")]
    public string Currency { get; set; } = "UAH";

    [MaxLength(2000)]
    public string? Comment { get; set; }
}

public sealed class UpdateTransportRequestStatus
{
    public TransportRequestStatus Status { get; set; }
}

public sealed class TransportRequestResponse
{
    public int Id { get; set; }
    public int ClientCompanyId { get; set; }
    public string ClientName { get; set; } = "";
    public string LoadingCity { get; set; } = "";
    public string? LoadingAddress { get; set; }
    public DateOnly LoadingDate { get; set; }
    public string DeliveryCity { get; set; } = "";
    public string? DeliveryAddress { get; set; }
    public DateOnly DeliveryDate { get; set; }
    public string CargoDescription { get; set; } = "";
    public decimal? WeightTons { get; set; }
    public decimal? Rate { get; set; }
    public string Currency { get; set; } = "UAH";
    public string? Comment { get; set; }
    public TransportRequestStatus Status { get; set; }
    public TransportRequestStatus? PreviousStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
