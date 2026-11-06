using DataAccess.Data;
using DataAccess.Data.Entities;
using DataAccess.Data.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Security.Claims;

namespace TMS.Controllers
{
    [Route("api/client")]
    [ApiController]
    [Authorize]
    public class ClientController : ControllerBase
    {
        private readonly TMSDbContext ctx;

        public ClientController(TMSDbContext ctx)
        {
            this.ctx = ctx;
        }

        private async Task<int?> GetCurrentCompanyIdAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return null;

            return await ctx.Users
                .Where(user => user.Id == userId)
                .Select(user => user.CompanyId)
                .SingleOrDefaultAsync();
        }

        [HttpGet]
        public async Task<IActionResult> GetClients([FromQuery] int? companyId)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return Ok(Array.Empty<ClientCompanyDto>());
            if (companyId.HasValue && companyId.Value != ownedCompanyId.Value) return Forbid();

            var clients = await ctx.ClientCompanies
                .AsNoTracking()
                .Where(client => client.ParentCompanyId == ownedCompanyId.Value)
                .Include(client => client.ContactPeople)
                .Include(client => client.BankDetails)
                    .ThenInclude(bank => bank.CorrespondentBanks)
                .ToListAsync();

            return Ok(clients.Select(ToDto));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetClientById(int id, [FromQuery] int? companyId)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return NotFound();
            if (companyId.HasValue && companyId.Value != ownedCompanyId.Value) return Forbid();

            var client = await ctx.ClientCompanies
                .AsNoTracking()
                .Include(item => item.ContactPeople)
                .Include(item => item.BankDetails)
                    .ThenInclude(bank => bank.CorrespondentBanks)
                .FirstOrDefaultAsync(item =>
                    item.Id == id && item.ParentCompanyId == ownedCompanyId.Value);

