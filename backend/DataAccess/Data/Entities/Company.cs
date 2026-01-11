using DataAccess.Data.Enum;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DataAccess.Data.Entities
{
    public class Company : BaseEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? CompanyType { get; set; }
        public string? CodeCompany { get; set; }
        public string? Ipn { get; set; }
        public string? TaxSystem { get; set; }
        public string? AdditionalInfo { get; set; }
        public string? LogoPath { get; set; }

        // Self-reference для клієнтів
        public int? ParentCompanyId { get; set; }
        public Company? ParentCompany { get; set; }
        public List<Company> ChildCompanies { get; set; } = new List<Company>();

        // Контакти
        public ContactInfo Contact { get; set; } = new ContactInfo();

        // Адреси
        public Address LegalAddress { get; set; } = new Address();
        public Address UkrPoshtaAddress { get; set; } = new Address();  // Колишня PostalAddress
        public Address ActualAddress { get; set; } = new Address();
        
        // Нова Пошта
        public NovaPoshtaRecipient? NovaPoshtaRecipient { get; set; }
        public NovaPoshtaDelivery? NovaPoshtaDelivery { get; set; }

        // Керівництво
        public List<Peaple> ManagementPeaple { get; set; } = new List<Peaple>();

        // Банківські реквізити
        public List<BankDetails> BankDetails { get; set; } = new List<BankDetails>();

        // API інтеграції
        public ApiKeys ApiKeys { get; set; } = new ApiKeys();

        public List<Tracking> CompanyTrackings { get; set; } = new List<Tracking>();

        [NotMapped]
        public bool IsClient => ParentCompanyId.HasValue;
    }

    // ================= Класи для структурування =================
    public class ContactInfo
    {
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
    }

    public class Address
    {
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Region { get; set; }
        public string? PostalCode { get; set; }
        public string? StreetAddress { get; set; }
        public string? BuildingNumber { get; set; }
        public string? ApartmentNumber { get; set; }

        [NotMapped]
        public string? FullAddress => $"{StreetAddress} {BuildingNumber}, {ApartmentNumber}, {City}, {Region}, {Country}, {PostalCode}";
    }

    // ================= Нова Пошта =================
    public enum NovaPoshtaRecipientType
    {
        PrivatePerson,      // Приватна особа
        Organization        // Організація
    }

    public enum NovaPoshtaDeliveryType
    {
        Branch,             // Відділення
        Address,            // Адреса
        Postomat,           // Поштомат
        DigitalAddress      // Цифрова адреса
    }

    public class NovaPoshtaRecipient
    {
        public int Id { get; set; }
        public NovaPoshtaRecipientType RecipientType { get; set; }
        
        // Для приватної особи
        public string? Phone { get; set; }
        public string? LastName { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        
        // Для організації
        public string? EdrpouCode { get; set; }
        public string? CompanyName { get; set; }
        public string? OwnershipForm { get; set; }
        public string? OrgPhone { get; set; }
        public string? OrgLastName { get; set; }
        public string? OrgFirstName { get; set; }
        public string? OrgMiddleName { get; set; }

        public int CompanyId { get; set; }
        [JsonIgnore]
        public Company? Company { get; set; }
    }

    public class NovaPoshtaDelivery
    {
        public int Id { get; set; }
        public NovaPoshtaDeliveryType DeliveryType { get; set; }
        
        // Спільні поля
        public string? City { get; set; }
        
        // Для відділення
        public string? Branch { get; set; }
        
        // Для адреси
        public string? Street { get; set; }
        public string? Building { get; set; }
        public string? Apartment { get; set; }
        public string? AddressComment { get; set; }
        
        // Для поштомату
        public string? PostomatNumber { get; set; }
        
        // Для цифрової адреси
        public string? DigitalAddressReference { get; set; }

        public int CompanyId { get; set; }
        [JsonIgnore]
        public Company? Company { get; set; }
    }

    public class Peaple
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public PositionType? Position { get; set; } = PositionType.Manager;
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }

    public enum PositionType
    {
        Director,
        Accountant,
        Manager,
        Other
    }

    public class BankDetails
    {
        public int Id { get; set; }
        public TypeAccount TypeAccount { get; set; } = TypeAccount.Hryvnia;
        public CurrencyCode Currency { get; set; } = CurrencyCode.UAH;
        public string? BankName { get; set; }
        public string? BankMfo { get; set; }
        public string? IBAN { get; set; }
        public string? SWIFT { get; set; }
        public string? BankOfBeneficiary { get; set; }
        public int CompanyId { get; set; }

        [JsonIgnore]
        public Company? Company { get; set; }

        public List<CorrespondentBanks> CorrespondentBanks { get; set; } = new List<CorrespondentBanks>();
    }

    public class CorrespondentBanks
    {
        public int Id { get; set; }
        public string? BankName { get; set; }
        public string? SWIFT { get; set; }
    }

    public class ApiKeys
    {
        public string? NovaPoshta { get; set; }
        public string? LardyTrans { get; set; }
    }
}
