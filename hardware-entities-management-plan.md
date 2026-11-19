# Hardware Management Plan

## Goal

Complete the Nozzles, Filaments, and Beds sections so each supports listing,
creating, viewing, editing, and deleting inventory, with the same interaction
patterns as the Printers section.

Implementation status: completed and build-verified.

## Baseline when the plan was written

- The Nozzles, Filaments, and Beds pages have placeholder tables and inactive
  “Add” buttons.
- The backend already has list, detail, create, update, and delete endpoints for
  all three entities.
- The frontend has separate API service classes for each entity, but they
  currently expose only the list operation.
- The request and overview models already represent each entity’s editable
  fields and optional printer assignment.
- Existing display pipes are available for nozzle, filament, and bed types, and
  for hardened status.

## Shared behavior and patterns

- Keep all forms and dialogs in standalone modal components under
  `src/modals/`, using Optimus UI controls and the existing printer-modal
  styling conventions.
- Keep each API service entity-specific. Extend `ApiNozzleService`,
  `ApiFilamentService`, and `ApiBedService`; do not introduce a combined
  inventory service.
- Each table will load its entity list, show a clear empty state, and refresh
  after a successful create, edit, or delete.
- Each table will have global search, sortable columns, and pagination like the
  Printers table. Use the existing table and paginator theme contrast settings.
- Each row will expose Details, Edit, and Delete actions.
- Details and edit dialogs will display the related printer by name when
  assigned, and “Unassigned” otherwise. Resolve `printerId` against the
  printer list using `ApiPrinterService`; do not show raw IDs as the primary
  label.
- Successful and failed mutations will display a toast. Errors will retain the
  API-provided problem detail when available.
- Deletion will require an Optimus UI confirmation dialog before calling the
  API. Refresh the table only after a successful delete.
- Do not add `CancellationToken` parameters to API endpoints.

## Entity-specific scope

### Nozzles

- Table columns: Nozzle type, Hardened, Printer, Actions.
- Create and edit fields:
  - Nozzle type, excluding the `NONE` enum value.
  - Hardened status.
  - Optional assigned printer.
- Details modal: nozzle type, hardened status, and assigned printer.
- Sorting and searching will use the displayed nozzle type, hardened status,
  and printer name where practical.

### Filaments

- Table columns: Brand, Filament type, Weight, Color, Printer, Actions.
- Create and edit fields:
  - Brand name.
  - Filament type, excluding the `NONE` enum value.
  - Non-negative weight.
  - Color code.
  - Optional assigned printer.
- Details modal: all filament fields and assigned printer.
- Use the existing filament-type pipe and a color swatch alongside the color
  code if it fits the established visual style.
- Filtering should match brand, type, weight, color, and printer name.

### Beds

- Table columns: Brand, Bed type, Printer, Actions.
- Create and edit fields:
  - Brand name.
  - Bed type, excluding the `NONE` enum value.
  - Optional assigned printer.
- Details modal: brand, bed type, and assigned printer.
- The backend permits only one bed per printer. Keep this validation and show a
  useful error toast if the selected printer already has a bed.
- Filtering should match brand, bed type, and printer name.

## Files and likely changes

- `src/components/nozzles/`, `src/components/filaments/`, and
  `src/components/beds/`: replace placeholder tables with loaded data, actions,
  table sorting/search/pagination, and embedded dialogs.
- `src/modals/`: add one create, edit, and details modal per entity.
- `src/services/api-nozzle-service.ts`, `api-filament-service.ts`, and
  `api-bed-service.ts`: add get-by-ID, create, update, and delete methods to
  the existing list methods.
- Existing models and display pipes should be reused unless implementation
  reveals a missing API field or display requirement.
- Backend controllers already provide CRUD operations. Audit their assignment
  validation and delete behavior while wiring the UI; make only corrections
  required for the requested flows.

## Implementation sequence

1. Extend the three API services and verify request/response types against the
   existing backend DTOs.
2. Implement the Nozzles page and its create, edit, and details dialogs.
3. Implement the Filaments page and its create, edit, and details dialogs.
4. Implement the Beds page and its create, edit, and details dialogs, including
   one-bed-per-printer conflict feedback.
5. Add consistent confirmation, toast, list refresh, filtering, sorting, and
   pagination behavior across all three pages.
6. Build the frontend and backend; address regressions introduced by these
   changes.

## Acceptance criteria

- All three pages display API data and a useful empty state.
- Every entity can be created, opened in a details modal, edited, and deleted
  after confirmation.
- Optional printer assignments are shown by printer name and can be changed
  or cleared.
- Invalid input and API conflicts are surfaced through validation messages or
  error toasts; success toasts appear only after successful requests.
- The tables support search, sorting, and pagination, and refresh after
  successful mutations.
- Frontend and backend builds pass, and the final diff passes whitespace and
  formatting checks.
