# Feature: products-add-frontend (F4)

## Objective
Add an "Agregar" button to the products list. It navigates to `/new`, which shows the D2 "Formulario de Registro" form. The form creates a product through `POST /backend/products`, and a "Reiniciar" button clears it.

## Problem / Why
F1 to F3 only list products. There is no way to create one.

## Scope / Constraints
- No UI libraries.
- New generic pieces in `@bank/ui`:
  - `uiButton` (`button[uiButton], a[uiButton]`), with primary and secondary variants
  - `ui-form-field` (label, a projected native input, and an error message).
- Frontend:
  - add `create` and `exists` to `ProductRepository` and to the HTTP adapter
  - pure validators in `products/forms/product-validators.ts`
  - `pages/product-form.page.*`
  - the `new` route.
- Validation:
  - id: required, 3 to 10 characters, and must not already exist (async check against `GET /backend/products/verification/:id`, which returns a boolean)
  - name: required, 5 to 100 characters. The user chose 5, following the spec, even though the backend requires 6. A backend 400 is shown as a server error.
  - description: required, 10 to 200 characters
  - logo: required
  - release date: required, today or later
  - revision date: required, disabled, and automatically set to release + 1 year (a group validator checks it).
- Errors use a red border plus a message underneath. UI copy is in Spanish to match the existing app.
- No backend changes.
- The ~400 lines per task heuristic is advisory only.
- TDD is off (no project config). The runner is vitest via `pnpm nx test <project>`.

## Tasks
- [x] T1: `@bank/ui` `uiButton` and `ui-form-field`, with tokens, exports and specs.
- [x] T2: repository `create` / `exists`, the HTTP adapter, validators, and the validators spec.
- [x] T3: `product-form.page` plus the `new` route.
- [x] T4: an "Agregar" link in the list toolbar.
- [x] T5: page specs (form and list link), then `run-many -t test eslint:lint typecheck build -p ui frontend`.

## Acceptance criteria / Checks
- `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend` passes.
- Manual check:
  1. Agregar goes to `/new`.
  2. Field errors show.
  3. An existing id is rejected.
  4. Revision is filled in automatically.
  5. Reiniciar clears the form.
  6. A valid submit returns to the list with the new product in it.

## Progress
- Plan approved 2026-11-14.
- T1-T5 implemented 2026-11-14. `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend` passed: ui 22 tests (8 files), frontend 36 tests (5 files); eslint, typecheck, build all green. Manual check still pending.

## Next step
Manual check, then commit on user request.
