using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TransportRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    ClientCompanyId = table.Column<int>(type: "int", nullable: false),
                    LoadingCity = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    LoadingAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    LoadingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DeliveryCity = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    DeliveryDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CargoDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    WeightTons = table.Column<decimal>(type: "decimal(12,3)", precision: 12, scale: 3, nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportRequests_ClientCompanies_ClientCompanyId",
                        column: x => x.ClientCompanyId,
                        principalTable: "ClientCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransportRequests_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequests_ClientCompanyId",
                table: "TransportRequests",
                column: "ClientCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequests_CompanyId_Status_CreatedAt",
                table: "TransportRequests",
                columns: new[] { "CompanyId", "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransportRequests");
        }
    }
}
