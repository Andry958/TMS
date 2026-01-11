using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentCompanyId1",
                table: "Companies",
                type: "int",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId1",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Companies_ParentCompanyId1",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ParentCompanyId1",
                table: "Companies");
        }
    }
}
