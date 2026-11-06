using System.ComponentModel.DataAnnotations;

namespace DataAccess.Data.Entities;

public class FinanceEntry
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    [MaxLength(450)] public string CreatedByUserId { get; set; } = "";
    [MaxLength(20)] public string Type { get; set; } = "income";
    [MaxLength(80)] public string Category { get; set; } = "";
    [MaxLength(300)] public string Description { get; set; } = "";
    public decimal Amount { get; set; }
    [MaxLength(3)] public string Currency { get; set; } = "UAH";
    [MaxLength(20)] public string Status { get; set; } = "planned";
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class WarehouseProduct
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    [MaxLength(450)] public string CreatedByUserId { get; set; } = "";
    [MaxLength(200)] public string Name { get; set; } = "";
    [MaxLength(80)] public string Sku { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(20)] public string Unit { get; set; } = "шт.";
    public decimal Quantity { get; set; }
    public decimal MinimumQuantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<WarehouseMovement> Movements { get; set; } = [];
}

public class WarehouseMovement
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int ProductId { get; set; }
    public WarehouseProduct Product { get; set; } = null!;
    [MaxLength(450)] public string CreatedByUserId { get; set; } = "";
    [MaxLength(10)] public string Type { get; set; } = "in";
    public decimal Quantity { get; set; }
    [MaxLength(500)] public string Comment { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class CompanyDocument
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    [MaxLength(450)] public string CreatedByUserId { get; set; } = "";
    [MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(40)] public string Type { get; set; } = "Інше";
    [MaxLength(100)] public string Number { get; set; } = "";
    [MaxLength(200)] public string Owner { get; set; } = "";
    public DateOnly? IssueDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "Активний";
    [MaxLength(1000)] public string Notes { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<CompanyDocumentFile> Files { get; set; } = [];
}

public class CompanyDocumentFile
{
    public int Id { get; set; }
    public int CompanyDocumentId { get; set; }
    public CompanyDocument Document { get; set; } = null!;
    [MaxLength(80)] public string StorageFileName { get; set; } = "";
    [MaxLength(255)] public string OriginalFileName { get; set; } = "";
    [MaxLength(120)] public string ContentType { get; set; } = "";
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
}
