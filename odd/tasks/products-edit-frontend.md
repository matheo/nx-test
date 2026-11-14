# Feature: products-edit-frontend (F5)

## Objective
Edit a product from a row dropdown menu in the products list. The kebab (⋮) icon sits in a new last column with no header, and its "Editar" option navigates to `/edit/:id`. That route reuses the F4 form, prefilled, with the ID disabled. Validations and per-field errors are the same as in F4.

## Problem / Why
F4 creates products, but there is no way to change one.

## Scope / Constraints
- No UI libraries.
- New generic `ui-dropdown-menu` in `@bank/ui`:
  - kebab trigger with `aria-haspopup` and `aria-expanded`
  - `role="menu"` panel with projected items
  - the panel uses `position: fixed` so the horizontal scroll of `ui-table-card` doesn't clip it
  - closes on Escape, outside click, item click, scroll, or resize.
- Backend, no changes:
  - `GET /bp/products/:id` returns a bare product, or 404.
  - `PUT /bp/products/:id` returns `{message, data}`.
- The route is `edit/:id`, not `/:id`, so that an id of `new` doesn't collide with the create route.
- User decision: "release date ≥ today" only applies when the date changes. An original past date is accepted as is.
- When editing, Reiniciar restores the loaded product.
- The ~400 lines per task heuristic is advisory only.
- TDD is off (no project config). The runner is vitest, through `pnpm nx test <project>`.

## Tasks
- [x] T1: `@bank/ui` `ui-dropdown-menu`, its export and its spec.
- [x] T2: repository `getById`/`update`, the HTTP adapter, a `todayOrLater(today, unchanged)` option, its spec, and the fake repos.
- [x] T3: edit mode in `ProductFormPage`, the `edit/:id` route, and the spec.
- [x] T4: actions column with the dropdown and "Editar" in the list, plus a list spec case.
- [x] T5: `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend`.

## Acceptance criteria / Checks
- `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend` passes.
- Manual check:
  1. ⋮ → Editar → `/edit/<id>`, with the fields filled in and the ID disabled.
  2. Errors show per field.
  3. An original past date is accepted, but changing it to a past date shows an error.
  4. Reiniciar restores the values.
  5. Enviar returns to the list with the change applied.
  6. The menu is not clipped and closes on Escape or an outside click.

## Progress
- Plan approved 2026-11-14.
- T1-T5 implemented 2026-11-14 by a delegated writer.
  - Item-click close lives in the document click listener because of the a11y lint rules.
  - Parent fix: scroll close moved from `window:scroll` to a capture-phase document listener, plus a spec. `scroll` does not bubble, so a horizontal scroll inside the table card left the fixed panel floating.
  - Check: `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend --skip-nx-cache`, 10/10 succeeded. ui 28 tests (9 files), frontend 46 tests (5 files).
  - Manual check passed (user, 2026-11-14).

## Next step
Commit on user request.
