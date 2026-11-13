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
