using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class FixPeapleCompanyFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankDetails_Companies_CompanyId",
                table: "BankDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_CorrespondentBanks_BankDetails_CompanyId_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks");

            migrationBuilder.DropIndex(
                name: "IX_CorrespondentBanks_CompanyId_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BankDetails",
                table: "BankDetails");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "CorrespondentBanks");

            migrationBuilder.DropColumn(
                name: "Management_AccountantFullName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Management_DirectorFullName",
                table: "Companies");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThirdName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BankDetails",
                table: "BankDetails",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Peaples",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Position = table.Column<int>(type: "int", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Peaples", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Peaples_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondentBanks_BankDetailsId",
                table: "CorrespondentBanks",
                column: "BankDetailsId");

            migrationBuilder.CreateIndex(
                name: "IX_BankDetails_CompanyId",
                table: "BankDetails",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_CompanyId",
                table: "AspNetUsers",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Peaples_CompanyId",
                table: "Peaples",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Companies_CompanyId",
                table: "AspNetUsers",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BankDetails_Companies_CompanyId",
                table: "BankDetails",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CorrespondentBanks_BankDetails_BankDetailsId",
                table: "CorrespondentBanks",
                column: "BankDetailsId",
                principalTable: "BankDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Companies_CompanyId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_BankDetails_Companies_CompanyId",
                table: "BankDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_CorrespondentBanks_BankDetails_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropTable(
                name: "Peaples");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks");

            migrationBuilder.DropIndex(
                name: "IX_CorrespondentBanks_BankDetailsId",
                table: "CorrespondentBanks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BankDetails",
                table: "BankDetails");

            migrationBuilder.DropIndex(
                name: "IX_BankDetails_CompanyId",
                table: "BankDetails");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_CompanyId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ThirdName",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "CorrespondentBanks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Management_AccountantFullName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Management_DirectorFullName",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CorrespondentBanks",
                table: "CorrespondentBanks",
                columns: new[] { "Id", "BankDetailsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_BankDetails",
                table: "BankDetails",
                columns: new[] { "CompanyId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondentBanks_CompanyId_BankDetailsId",
                table: "CorrespondentBanks",
                columns: new[] { "CompanyId", "BankDetailsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_BankDetails_Companies_CompanyId",
                table: "BankDetails",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CorrespondentBanks_BankDetails_CompanyId_BankDetailsId",
                table: "CorrespondentBanks",
                columns: new[] { "CompanyId", "BankDetailsId" },
                principalTable: "BankDetails",
                principalColumns: new[] { "CompanyId", "Id" },
                onDelete: ReferentialAction.Cascade);
        }
    }
}
