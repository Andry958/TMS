using DataAccess.Data;
using DataAccess.Data.Entities;
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
        private readonly TMSDbContext _ctx;
        private readonly IHttpClientFactory _httpClientFactory;

        public TrackingController(TMSDbContext context, IHttpClientFactory httpClientFactory)
        {
            _ctx = context;
            _httpClientFactory = httpClientFactory;
        }

        // ================= GET BY COMPANY WITH PAGINATION =================
        [HttpGet("company/{companyId}")]
        public async Task<IActionResult> GetTrackingsByCompanyId(
            int companyId,
            [FromQuery] int? page = null,
            [FromQuery] int? pageSize = null,
            [FromQuery] string sortOrder = "desc")
        {
            var companyExists = await _ctx.Companies.AnyAsync(c => c.Id == companyId);
            if (!companyExists) return NotFound("Company not found");

            var query = _ctx.Trackings
                .Where(t => t.CompanyId == companyId)
                .AsQueryable();

            query = sortOrder?.ToLower() == "asc"
                ? query.OrderBy(t => t.Id)
                : query.OrderByDescending(t => t.Id);

            if (!page.HasValue || !pageSize.HasValue)
            {
                var allItems = await query.AsNoTracking().ToListAsync();
                return Ok(allItems);
            }

            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .AsNoTracking()
                .ToListAsync();

            return Ok(new
            {
                Items = items,
                CurrentPage = page.Value,
                PageSize = pageSize.Value,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize.Value)
            });
        }

        // ================= ADD TRACKING =================
        [HttpPost]
        public async Task<IActionResult> AddTracking([FromBody] AddTrackingDto dto)
        {
            var company = await _ctx.Companies
                .Include(c => c.ApiKeys)
                .FirstOrDefaultAsync(c => c.Id == dto.IdCompany);

            if (company == null) return NotFound("Company not found");

            var np = await LoadFromNovaPoshta(dto.TTN, company.ApiKeys.NovaPoshta);
            if (np == null) return BadRequest("Tracking not found");

            var tracking = new Tracking
            {
                Number = np.Number,
                Status = np.Status,
                DeliveryDate = np.RecipientDateTime,
                RecipientFullName = np.RecipientFullName,
                DaysType = "calendar",
                DaysCount = 0,
                CompanyId = dto.IdCompany
            };

            _ctx.Trackings.Add(tracking);
            await _ctx.SaveChangesAsync();

            return Ok(tracking);
        }

        // ================= BULK UPDATE PAYMENT INFO =================
        [HttpPut("payment/bulk")]
        public async Task<IActionResult> BulkUpdatePaymentInfo([FromBody] List<UpdatePaymentDto> updates)
        {
            if (updates == null || updates.Count == 0) return BadRequest("No updates provided");

            var ids = updates.Select(u => u.Id).ToList();
            var trackingsToUpdate = await _ctx.Trackings.Where(t => ids.Contains(t.Id)).ToListAsync();

            foreach (var tracking in trackingsToUpdate)
            {
                var dto = updates.First(u => u.Id == tracking.Id);
                tracking.DaysType = dto.DaysType;
                tracking.DaysCount = dto.DaysCount;
                tracking.PaymentDueDate = dto.PaymentDueDate;
                tracking.OverdueDays = dto.OverdueDays;

                // Нові поля
                tracking.Amount = dto.Amount;
                tracking.InvoiceNumber = dto.InvoiceNumber;
                tracking.Payer = dto.Payer;
                tracking.Vehicle = dto.Vehicle;
                tracking.Route = dto.Route;
                tracking.PaymentMark = dto.PaymentMark;
            }

            await _ctx.SaveChangesAsync();
            return Ok(new { message = "Payment info updated successfully", count = trackingsToUpdate.Count });
        }

        // ================= DELETE TRACKING =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTracking(int id)
        {
            var tracking = await _ctx.Trackings.FindAsync(id);
            if (tracking == null) return NotFound("Tracking not found");

            _ctx.Trackings.Remove(tracking);
            await _ctx.SaveChangesAsync();

            return Ok(new { message = "Tracking deleted successfully", id });
        }

        // ================= REFRESH NP DATA =================
        [HttpPut("refresh-np/{companyId}")]
        public async Task<IActionResult> RefreshNPData(int companyId)
        {
            var company = await _ctx.Companies
                .Include(c => c.ApiKeys)
                .FirstOrDefaultAsync(c => c.Id == companyId);

            if (company == null) return NotFound("Company not found");

            var trackings = await _ctx.Trackings
                .Where(t => t.CompanyId == companyId)
                .ToListAsync();

            foreach (var t in trackings)
            {
                var np = await LoadFromNovaPoshta(t.Number, company.ApiKeys.NovaPoshta);
                if (np != null)
                {
                    t.Status = np.Status;
                    t.DeliveryDate = np.RecipientDateTime;
                    t.RecipientFullName = np.RecipientFullName;
                }
            }

            await _ctx.SaveChangesAsync();
            return Ok(new { message = "NP data refreshed", count = trackings.Count });
        }

        // ================= LOAD FROM NP =================
        private async Task<NovaPoshtaTrackingDto?> LoadFromNovaPoshta(string ttn, string apiKey)
        {
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

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsync(
                "https://api.novaposhta.ua/v2.0/json/",
                new StringContent(json, Encoding.UTF8, "application/json")
            );

            var result = await response.Content.ReadAsStringAsync();
            var np = JsonSerializer.Deserialize<NovaPoshtaResponse>(
                result,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (np == null || !np.success || np.data.Count == 0) return null;
            return np.data.First();
        }
    }

    // ================= DTOs =================
    public class NovaPoshtaTrackingDto
    {
        public string Number { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? ActualDeliveryDate { get; set; }
        public string? RecipientDateTime { get; set; }
        public string? RecipientFullName { get; set; }
    }

    public class NovaPoshtaResponse
    {
        public bool success { get; set; }
        public List<NovaPoshtaTrackingDto> data { get; set; } = new();
    }

    public class AddTrackingDto
    {
        public string TTN { get; set; } = null!;
        public int IdCompany { get; set; }
    }

    public class UpdatePaymentDto
    {
        public int Id { get; set; }
        public string DaysType { get; set; } = "calendar";
        public int DaysCount { get; set; }
        public DateTime? PaymentDueDate { get; set; }
        public int? OverdueDays { get; set; }

        public decimal? Amount { get; set; }
        public string? InvoiceNumber { get; set; }
        public string? Payer { get; set; }
        public string? Vehicle { get; set; }
        public string? Route { get; set; }
        public bool PaymentMark { get; set; }
    }
}
