using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TMS.Controllers
{
    [Route("api/managementPeaple")]
    [ApiController]
    [Authorize]
    public class ManagementPeapleController : ControllerBase
    {
        private readonly TMSDbContext ctx;
        public ManagementPeapleController(TMSDbContext ctx)
        {
            this.ctx = ctx;
        }

        private async Task<int?> GetCurrentCompanyIdAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return null;
            return await ctx.Users.Where(user => user.Id == userId)
                .Select(user => user.CompanyId).SingleOrDefaultAsync();
        }

        // ================= DELETE MANAGEMENT PEAPLE BY ID =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManagementPeaple(int id)
        {
            var companyId = await GetCurrentCompanyIdAsync();
            if (!companyId.HasValue) return NotFound();
            var peaple = await ctx.Peaples.FirstOrDefaultAsync(person => person.Id == id && person.CompanyId == companyId.Value);
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
            var companyId = await GetCurrentCompanyIdAsync();
            if (companyId != id) return NotFound();
            var peaples = await ctx.Peaples
                .Where(p => p.CompanyId == companyId.Value)
                .ToListAsync();

            return Ok(peaples);
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddManagementPeaple([FromBody] PeapleDto peaple, int companyId)
        {
            var ownedCompanyId = await GetCurrentCompanyIdAsync();
            if (ownedCompanyId != companyId) return NotFound();
            var company = await ctx.Companies.FindAsync(ownedCompanyId.Value);
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
