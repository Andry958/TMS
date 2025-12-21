using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs
{
    public class PostCompanyDTO
    {
        public string? Name { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Region { get; set; }
        public string? PostalCode { get; set; }
        public string? StreetAddress { get; set; }
        public string? BuildingNumber { get; set; }
        public string? ApartmentNumber { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public List<string?> BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankMfo { get; set; }
        public string? DirectorFullName { get; set; }
        public string? AccountantFullName { get; set; } // Головний бухгалтер
        public string? TaxSystem { get; set; } // Система оподаткування
        public string? CompanyType { get; set; } // Тип компанії (наприклад, ТОВ, ПП)
        public string? AdditionalInfo { get; set; }
        public string? LogoPath { get; set; }
        public string? PostalAddress { get; set; }
        public string LegalAddress { get; set; }
        public string CodeCompany { get; set; } // Код ЄДРПОУ
        public string Ipn { get; set; } // Ідентифікаційний податковий номер
        public string Currency { get; set; } // Наприклад, "UAH" або "EUR"
        public string ApiNovaPoshtaKey { get; set; }
        public string ApiLardyTransKey { get; set; }
    }
}
