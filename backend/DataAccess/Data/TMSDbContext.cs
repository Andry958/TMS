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
        public DbSet<ClientCompany> ClientCompanies { get; set; }
        public DbSet<ClientCompanyContact> ClientCompanyContacts { get; set; }
        public DbSet<ClientCompanyBankDetails> ClientCompanyBankDetails { get; set; }
        public DbSet<ClientCompanyCorrespondentBank> ClientCompanyCorrespondentBanks { get; set; }
        public DbSet<Peaple> Peaples { get; set; }
        public DbSet<BankDetails> BankDetails { get; set; }
        public DbSet<Tracking> Trackings { get; set; }
        public DbSet<FleetVehicle> FleetVehicles { get; set; }
        public DbSet<GlobusTelemetryPoint> GlobusTelemetryPoints { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<DriverDocument> DriverDocuments { get; set; }
        public DbSet<DriverDocumentFile> DriverDocumentFiles { get; set; }
        public DbSet<FleetVehicleDocument> FleetVehicleDocuments { get; set; }
        public DbSet<FleetVehicleDocumentFile> FleetVehicleDocumentFiles { get; set; }
        public DbSet<VehicleDriverAssignment> VehicleDriverAssignments { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<TripPoint> TripPoints { get; set; }
        public DbSet<TripExpense> TripExpenses { get; set; }
        public DbSet<TransportRequest> TransportRequests { get; set; }
        public DbSet<TransportOrder> TransportOrders { get; set; }
        public DbSet<TransportOrderDocument> TransportOrderDocuments { get; set; }
        public DbSet<FinanceEntry> FinanceEntries { get; set; }
        public DbSet<WarehouseProduct> WarehouseProducts { get; set; }
        public DbSet<WarehouseMovement> WarehouseMovements { get; set; }
        public DbSet<CompanyDocument> CompanyDocuments { get; set; }
        public DbSet<CompanyDocumentFile> CompanyDocumentFiles { get; set; }
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

            modelBuilder.Entity<ClientCompany>(entity =>
            {
                entity.OwnsOne(c => c.Contact);
                entity.OwnsOne(c => c.LegalAddress);
                entity.OwnsOne(c => c.UkrPoshtaAddress);
                entity.OwnsOne(c => c.ActualAddress);

                entity.HasOne(c => c.ParentCompany)
                    .WithMany()
                    .HasForeignKey(c => c.ParentCompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(c => c.ContactPeople)
                    .WithOne(p => p.ClientCompany)
                    .HasForeignKey(p => p.ClientCompanyId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(c => c.BankDetails)
                    .WithOne(bank => bank.ClientCompany)
                    .HasForeignKey(bank => bank.ClientCompanyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ClientCompanyBankDetails>(entity =>
            {
                entity.HasKey(bank => bank.Id);
                entity.HasMany(bank => bank.CorrespondentBanks)
                    .WithOne(bank => bank.ClientCompanyBankDetails)
                    .HasForeignKey(bank => bank.ClientCompanyBankDetailsId)
                    .OnDelete(DeleteBehavior.Cascade);
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

            modelBuilder.Entity<FleetVehicle>(entity =>
            {
                entity.HasIndex(vehicle => new { vehicle.CompanyId, vehicle.Plate }).IsUnique();
                entity.HasIndex(vehicle => new { vehicle.Id, vehicle.CompanyId }).IsUnique();
                entity.Property(vehicle => vehicle.CapacityTons).HasPrecision(12, 3);
                entity.Property(vehicle => vehicle.VolumeM3).HasPrecision(12, 3);
                entity.Property(vehicle => vehicle.MileageKm).HasPrecision(14, 1);
                entity.Property(vehicle => vehicle.TareKg).HasPrecision(12, 2);
                entity.Property(vehicle => vehicle.GrossWeightKg).HasPrecision(12, 2);
                entity.Property(vehicle => vehicle.HydraulicLiftCapacityKg).HasPrecision(12, 2);
                entity.Property(vehicle => vehicle.FuelTankLitres).HasPrecision(12, 2);
                entity.Property(vehicle => vehicle.FuelLevelLitres).HasPrecision(12, 2);
                entity.Property(vehicle => vehicle.AdblueTankLitres).HasPrecision(12, 2);
                entity.Property(vehicle => vehicle.ConsumptionLitresPer100Km).HasPrecision(12, 3);
                entity.Property(vehicle => vehicle.NextServiceMileageKm).HasPrecision(14, 1);
                entity.Property(vehicle => vehicle.LeaseCost).HasPrecision(18, 2);
                entity.Property(vehicle => vehicle.CostPerKm).HasPrecision(18, 4);
                entity.HasOne(vehicle => vehicle.Company).WithMany(company => company.FleetVehicles)
                    .HasForeignKey(vehicle => vehicle.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<GlobusTelemetryPoint>(entity =>
            {
                entity.HasKey(point => point.Id);
                entity.Property(point => point.DeviceSerial).HasMaxLength(100);
                entity.HasIndex(point => new
                {
                    point.CompanyId,
                    point.DeviceSerial,
                    point.RecordedAtUtc
                }).IsUnique();
                entity.HasOne<Company>()
                    .WithMany()
                    .HasForeignKey(point => point.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Driver>(entity =>
            {
                entity.HasIndex(driver => new { driver.CompanyId, driver.IsArchived });
                entity.HasIndex(driver => new { driver.Id, driver.CompanyId }).IsUnique();
                entity.HasOne(driver => driver.Company).WithMany(company => company.Drivers)
                    .HasForeignKey(driver => driver.CompanyId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DriverDocument>(entity =>
            {
                entity.HasOne(document => document.Driver)
                    .WithMany(driver => driver.Documents)
                    .HasForeignKey(document => document.DriverId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DriverDocumentFile>(entity =>
            {
                entity.HasOne(file => file.DriverDocument)
                    .WithMany(document => document.Files)
                    .HasForeignKey(file => file.DriverDocumentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<FleetVehicleDocument>(entity =>
            {
                entity.HasOne(document => document.Vehicle)
                    .WithMany(vehicle => vehicle.Documents)
                    .HasForeignKey(document => document.VehicleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<FleetVehicleDocumentFile>(entity =>
            {
                entity.HasOne(file => file.VehicleDocument)
                    .WithMany(document => document.Files)
                    .HasForeignKey(file => file.VehicleDocumentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleDriverAssignment>(entity =>
            {
                entity.HasIndex(assignment => assignment.VehicleId)
                    .IsUnique()
                    .HasFilter("[EndedAt] IS NULL");
                entity.HasIndex(assignment => assignment.DriverId)
                    .IsUnique()
                    .HasFilter("[EndedAt] IS NULL");
                entity.HasIndex(assignment => new { assignment.CompanyId, assignment.VehicleId, assignment.StartedAt });
                entity.HasOne<Company>().WithMany().HasForeignKey(assignment => assignment.CompanyId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(assignment => assignment.Vehicle)
                    .WithMany(vehicle => vehicle.Assignments)
                    .HasForeignKey(assignment => new { assignment.VehicleId, assignment.CompanyId })
                    .HasPrincipalKey(vehicle => new { vehicle.Id, vehicle.CompanyId })
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(assignment => assignment.Driver)
                    .WithMany(driver => driver.Assignments)
                    .HasForeignKey(assignment => new { assignment.DriverId, assignment.CompanyId })
                    .HasPrincipalKey(driver => new { driver.Id, driver.CompanyId })
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Trip>(entity =>
            {
                entity.HasIndex(trip => new { trip.CompanyId, trip.Status, trip.PlannedStartAt });
                entity.Property(trip => trip.IssuedAmount).HasPrecision(18, 2);
                entity.Property(trip => trip.StartOdometerKm).HasPrecision(14, 1);
                entity.Property(trip => trip.EndOdometerKm).HasPrecision(14, 1);
                entity.HasOne<Company>().WithMany().HasForeignKey(trip => trip.CompanyId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(trip => trip.Vehicle)
                    .WithMany(vehicle => vehicle.Trips)
                    .HasForeignKey(trip => new { trip.VehicleId, trip.CompanyId })
                    .HasPrincipalKey(vehicle => new { vehicle.Id, vehicle.CompanyId })
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(trip => trip.Driver)
                    .WithMany(driver => driver.Trips)
                    .HasForeignKey(trip => new { trip.DriverId, trip.CompanyId })
                    .HasPrincipalKey(driver => new { driver.Id, driver.CompanyId })
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TripPoint>(entity =>
            {
                entity.HasIndex(point => new { point.TripId, point.Order }).IsUnique();
                entity.HasOne(point => point.Trip)
                    .WithMany(trip => trip.Points)
                    .HasForeignKey(point => point.TripId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TripExpense>(entity =>
            {
                entity.Property(expense => expense.Amount).HasPrecision(18, 2);
                entity.HasOne(expense => expense.Trip)
                    .WithMany(trip => trip.Expenses)
                    .HasForeignKey(expense => expense.TripId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TransportRequest>(entity =>
            {
                entity.HasIndex(request => new { request.CompanyId, request.Status, request.CreatedAt });
                entity.Property(request => request.Status).HasConversion<string>().HasMaxLength(30);
                entity.Property(request => request.PreviousStatus).HasConversion<string>().HasMaxLength(30);
                entity.Property(request => request.WeightTons).HasPrecision(12, 3);
                entity.Property(request => request.Rate).HasPrecision(18, 2);
                entity.HasOne<Company>().WithMany().HasForeignKey(request => request.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(request => request.Client).WithMany()
                    .HasForeignKey(request => request.ClientCompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TransportOrder>(entity =>
            {
                entity.HasIndex(order => new { order.CompanyId, order.Status, order.CreatedAt });
                entity.HasIndex(order => order.SourceRequestId)
                    .IsUnique()
                    .HasFilter("[SourceRequestId] IS NOT NULL");
                entity.Property(order => order.Status).HasConversion<string>().HasMaxLength(30);
                entity.Property(order => order.PreviousStatus).HasConversion<string>().HasMaxLength(30);
                entity.Property(order => order.InitialRate).HasPrecision(18, 2);
                entity.Property(order => order.VatRate).HasPrecision(5, 2);
                entity.Property(order => order.WeightTons).HasPrecision(12, 3);
                entity.HasOne<Company>().WithMany().HasForeignKey(order => order.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(order => order.Client).WithMany()
                    .HasForeignKey(order => order.ClientCompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(order => order.ClientContact).WithMany()
                    .HasForeignKey(order => order.ClientContactId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<User>().WithMany().HasForeignKey(order => order.ManagerUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(order => order.SourceRequest).WithMany()
                    .HasForeignKey(order => order.SourceRequestId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(order => order.FleetVehicle).WithMany()
                    .HasForeignKey(order => new { order.FleetVehicleId, order.CompanyId })
                    .HasPrincipalKey(vehicle => new { vehicle.Id, vehicle.CompanyId })
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(order => order.Documents).WithOne(document => document.TransportOrder)
                    .HasForeignKey(document => document.TransportOrderId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(order => order.Trip).WithMany(trip => trip.Orders)
                    .HasForeignKey(order => new { order.TripId, order.CompanyId })
                    .HasPrincipalKey(trip => new { trip.Id, trip.CompanyId })
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<FinanceEntry>(entity =>
            {
                entity.HasIndex(item => new { item.CompanyId, item.Date });
                entity.Property(item => item.Amount).HasPrecision(18, 2);
                entity.HasOne<Company>().WithMany().HasForeignKey(item => item.CompanyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<User>().WithMany().HasForeignKey(item => item.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<WarehouseProduct>(entity =>
            {
                entity.HasIndex(item => new { item.CompanyId, item.Sku }).IsUnique()
                    .HasFilter("[Sku] <> ''");
                entity.Property(item => item.Quantity).HasPrecision(18, 3);
                entity.Property(item => item.MinimumQuantity).HasPrecision(18, 3);
                entity.HasOne<Company>().WithMany().HasForeignKey(item => item.CompanyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<User>().WithMany().HasForeignKey(item => item.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<WarehouseMovement>(entity =>
            {
                entity.HasIndex(item => new { item.CompanyId, item.CreatedAt });
                entity.Property(item => item.Quantity).HasPrecision(18, 3);
                entity.HasOne(item => item.Product).WithMany(product => product.Movements)
                    .HasForeignKey(item => item.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<Company>().WithMany().HasForeignKey(item => item.CompanyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<User>().WithMany().HasForeignKey(item => item.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CompanyDocument>(entity =>
            {
                entity.HasIndex(item => new { item.CompanyId, item.ExpiryDate });
                entity.HasOne<Company>().WithMany().HasForeignKey(item => item.CompanyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<User>().WithMany().HasForeignKey(item => item.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CompanyDocumentFile>(entity =>
            {
                entity.HasOne(file => file.Document).WithMany(document => document.Files)
                    .HasForeignKey(file => file.CompanyDocumentId).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
