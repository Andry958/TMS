using DataAccess.Data.Entities;
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
        
        // ID батьківської компанії (для клієнтів)
        public int? ParentCompanyId { get; set; }

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

        // Укр. пошта (колишня Поштова адреса)
        public string? UkrPoshtaAddress_Country { get; set; }
        public string? UkrPoshtaAddress_City { get; set; }
        public string? UkrPoshtaAddress_Region { get; set; }
        public string? UkrPoshtaAddress_PostalCode { get; set; }
        public string? UkrPoshtaAddress_StreetAddress { get; set; }
        public string? UkrPoshtaAddress_BuildingNumber { get; set; }
        public string? UkrPoshtaAddress_ApartmentNumber { get; set; }

        // Нова Пошта - Отримувач
        public int? NovaPoshtaRecipientType { get; set; } // 0 - Приватна особа, 1 - Організація
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

        // Нова Пошта - Доставка
        public int? NovaPoshtaDeliveryType { get; set; } // 0 - Відділення, 1 - Адреса, 2 - Поштомат, 3 - Цифрова адреса
        public string? NPD_City { get; set; }
        public string? NPD_Branch { get; set; }
        public string? NPD_Street { get; set; }
        public string? NPD_Building { get; set; }
        public string? NPD_Apartment { get; set; }
        public string? NPD_AddressComment { get; set; }
        public string? NPD_PostomatNumber { get; set; }
        public string? NPD_DigitalAddressReference { get; set; }

        // Фактична адреса
        public string? ActualAddress_Country { get; set; }
        public string? ActualAddress_City { get; set; }
        public string? ActualAddress_Region { get; set; }
        public string? ActualAddress_PostalCode { get; set; }
        public string? ActualAddress_StreetAddress { get; set; }
        public string? ActualAddress_BuildingNumber { get; set; }
        public string? ActualAddress_ApartmentNumber { get; set; }

        // Керівництво
        public List<Peaple> ManagementPeaple { get; set; } = new List<Peaple>();
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