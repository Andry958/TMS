using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using DataAccess.Data.Enum;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var companies = ctx.Companies
                .Include(c => c.Contact)
                .Include(c => c.LegalAddress)
                .Include(c => c.UkrPoshtaAddress)
                .Include(c => c.ActualAddress)
                .Include(c => c.ManagementPeaple)
                .Include(c => c.BankDetails)
                    .ThenInclude(bd => bd.CorrespondentBanks)
                .Include(c => c.ApiKeys)
                .Include(c => c.NovaPoshtaRecipient)
                .Include(c => c.NovaPoshtaDelivery)
                .Select(c => MapToDto(c))
                .ToList();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public IActionResult GetCompanyById(int id)
        {
            var company = ctx.Companies
                .Include(c => c.Contact)
                .Include(c => c.LegalAddress)
                .Include(c => c.UkrPoshtaAddress)
                .Include(c => c.ActualAddress)
                .Include(c => c.ManagementPeaple)
                .Include(c => c.BankDetails)
                    .ThenInclude(bd => bd.CorrespondentBanks)
                .Include(c => c.ApiKeys)
                .FirstOrDefault(c => c.Id == id);

            if (company == null)
            {
                return NotFound();
            }

            var dto = MapToDto(company);
            return Ok(dto);
        }

        private static object MapToDto(Company c)
        {
            return new
            {
                id = c.Id,
                name = c.Name,
                companyType = c.CompanyType,
                codeCompany = c.CodeCompany,
                ipn = c.Ipn,
                taxSystem = c.TaxSystem,
                additionalInfo = c.AdditionalInfo,
                logoPath = c.LogoPath,
                contact = c.Contact == null ? null : new
                {
                    phoneNumber = c.Contact.PhoneNumber,
                    email = c.Contact.Email,
                    website = c.Contact.Website
                },
                legalAddress = c.LegalAddress == null ? null : new
                {
                    country = c.LegalAddress.Country,
                    city = c.LegalAddress.City,
                    region = c.LegalAddress.Region,
                    postalCode = c.LegalAddress.PostalCode,
                    streetAddress = c.LegalAddress.StreetAddress,
                    buildingNumber = c.LegalAddress.BuildingNumber,
                    apartmentNumber = c.LegalAddress.ApartmentNumber
                },
                ukrPoshtaAddress = c.UkrPoshtaAddress == null ? null : new
                {
                    country = c.UkrPoshtaAddress.Country,
                    city = c.UkrPoshtaAddress.City,
                    region = c.UkrPoshtaAddress.Region,
                    postalCode = c.UkrPoshtaAddress.PostalCode,
                    streetAddress = c.UkrPoshtaAddress.StreetAddress,
                    buildingNumber = c.UkrPoshtaAddress.BuildingNumber,
                    apartmentNumber = c.UkrPoshtaAddress.ApartmentNumber
                },
                novaPoshtaRecipient = c.NovaPoshtaRecipient == null ? null : new
                {
                    recipientType = c.NovaPoshtaRecipient.RecipientType,
                    phone = c.NovaPoshtaRecipient.Phone,
                    lastName = c.NovaPoshtaRecipient.LastName,
                    firstName = c.NovaPoshtaRecipient.FirstName,
                    middleName = c.NovaPoshtaRecipient.MiddleName,
                    edrpouCode = c.NovaPoshtaRecipient.EdrpouCode,
                    companyName = c.NovaPoshtaRecipient.CompanyName,
                    ownershipForm = c.NovaPoshtaRecipient.OwnershipForm,
                    orgPhone = c.NovaPoshtaRecipient.OrgPhone,
                    orgLastName = c.NovaPoshtaRecipient.OrgLastName,
                    orgFirstName = c.NovaPoshtaRecipient.OrgFirstName,
                    orgMiddleName = c.NovaPoshtaRecipient.OrgMiddleName
                },
                novaPoshtaDelivery = c.NovaPoshtaDelivery == null ? null : new
                {
                    deliveryType = c.NovaPoshtaDelivery.DeliveryType,
                    city = c.NovaPoshtaDelivery.City,
                    branch = c.NovaPoshtaDelivery.Branch,
                    street = c.NovaPoshtaDelivery.Street,
                    building = c.NovaPoshtaDelivery.Building,
                    apartment = c.NovaPoshtaDelivery.Apartment,
                    addressComment = c.NovaPoshtaDelivery.AddressComment,
                    postomatNumber = c.NovaPoshtaDelivery.PostomatNumber,
                    digitalAddressReference = c.NovaPoshtaDelivery.DigitalAddressReference
                },
                actualAddress = c.ActualAddress == null ? null : new
                {
                    country = c.ActualAddress.Country,
                    city = c.ActualAddress.City,
                    region = c.ActualAddress.Region,
                    postalCode = c.ActualAddress.PostalCode,
                    streetAddress = c.ActualAddress.StreetAddress,
                    buildingNumber = c.ActualAddress.BuildingNumber,
                    apartmentNumber = c.ActualAddress.ApartmentNumber
                },
                managementPeaple = c.ManagementPeaple?.Select(p => new
                {
                    id = p.Id,
                    fullName = p.FullName,
                    position = p.Position,
                    phoneNumber = p.PhoneNumber,
                    email = p.Email
                }).ToList(),
                bankDetails = c.BankDetails?.Select(bd => new
                {
                    typeAccount = bd.TypeAccount,
                    currency = bd.Currency,
                    bankName = bd.BankName,
                    bankMfo = bd.BankMfo,
                    iban = bd.IBAN,
                    swift = bd.SWIFT,
                    bankOfBeneficiary = bd.BankOfBeneficiary,
                    correspondentBanks = bd.CorrespondentBanks?.Select(cb => new
                    {
                        bankName = cb.BankName,
                        swift = cb.SWIFT
                    }).ToList()
                }).ToList(),
                apiKeys = c.ApiKeys == null ? null : new
                {
                    novaPoshta = c.ApiKeys.NovaPoshta,
                    lardyTrans = c.ApiKeys.LardyTrans
                }
            };
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

                Contact = new ContactInfo
                {
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                    Website = dto.Website
                },

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

                UkrPoshtaAddress = new Address
                {
                    Country = dto.UkrPoshtaAddress_Country,
                    City = dto.UkrPoshtaAddress_City,
                    Region = dto.UkrPoshtaAddress_Region,
                    PostalCode = dto.UkrPoshtaAddress_PostalCode,
                    StreetAddress = dto.UkrPoshtaAddress_StreetAddress,
                    BuildingNumber = dto.UkrPoshtaAddress_BuildingNumber,
                    ApartmentNumber = dto.UkrPoshtaAddress_ApartmentNumber
                },
                
                NovaPoshtaRecipient = new NovaPoshtaRecipient
                {
                    RecipientType = dto.NovaPoshtaRecipientType.HasValue 
                        ? (NovaPoshtaRecipientType)dto.NovaPoshtaRecipientType.Value 
                        : (NovaPoshtaRecipientType)0,
                    Phone = dto.NP_Phone,
                    LastName = dto.NP_LastName,
                    FirstName = dto.NP_FirstName,
                    MiddleName = dto.NP_MiddleName,
                    EdrpouCode = dto.NP_EdrpouCode,
                    CompanyName = dto.NP_CompanyName,
                    OwnershipForm = dto.NP_OwnershipForm,
                    OrgPhone = dto.NP_OrgPhone,
                    OrgLastName = dto.NP_OrgLastName,
                    OrgFirstName = dto.NP_OrgFirstName,
                    OrgMiddleName = dto.NP_OrgMiddleName
                },
                
                NovaPoshtaDelivery = new NovaPoshtaDelivery
                {
                    DeliveryType = dto.NovaPoshtaDeliveryType.HasValue 
                        ? (NovaPoshtaDeliveryType)dto.NovaPoshtaDeliveryType.Value 
                        : (NovaPoshtaDeliveryType)0,
                    City = dto.NPD_City,
                    Branch = dto.NPD_Branch,
                    Street = dto.NPD_Street,
                    Building = dto.NPD_Building,
                    Apartment = dto.NPD_Apartment,
                    AddressComment = dto.NPD_AddressComment,
                    PostomatNumber = dto.NPD_PostomatNumber,
                    DigitalAddressReference = dto.NPD_DigitalAddressReference
                },

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

                ManagementPeaple = dto.ManagementPeaple ?? new List<Peaple>(),

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

                ApiKeys = new ApiKeys
                {
                    NovaPoshta = dto.ApiNovaPoshtaKey,
                    LardyTrans = dto.ApiLardyTransKey
                }
            };

            ctx.Companies.Add(newCompany);
            ctx.SaveChanges();
            return CreatedAtAction(nameof(GetCompanyById), new { id = newCompany.Id }, MapToDto(newCompany));
        }

        [HttpPut("{id}")]
        public IActionResult UpdateCompany(int id, [FromBody] PostCompanyDTO dto)
        {
            var company = ctx.Companies
                .Include(c => c.Contact)
                .Include(c => c.LegalAddress)
                .Include(c => c.UkrPoshtaAddress)
                .Include(c => c.ActualAddress)
                .Include(c => c.ManagementPeaple)
                .Include(c => c.BankDetails)
                    .ThenInclude(bd => bd.CorrespondentBanks)
                .Include(c => c.ApiKeys)
                .Include(c => c.NovaPoshtaRecipient)
                .Include(c => c.NovaPoshtaDelivery)
                .FirstOrDefault(c => c.Id == id);

            if (company == null) return NotFound();

            company.Name = dto.Name;
            company.CompanyType = dto.CompanyType;
            company.CodeCompany = dto.CodeCompany;
            company.Ipn = dto.Ipn;
            company.TaxSystem = dto.TaxSystem;
            company.AdditionalInfo = dto.AdditionalInfo;
            company.LogoPath = dto.LogoPath;

            company.Contact ??= new ContactInfo();
            company.Contact.PhoneNumber = dto.PhoneNumber;
            company.Contact.Email = dto.Email;
            company.Contact.Website = dto.Website;

            company.LegalAddress ??= new Address();
            company.LegalAddress.Country = dto.LegalAddress_Country;
            company.LegalAddress.City = dto.LegalAddress_City;
            company.LegalAddress.Region = dto.LegalAddress_Region;
            company.LegalAddress.PostalCode = dto.LegalAddress_PostalCode;
            company.LegalAddress.StreetAddress = dto.LegalAddress_StreetAddress;
            company.LegalAddress.BuildingNumber = dto.LegalAddress_BuildingNumber;
            company.LegalAddress.ApartmentNumber = dto.LegalAddress_ApartmentNumber;

            company.UkrPoshtaAddress ??= new Address();
            company.UkrPoshtaAddress.Country = dto.UkrPoshtaAddress_Country;
            company.UkrPoshtaAddress.City = dto.UkrPoshtaAddress_City;
            company.UkrPoshtaAddress.Region = dto.UkrPoshtaAddress_Region;
            company.UkrPoshtaAddress.PostalCode = dto.UkrPoshtaAddress_PostalCode;
            company.UkrPoshtaAddress.StreetAddress = dto.UkrPoshtaAddress_StreetAddress;
            company.UkrPoshtaAddress.BuildingNumber = dto.UkrPoshtaAddress_BuildingNumber;
            company.UkrPoshtaAddress.ApartmentNumber = dto.UkrPoshtaAddress_ApartmentNumber;

            // Нова Пошта - Отримувач (завжди створюємо/оновлюємо)
            company.NovaPoshtaRecipient ??= new NovaPoshtaRecipient();
            
            if (dto.NovaPoshtaRecipientType.HasValue)
            {
                company.NovaPoshtaRecipient.RecipientType = (NovaPoshtaRecipientType)dto.NovaPoshtaRecipientType.Value;
            }
            
            company.NovaPoshtaRecipient.Phone = dto.NP_Phone;
            company.NovaPoshtaRecipient.LastName = dto.NP_LastName;
            company.NovaPoshtaRecipient.FirstName = dto.NP_FirstName;
            company.NovaPoshtaRecipient.MiddleName = dto.NP_MiddleName;
            company.NovaPoshtaRecipient.EdrpouCode = dto.NP_EdrpouCode;
            company.NovaPoshtaRecipient.CompanyName = dto.NP_CompanyName;
            company.NovaPoshtaRecipient.OwnershipForm = dto.NP_OwnershipForm;
            company.NovaPoshtaRecipient.OrgPhone = dto.NP_OrgPhone;
            company.NovaPoshtaRecipient.OrgLastName = dto.NP_OrgLastName;
            company.NovaPoshtaRecipient.OrgFirstName = dto.NP_OrgFirstName;
            company.NovaPoshtaRecipient.OrgMiddleName = dto.NP_OrgMiddleName;

            // Нова Пошта - Доставка (завжди створюємо/оновлюємо)
            company.NovaPoshtaDelivery ??= new NovaPoshtaDelivery();
            
            if (dto.NovaPoshtaDeliveryType.HasValue)
            {
                company.NovaPoshtaDelivery.DeliveryType = (NovaPoshtaDeliveryType)dto.NovaPoshtaDeliveryType.Value;
            }
            
            company.NovaPoshtaDelivery.City = dto.NPD_City;
            company.NovaPoshtaDelivery.Branch = dto.NPD_Branch;
            company.NovaPoshtaDelivery.Street = dto.NPD_Street;
            company.NovaPoshtaDelivery.Building = dto.NPD_Building;
            company.NovaPoshtaDelivery.Apartment = dto.NPD_Apartment;
            company.NovaPoshtaDelivery.AddressComment = dto.NPD_AddressComment;
            company.NovaPoshtaDelivery.PostomatNumber = dto.NPD_PostomatNumber;
            company.NovaPoshtaDelivery.DigitalAddressReference = dto.NPD_DigitalAddressReference;

            company.ActualAddress ??= new Address();
            company.ActualAddress.Country = dto.ActualAddress_Country;
            company.ActualAddress.City = dto.ActualAddress_City;
            company.ActualAddress.Region = dto.ActualAddress_Region;
            company.ActualAddress.PostalCode = dto.ActualAddress_PostalCode;
            company.ActualAddress.StreetAddress = dto.ActualAddress_StreetAddress;
            company.ActualAddress.BuildingNumber = dto.ActualAddress_BuildingNumber;
            company.ActualAddress.ApartmentNumber = dto.ActualAddress_ApartmentNumber;

            if (company.BankDetails != null && company.BankDetails.Any())
                ctx.RemoveRange(company.BankDetails);

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

            company.ApiKeys ??= new ApiKeys();
            company.ApiKeys.NovaPoshta = dto.ApiNovaPoshtaKey;
            company.ApiKeys.LardyTrans = dto.ApiLardyTransKey;

            ctx.SaveChanges();
            return NoContent();
        }
    }
}
