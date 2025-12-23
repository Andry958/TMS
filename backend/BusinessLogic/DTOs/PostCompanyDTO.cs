using DataAccess.Data.Enum;

namespace BusinessLogic.DTOs
{
    public class PostCompanyDTO
    {
        // Основна інформація
        public string? Name { get; set; }
        public string? CompanyType { get; set; }
        public string? CodeCompany { get; set; }
        public string? Ipn { get; set; }
        public string? TaxSystem { get; set; }
        public string? AdditionalInfo { get; set; }
        public string? LogoPath { get; set; }

        // Контакти
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }

        // Юридична адреса
        public string? LegalAddress_Country { get; set; }
        public string? LegalAddress_City { get; set; }
        public string? LegalAddress_Region { get; set; }
        public string? LegalAddress_PostalCode { get; set; }
        public string? LegalAddress_StreetAddress { get; set; }
        public string? LegalAddress_BuildingNumber { get; set; }
        public string? LegalAddress_ApartmentNumber { get; set; }

        // Поштова адреса
        public string? PostalAddress_Country { get; set; }
        public string? PostalAddress_City { get; set; }
        public string? PostalAddress_Region { get; set; }
        public string? PostalAddress_PostalCode { get; set; }
        public string? PostalAddress_StreetAddress { get; set; }
        public string? PostalAddress_BuildingNumber { get; set; }
        public string? PostalAddress_ApartmentNumber { get; set; }

        // Фактична адреса
        public string? ActualAddress_Country { get; set; }
        public string? ActualAddress_City { get; set; }
        public string? ActualAddress_Region { get; set; }
        public string? ActualAddress_PostalCode { get; set; }
        public string? ActualAddress_StreetAddress { get; set; }
        public string? ActualAddress_BuildingNumber { get; set; }
        public string? ActualAddress_ApartmentNumber { get; set; }

        // Керівництво
        public string? DirectorFullName { get; set; }
        public string? AccountantFullName { get; set; }

        // Банківські реквізити (список)
        public List<BankDetailsDTO>? BankDetails { get; set; }

        // API інтеграції
        public string? ApiNovaPoshtaKey { get; set; }
        public string? ApiLardyTransKey { get; set; }
    }

    public class BankDetailsDTO
    {
        public DataAccess.Data.Enum.TypeAccount TypeAccount { get; set; } = TypeAccount.Hryvnia;
        public CurrencyCode Currency { get; set; } = CurrencyCode.UAH;
        public string? BankName { get; set; }
        public string? BankMfo { get; set; }
        public string? IBAN { get; set; }
        public string? SWIFT { get; set; }
        public string? BankOfBeneficiary { get; set; }
        public List<CorrespondentBankDTO>? CorrespondentBanks { get; set; }
    }

    public class CorrespondentBankDTO
    {
        public string? BankName { get; set; }
        public string? SWIFT { get; set; }
    }
}