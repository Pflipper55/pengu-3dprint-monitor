# PostgreSQL and EF Core

Start PostgreSQL and pgAdmin from the repository root:

```sh
docker compose up -d
```

The development connection string in `appsettings.Development.json` matches the Compose defaults. These credentials are for local development only. Override the `ConnectionStrings__DefaultConnection` environment variable outside development.

Open pgAdmin at <http://localhost:5050> and sign in with `admin@pengu.local` / `pengu-pgadmin-local-password` (or the values set by `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`). To register the Compose database, use host `postgres`, port `5432`, and the database/user/password from `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. `localhost` is not the database host from inside the pgAdmin container.

`POSTGRES_USER` and `POSTGRES_PASSWORD` are only applied when PostgreSQL initializes an empty data directory. If the API reports that role `pengu` does not exist, the existing `postgres-data` volume may have been initialized with a different role. Connect using the role that originally initialized the database:

```sh
docker compose exec postgres psql -U <existing-admin-role> -d postgres
```

In the `psql` prompt, create the configured application role (or update its password if it already exists):

```sql
CREATE ROLE pengu LOGIN PASSWORD '<POSTGRES_PASSWORD>';
-- If pengu already exists, use this instead:
ALTER ROLE pengu WITH LOGIN PASSWORD '<POSTGRES_PASSWORD>';
```

Replace `<POSTGRES_PASSWORD>` with the value configured for the Compose database. Do not remove the volume unless its data is disposable.

Restore the local EF CLI tool and create/apply migrations from the repository root:

```sh
dotnet tool restore
dotnet ef migrations add InitialCreate --project Pengu3DPrintApi
dotnet ef database update --project Pengu3DPrintApi
```

Add entity types and corresponding `DbSet<T>` properties to `PenguMonitorDbContext` before creating migrations that include application tables.

Apply pending schema migrations after updating the API:

```sh
dotnet ef database update --project Pengu3DPrintApi
```

## Live printer status

The API monitors configured Bambu Lab printers over the local network using BambuSharp.
The API host must be able to reach each printer on its MQTT port (8883). Connection
settings, including the Bambu Lab serial number, are read from the database. Existing
printers need their serial number added in the edit-printer dialog after applying the
migration. The serial number and access code are not included in status events or logs.

The SignalR hub is available at `/hubs/printer-status`. Clients can invoke
`GetCurrentStatuses` for a snapshot and listen for:

- `PrinterStatusChanged`: `{ id, status, version }`, where status is `Connecting`,
  `Online`, or `Offline`.
- `PrinterRemoved`: the ID of a printer removed from the database.

`Online` means a printer report was received within the last 30 seconds. Failed or
stale connections are retried every 10 seconds. Database changes are reconciled within
10 seconds. The web application connects to this hub and displays status in the
printers table; print-job telemetry is not included.
