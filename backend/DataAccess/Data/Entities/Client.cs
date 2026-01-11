using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Data.Entities
{
    public class Client
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(100)]
        public string? CompanyType { get; set; }

        [Required]
        [MaxLength(50)]
        public string CodeCompany { get; set; } // ЄДРПОУ

        [MaxLength(50)]
        public string? Ipn { get; set; }

        [MaxLength(100)]
        public string? TaxSystem { get; set; }

        public string? AdditionalInfo { get; set; }

        [MaxLength(500)]
        public string? LogoPath { get; set; }

        // Navigation properties
        public int? ContactId { get; set; }
        [ForeignKey("ContactId")]
        public ContactInfo? Contact { get; set; }

        public int? LegalAddressId { get; set; }
        [ForeignKey("LegalAddressId")]
        public Address? LegalAddress { get; set; }

        public int? PostalAddressId { get; set; }
        [ForeignKey("PostalAddressId")]
        public Address? PostalAddress { get; set; }

        public ICollection<Peaple> ManagementPeaple { get; set; } = new List<Peaple>();
        public ICollection<BankDetails> BankDetails { get; set; } = new List<BankDetails>();

        public int? ApiKeysId { get; set; }
        [ForeignKey("ApiKeysId")]
        public ApiKeys? ApiKeys { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}