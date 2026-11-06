using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderFleetAndStatusUndo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviousStatus",
                table: "TransportRequests",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FleetVehicleId",
                table: "TransportOrders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviousStatus",
                table: "TransportOrders",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_FleetVehicleId_CompanyId",
                table: "TransportOrders",
                columns: new[] { "FleetVehicleId", "CompanyId" });

            migrationBuilder.AddForeignKey(
                name: "FK_TransportOrders_FleetVehicles_FleetVehicleId_CompanyId",
                table: "TransportOrders",
                columns: new[] { "FleetVehicleId", "CompanyId" },
                principalTable: "FleetVehicles",
                principalColumns: new[] { "Id", "CompanyId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransportOrders_FleetVehicles_FleetVehicleId_CompanyId",
                table: "TransportOrders");

            migrationBuilder.DropIndex(
                name: "IX_TransportOrders_FleetVehicleId_CompanyId",
                table: "TransportOrders");

            migrationBuilder.DropColumn(
                name: "PreviousStatus",
                table: "TransportRequests");

            migrationBuilder.DropColumn(
                name: "FleetVehicleId",
                table: "TransportOrders");

            migrationBuilder.DropColumn(
                name: "PreviousStatus",
                table: "TransportOrders");
        }
    }
}
