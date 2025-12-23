using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Init2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Companies_CompanyId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ApiLardyTransKey",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ApiNovaPoshtaKey",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LegalAddress",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "Website",
                table: "Companies",
                newName: "Contact_Website");

            migrationBuilder.RenameColumn(
                name: "StreetAddress",
                table: "Companies",
                newName: "PostalAddress_StreetAddress");

            migrationBuilder.RenameColumn(
                name: "Region",
                table: "Companies",
                newName: "PostalAddress_Region");

            migrationBuilder.RenameColumn(
                name: "PostalCode",
                table: "Companies",
                newName: "PostalAddress_PostalCode");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Companies",
                newName: "Contact_PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Companies",
                newName: "Contact_Email");

            migrationBuilder.RenameColumn(
                name: "DirectorFullName",
                table: "Companies",
                newName: "Management_DirectorFullName");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "Companies",
                newName: "BankDetails_Currency");

            migrationBuilder.RenameColumn(
                name: "Country",
                table: "Companies",
                newName: "PostalAddress_Country");

            migrationBuilder.RenameColumn(
                name: "City",
                table: "Companies",
                newName: "PostalAddress_City");

            migrationBuilder.RenameColumn(
                name: "BuildingNumber",
                table: "Companies",
                newName: "PostalAddress_BuildingNumber");

            migrationBuilder.RenameColumn(
                name: "BankName",
                table: "Companies",
                newName: "BankDetails_BankName");

            migrationBuilder.RenameColumn(
                name: "BankMfo",
                table: "Companies",
                newName: "BankDetails_BankMfo");

            migrationBuilder.RenameColumn(
                name: "ApartmentNumber",
                table: "Companies",
                newName: "PostalAddress_ApartmentNumber");

            migrationBuilder.RenameColumn(
                name: "AccountantFullName",
                table: "Companies",
                newName: "Management_AccountantFullName");

            migrationBuilder.RenameColumn(
                name: "PostalAddress",
                table: "Companies",
                newName: "LegalAddress_StreetAddress");

            migrationBuilder.RenameColumn(
                name: "CompanyId",
                table: "Companies",
                newName: "ParentCompanyId");

            migrationBuilder.RenameColumn(
                name: "BankAccountNumber",
                table: "Companies",
                newName: "LegalAddress_Region");

            migrationBuilder.RenameIndex(
                name: "IX_Companies_CompanyId",
                table: "Companies",
                newName: "IX_Companies_ParentCompanyId");

            migrationBuilder.AlterColumn<string>(
                name: "Ipn",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CodeCompany",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "BankDetails_Currency",
                table: "Companies",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "BankDetails_BankName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_ApartmentNumber",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_BuildingNumber",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_City",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_Country",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_PostalCode",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_Region",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualAddress_StreetAddress",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApiKeys_LardyTrans",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApiKeys_NovaPoshta",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankDetails_BankOfBeneficiary",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankDetails_IBAN",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankDetails_SWIFT",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BankDetails_TypeAccount",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LegalAddress_ApartmentNumber",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LegalAddress_BuildingNumber",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LegalAddress_City",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LegalAddress_Country",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LegalAddress_PostalCode",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CorrespondentBanks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SWIFT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankDetailsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorrespondentBanks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondentBanks_Companies_BankDetailsId",
                        column: x => x.BankDetailsId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondentBanks_BankDetailsId",
                table: "CorrespondentBanks",
                column: "BankDetailsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId",
                table: "Companies",
                column: "ParentCompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId",
                table: "Companies");

            migrationBuilder.DropTable(
                name: "CorrespondentBanks");

            migrationBuilder.DropColumn(
                name: "ActualAddress_ApartmentNumber",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ActualAddress_BuildingNumber",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ActualAddress_City",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ActualAddress_Country",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ActualAddress_PostalCode",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ActualAddress_Region",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ActualAddress_StreetAddress",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ApiKeys_LardyTrans",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ApiKeys_NovaPoshta",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_BankOfBeneficiary",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_IBAN",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_SWIFT",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_TypeAccount",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LegalAddress_ApartmentNumber",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LegalAddress_BuildingNumber",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LegalAddress_City",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LegalAddress_Country",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LegalAddress_PostalCode",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_StreetAddress",
                table: "Companies",
                newName: "StreetAddress");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_Region",
                table: "Companies",
                newName: "Region");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_PostalCode",
                table: "Companies",
                newName: "PostalCode");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_Country",
                table: "Companies",
                newName: "Country");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_City",
                table: "Companies",
                newName: "City");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_BuildingNumber",
                table: "Companies",
                newName: "BuildingNumber");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_ApartmentNumber",
                table: "Companies",
                newName: "ApartmentNumber");

            migrationBuilder.RenameColumn(
                name: "Management_DirectorFullName",
                table: "Companies",
                newName: "DirectorFullName");

            migrationBuilder.RenameColumn(
                name: "Management_AccountantFullName",
                table: "Companies",
                newName: "AccountantFullName");

            migrationBuilder.RenameColumn(
                name: "Contact_Website",
                table: "Companies",
                newName: "Website");

            migrationBuilder.RenameColumn(
                name: "Contact_PhoneNumber",
                table: "Companies",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "Contact_Email",
                table: "Companies",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "BankDetails_Currency",
                table: "Companies",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "BankDetails_BankName",
                table: "Companies",
                newName: "BankName");

            migrationBuilder.RenameColumn(
                name: "BankDetails_BankMfo",
                table: "Companies",
                newName: "BankMfo");

            migrationBuilder.RenameColumn(
                name: "ParentCompanyId",
                table: "Companies",
                newName: "CompanyId");

            migrationBuilder.RenameColumn(
                name: "LegalAddress_StreetAddress",
                table: "Companies",
                newName: "PostalAddress");

            migrationBuilder.RenameColumn(
                name: "LegalAddress_Region",
                table: "Companies",
                newName: "BankAccountNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Companies_ParentCompanyId",
                table: "Companies",
                newName: "IX_Companies_CompanyId");

            migrationBuilder.AlterColumn<string>(
                name: "Ipn",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodeCompany",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "BankName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApiLardyTransKey",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ApiNovaPoshtaKey",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LegalAddress",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Companies_CompanyId",
                table: "Companies",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");
        }
    }
}
