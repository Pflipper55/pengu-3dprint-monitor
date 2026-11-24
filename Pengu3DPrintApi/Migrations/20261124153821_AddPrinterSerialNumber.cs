using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pengu3DPrintApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPrinterSerialNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "Printers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "Printers");
        }
    }
}
