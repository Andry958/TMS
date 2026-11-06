using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class LinkOrdersToTrips : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TripId",
                table: "TransportOrders",
                type: "int",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Trips_Id_CompanyId",
                table: "Trips",
                columns: new[] { "Id", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_TripId_CompanyId",
                table: "TransportOrders",
                columns: new[] { "TripId", "CompanyId" });

            migrationBuilder.AddForeignKey(
                name: "FK_TransportOrders_Trips_TripId_CompanyId",
                table: "TransportOrders",
                columns: new[] { "TripId", "CompanyId" },
                principalTable: "Trips",
                principalColumns: new[] { "Id", "CompanyId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransportOrders_Trips_TripId_CompanyId",
                table: "TransportOrders");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Trips_Id_CompanyId",
                table: "Trips");

            migrationBuilder.DropIndex(
                name: "IX_TransportOrders_TripId_CompanyId",
                table: "TransportOrders");

            migrationBuilder.DropColumn(
                name: "TripId",
                table: "TransportOrders");
        }
    }
}
