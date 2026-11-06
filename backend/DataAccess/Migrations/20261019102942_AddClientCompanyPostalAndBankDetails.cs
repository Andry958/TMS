using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddClientCompanyPostalAndBankDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NPD_AddressComment",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_Apartment",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_Branch",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_Building",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_City",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_DigitalAddressReference",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_PostomatNumber",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NPD_Street",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_CompanyName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_EdrpouCode",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_FirstName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_LastName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_MiddleName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_OrgFirstName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_OrgLastName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_OrgMiddleName",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_OrgPhone",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_OwnershipForm",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NP_Phone",
                table: "ClientCompanies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NovaPoshtaDeliveryType",
                table: "ClientCompanies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NovaPoshtaRecipientType",
                table: "ClientCompanies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClientCompanyBankDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeAccount = table.Column<int>(type: "int", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankMfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Iban = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Swift = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankOfBeneficiary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClientCompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCompanyBankDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientCompanyBankDetails_ClientCompanies_ClientCompanyId",
                        column: x => x.ClientCompanyId,
                        principalTable: "ClientCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientCompanyCorrespondentBanks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Swift = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClientCompanyBankDetailsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCompanyCorrespondentBanks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientCompanyCorrespondentBanks_ClientCompanyBankDetails_ClientCompanyBankDetailsId",
                        column: x => x.ClientCompanyBankDetailsId,
                        principalTable: "ClientCompanyBankDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientCompanyBankDetails_ClientCompanyId",
                table: "ClientCompanyBankDetails",
                column: "ClientCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientCompanyCorrespondentBanks_ClientCompanyBankDetailsId",
                table: "ClientCompanyCorrespondentBanks",
                column: "ClientCompanyBankDetailsId");

            migrationBuilder.Sql(
                """
                UPDATE clients
                SET
                    [NovaPoshtaRecipientType] = companies.[NovaPoshtaRecipient_RecipientType],
                    [NP_Phone] = companies.[NovaPoshtaRecipient_Phone],
                    [NP_LastName] = companies.[NovaPoshtaRecipient_LastName],
                    [NP_FirstName] = companies.[NovaPoshtaRecipient_FirstName],
                    [NP_MiddleName] = companies.[NovaPoshtaRecipient_MiddleName],
                    [NP_EdrpouCode] = companies.[NovaPoshtaRecipient_EdrpouCode],
                    [NP_CompanyName] = companies.[NovaPoshtaRecipient_CompanyName],
                    [NP_OwnershipForm] = companies.[NovaPoshtaRecipient_OwnershipForm],
                    [NP_OrgPhone] = companies.[NovaPoshtaRecipient_OrgPhone],
                    [NP_OrgLastName] = companies.[NovaPoshtaRecipient_OrgLastName],
                    [NP_OrgFirstName] = companies.[NovaPoshtaRecipient_OrgFirstName],
                    [NP_OrgMiddleName] = companies.[NovaPoshtaRecipient_OrgMiddleName],
                    [NovaPoshtaDeliveryType] = companies.[NovaPoshtaDelivery_DeliveryType],
                    [NPD_City] = companies.[NovaPoshtaDelivery_City],
                    [NPD_Branch] = companies.[NovaPoshtaDelivery_Branch],
                    [NPD_Street] = companies.[NovaPoshtaDelivery_Street],
                    [NPD_Building] = companies.[NovaPoshtaDelivery_Building],
                    [NPD_Apartment] = companies.[NovaPoshtaDelivery_Apartment],
                    [NPD_AddressComment] = companies.[NovaPoshtaDelivery_AddressComment],
                    [NPD_PostomatNumber] = companies.[NovaPoshtaDelivery_PostomatNumber],
                    [NPD_DigitalAddressReference] = companies.[NovaPoshtaDelivery_DigitalAddressReference]
                FROM [ClientCompanies] AS clients
                INNER JOIN [Companies] AS companies ON companies.[Id] = clients.[Id];

                SET IDENTITY_INSERT [ClientCompanyBankDetails] ON;
                INSERT INTO [ClientCompanyBankDetails] (
                    [Id], [TypeAccount], [Currency], [BankName], [BankMfo],
                    [Iban], [Swift], [BankOfBeneficiary], [ClientCompanyId]
                )
                SELECT
                    banks.[Id], banks.[TypeAccount], banks.[Currency], banks.[BankName],
                    banks.[BankMfo], banks.[IBAN], banks.[SWIFT],
                    banks.[BankOfBeneficiary], clients.[Id]
                FROM [BankDetails] AS banks
                INNER JOIN [ClientCompanies] AS clients ON clients.[Id] = banks.[CompanyId];
                SET IDENTITY_INSERT [ClientCompanyBankDetails] OFF;

                SET IDENTITY_INSERT [ClientCompanyCorrespondentBanks] ON;
                INSERT INTO [ClientCompanyCorrespondentBanks] (
                    [Id], [BankName], [Swift], [ClientCompanyBankDetailsId]
                )
                SELECT
                    correspondent.[Id], correspondent.[BankName], correspondent.[SWIFT],
                    correspondent.[BankDetailsId]
                FROM [CorrespondentBanks] AS correspondent
                INNER JOIN [ClientCompanyBankDetails] AS banks
                    ON banks.[Id] = correspondent.[BankDetailsId];
                SET IDENTITY_INSERT [ClientCompanyCorrespondentBanks] OFF;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientCompanyCorrespondentBanks");

            migrationBuilder.DropTable(
                name: "ClientCompanyBankDetails");

            migrationBuilder.DropColumn(
                name: "NPD_AddressComment",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_Apartment",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_Branch",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_Building",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_City",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_DigitalAddressReference",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_PostomatNumber",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NPD_Street",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_CompanyName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_EdrpouCode",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_FirstName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_LastName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_MiddleName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_OrgFirstName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_OrgLastName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_OrgMiddleName",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_OrgPhone",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_OwnershipForm",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NP_Phone",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDeliveryType",
                table: "ClientCompanies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipientType",
                table: "ClientCompanies");
        }
    }
}
