using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addTracking3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Trackings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trackings_CompanyId",
                table: "Trackings",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trackings_Companies_CompanyId",
                table: "Trackings",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trackings_Companies_CompanyId",
                table: "Trackings");

            migrationBuilder.DropIndex(
                name: "IX_Trackings_CompanyId",
                table: "Trackings");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Trackings");
        }
    }
}
