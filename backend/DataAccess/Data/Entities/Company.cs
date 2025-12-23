using DataAccess.Data.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DataAccess.Data.Entities
{
    public class Company : BaseEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? CompanyType { get; set; } // Тип компанії
        public string? CodeCompany { get; set; } // ЄДРПОУ
        public string? Ipn { get; set; } // ІПН
        public string? TaxSystem { get; set; } // Система оподаткування
        public string? AdditionalInfo { get; set; }
        public string? LogoPath { get; set; }

        // Контакти
        public ContactInfo Contact { get; set; } = new ContactInfo();

        // Адреси
        public Address LegalAddress { get; set; } = new Address();
        public Address PostalAddress { get; set; } = new Address();
        public Address ActualAddress { get; set; } = new Address();

        // Керівництво
        public Management Management { get; set; } = new Management();

        // Банківські реквізити
        public List<BankDetails> BankDetails { get; set; } = new List<BankDetails>();

        // API інтеграції
        public ApiKeys ApiKeys { get; set; } = new ApiKeys();

        // Клієнти
        public List<Company> Clients { get; set; } = new List<Company>();

        public List<Tracking> CompanyTrackings { get; set; } = new List<Tracking>();
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

    public class Management
    {
        public string? DirectorFullName { get; set; }
        public string? AccountantFullName { get; set; } // Головний бухгалтер
    }

    public class BankDetails
    {
        public int Id { get; set; }
        public TypeAccount TypeAccount { get; set; } = TypeAccount.Hryvnia; // Тип рахунку, за замовчуванням "Розрахунковий"

        public CurrencyCode Currency { get; set; } = CurrencyCode.UAH;  // Наприклад, "UAH"
        public string? BankName { get; set; } 
        public string? BankMfo { get; set; }
        public string? IBAN  { get; set; } // iban рахунок
        public string? SWIFT { get; set; } // swift код, для валютного рахунку

        public string? BankOfBeneficiary { get; set; } // Банк отримувача, для валютного рахунку
        public int CompanyId { get; set; } // FK до Company
        [JsonIgnore]
        public Company? Company { get; set; }
        public List<CorrespondentBanks> CorrespondentBanks { get; set; } = new List<CorrespondentBanks>();
    }

    public class CorrespondentBanks
    {
        public string? BankName { get; set; }
        public string? SWIFT { get; set; }
    }

        public class ApiKeys
    {
        public string? NovaPoshta { get; set; }
        public string? LardyTrans { get; set; }
    }

}
