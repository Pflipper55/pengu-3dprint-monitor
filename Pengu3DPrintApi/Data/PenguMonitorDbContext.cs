using Microsoft.EntityFrameworkCore;
using Pengu3DPrintApi.Data.Entities;

namespace Pengu3DPrintApi.Data;

public sealed class PenguMonitorDbContext(DbContextOptions<PenguMonitorDbContext> options) : DbContext(options)
{
    public DbSet<Printer> Printers => Set<Printer>();

    public DbSet<Bed> Beds => Set<Bed>();

    public DbSet<Filament> Filaments => Set<Filament>();

    public DbSet<Nozzle> Nozzles => Set<Nozzle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Printer>(entity =>
        {
            entity.HasKey(printer => printer.Id);
            entity.Ignore(printer => printer.BedId);

            entity.HasOne(printer => printer.UsedBed)
                .WithOne(bed => bed.InsertedPrinter)
                .HasForeignKey<Bed>(bed => bed.PrinterId);

            entity.HasMany(printer => printer.LoadedFilaments)
                .WithOne(filament => filament.LoadedPrinter)
                .HasForeignKey(filament => filament.PrinterId);

            entity.HasMany(printer => printer.Nozzles)
                .WithOne(nozzle => nozzle.InsertedPrinter)
                .HasForeignKey(nozzle => nozzle.PrinterId);
        });

        modelBuilder.Entity<Bed>().HasKey(bed => bed.Id);
        modelBuilder.Entity<Filament>().HasKey(filament => filament.Id);
        modelBuilder.Entity<Nozzle>().HasKey(nozzle => nozzle.Id);
    }
}
