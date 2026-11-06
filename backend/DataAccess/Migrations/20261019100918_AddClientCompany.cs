using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddClientCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientCompanies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParentCompanyId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CompanyType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CodeCompany = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ipn = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxSystem = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Contact_PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Contact_Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Contact_Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_StreetAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_BuildingNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LegalAddress_ApartmentNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_StreetAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_BuildingNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UkrPoshtaAddress_ApartmentNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_StreetAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_BuildingNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActualAddress_ApartmentNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCompanies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientCompanies_Companies_ParentCompanyId",
                        column: x => x.ParentCompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClientCompanyContacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Position = table.Column<int>(type: "int", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    ClientCompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCompanyContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientCompanyContacts_ClientCompanies_ClientCompanyId",
                        column: x => x.ClientCompanyId,
                        principalTable: "ClientCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientCompanies_ParentCompanyId",
                table: "ClientCompanies",
                column: "ParentCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientCompanyContacts_ClientCompanyId",
                table: "ClientCompanyContacts",
                column: "ClientCompanyId");

            migrationBuilder.Sql(
                """
                SET IDENTITY_INSERT [ClientCompanies] ON;

                INSERT INTO [ClientCompanies] (
                    [Id], [ParentCompanyId], [Name], [CompanyType], [CodeCompany], [Ipn],
                    [TaxSystem], [AdditionalInfo], [LogoPath],
                    [Contact_PhoneNumber], [Contact_Email], [Contact_Website],
                    [LegalAddress_Country], [LegalAddress_City], [LegalAddress_Region],
                    [LegalAddress_PostalCode], [LegalAddress_StreetAddress],
                    [LegalAddress_BuildingNumber], [LegalAddress_ApartmentNumber],
                    [UkrPoshtaAddress_Country], [UkrPoshtaAddress_City], [UkrPoshtaAddress_Region],
                    [UkrPoshtaAddress_PostalCode], [UkrPoshtaAddress_StreetAddress],
                    [UkrPoshtaAddress_BuildingNumber], [UkrPoshtaAddress_ApartmentNumber],
                    [ActualAddress_Country], [ActualAddress_City], [ActualAddress_Region],
                    [ActualAddress_PostalCode], [ActualAddress_StreetAddress],
                    [ActualAddress_BuildingNumber], [ActualAddress_ApartmentNumber], [CreatedAt]
                )
                SELECT
                    [Id], [ParentCompanyId], [Name], [CompanyType], [CodeCompany], [Ipn],
                    [TaxSystem], [AdditionalInfo], [LogoPath],
                    [Contact_PhoneNumber], [Contact_Email], [Contact_Website],
                    [LegalAddress_Country], [LegalAddress_City], [LegalAddress_Region],
                    [LegalAddress_PostalCode], [LegalAddress_StreetAddress],
                    [LegalAddress_BuildingNumber], [LegalAddress_ApartmentNumber],
                    [UkrPoshtaAddress_Country], [UkrPoshtaAddress_City], [UkrPoshtaAddress_Region],
                    [UkrPoshtaAddress_PostalCode], [UkrPoshtaAddress_StreetAddress],
                    [UkrPoshtaAddress_BuildingNumber], [UkrPoshtaAddress_ApartmentNumber],
                    [ActualAddress_Country], [ActualAddress_City], [ActualAddress_Region],
                    [ActualAddress_PostalCode], [ActualAddress_StreetAddress],
                    [ActualAddress_BuildingNumber], [ActualAddress_ApartmentNumber], SYSUTCDATETIME()
                FROM [Companies]
                WHERE [ParentCompanyId] IS NOT NULL;

                SET IDENTITY_INSERT [ClientCompanies] OFF;

                INSERT INTO [ClientCompanyContacts] (
                    [FullName], [Position], [PhoneNumber], [Email], [ClientCompanyId]
                )
                SELECT
                    people.[FullName], people.[Position], people.[PhoneNumber], people.[Email],
                    clients.[Id]
                FROM [Peaples] AS people
                INNER JOIN [ClientCompanies] AS clients ON clients.[Id] = people.[CompanyId]
                WHERE people.[FullName] IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientCompanyContacts");

            migrationBuilder.DropTable(
                name: "ClientCompanies");
        }
    }
}
