using System.ComponentModel.DataAnnotations;
using DataAccess.Data.Enum;

namespace DataAccess.Data.Entities
{
    public class ClientCompany
    {
        public int Id { get; set; }

        [Required]
        public int ParentCompanyId { get; set; }
        public Company? ParentCompany { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? CompanyType { get; set; }

        [Required]
        [MaxLength(50)]
        public string CodeCompany { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Ipn { get; set; }

        [MaxLength(100)]
        public string? TaxSystem { get; set; }

        public string? AdditionalInfo { get; set; }

        [MaxLength(500)]
        public string? LogoPath { get; set; }

        public ContactInfo Contact { get; set; } = new();
        public Address LegalAddress { get; set; } = new();
        public Address UkrPoshtaAddress { get; set; } = new();
        public Address ActualAddress { get; set; } = new();

        public NovaPoshtaRecipientType? NovaPoshtaRecipientType { get; set; }
        public string? NP_Phone { get; set; }
        public string? NP_LastName { get; set; }
        public string? NP_FirstName { get; set; }
        public string? NP_MiddleName { get; set; }
        public string? NP_EdrpouCode { get; set; }
        public string? NP_CompanyName { get; set; }
        public string? NP_OwnershipForm { get; set; }
        public string? NP_OrgPhone { get; set; }
        public string? NP_OrgLastName { get; set; }
        public string? NP_OrgFirstName { get; set; }
        public string? NP_OrgMiddleName { get; set; }
        public NovaPoshtaDeliveryType? NovaPoshtaDeliveryType { get; set; }
        public string? NPD_City { get; set; }
        public string? NPD_Branch { get; set; }
        public string? NPD_Street { get; set; }
        public string? NPD_Building { get; set; }
        public string? NPD_Apartment { get; set; }
        public string? NPD_AddressComment { get; set; }
        public string? NPD_PostomatNumber { get; set; }
        public string? NPD_DigitalAddressReference { get; set; }

        public List<ClientCompanyContact> ContactPeople { get; set; } = new();
        public List<ClientCompanyBankDetails> BankDetails { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    public class ClientCompanyBankDetails
    {
        public int Id { get; set; }
        public TypeAccount TypeAccount { get; set; } = TypeAccount.Hryvnia;
        public CurrencyCode Currency { get; set; } = CurrencyCode.UAH;
        public string? BankName { get; set; }
        public string? BankMfo { get; set; }
        public string? Iban { get; set; }
        public string? Swift { get; set; }
        public string? BankOfBeneficiary { get; set; }
        public int ClientCompanyId { get; set; }
        public ClientCompany? ClientCompany { get; set; }
        public List<ClientCompanyCorrespondentBank> CorrespondentBanks { get; set; } = new();
    }

    public class ClientCompanyCorrespondentBank
    {
        public int Id { get; set; }
        public string? BankName { get; set; }
        public string? Swift { get; set; }
        public int ClientCompanyBankDetailsId { get; set; }
        public ClientCompanyBankDetails? ClientCompanyBankDetails { get; set; }
    }

    public class ClientCompanyContact
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        public PositionType? Position { get; set; } = PositionType.Manager;

        [MaxLength(50)]
        public string? PhoneNumber { get; set; }

        [MaxLength(254)]
        public string? Email { get; set; }

        public int ClientCompanyId { get; set; }
        public ClientCompany? ClientCompany { get; set; }
    }
}
