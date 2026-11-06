using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddFleetOperations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    AdditionalContact = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drivers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Drivers_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FleetVehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Make = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: true),
                    Plate = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    TrailerPlate = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Vin = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    EuroClass = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    BodyType = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Division = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Mechanic = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    MileageKm = table.Column<decimal>(type: "decimal(14,1)", precision: 14, scale: 1, nullable: true),
                    CapacityTons = table.Column<decimal>(type: "decimal(12,3)", precision: 12, scale: 3, nullable: true),
                    VolumeM3 = table.Column<decimal>(type: "decimal(12,3)", precision: 12, scale: 3, nullable: true),
                    PalletCapacity = table.Column<int>(type: "int", nullable: true),
                    CargoDimensions = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    DoorHeight = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    TareKg = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    GrossWeightKg = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    Equipment = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    RefrigerationType = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    TemperatureRange = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TemperatureRecorder = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    DoubleDeck = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    HydraulicLiftCapacityKg = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    Extras = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomsApproval = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    AdrClass = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    GpsProvider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    GpsDeviceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CanBusStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    FuelTankLitres = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    FuelLevelLitres = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    AdblueTankLitres = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    ConsumptionLitresPer100Km = table.Column<decimal>(type: "decimal(12,3)", precision: 12, scale: 3, nullable: true),
                    EQueueProfile = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    TransitSystems = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    TransitProfileId = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    LastGpsUpdate = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    NextServiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextServiceMileageKm = table.Column<decimal>(type: "decimal(14,1)", precision: 14, scale: 1, nullable: true),
                    PlannedServiceWorks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TireAxles = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TireTread = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TireDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepairHistory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OwnershipType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    OwnershipDetails = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Lessor = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    LeaseCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    LeaseCurrency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CostPerKm = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    CostCurrency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FleetVehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FleetVehicles_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DriverDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Number = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IssueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DriverDocuments_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PlannedStartAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PlannedEndAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualStartAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualEndAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IssuedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    StartOdometerKm = table.Column<decimal>(type: "decimal(14,1)", precision: 14, scale: 1, nullable: true),
                    EndOdometerKm = table.Column<decimal>(type: "decimal(14,1)", precision: 14, scale: 1, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trips_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Trips_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Trips_FleetVehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "FleetVehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VehicleDriverAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChangeReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleDriverAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VehicleDriverAssignments_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VehicleDriverAssignments_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VehicleDriverAssignments_FleetVehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "FleetVehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DriverDocumentFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverDocumentId = table.Column<int>(type: "int", nullable: false),
                    StorageFileName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverDocumentFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DriverDocumentFiles_DriverDocuments_DriverDocumentId",
                        column: x => x.DriverDocumentId,
                        principalTable: "DriverDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripExpenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SpentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripExpenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TripExpenses_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripPoints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ArrivalAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripPoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TripPoints_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DriverDocumentFiles_DriverDocumentId",
                table: "DriverDocumentFiles",
                column: "DriverDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DriverDocuments_DriverId",
                table: "DriverDocuments",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_CompanyId_IsArchived",
                table: "Drivers",
                columns: new[] { "CompanyId", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_FleetVehicles_CompanyId_Plate",
                table: "FleetVehicles",
                columns: new[] { "CompanyId", "Plate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TripExpenses_TripId",
                table: "TripExpenses",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_TripPoints_TripId_Order",
                table: "TripPoints",
                columns: new[] { "TripId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_CompanyId_Status_PlannedStartAt",
                table: "Trips",
                columns: new[] { "CompanyId", "Status", "PlannedStartAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_DriverId",
                table: "Trips",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_VehicleId",
                table: "Trips",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_CompanyId_VehicleId_StartedAt",
                table: "VehicleDriverAssignments",
                columns: new[] { "CompanyId", "VehicleId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_DriverId",
                table: "VehicleDriverAssignments",
                column: "DriverId",
                unique: true,
                filter: "[EndedAt] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_VehicleId",
                table: "VehicleDriverAssignments",
                column: "VehicleId",
                unique: true,
                filter: "[EndedAt] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DriverDocumentFiles");

            migrationBuilder.DropTable(
                name: "TripExpenses");

            migrationBuilder.DropTable(
                name: "TripPoints");

            migrationBuilder.DropTable(
                name: "VehicleDriverAssignments");

            migrationBuilder.DropTable(
                name: "DriverDocuments");

            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.DropTable(
                name: "Drivers");

            migrationBuilder.DropTable(
                name: "FleetVehicles");
        }
    }
}
