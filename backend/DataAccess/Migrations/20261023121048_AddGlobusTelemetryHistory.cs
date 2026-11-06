using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddGlobusTelemetryHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GlobusTelemetryPoints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DeviceSerial = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RecordedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    SpeedKmh = table.Column<double>(type: "float", nullable: true),
                    CourseDegrees = table.Column<double>(type: "float", nullable: true),
                    AltitudeMeters = table.Column<double>(type: "float", nullable: true),
                    IgnitionOn = table.Column<bool>(type: "bit", nullable: true),
                    SensorsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CollectedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobusTelemetryPoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GlobusTelemetryPoints_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GlobusTelemetryPoints_CompanyId_DeviceSerial_RecordedAtUtc",
                table: "GlobusTelemetryPoints",
                columns: new[] { "CompanyId", "DeviceSerial", "RecordedAtUtc" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GlobusTelemetryPoints");
        }
    }
}
