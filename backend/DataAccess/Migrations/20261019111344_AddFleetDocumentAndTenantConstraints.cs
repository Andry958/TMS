using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddFleetDocumentAndTenantConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Companies_CompanyId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Drivers_DriverId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_FleetVehicles_VehicleId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleDriverAssignments_Companies_CompanyId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleDriverAssignments_Drivers_DriverId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleDriverAssignments_FleetVehicles_VehicleId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Trips_DriverId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_VehicleId",
                table: "Trips");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_FleetVehicles_Id_CompanyId",
                table: "FleetVehicles",
                columns: new[] { "Id", "CompanyId" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Drivers_Id_CompanyId",
                table: "Drivers",
                columns: new[] { "Id", "CompanyId" });

            migrationBuilder.CreateTable(
                name: "FleetVehicleDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Number = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IssueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FleetVehicleDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FleetVehicleDocuments_FleetVehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "FleetVehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FleetVehicleDocumentFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleDocumentId = table.Column<int>(type: "int", nullable: false),
                    StorageFileName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FleetVehicleDocumentFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FleetVehicleDocumentFiles_FleetVehicleDocuments_VehicleDocumentId",
                        column: x => x.VehicleDocumentId,
                        principalTable: "FleetVehicleDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_DriverId_CompanyId",
                table: "VehicleDriverAssignments",
                columns: new[] { "DriverId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_VehicleId_CompanyId",
                table: "VehicleDriverAssignments",
                columns: new[] { "VehicleId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_DriverId_CompanyId",
                table: "Trips",
                columns: new[] { "DriverId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_VehicleId_CompanyId",
                table: "Trips",
                columns: new[] { "VehicleId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FleetVehicles_Id_CompanyId",
                table: "FleetVehicles",
                columns: new[] { "Id", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_Id_CompanyId",
                table: "Drivers",
                columns: new[] { "Id", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FleetVehicleDocumentFiles_VehicleDocumentId",
                table: "FleetVehicleDocumentFiles",
                column: "VehicleDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_FleetVehicleDocuments_VehicleId",
                table: "FleetVehicleDocuments",
                column: "VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Companies_CompanyId",
                table: "Trips",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Drivers_DriverId_CompanyId",
                table: "Trips",
                columns: new[] { "DriverId", "CompanyId" },
                principalTable: "Drivers",
                principalColumns: new[] { "Id", "CompanyId" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_FleetVehicles_VehicleId_CompanyId",
                table: "Trips",
                columns: new[] { "VehicleId", "CompanyId" },
                principalTable: "FleetVehicles",
                principalColumns: new[] { "Id", "CompanyId" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleDriverAssignments_Companies_CompanyId",
                table: "VehicleDriverAssignments",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleDriverAssignments_Drivers_DriverId_CompanyId",
                table: "VehicleDriverAssignments",
                columns: new[] { "DriverId", "CompanyId" },
                principalTable: "Drivers",
                principalColumns: new[] { "Id", "CompanyId" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleDriverAssignments_FleetVehicles_VehicleId_CompanyId",
                table: "VehicleDriverAssignments",
                columns: new[] { "VehicleId", "CompanyId" },
                principalTable: "FleetVehicles",
                principalColumns: new[] { "Id", "CompanyId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Companies_CompanyId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Drivers_DriverId_CompanyId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_FleetVehicles_VehicleId_CompanyId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleDriverAssignments_Companies_CompanyId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleDriverAssignments_Drivers_DriverId_CompanyId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleDriverAssignments_FleetVehicles_VehicleId_CompanyId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropTable(
                name: "FleetVehicleDocumentFiles");

            migrationBuilder.DropTable(
                name: "FleetVehicleDocuments");

            migrationBuilder.DropIndex(
                name: "IX_VehicleDriverAssignments_DriverId_CompanyId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropIndex(
                name: "IX_VehicleDriverAssignments_VehicleId_CompanyId",
                table: "VehicleDriverAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Trips_DriverId_CompanyId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_Trips_VehicleId_CompanyId",
                table: "Trips");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_FleetVehicles_Id_CompanyId",
                table: "FleetVehicles");

            migrationBuilder.DropIndex(
                name: "IX_FleetVehicles_Id_CompanyId",
                table: "FleetVehicles");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Drivers_Id_CompanyId",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_Id_CompanyId",
                table: "Drivers");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_DriverId",
                table: "Trips",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_VehicleId",
                table: "Trips",
                column: "VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Companies_CompanyId",
                table: "Trips",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Drivers_DriverId",
                table: "Trips",
                column: "DriverId",
                principalTable: "Drivers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_FleetVehicles_VehicleId",
                table: "Trips",
                column: "VehicleId",
                principalTable: "FleetVehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleDriverAssignments_Companies_CompanyId",
                table: "VehicleDriverAssignments",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleDriverAssignments_Drivers_DriverId",
                table: "VehicleDriverAssignments",
                column: "DriverId",
                principalTable: "Drivers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleDriverAssignments_FleetVehicles_VehicleId",
                table: "VehicleDriverAssignments",
                column: "VehicleId",
                principalTable: "FleetVehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
