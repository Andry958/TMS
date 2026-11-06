using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DataAccess.Data.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TransportRequestStatus
{
    New,
    InProgress,
    Confirmed,
    Rejected,
    Ordered
}

public sealed class TransportRequest
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int ClientCompanyId { get; set; }
    public ClientCompany Client { get; set; } = null!;

    [MaxLength(160)]
    public string LoadingCity { get; set; } = "";

    [MaxLength(300)]
    public string? LoadingAddress { get; set; }

    public DateOnly LoadingDate { get; set; }

    [MaxLength(160)]
    public string DeliveryCity { get; set; } = "";

    [MaxLength(300)]
    public string? DeliveryAddress { get; set; }

    public DateOnly DeliveryDate { get; set; }

    [MaxLength(500)]
    public string CargoDescription { get; set; } = "";

    public decimal? WeightTons { get; set; }
    public decimal? Rate { get; set; }

    [MaxLength(3)]
    public string Currency { get; set; } = "UAH";

    [MaxLength(2000)]
    public string? Comment { get; set; }

    public TransportRequestStatus Status { get; set; } = TransportRequestStatus.New;
    public TransportRequestStatus? PreviousStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
