using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class ListBandDet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CorrespondentBanks_Companies_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks");

            migrationBuilder.DropIndex(
                name: "IX_CorrespondentBanks_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropColumn(
                name: "BankDetails_BankMfo",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_BankName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_BankOfBeneficiary",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "BankDetails_Currency",
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

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "CorrespondentBanks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks",
                columns: new[] { "Id", "BankDetailsId" });

            migrationBuilder.CreateTable(
                name: "BankDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    TypeAccount = table.Column<int>(type: "int", nullable: false),
                    Currency = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankMfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IBAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SWIFT = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankOfBeneficiary = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankDetails", x => new { x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_BankDetails_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondentBanks_CompanyId_BankDetailsId",
                table: "CorrespondentBanks",
                columns: new[] { "CompanyId", "BankDetailsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_CorrespondentBanks_BankDetails_CompanyId_BankDetailsId",
                table: "CorrespondentBanks",
                columns: new[] { "CompanyId", "BankDetailsId" },
                principalTable: "BankDetails",
                principalColumns: new[] { "CompanyId", "Id" },
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CorrespondentBanks_BankDetails_CompanyId_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropTable(
                name: "BankDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks");

            migrationBuilder.DropIndex(
                name: "IX_CorrespondentBanks_CompanyId_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "CorrespondentBanks");

            migrationBuilder.AddColumn<string>(
                name: "BankDetails_BankMfo",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankDetails_BankName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankDetails_BankOfBeneficiary",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BankDetails_Currency",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AddPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondentBanks_BankDetailsId",
                table: "CorrespondentBanks",
                column: "BankDetailsId");

            migrationBuilder.AddForeignKey(
                name: "FK_CorrespondentBanks_Companies_BankDetailsId",
                table: "CorrespondentBanks",
                column: "BankDetailsId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
