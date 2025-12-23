using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using DataAccess.Data.Enum;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly TMSDbContext ctx;
        public CompanyController(TMSDbContext ctx)
        {
            this.ctx = ctx;
        }

        [HttpGet]
        public IActionResult GetCompanies()
        {
            var companies = ctx.Companies.ToList();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public IActionResult GetCompanyById(int id)
        {
            var company = ctx.Companies.Find(id);
            if (company == null)
            {
                return NotFound();
            }
            return Ok(company);
        }

        [HttpPost]
        public IActionResult CreateCompany([FromBody] PostCompanyDTO dto)
        {
            var newCompany = new Company
            {
                Name = dto.Name,
                CompanyType = dto.CompanyType,
                CodeCompany = dto.CodeCompany,
                Ipn = dto.Ipn,
                TaxSystem = dto.TaxSystem,
                AdditionalInfo = dto.AdditionalInfo,
                LogoPath = dto.LogoPath,

                // Контакти
                Contact = new ContactInfo
                {
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                    Website = dto.Website
                },

                // Юридична адреса
                LegalAddress = new Address
                {
                    Country = dto.LegalAddress_Country,
                    City = dto.LegalAddress_City,
                    Region = dto.LegalAddress_Region,
                    PostalCode = dto.LegalAddress_PostalCode,
                    StreetAddress = dto.LegalAddress_StreetAddress,
                    BuildingNumber = dto.LegalAddress_BuildingNumber,
                    ApartmentNumber = dto.LegalAddress_ApartmentNumber
                },

                // Поштова адреса
                PostalAddress = new Address
                {
                    Country = dto.PostalAddress_Country,
                    City = dto.PostalAddress_City,
                    Region = dto.PostalAddress_Region,
                    PostalCode = dto.PostalAddress_PostalCode,
                    StreetAddress = dto.PostalAddress_StreetAddress,
                    BuildingNumber = dto.PostalAddress_BuildingNumber,
                    ApartmentNumber = dto.PostalAddress_ApartmentNumber
                },

                // Фактична адреса
                ActualAddress = new Address
                {
                    Country = dto.ActualAddress_Country,
                    City = dto.ActualAddress_City,
                    Region = dto.ActualAddress_Region,
                    PostalCode = dto.ActualAddress_PostalCode,
                    StreetAddress = dto.ActualAddress_StreetAddress,
                    BuildingNumber = dto.ActualAddress_BuildingNumber,
                    ApartmentNumber = dto.ActualAddress_ApartmentNumber
                },

                // Керівництво
                Management = new Management
                {
                    DirectorFullName = dto.DirectorFullName,
                    AccountantFullName = dto.AccountantFullName
                },

                // Банківські реквізити (список)
                BankDetails = dto.BankDetails?.Select(bd => new BankDetails
                {
                    TypeAccount = bd.TypeAccount,
                    Currency = bd.Currency,
                    BankName = bd.BankName,
                    BankMfo = bd.BankMfo,
                    IBAN = bd.IBAN,
                    SWIFT = bd.SWIFT,
                    BankOfBeneficiary = bd.BankOfBeneficiary,
                    CorrespondentBanks = bd.CorrespondentBanks?.Select(cb => new CorrespondentBanks
                    {
                        BankName = cb.BankName,
                        SWIFT = cb.SWIFT
                    }).ToList() ?? new List<CorrespondentBanks>()
                }).ToList() ?? new List<BankDetails>(),

                // API інтеграції
                ApiKeys = new ApiKeys
                {
                    NovaPoshta = dto.ApiNovaPoshtaKey,
                    LardyTrans = dto.ApiLardyTransKey
                }
            };

            ctx.Companies.Add(newCompany);
            ctx.SaveChanges();
            return CreatedAtAction(nameof(GetCompanyById), new { id = newCompany.Id }, newCompany);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateCompany(int id, [FromBody] PostCompanyDTO dto)
        {
            var company = ctx.Companies.Find(id);
            if (company == null)
            {
                return NotFound();
            }

            // Основна інформація
            company.Name = dto.Name;
            company.CompanyType = dto.CompanyType;
            company.CodeCompany = dto.CodeCompany;
            company.Ipn = dto.Ipn;
            company.TaxSystem = dto.TaxSystem;
            company.AdditionalInfo = dto.AdditionalInfo;
            company.LogoPath = dto.LogoPath;

            // Контакти
            company.Contact.PhoneNumber = dto.PhoneNumber;
            company.Contact.Email = dto.Email;
            company.Contact.Website = dto.Website;

            // Юридична адреса
            company.LegalAddress.Country = dto.LegalAddress_Country;
            company.LegalAddress.City = dto.LegalAddress_City;
            company.LegalAddress.Region = dto.LegalAddress_Region;
            company.LegalAddress.PostalCode = dto.LegalAddress_PostalCode;
            company.LegalAddress.StreetAddress = dto.LegalAddress_StreetAddress;
            company.LegalAddress.BuildingNumber = dto.LegalAddress_BuildingNumber;
            company.LegalAddress.ApartmentNumber = dto.LegalAddress_ApartmentNumber;

            // Поштова адреса
            company.PostalAddress.Country = dto.PostalAddress_Country;
            company.PostalAddress.City = dto.PostalAddress_City;
            company.PostalAddress.Region = dto.PostalAddress_Region;
            company.PostalAddress.PostalCode = dto.PostalAddress_PostalCode;
            company.PostalAddress.StreetAddress = dto.PostalAddress_StreetAddress;
            company.PostalAddress.BuildingNumber = dto.PostalAddress_BuildingNumber;
            company.PostalAddress.ApartmentNumber = dto.PostalAddress_ApartmentNumber;

            // Фактична адреса
            company.ActualAddress.Country = dto.ActualAddress_Country;
            company.ActualAddress.City = dto.ActualAddress_City;
            company.ActualAddress.Region = dto.ActualAddress_Region;
            company.ActualAddress.PostalCode = dto.ActualAddress_PostalCode;
            company.ActualAddress.StreetAddress = dto.ActualAddress_StreetAddress;
            company.ActualAddress.BuildingNumber = dto.ActualAddress_BuildingNumber;
            company.ActualAddress.ApartmentNumber = dto.ActualAddress_ApartmentNumber;

            // Керівництво
            company.Management.DirectorFullName = dto.DirectorFullName;
            company.Management.AccountantFullName = dto.AccountantFullName;

            // Банківські реквізити (оновлення списку)
            company.BankDetails = dto.BankDetails?.Select(bd => new BankDetails
            {
                TypeAccount = bd.TypeAccount,
                Currency = bd.Currency,
                BankName = bd.BankName,
                BankMfo = bd.BankMfo,
                IBAN = bd.IBAN,
                SWIFT = bd.SWIFT,
                BankOfBeneficiary = bd.BankOfBeneficiary,
                CorrespondentBanks = bd.CorrespondentBanks?.Select(cb => new CorrespondentBanks
                {
                    BankName = cb.BankName,
                    SWIFT = cb.SWIFT
                }).ToList() ?? new List<CorrespondentBanks>()
            }).ToList() ?? new List<BankDetails>();

            // API інтеграції
            company.ApiKeys.NovaPoshta = dto.ApiNovaPoshtaKey;
            company.ApiKeys.LardyTrans = dto.ApiLardyTransKey;

            ctx.SaveChanges();
            return NoContent();
        }
    }
}