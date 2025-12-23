using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace TMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrackingController : ControllerBase
    {
        private readonly TMSDbContext ctx;

        public TrackingController(TMSDbContext context)
        {
            ctx = context;
        }
        //[HttpGet]
        //public IActionResult GetAllTrackings()
        //{
        //    var trackings = ctx.Trackings.ToList();
        //    return Ok(trackings);
        //}
        // id
        [HttpGet("{id}")]
        public IActionResult GetTrackingById(int id)
        {
            var tracking = ctx.Trackings.Find(id);
            if (tracking == null)
            {
                return NotFound();
            }
            return Ok(tracking);
        }
        [HttpGet("company/{companyId}")]
        public async Task<IActionResult> GetTrackingsByCompanyId(int companyId)
        {
            var company = await ctx.Companies
                .Include(c => c.CompanyTrackings)
                .Include(c => c.ApiKeys)
                .FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null)
                return NotFound("Company not found");

            foreach (var tracking in company.CompanyTrackings)
            {
                var np = await LoadFromNovaPoshta(tracking.Number, company.ApiKeys.NovaPoshta);
                if (np == null)
                    continue;

                // 🔄 оновлення полів
                tracking.Status = np.Status;
                tracking.StatusCode = np.StatusCode;
                tracking.TrackingUpdateDate = np.TrackingUpdateDate;
                tracking.ActualDeliveryDate = np.ActualDeliveryDate;
                tracking.RecipientDateTime = np.RecipientDateTime;
                tracking.ExpressWaybillPaymentStatus = np.ExpressWaybillPaymentStatus;
                tracking.ExpressWaybillAmountToPay = np.ExpressWaybillAmountToPay;
            }

            await ctx.SaveChangesAsync();

            return Ok(company.CompanyTrackings);
        }

        [HttpPost]
        public IActionResult AddTracking([FromBody] AddTrackingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var company = ctx.Companies.Find(dto.IdCompany);
            if (company == null)
                return NotFound("Company not found");

            var TTN = dto.TTN;

            var url = "https://api.novaposhta.ua/v2.0/json/";

            var json = $@"{{
        ""apiKey"": ""{company.ApiKeys.NovaPoshta}"",
        ""modelName"": ""TrackingDocumentGeneral"",
        ""calledMethod"": ""getStatusDocuments"",
        ""methodProperties"": {{
            ""Documents"": [
                {{ ""DocumentNumber"": ""{TTN}"" }}
            ]
        }}
    }}";

            using var client = new HttpClient();
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = client.PostAsync(url, content).Result;
            var resultJson = response.Content.ReadAsStringAsync().Result;

            var npResponse = JsonSerializer.Deserialize<NovaPoshtaResponse>(
                resultJson,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            if (npResponse == null || !npResponse.success || npResponse.data.Count == 0)
                return BadRequest("Tracking not found");

            var np = npResponse.data.First();

            

            // 🔥 ГОЛОВНЕ — збереження
            var tracking = new Tracking
            {
                Number = np.Number,
                StatusCode = np.StatusCode,
                DateCreated = np.DateCreated,
                Status = np.Status,
                RefEW = np.RefEW,

                RecipientDateTime = np.RecipientDateTime,

                CargoType = np.CargoType,
                CargoDescriptionString = np.CargoDescriptionString,

                DocumentCost = np.DocumentCost,
                AnnouncedPrice = np.AnnouncedPrice,

                DocumentWeight = np.DocumentWeight,
                CheckWeight = np.CheckWeight,
                CalculatedWeight = np.CalculatedWeight,
                CheckWeightMethod = np.CheckWeightMethod,
                FactualWeight = np.FactualWeight,
                VolumeWeight = np.VolumeWeight,

                SeatsAmount = np.SeatsAmount,
                ServiceType = np.ServiceType,

                CitySender = np.CitySender,
                CounterpartySenderDescription = np.CounterpartySenderDescription,
                CounterpartySenderType = np.CounterpartySenderType,
                PhoneSender = np.PhoneSender,
                SenderAddress = np.SenderAddress,
                SenderFullNameEW = np.SenderFullNameEW,
                WarehouseSender = np.WarehouseSender,

                CityRecipient = np.CityRecipient,
                CounterpartyRecipientDescription = np.CounterpartyRecipientDescription,
                PhoneRecipient = np.PhoneRecipient,
                RecipientAddress = np.RecipientAddress,
                RecipientFullName = np.RecipientFullName,
                WarehouseRecipient = np.WarehouseRecipient,
                WarehouseRecipientNumber = np.WarehouseRecipientNumber,

                PayerType = np.PayerType,
                PaymentMethod = np.PaymentMethod,
                ExpressWaybillPaymentStatus = np.ExpressWaybillPaymentStatus,
                ExpressWaybillAmountToPay = np.ExpressWaybillAmountToPay,

                ScheduledDeliveryDate = np.ScheduledDeliveryDate,
                ActualDeliveryDate = np.ActualDeliveryDate,
                DateScan = np.DateScan,
                TrackingUpdateDate = np.TrackingUpdateDate,

                CargoReturnRefusal = np.CargoReturnRefusal,
                SecurePayment = np.SecurePayment,

                PossibilityCreateClaim = np.PossibilityCreateClaim,
                PossibilityCreateReturn = np.PossibilityCreateReturn
            };

            company.CompanyTrackings.Add(tracking);
            ctx.SaveChanges();

            return Ok(tracking);
        }
        private async Task<Tracking?> LoadFromNovaPoshta(string ttn, string apiKey)
        {
            var url = "https://api.novaposhta.ua/v2.0/json/";

            var json = $@"{{
        ""apiKey"": ""{apiKey}"",
        ""modelName"": ""TrackingDocumentGeneral"",
        ""calledMethod"": ""getStatusDocuments"",
        ""methodProperties"": {{
            ""Documents"": [
                {{ ""DocumentNumber"": ""{ttn}"" }}
            ]
        }}
    }}";

            using var client = new HttpClient();
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await client.PostAsync(url, content);
            var resultJson = await response.Content.ReadAsStringAsync();

            var npResponse = JsonSerializer.Deserialize<NovaPoshtaResponse>(
                resultJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (npResponse == null || !npResponse.success || npResponse.data.Count == 0)
                return null;

            return npResponse.data.First();
        }
        // edit
        [HttpPut("{id}")]
        public IActionResult EditTracking(int id, [FromBody] Tracking tracking)
        {
            if (id != tracking.Id)
            {
                return BadRequest();
            }

            ctx.Entry(tracking).State = EntityState.Modified;
            ctx.SaveChanges();

            return NoContent();
        }

    }


    public class NovaPoshtaResponse
    {
        public bool success { get; set; }
        public List<Tracking> data { get; set; }
    }
    public class AddTrackingDto
    {
        public string TTN { get; set; } = null!;
        public int IdCompany { get; set; }
    }
}
