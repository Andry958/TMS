using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using DataAccess.Data.Enum;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TMS.Controllers
{
    [Route("api/client")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly TMSDbContext ctx;
        public ClientController(TMSDbContext ctx)
        {
            this.ctx = ctx;
        }

        // GET: api/client - Отримати всіх клієнтів (компанії з ParentCompanyId)
        [HttpGet]
        public IActionResult GetClients([FromQuery] int? companyId)
        {
            Console.WriteLine($"[GetClients] Отримано запит з companyId: {companyId}");
            
            if (!companyId.HasValue)
            {
                Console.WriteLine("[GetClients] CompanyId не передано - повертаємо помилку");
                return BadRequest("CompanyId is required");
            }

            var clients = ctx.Companies
                .Where(c => c.ParentCompanyId == companyId.Value)
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
                .Select(c => new
                {
                    id = c.Id,
                    name = c.Name,
                    companyType = c.CompanyType,
                    codeCompany = c.CodeCompany,
                    ipn = c.Ipn,
                    taxSystem = c.TaxSystem,
                    additionalInfo = c.AdditionalInfo,
                    logoPath = c.LogoPath,
                    phoneNumber = c.Contact != null ? c.Contact.PhoneNumber : null,
                    email = c.Contact != null ? c.Contact.Email : null,
                    website = c.Contact != null ? c.Contact.Website : null,
                    parentCompanyId = c.ParentCompanyId,
                    contactPersons = c.ManagementPeaple.Select(p => new
                    {
                        id = p.Id,
                        fullName = p.FullName,
                        position = p.Position,
                        phoneNumber = p.PhoneNumber,
                        email = p.Email
                    }).ToList()
                })
                .ToList();

            Console.WriteLine($"[GetClients] Знайдено {clients.Count} клієнтів для companyId={companyId.Value}");
            
            // Виводимо кожного клієнта окремо
            foreach (var client in clients)
            {
                Console.WriteLine($"[GetClients] Клієнт ID={client.id}: {System.Text.Json.JsonSerializer.Serialize(client, new System.Text.Json.JsonSerializerOptions { WriteIndented = true })}");
            }
            
            return Ok(clients);
        }

        // GET: api/client/{id}
        [HttpGet("{id}")]
        public IActionResult GetClientById(int id, [FromQuery] int? companyId)
        {
            var client = ctx.Companies
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
                .FirstOrDefault(c => c.Id == id && c.ParentCompanyId != null && 
                    (!companyId.HasValue || c.ParentCompanyId == companyId.Value));

            if (client == null)
            {
                return NotFound("Client not found or does not belong to specified company");
            }

            var dto = new
            {
                id = client.Id,
                name = client.Name,
                companyType = client.CompanyType,
                codeCompany = client.CodeCompany,
                ipn = client.Ipn,
                taxSystem = client.TaxSystem,
                additionalInfo = client.AdditionalInfo,
                logoPath = client.LogoPath,
                phoneNumber = client.Contact?.PhoneNumber,
                email = client.Contact?.Email,
                website = client.Contact?.Website,

                legalAddress_Country = client.LegalAddress?.Country,
                legalAddress_City = client.LegalAddress?.City,
                legalAddress_Region = client.LegalAddress?.Region,
                legalAddress_PostalCode = client.LegalAddress?.PostalCode,
                legalAddress_StreetAddress = client.LegalAddress?.StreetAddress,
                legalAddress_BuildingNumber = client.LegalAddress?.BuildingNumber,
                legalAddress_ApartmentNumber = client.LegalAddress?.ApartmentNumber,

                ukrPoshtaAddress_Country = client.UkrPoshtaAddress?.Country,
                ukrPoshtaAddress_City = client.UkrPoshtaAddress?.City,
                ukrPoshtaAddress_Region = client.UkrPoshtaAddress?.Region,
                ukrPoshtaAddress_PostalCode = client.UkrPoshtaAddress?.PostalCode,
                ukrPoshtaAddress_StreetAddress = client.UkrPoshtaAddress?.StreetAddress,
                ukrPoshtaAddress_BuildingNumber = client.UkrPoshtaAddress?.BuildingNumber,
                ukrPoshtaAddress_ApartmentNumber = client.UkrPoshtaAddress?.ApartmentNumber,

                novaPoshtaRecipientType = client.NovaPoshtaRecipient != null ? (int?)client.NovaPoshtaRecipient.RecipientType : null,
                nP_Phone = client.NovaPoshtaRecipient?.Phone,
                nP_LastName = client.NovaPoshtaRecipient?.LastName,
                nP_FirstName = client.NovaPoshtaRecipient?.FirstName,
                nP_MiddleName = client.NovaPoshtaRecipient?.MiddleName,
                nP_EdrpouCode = client.NovaPoshtaRecipient?.EdrpouCode,
                nP_CompanyName = client.NovaPoshtaRecipient?.CompanyName,
                nP_OwnershipForm = client.NovaPoshtaRecipient?.OwnershipForm,
                nP_OrgPhone = client.NovaPoshtaRecipient?.OrgPhone,
                nP_OrgLastName = client.NovaPoshtaRecipient?.OrgLastName,
                nP_OrgFirstName = client.NovaPoshtaRecipient?.OrgFirstName,
                nP_OrgMiddleName = client.NovaPoshtaRecipient?.OrgMiddleName,

                novaPoshtaDeliveryType = client.NovaPoshtaDelivery != null ? (int?)client.NovaPoshtaDelivery.DeliveryType : null,
                npD_City = client.NovaPoshtaDelivery?.City,
                npD_Branch = client.NovaPoshtaDelivery?.Branch,
                npD_Street = client.NovaPoshtaDelivery?.Street,
                npD_Building = client.NovaPoshtaDelivery?.Building,
                npD_Apartment = client.NovaPoshtaDelivery?.Apartment,
                npD_AddressComment = client.NovaPoshtaDelivery?.AddressComment,
                npD_PostomatNumber = client.NovaPoshtaDelivery?.PostomatNumber,
                npD_DigitalAddressReference = client.NovaPoshtaDelivery?.DigitalAddressReference,

                actualAddress_Country = client.ActualAddress?.Country,
                actualAddress_City = client.ActualAddress?.City,
                actualAddress_Region = client.ActualAddress?.Region,
                actualAddress_PostalCode = client.ActualAddress?.PostalCode,
                actualAddress_StreetAddress = client.ActualAddress?.StreetAddress,
                actualAddress_BuildingNumber = client.ActualAddress?.BuildingNumber,
                actualAddress_ApartmentNumber = client.ActualAddress?.ApartmentNumber,

                bankDetails = client.BankDetails?.Select(bd => new
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

                apiNovaPoshtaKey = client.ApiKeys?.NovaPoshta,
                apiLardyTransKey = client.ApiKeys?.LardyTrans,

                contactPersons = client.ManagementPeaple?.Select(p => new
                {
                    id = p.Id,
                    fullName = p.FullName,
                    position = p.Position,
                    phoneNumber = p.PhoneNumber,
                    email = p.Email
                }).ToList()
            };

            return Ok(dto);
        }

        // POST: api/client
        [HttpPost]
        public IActionResult CreateClient([FromBody] PostCompanyDTO dto)
        {
            Console.WriteLine($"[CreateClient] Отримано запит. ParentCompanyId з DTO: {dto.ParentCompanyId}");
            
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.CodeCompany))
            {
                return BadRequest("Name and CodeCompany are required");
            }

            // Перевіряємо чи передано ParentCompanyId через DTO або використовуємо головну компанію
            int? parentCompanyId = dto.ParentCompanyId;
            
            if (!parentCompanyId.HasValue)
            {
                // Якщо не передано, отримуємо головну компанію (перша з ParentCompanyId = null)
                var parentCompany = ctx.Companies.FirstOrDefault(c => c.ParentCompanyId == null);
                if (parentCompany == null)
                {
                    return BadRequest("Parent company not found. Create main company first.");
                }
                parentCompanyId = parentCompany.Id;
            }
            else
            {
                // Перевіряємо чи існує вказана батьківська компанія
                var parentExists = ctx.Companies.Any(c => c.Id == parentCompanyId.Value);
                if (!parentExists)
                {
                    return BadRequest($"Parent company with ID {parentCompanyId.Value} not found.");
                }
            }

            Console.WriteLine($"[CreateClient] Використовується ParentCompanyId: {parentCompanyId.Value}");

            var newClient = new Company
            {
                Name = dto.Name,
                CompanyType = dto.CompanyType,
                CodeCompany = dto.CodeCompany,
                Ipn = dto.Ipn,
                TaxSystem = dto.TaxSystem,
                AdditionalInfo = dto.AdditionalInfo,
                LogoPath = dto.LogoPath,

                ParentCompanyId = parentCompanyId.Value,

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

            ctx.Companies.Add(newClient);
            ctx.SaveChanges();

            return CreatedAtAction(nameof(GetClientById), new { id = newClient.Id }, new { id = newClient.Id });
        }

        // PUT: api/client/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateClient(int id, [FromBody] PostCompanyDTO dto)
        {
            // Перевіряємо, що клієнт належить до вказаної батьківської компанії
            var client = ctx.Companies
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
                .FirstOrDefault(c => c.Id == id && c.ParentCompanyId != null &&
                    (!dto.ParentCompanyId.HasValue || c.ParentCompanyId == dto.ParentCompanyId.Value));

            if (client == null) return NotFound("Client not found or does not belong to specified company");

            client.Name = dto.Name;
            client.CompanyType = dto.CompanyType;
            client.CodeCompany = dto.CodeCompany;
            client.Ipn = dto.Ipn;
            client.TaxSystem = dto.TaxSystem;
            client.AdditionalInfo = dto.AdditionalInfo;
            client.LogoPath = dto.LogoPath;

            client.Contact ??= new ContactInfo();
            client.Contact.PhoneNumber = dto.PhoneNumber;
            client.Contact.Email = dto.Email;
            client.Contact.Website = dto.Website;

            client.LegalAddress ??= new Address();
            client.LegalAddress.Country = dto.LegalAddress_Country;
            client.LegalAddress.City = dto.LegalAddress_City;
            client.LegalAddress.Region = dto.LegalAddress_Region;
            client.LegalAddress.PostalCode = dto.LegalAddress_PostalCode;
            client.LegalAddress.StreetAddress = dto.LegalAddress_StreetAddress;
            client.LegalAddress.BuildingNumber = dto.LegalAddress_BuildingNumber;
            client.LegalAddress.ApartmentNumber = dto.LegalAddress_ApartmentNumber;

            client.UkrPoshtaAddress ??= new Address();
            client.UkrPoshtaAddress.Country = dto.UkrPoshtaAddress_Country;
            client.UkrPoshtaAddress.City = dto.UkrPoshtaAddress_City;
            client.UkrPoshtaAddress.Region = dto.UkrPoshtaAddress_Region;
            client.UkrPoshtaAddress.PostalCode = dto.UkrPoshtaAddress_PostalCode;
            client.UkrPoshtaAddress.StreetAddress = dto.UkrPoshtaAddress_StreetAddress;
            client.UkrPoshtaAddress.BuildingNumber = dto.UkrPoshtaAddress_BuildingNumber;
            client.UkrPoshtaAddress.ApartmentNumber = dto.UkrPoshtaAddress_ApartmentNumber;

            // Нова Пошта - Отримувач (завжди створюємо/оновлюємо)
            client.NovaPoshtaRecipient ??= new NovaPoshtaRecipient();
            
            if (dto.NovaPoshtaRecipientType.HasValue)
            {
                client.NovaPoshtaRecipient.RecipientType = (NovaPoshtaRecipientType)dto.NovaPoshtaRecipientType.Value;
            }
            
            client.NovaPoshtaRecipient.Phone = dto.NP_Phone;
            client.NovaPoshtaRecipient.LastName = dto.NP_LastName;
            client.NovaPoshtaRecipient.FirstName = dto.NP_FirstName;
            client.NovaPoshtaRecipient.MiddleName = dto.NP_MiddleName;
            client.NovaPoshtaRecipient.EdrpouCode = dto.NP_EdrpouCode;
            client.NovaPoshtaRecipient.CompanyName = dto.NP_CompanyName;
            client.NovaPoshtaRecipient.OwnershipForm = dto.NP_OwnershipForm;
            client.NovaPoshtaRecipient.OrgPhone = dto.NP_OrgPhone;
            client.NovaPoshtaRecipient.OrgLastName = dto.NP_OrgLastName;
            client.NovaPoshtaRecipient.OrgFirstName = dto.NP_OrgFirstName;
            client.NovaPoshtaRecipient.OrgMiddleName = dto.NP_OrgMiddleName;

            // Нова Пошта - Доставка (завжди створюємо/оновлюємо)
            client.NovaPoshtaDelivery ??= new NovaPoshtaDelivery();
            
            if (dto.NovaPoshtaDeliveryType.HasValue)
            {
                client.NovaPoshtaDelivery.DeliveryType = (NovaPoshtaDeliveryType)dto.NovaPoshtaDeliveryType.Value;
            }
            
            client.NovaPoshtaDelivery.City = dto.NPD_City;
            client.NovaPoshtaDelivery.Branch = dto.NPD_Branch;
            client.NovaPoshtaDelivery.Street = dto.NPD_Street;
            client.NovaPoshtaDelivery.Building = dto.NPD_Building;
            client.NovaPoshtaDelivery.Apartment = dto.NPD_Apartment;
            client.NovaPoshtaDelivery.AddressComment = dto.NPD_AddressComment;
            client.NovaPoshtaDelivery.PostomatNumber = dto.NPD_PostomatNumber;
            client.NovaPoshtaDelivery.DigitalAddressReference = dto.NPD_DigitalAddressReference;

            client.ActualAddress ??= new Address();
            client.ActualAddress.Country = dto.ActualAddress_Country;
            client.ActualAddress.City = dto.ActualAddress_City;
            client.ActualAddress.Region = dto.ActualAddress_Region;
            client.ActualAddress.PostalCode = dto.ActualAddress_PostalCode;
            client.ActualAddress.StreetAddress = dto.ActualAddress_StreetAddress;
            client.ActualAddress.BuildingNumber = dto.ActualAddress_BuildingNumber;
            client.ActualAddress.ApartmentNumber = dto.ActualAddress_ApartmentNumber;

            // Оновлення банківських реквізитів
            if (client.BankDetails != null)
            {
                foreach (var bd in client.BankDetails)
                {
                    ctx.Entry(bd).Collection(b => b.CorrespondentBanks).Load();
                }
                ctx.RemoveRange(client.BankDetails);
            }

            client.BankDetails = dto.BankDetails?.Select(bd => new BankDetails
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

            client.ApiKeys ??= new ApiKeys();
            client.ApiKeys.NovaPoshta = dto.ApiNovaPoshtaKey;
            client.ApiKeys.LardyTrans = dto.ApiLardyTransKey;

            ctx.SaveChanges();

            return Ok(new { message = "Client updated successfully", id = client.Id });
        }

        // DELETE: api/client/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteClient(int id, [FromQuery] int? companyId)
        {
            var client = ctx.Companies
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
                .FirstOrDefault(c => c.Id == id && c.ParentCompanyId != null &&
                    (!companyId.HasValue || c.ParentCompanyId == companyId.Value));

            if (client == null)
            {
                return NotFound("Client not found or does not belong to specified company");
            }

            Console.WriteLine($"[DeleteClient] Видалення клієнта ID={id}, Назва={client.Name}");

            // Видаляємо ManagementPeaple (окрема таблиця)
            if (client.ManagementPeaple != null && client.ManagementPeaple.Any())
            {
                ctx.Peaples.RemoveRange(client.ManagementPeaple);
            }

            // Видаляємо BankDetails з CorrespondentBanks (окрема таблиця)
            if (client.BankDetails != null && client.BankDetails.Any())
            {
                // CorrespondentBanks видаляться автоматично, оскільки це owned type
                ctx.BankDetails.RemoveRange(client.BankDetails);
            }

            // Owned types (Contact, Addresses, ApiKeys, NovaPoshtaRecipient, NovaPoshtaDelivery)
            // видаляться автоматично при видаленні головної сутності

            // Тепер видаляємо саму компанію
            ctx.Companies.Remove(client);
            ctx.SaveChanges();

            Console.WriteLine($"[DeleteClient] Клієнт ID={id} успішно видалено");
            return Ok(new { message = "Client deleted successfully" });
        }
    }
}
