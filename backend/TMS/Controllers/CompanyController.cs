using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
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
        public IActionResult CreateCompany([FromBody] PostCompanyDTO company)
        {
            var newCompany = new Company
            {
                Name = company.Name,
                Country = company.Country,
                City = company.City,
                Region = company.Region,
                PostalCode = company.PostalCode,
                StreetAddress = company.StreetAddress,
                BuildingNumber = company.BuildingNumber,
                ApartmentNumber = company.ApartmentNumber,
                PhoneNumber = company.PhoneNumber,
                Email = company.Email,
                Website = company.Website,
                BankName = company.BankName,
                BankAccountNumber = company.BankAccountNumber,
                BankMfo = company.BankMfo,
                DirectorFullName = company.DirectorFullName,
                AccountantFullName = company.AccountantFullName,
                TaxSystem = company.TaxSystem,
                CompanyType = company.CompanyType,
                AdditionalInfo = company.AdditionalInfo,
                LogoPath = company.LogoPath,
                PostalAddress = company.PostalAddress,
                LegalAddress = company.LegalAddress,
                CodeCompany = company.CodeCompany,
                Ipn = company.Ipn,
                Currency = company.Currency,
                ApiNovaPoshtaKey = company.ApiNovaPoshtaKey,
                ApiLardyTransKey = company.ApiLardyTransKey

            };
            ctx.Companies.Add(newCompany);
            ctx.SaveChanges();
            return CreatedAtAction(nameof(GetCompanyById), new { id = newCompany.Id }, newCompany);
        }
        [HttpPut("{id}")]
        public IActionResult UpdateCompany(int id, [FromBody] PostCompanyDTO company)
        {
            var existingCompany = ctx.Companies.Find(id);
            if (existingCompany == null)
            {
                return NotFound();
            }
            existingCompany.Name = company.Name;
            existingCompany.Country = company.Country;
            existingCompany.City = company.City;
            existingCompany.Region = company.Region;
            existingCompany.PostalCode = company.PostalCode;
            existingCompany.StreetAddress = company.StreetAddress;
            existingCompany.BuildingNumber = company.BuildingNumber;
            existingCompany.ApartmentNumber = company.ApartmentNumber;
            existingCompany.PhoneNumber = company.PhoneNumber;
            existingCompany.Email = company.Email;
            existingCompany.Website = company.Website;
            existingCompany.BankName = company.BankName;
            existingCompany.BankAccountNumber = company.BankAccountNumber;
            existingCompany.BankMfo = company.BankMfo;
            existingCompany.DirectorFullName = company.DirectorFullName;
            existingCompany.AccountantFullName = company.AccountantFullName;
            existingCompany.TaxSystem = company.TaxSystem;
            existingCompany.CompanyType = company.CompanyType;
            existingCompany.AdditionalInfo = company.AdditionalInfo;
            existingCompany.LogoPath = company.LogoPath;
            existingCompany.PostalAddress = company.PostalAddress;
            existingCompany.LegalAddress = company.LegalAddress;
            existingCompany.CodeCompany = company.CodeCompany;
            existingCompany.Ipn = company.Ipn;
            existingCompany.Currency = company.Currency;
            existingCompany.ApiNovaPoshtaKey = company.ApiNovaPoshtaKey;
            existingCompany.ApiLardyTransKey = company.ApiLardyTransKey;

            ctx.SaveChanges();
            return NoContent();
        }
    }
}
