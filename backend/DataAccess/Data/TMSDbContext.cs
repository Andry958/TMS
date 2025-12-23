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
        public DbSet<Tracking> Trackings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Company>(entity =>
            {
                // ------------------- Власні типи -------------------
                entity.OwnsOne(c => c.Contact);
                entity.OwnsOne(c => c.LegalAddress);
                entity.OwnsOne(c => c.PostalAddress);
                entity.OwnsOne(c => c.ActualAddress);
                entity.OwnsOne(c => c.Management);
                entity.OwnsOne(c => c.ApiKeys);

                // ------------------- Банківські реквізити -------------------
                entity.OwnsMany(c => c.BankDetails, bd =>
                {
                    bd.Property(b => b.TypeAccount);
                    bd.Property(b => b.Currency);
                    bd.Property(b => b.BankName);
                    bd.Property(b => b.BankMfo);
                    bd.Property(b => b.IBAN);
                    bd.Property(b => b.SWIFT);
                    bd.Property(b => b.BankOfBeneficiary);

                    bd.OwnsMany(b => b.CorrespondentBanks, cb =>
                    {
                        cb.WithOwner().HasForeignKey("CompanyId", "BankDetailsId"); // FK на композитний PK
                        cb.Property<int>("Id");
                        cb.HasKey("Id", "BankDetailsId");
                        cb.Property(c => c.BankName);
                        cb.Property(c => c.SWIFT);
                    });
                });



                // ------------------- Self-referencing Clients -------------------
                entity.HasMany(c => c.Clients)
                      .WithOne()
                      .HasForeignKey("ParentCompanyId")
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
