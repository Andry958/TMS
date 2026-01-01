using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualDeliveryDate",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "AnnouncedPrice",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CalculatedWeight",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CargoDescriptionString",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CargoReturnRefusal",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CargoType",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CheckWeight",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CheckWeightMethod",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CityRecipient",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CitySender",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CounterpartyRecipientDescription",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CounterpartySenderDescription",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CounterpartySenderType",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "DateCreated",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "DateScan",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "DocumentCost",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "DocumentWeight",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "ExpressWaybillAmountToPay",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "ExpressWaybillPaymentStatus",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "FactualWeight",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PayerType",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PhoneRecipient",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PhoneSender",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PossibilityCreateClaim",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "PossibilityCreateReturn",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "RecipientAddress",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "RecipientDateTime",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "RefEW",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "ScheduledDeliveryDate",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "SeatsAmount",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "SecurePayment",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "SenderAddress",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "SenderFullNameEW",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "ServiceType",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "StatusCode",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "TrackingUpdateDate",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "VolumeWeight",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "WarehouseRecipient",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "WarehouseRecipientNumber",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "WarehouseSender",
                table: "Trackings");

            migrationBuilder.AlterColumn<string>(
                name: "RecipientFullName",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "DeliveryDate",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryDate",
                table: "Trackings");

            migrationBuilder.AlterColumn<string>(
                name: "RecipientFullName",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActualDeliveryDate",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "AnnouncedPrice",
                table: "Trackings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CalculatedWeight",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CargoDescriptionString",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "CargoReturnRefusal",
                table: "Trackings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CargoType",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "CheckWeight",
                table: "Trackings",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "CheckWeightMethod",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CityRecipient",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CitySender",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CounterpartyRecipientDescription",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CounterpartySenderDescription",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CounterpartySenderType",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DateCreated",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DateScan",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DocumentCost",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "DocumentWeight",
                table: "Trackings",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ExpressWaybillAmountToPay",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExpressWaybillPaymentStatus",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FactualWeight",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PayerType",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneRecipient",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneSender",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "PossibilityCreateClaim",
                table: "Trackings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PossibilityCreateReturn",
                table: "Trackings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RecipientAddress",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RecipientDateTime",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RefEW",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ScheduledDeliveryDate",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SeatsAmount",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "SecurePayment",
                table: "Trackings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SenderAddress",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SenderFullNameEW",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceType",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StatusCode",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TrackingUpdateDate",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VolumeWeight",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WarehouseRecipient",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "WarehouseRecipientNumber",
                table: "Trackings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseSender",
                table: "Trackings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
