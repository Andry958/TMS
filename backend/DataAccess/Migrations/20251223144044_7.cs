using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "Trackings",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNumber",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Payer",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PaymentMark",
                table: "Trackings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Route",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vehicle",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amount",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "InvoiceNumber",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "Payer",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PaymentMark",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "Route",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "Vehicle",
                table: "Trackings");
        }
    }
}
