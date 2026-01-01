using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DaysCount",
                table: "Trackings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "DaysType",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OverdueDays",
                table: "Trackings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDueDate",
                table: "Trackings",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DaysCount",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "DaysType",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "OverdueDays",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PaymentDueDate",
                table: "Trackings");
        }
    }
}
