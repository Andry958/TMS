using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Data
{
    public class TMSDbContext : IdentityDbContext<User>
    {
        public TMSDbContext(DbContextOptions<TMSDbContext> options)
            : base(options)
        {
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Peaple> Peaples { get; set; }
        public DbSet<BankDetails> BankDetails { get; set; }
        public DbSet<Tracking> Trackings { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Company>(entity =>
            {

                // ------------------- Власні (Owned) типи -------------------
                entity.OwnsOne(c => c.Contact);
                entity.OwnsOne(c => c.LegalAddress);
                entity.OwnsOne(c => c.UkrPoshtaAddress);  // Перейменовано з PostalAddress
                entity.OwnsOne(c => c.ActualAddress);
                entity.OwnsOne(c => c.ApiKeys);
                
                // ------------------- Нова Пошта -------------------
                entity.OwnsOne(c => c.NovaPoshtaRecipient, np =>
                {
                    np.Property(r => r.RecipientType).HasConversion<int>();
                });
                entity.OwnsOne(c => c.NovaPoshtaDelivery, nd =>
                {
                    nd.Property(d => d.DeliveryType).HasConversion<int>();
                });

                // ------------------- Банківські реквізити -------------------
                entity.HasMany(c => c.BankDetails)
                      .WithOne(b => b.Company)
                      .HasForeignKey(b => b.CompanyId)
                      .OnDelete(DeleteBehavior.Restrict);

                // ------------------- ManagementPeaple -------------------
                entity.HasMany(c => c.ManagementPeaple)
                      .WithOne(p => p.Company)
                      .HasForeignKey(p => p.CompanyId)
                      .OnDelete(DeleteBehavior.Restrict);

                // ------------------- Self-referencing (Parent-Child) -------------------
                entity.HasOne(c => c.ParentCompany)
                      .WithMany(c => c.ChildCompanies)
                      .HasForeignKey(c => c.ParentCompanyId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ------------------- Peaple -------------------
            modelBuilder.Entity<Peaple>(entity =>
            {
                entity.HasKey(p => p.Id);
            });

            // ------------------- BankDetails -------------------
            modelBuilder.Entity<BankDetails>(entity =>
            {
                entity.HasKey(b => b.Id);

                // CorrespondentBanks як owned
                entity.OwnsMany(b => b.CorrespondentBanks, cb =>
                {
                    cb.WithOwner().HasForeignKey("BankDetailsId");
                    cb.HasKey("Id");
                });
            });

            // ------------------- Tracking -------------------
            modelBuilder.Entity<Tracking>(entity =>
            {
                entity.Property(t => t.Amount)
                      .HasPrecision(18, 4);
            });
        }
    }
}
