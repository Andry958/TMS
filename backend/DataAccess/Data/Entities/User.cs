using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Data.Entities
{
    public class User : IdentityUser, BaseEntity
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ThirdName { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? PhoneNumber { get; set; } 
        public string? Role { get; set; } // e.g., Admin, User, Manager
        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
