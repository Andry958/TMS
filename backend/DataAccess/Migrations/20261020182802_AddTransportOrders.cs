using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TransportOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    ClientCompanyId = table.Column<int>(type: "int", nullable: false),
                    ClientContactId = table.Column<int>(type: "int", nullable: true),
                    ManagerUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AdditionalManagerUserIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SourceRequestId = table.Column<int>(type: "int", nullable: true),
                    ClientOrderNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OrderDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ContractNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InitialRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    VatRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    PaymentTerms = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PaymentDelayDays = table.Column<int>(type: "int", nullable: true),
                    LoadingCity = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    LoadingAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    LoadingDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DeliveryCity = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    DeliveryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CargoDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WeightTons = table.Column<decimal>(type: "decimal(12,3)", precision: 12, scale: 3, nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportOrders_AspNetUsers_ManagerUserId",
                        column: x => x.ManagerUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransportOrders_ClientCompanies_ClientCompanyId",
                        column: x => x.ClientCompanyId,
                        principalTable: "ClientCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransportOrders_ClientCompanyContacts_ClientContactId",
                        column: x => x.ClientContactId,
                        principalTable: "ClientCompanyContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransportOrders_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransportOrders_TransportRequests_SourceRequestId",
                        column: x => x.SourceRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_ClientCompanyId",
                table: "TransportOrders",
                column: "ClientCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_ClientContactId",
                table: "TransportOrders",
                column: "ClientContactId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_CompanyId_Status_CreatedAt",
                table: "TransportOrders",
                columns: new[] { "CompanyId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_ManagerUserId",
                table: "TransportOrders",
                column: "ManagerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_SourceRequestId",
                table: "TransportOrders",
                column: "SourceRequestId",
                unique: true,
                filter: "[SourceRequestId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransportOrders");
        }
    }
}
