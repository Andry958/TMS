using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNovaPoshtaAndRenamePostalAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId1",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Companies_ParentCompanyId1",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_StreetAddress",
                table: "Companies",
                newName: "UkrPoshtaAddress_StreetAddress");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_Region",
                table: "Companies",
                newName: "UkrPoshtaAddress_Region");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_PostalCode",
                table: "Companies",
                newName: "UkrPoshtaAddress_PostalCode");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_Country",
                table: "Companies",
                newName: "UkrPoshtaAddress_Country");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_City",
                table: "Companies",
                newName: "UkrPoshtaAddress_City");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_BuildingNumber",
                table: "Companies",
                newName: "UkrPoshtaAddress_BuildingNumber");

            migrationBuilder.RenameColumn(
                name: "PostalAddress_ApartmentNumber",
                table: "Companies",
                newName: "UkrPoshtaAddress_ApartmentNumber");

            migrationBuilder.RenameColumn(
                name: "ParentCompanyId1",
                table: "Companies",
                newName: "NovaPoshtaRecipient_RecipientType");

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Trackings",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_AddressComment",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_Apartment",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_Branch",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_Building",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_City",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NovaPoshtaDelivery_DeliveryType",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_DigitalAddressReference",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NovaPoshtaDelivery_Id",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_PostomatNumber",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaDelivery_Street",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_CompanyName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_EdrpouCode",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_FirstName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NovaPoshtaRecipient_Id",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_LastName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_MiddleName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_OrgFirstName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_OrgLastName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_OrgMiddleName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_OrgPhone",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_OwnershipForm",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NovaPoshtaRecipient_Phone",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_AddressComment",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_Apartment",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_Branch",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_Building",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_City",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_DeliveryType",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_DigitalAddressReference",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_Id",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_PostomatNumber",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaDelivery_Street",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_CompanyName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_EdrpouCode",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_FirstName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_Id",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_LastName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_MiddleName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_OrgFirstName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_OrgLastName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_OrgMiddleName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_OrgPhone",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_OwnershipForm",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NovaPoshtaRecipient_Phone",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_StreetAddress",
                table: "Companies",
                newName: "PostalAddress_StreetAddress");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_Region",
                table: "Companies",
                newName: "PostalAddress_Region");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_PostalCode",
                table: "Companies",
                newName: "PostalAddress_PostalCode");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_Country",
                table: "Companies",
                newName: "PostalAddress_Country");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_City",
                table: "Companies",
                newName: "PostalAddress_City");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_BuildingNumber",
                table: "Companies",
                newName: "PostalAddress_BuildingNumber");

            migrationBuilder.RenameColumn(
                name: "UkrPoshtaAddress_ApartmentNumber",
                table: "Companies",
                newName: "PostalAddress_ApartmentNumber");

            migrationBuilder.RenameColumn(
                name: "NovaPoshtaRecipient_RecipientType",
                table: "Companies",
                newName: "ParentCompanyId1");

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Trackings",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,4)",
                oldPrecision: 18,
                oldScale: 4,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_ParentCompanyId1",
                table: "Companies",
                column: "ParentCompanyId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId1",
                table: "Companies",
                column: "ParentCompanyId1",
                principalTable: "Companies",
                principalColumn: "Id");
        }
    }
}