            return client is null ? NotFound("Client not found") : Ok(ToDto(client));
        }

        [HttpPost]
        public async Task<IActionResult> CreateClient([FromBody] CreateClientCompanyRequest request)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return Forbid();
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.CodeCompany))
                return BadRequest(new { message = "Name and CodeCompany are required." });

            var client = new ClientCompany
            {
                ParentCompanyId = ownedCompanyId.Value,
                CreatedAt = DateTime.UtcNow
            };
            ApplyRequest(client, request);
            client.ContactPeople = request.ContactPersons.Select(person => new ClientCompanyContact
            {
                FullName = person.FullName.Trim(),
                Position = person.Position,
                PhoneNumber = person.PhoneNumber,
                Email = person.Email
            }).ToList();
            client.BankDetails = request.BankDetails.Select(ToBankDetails).ToList();

            ctx.ClientCompanies.Add(client);
            await ctx.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetClientById),
                new { id = client.Id },
                ToDto(client));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] ClientCompanyRequest request)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return NotFound();
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.CodeCompany))
                return BadRequest(new { message = "Name and CodeCompany are required." });

            var client = await ctx.ClientCompanies
                .Include(item => item.BankDetails)
                    .ThenInclude(bank => bank.CorrespondentBanks)
                .FirstOrDefaultAsync(item =>
                    item.Id == id && item.ParentCompanyId == ownedCompanyId.Value);
            if (client is null) return NotFound("Client not found");

            ApplyRequest(client, request);
            ctx.ClientCompanyBankDetails.RemoveRange(client.BankDetails);
            client.BankDetails = request.BankDetails.Select(ToBankDetails).ToList();
            client.UpdatedAt = DateTime.UtcNow;
            await ctx.SaveChangesAsync();

            return Ok(ToDto(client));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteClient(int id, [FromQuery] int? companyId)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return NotFound();
            if (companyId.HasValue && companyId.Value != ownedCompanyId.Value) return Forbid();

            var client = await ctx.ClientCompanies.FirstOrDefaultAsync(item =>
                item.Id == id && item.ParentCompanyId == ownedCompanyId.Value);
            if (client is null) return NotFound("Client not found");

            ctx.ClientCompanies.Remove(client);
            await ctx.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id:int}/contacts")]
        public async Task<IActionResult> AddContact(int id, [FromBody] ClientCompanyContactRequest request)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return NotFound();
            if (string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest(new { message = "FullName is required." });

            var client = await ctx.ClientCompanies.FirstOrDefaultAsync(item =>
                item.Id == id && item.ParentCompanyId == ownedCompanyId.Value);
            if (client is null) return NotFound("Client not found");

            var contact = new ClientCompanyContact
            {
                ClientCompanyId = client.Id,
                FullName = request.FullName,
                Position = request.Position,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email
            };
            ctx.ClientCompanyContacts.Add(contact);
            await ctx.SaveChangesAsync();

            return Ok(contact);
        }

        [HttpDelete("{id:int}/contacts/{contactId:int}")]
        public async Task<IActionResult> DeleteContact(int id, int contactId)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (!ownedCompanyId.HasValue) return NotFound();

            var contact = await ctx.ClientCompanyContacts.FirstOrDefaultAsync(item =>
                item.Id == contactId &&
                item.ClientCompanyId == id &&
                item.ClientCompany!.ParentCompanyId == ownedCompanyId.Value);
            if (contact is null) return NotFound("Contact not found");

            ctx.ClientCompanyContacts.Remove(contact);
            await ctx.SaveChangesAsync();
            return NoContent();
        }

        private static void ApplyRequest(ClientCompany client, ClientCompanyRequest request)
        {
            client.Name = request.Name.Trim();
            client.CompanyType = request.CompanyType;
            client.CodeCompany = request.CodeCompany.Trim();
            client.Ipn = request.Ipn;
            client.TaxSystem = request.TaxSystem;
            client.AdditionalInfo = request.AdditionalInfo;
            client.LogoPath = request.LogoPath;
            client.Contact.PhoneNumber = request.PhoneNumber;
            client.Contact.Email = request.Email;
            client.Contact.Website = request.Website;
            ApplyAddress(client.LegalAddress,
                request.LegalAddress_Country,
                request.LegalAddress_City,
                request.LegalAddress_Region,
                request.LegalAddress_PostalCode,
                request.LegalAddress_StreetAddress,
                request.LegalAddress_BuildingNumber,
                request.LegalAddress_ApartmentNumber);
            ApplyAddress(client.UkrPoshtaAddress,
                request.UkrPoshtaAddress_Country,
                request.UkrPoshtaAddress_City,
                request.UkrPoshtaAddress_Region,
                request.UkrPoshtaAddress_PostalCode,
                request.UkrPoshtaAddress_StreetAddress,
                request.UkrPoshtaAddress_BuildingNumber,
                request.UkrPoshtaAddress_ApartmentNumber);
            ApplyAddress(client.ActualAddress,
                request.ActualAddress_Country,
                request.ActualAddress_City,
                request.ActualAddress_Region,
                request.ActualAddress_PostalCode,
                request.ActualAddress_StreetAddress,
                request.ActualAddress_BuildingNumber,
                request.ActualAddress_ApartmentNumber);
            client.NovaPoshtaRecipientType = request.NovaPoshtaRecipientType.HasValue
                ? (NovaPoshtaRecipientType)request.NovaPoshtaRecipientType.Value
                : null;
            client.NP_Phone = request.NP_Phone;
            client.NP_LastName = request.NP_LastName;
            client.NP_FirstName = request.NP_FirstName;
            client.NP_MiddleName = request.NP_MiddleName;
            client.NP_EdrpouCode = request.NP_EdrpouCode;
            client.NP_CompanyName = request.NP_CompanyName;
            client.NP_OwnershipForm = request.NP_OwnershipForm;
            client.NP_OrgPhone = request.NP_OrgPhone;
            client.NP_OrgLastName = request.NP_OrgLastName;
            client.NP_OrgFirstName = request.NP_OrgFirstName;
            client.NP_OrgMiddleName = request.NP_OrgMiddleName;
            client.NovaPoshtaDeliveryType = request.NovaPoshtaDeliveryType.HasValue
                ? (NovaPoshtaDeliveryType)request.NovaPoshtaDeliveryType.Value
                : null;
            client.NPD_City = request.NPD_City;
            client.NPD_Branch = request.NPD_Branch;
            client.NPD_Street = request.NPD_Street;
            client.NPD_Building = request.NPD_Building;
            client.NPD_Apartment = request.NPD_Apartment;
            client.NPD_AddressComment = request.NPD_AddressComment;
            client.NPD_PostomatNumber = request.NPD_PostomatNumber;
            client.NPD_DigitalAddressReference = request.NPD_DigitalAddressReference;
        }

        private static ClientCompanyBankDetails ToBankDetails(ClientCompanyBankDetailsRequest bank) => new()
        {
            TypeAccount = bank.TypeAccount,
            Currency = bank.Currency,
            BankName = bank.BankName,
            BankMfo = bank.BankMfo,
            Iban = bank.Iban,
            Swift = bank.Swift,
            BankOfBeneficiary = bank.BankOfBeneficiary,
            CorrespondentBanks = bank.CorrespondentBanks.Select(correspondent => new ClientCompanyCorrespondentBank
            {
                BankName = correspondent.BankName,
                Swift = correspondent.Swift
            }).ToList()
        };

        private static void ApplyAddress(
            Address address,
            string? country,
            string? city,
            string? region,
            string? postalCode,
            string? streetAddress,
            string? buildingNumber,
            string? apartmentNumber)
        {
            address.Country = country;
            address.City = city;
            address.Region = region;
            address.PostalCode = postalCode;
            address.StreetAddress = streetAddress;
            address.BuildingNumber = buildingNumber;
            address.ApartmentNumber = apartmentNumber;
        }

        private static ClientCompanyDto ToDto(ClientCompany client) => new()
        {
            Id = client.Id,
            Name = client.Name,
            CompanyType = client.CompanyType,
            CodeCompany = client.CodeCompany,
            Ipn = client.Ipn,
            TaxSystem = client.TaxSystem,
            AdditionalInfo = client.AdditionalInfo,
            LogoPath = client.LogoPath,
            ParentCompanyId = client.ParentCompanyId,
            PhoneNumber = client.Contact.PhoneNumber,
            Email = client.Contact.Email,
            Website = client.Contact.Website,
            LegalAddress_Country = client.LegalAddress.Country,
            LegalAddress_City = client.LegalAddress.City,
            LegalAddress_Region = client.LegalAddress.Region,
            LegalAddress_PostalCode = client.LegalAddress.PostalCode,
            LegalAddress_StreetAddress = client.LegalAddress.StreetAddress,
            LegalAddress_BuildingNumber = client.LegalAddress.BuildingNumber,
            LegalAddress_ApartmentNumber = client.LegalAddress.ApartmentNumber,
            UkrPoshtaAddress_Country = client.UkrPoshtaAddress.Country,
            UkrPoshtaAddress_City = client.UkrPoshtaAddress.City,
            UkrPoshtaAddress_Region = client.UkrPoshtaAddress.Region,
            UkrPoshtaAddress_PostalCode = client.UkrPoshtaAddress.PostalCode,
            UkrPoshtaAddress_StreetAddress = client.UkrPoshtaAddress.StreetAddress,
            UkrPoshtaAddress_BuildingNumber = client.UkrPoshtaAddress.BuildingNumber,
            UkrPoshtaAddress_ApartmentNumber = client.UkrPoshtaAddress.ApartmentNumber,
            ActualAddress_Country = client.ActualAddress.Country,
            ActualAddress_City = client.ActualAddress.City,
            ActualAddress_Region = client.ActualAddress.Region,
            ActualAddress_PostalCode = client.ActualAddress.PostalCode,
            ActualAddress_StreetAddress = client.ActualAddress.StreetAddress,
            ActualAddress_BuildingNumber = client.ActualAddress.BuildingNumber,
            ActualAddress_ApartmentNumber = client.ActualAddress.ApartmentNumber,
            NovaPoshtaRecipientType = client.NovaPoshtaRecipientType.HasValue
                ? (int)client.NovaPoshtaRecipientType.Value
                : null,
            NP_Phone = client.NP_Phone,
            NP_LastName = client.NP_LastName,
            NP_FirstName = client.NP_FirstName,
            NP_MiddleName = client.NP_MiddleName,
            NP_EdrpouCode = client.NP_EdrpouCode,
            NP_CompanyName = client.NP_CompanyName,
            NP_OwnershipForm = client.NP_OwnershipForm,
            NP_OrgPhone = client.NP_OrgPhone,
            NP_OrgLastName = client.NP_OrgLastName,
            NP_OrgFirstName = client.NP_OrgFirstName,
            NP_OrgMiddleName = client.NP_OrgMiddleName,
            NovaPoshtaDeliveryType = client.NovaPoshtaDeliveryType.HasValue
                ? (int)client.NovaPoshtaDeliveryType.Value
                : null,
            NPD_City = client.NPD_City,
            NPD_Branch = client.NPD_Branch,
            NPD_Street = client.NPD_Street,
            NPD_Building = client.NPD_Building,
            NPD_Apartment = client.NPD_Apartment,
            NPD_AddressComment = client.NPD_AddressComment,
            NPD_PostomatNumber = client.NPD_PostomatNumber,
            NPD_DigitalAddressReference = client.NPD_DigitalAddressReference,
            BankDetails = client.BankDetails.Select(bank => new ClientCompanyBankDetailsRequest
            {
                TypeAccount = bank.TypeAccount,
                Currency = bank.Currency,
                BankName = bank.BankName,
                BankMfo = bank.BankMfo,
                Iban = bank.Iban,
                Swift = bank.Swift,
                BankOfBeneficiary = bank.BankOfBeneficiary,
                CorrespondentBanks = bank.CorrespondentBanks.Select(correspondent => new ClientCompanyCorrespondentBankRequest
                {
                    BankName = correspondent.BankName,
                    Swift = correspondent.Swift
                }).ToList()
            }).ToList(),
            ContactPersons = client.ContactPeople.Select(person => new ClientCompanyContactDto
            {
                Id = person.Id,
                FullName = person.FullName,
                Position = person.Position,
                PhoneNumber = person.PhoneNumber,
                Email = person.Email
            }).ToList()
        };
    }

    public class ClientCompanyRequest
    {
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? CompanyType { get; set; }

        [Required, MaxLength(50)]
        public string CodeCompany { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Ipn { get; set; }

        [MaxLength(100)]
        public string? TaxSystem { get; set; }

        public string? AdditionalInfo { get; set; }
        public string? LogoPath { get; set; }
        public string? PhoneNumber { get; set; }
        [EmailAddress, MaxLength(254)]
        public string? Email { get; set; }
        public string? Website { get; set; }

        public string? LegalAddress_Country { get; set; }
        public string? LegalAddress_City { get; set; }
        public string? LegalAddress_Region { get; set; }
        public string? LegalAddress_PostalCode { get; set; }
        public string? LegalAddress_StreetAddress { get; set; }
        public string? LegalAddress_BuildingNumber { get; set; }
        public string? LegalAddress_ApartmentNumber { get; set; }

        public string? UkrPoshtaAddress_Country { get; set; }
        public string? UkrPoshtaAddress_City { get; set; }
        public string? UkrPoshtaAddress_Region { get; set; }
        public string? UkrPoshtaAddress_PostalCode { get; set; }
        public string? UkrPoshtaAddress_StreetAddress { get; set; }
        public string? UkrPoshtaAddress_BuildingNumber { get; set; }
        public string? UkrPoshtaAddress_ApartmentNumber { get; set; }

        public string? ActualAddress_Country { get; set; }
        public string? ActualAddress_City { get; set; }
        public string? ActualAddress_Region { get; set; }
        public string? ActualAddress_PostalCode { get; set; }
        public string? ActualAddress_StreetAddress { get; set; }
        public string? ActualAddress_BuildingNumber { get; set; }
        public string? ActualAddress_ApartmentNumber { get; set; }

        public int? NovaPoshtaRecipientType { get; set; }
        [JsonPropertyName("nP_Phone")]
        public string? NP_Phone { get; set; }
        [JsonPropertyName("nP_LastName")]
        public string? NP_LastName { get; set; }
        [JsonPropertyName("nP_FirstName")]
        public string? NP_FirstName { get; set; }
        [JsonPropertyName("nP_MiddleName")]
        public string? NP_MiddleName { get; set; }
        [JsonPropertyName("nP_EdrpouCode")]
        public string? NP_EdrpouCode { get; set; }
        [JsonPropertyName("nP_CompanyName")]
        public string? NP_CompanyName { get; set; }
        [JsonPropertyName("nP_OwnershipForm")]
        public string? NP_OwnershipForm { get; set; }
        [JsonPropertyName("nP_OrgPhone")]
        public string? NP_OrgPhone { get; set; }
        [JsonPropertyName("nP_OrgLastName")]
        public string? NP_OrgLastName { get; set; }
        [JsonPropertyName("nP_OrgFirstName")]
        public string? NP_OrgFirstName { get; set; }
        [JsonPropertyName("nP_OrgMiddleName")]
        public string? NP_OrgMiddleName { get; set; }
        public int? NovaPoshtaDeliveryType { get; set; }
        [JsonPropertyName("npD_City")]
        public string? NPD_City { get; set; }
        [JsonPropertyName("npD_Branch")]
        public string? NPD_Branch { get; set; }
        [JsonPropertyName("npD_Street")]
        public string? NPD_Street { get; set; }
        [JsonPropertyName("npD_Building")]
        public string? NPD_Building { get; set; }
        [JsonPropertyName("npD_Apartment")]
        public string? NPD_Apartment { get; set; }
        [JsonPropertyName("npD_AddressComment")]
        public string? NPD_AddressComment { get; set; }
        [JsonPropertyName("npD_PostomatNumber")]
        public string? NPD_PostomatNumber { get; set; }
        [JsonPropertyName("npD_DigitalAddressReference")]
        public string? NPD_DigitalAddressReference { get; set; }
        public List<ClientCompanyBankDetailsRequest> BankDetails { get; set; } = new();
    }

    public class ClientCompanyBankDetailsRequest
    {
        [EnumDataType(typeof(TypeAccount))]
        public TypeAccount TypeAccount { get; set; } = TypeAccount.Hryvnia;
        [EnumDataType(typeof(CurrencyCode))]
        public CurrencyCode Currency { get; set; } = CurrencyCode.UAH;
        public string? BankName { get; set; }
        public string? BankMfo { get; set; }
        public string? Iban { get; set; }
        public string? Swift { get; set; }
        public string? BankOfBeneficiary { get; set; }
        public List<ClientCompanyCorrespondentBankRequest> CorrespondentBanks { get; set; } = new();
    }

    public class ClientCompanyCorrespondentBankRequest
    {
        public string? BankName { get; set; }
        public string? Swift { get; set; }
    }

    public class ClientCompanyContactRequest
    {
        [Required, MaxLength(200)]
        public string FullName { get; set; } = string.Empty;
        public PositionType? Position { get; set; }
        [MaxLength(50)]
        public string? PhoneNumber { get; set; }
        [EmailAddress, MaxLength(254)]
        public string? Email { get; set; }
    }

    public class CreateClientCompanyRequest : ClientCompanyRequest
    {
        public List<ClientCompanyContactRequest> ContactPersons { get; set; } = new();
    }

    public class ClientCompanyDto : ClientCompanyRequest
    {
        public int Id { get; set; }
        public int ParentCompanyId { get; set; }
        public List<ClientCompanyContactDto> ContactPersons { get; set; } = new();
    }

    public class ClientCompanyContactDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public PositionType? Position { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
    }
}
