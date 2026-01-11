using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TMS.Controllers
{
    [Route("api/managementPeaple")]
    [ApiController]
    public class ManagementPeapleController : ControllerBase
    {
        private readonly TMSDbContext ctx;
        public ManagementPeapleController(TMSDbContext ctx)
        {
            this.ctx = ctx;
        }

        // ================= DELETE MANAGEMENT PEAPLE BY ID =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManagementPeaple(int id)
        {
            var peaple = await ctx.Peaples.FindAsync(id);
            if (peaple == null)
            {
                return NotFound("Management peaple not found");
            }

            ctx.Peaples.Remove(peaple);
            await ctx.SaveChangesAsync();

            return Ok("Management peaple deleted successfully");
        }
        [HttpGet("bycompany/{id}")]
        public async Task<IActionResult> GetManagementPeapleByCompanyId(int id)
        {
            var peaples = await ctx.Peaples
                .Where(p => p.CompanyId == id)
                .ToListAsync();

            return Ok(peaples);
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddManagementPeaple([FromBody] PeapleDto peaple, int companyId)
        {
            var company = await ctx.Companies.FindAsync(companyId);
            if (company == null)
            {
                return NotFound("Company not found");
            }
            
            peaple.CompanyId = companyId;
            Peaple newPeaple = new Peaple
            {
                FullName = peaple.FullName,
                Position = peaple.Position,
                PhoneNumber = peaple.PhoneNumber,
                Email = peaple.Email,
                CompanyId = peaple.CompanyId
            };
            company.ManagementPeaple.Add(newPeaple); 
            await ctx.Peaples.AddAsync(newPeaple);
            await ctx.SaveChangesAsync();

            return Ok(peaple);
        }

        public class PeapleDto
        {
            public string? FullName { get; set; }
            public PositionType? Position { get; set; } = PositionType.Manager;
            public string? PhoneNumber { get; set; }
            public string? Email { get; set; }

            public int CompanyId { get; set; }

        }
    }
}
