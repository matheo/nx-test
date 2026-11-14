# Feature: products-delete-frontend (F6)

## Objective
Add an "Eliminar" item to each row's dropdown menu. It opens a confirm modal, styled per the mockup, that reads "¿Estas seguro de eliminar el producto {name}?" and has two buttons, "Cancelar" and "Confirmar". Confirmar deletes the product and removes its row. Cancelar only hides the modal.

## Problem / Why
F4 and F5 create and edit products, but nothing deletes them.

## Scope / Constraints
- No UI libraries.
- New generic `ui-confirm-dialog` in `@bank/ui`:
  - built on a native `<dialog>` opened with `showModal()`, driven by an `open` input
  - outputs: `confirmed` and `cancelled`. `cancelled` fires on the Cancel button, on Escape (the `cancel` event is prevented) and on a backdrop click.
  - `busy` input; message projected through `ng-content`
  - `confirmLabel` defaults to "Confirmar" and `cancelLabel` to "Cancelar".
- User decision: the button label follows the mockup, "Confirmar", not the written spec's "Eliminar".
- Backend, no changes: `DELETE /bp/products/:id` returns `{message}`, or 404.
- After a removal, `page` is clamped to `pageCount`.
- The ~400 lines per task heuristic is advisory only.
- TDD is off (no project config). The runner is vitest, through `pnpm nx test <project>`.

## Tasks
- [x] T1: `@bank/ui` `ui-confirm-dialog`, its export and its spec.
- [x] T2: repository `remove`, the HTTP adapter, and the fake repos.
- [x] T3: store `remove` with page clamping, plus its spec.
- [x] T4: an "Eliminar" menu item and the dialog wiring in the list page, error handling, and list specs.
- [x] T5: `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend`.

## Acceptance criteria / Checks
- `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend` passes.
- Manual check:
  1. ⋮ → Eliminar opens the modal with the product name.
  2. Cancelar and Escape hide it, and nothing is deleted.
  3. Confirmar removes the row and the count drops.
  4. Deleting the last row on the last page moves you to the previous page.

## Progress
- Plan approved 2026-11-14.
- Implemented T1-T5 (2026-11-14).
  - `UiConfirmDialog` is in `src/core/ui/src/lib/confirm-dialog/`, exported from `index.ts`. The spec stubs `showModal`/`close` in `beforeAll` when jsdom lacks them.
  - `ProductRepository.remove` and the HTTP adapter (`DELETE /backend/products/:id`, mapped to void) are done. Fake repos in the store spec, the list spec and the form spec now have `remove`.
  - `ProductListStore.remove` filters the product out and clamps `page` to `pageCount()`. The page subscribes with `takeUntilDestroyed`.
  - The list page has an Eliminar menu item, one `ui-confirm-dialog`, and the `pendingDelete`, `deleting` and `deleteError` signals. The error message is 'No se pudo eliminar el producto.' (`role="alert"`, inside the dialog).
  - Deviation: the backdrop click listener is registered with `addEventListener` in `afterNextRender`. A template `(click)` on `<dialog>` fails `click-events-have-key-events` and `interactive-supports-focus`. Keyboard users have Escape and the Cancel button.
  - Deviation: the `deleteError` alert is projected inside the dialog message (so it stays visible while the dialog is open) rather than below the dialog.
  - Deviation: `confirmDelete` ignores repeat calls while `deleting()` is true.
  - Added list-spec and store-spec cases for the failure path (dialog stays open with error, list unchanged).
- Check: `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend --skip-nx-cache` passed (10/10 tasks). Tests: ui 35 passed (10 files), frontend 53 passed (5 files).

## Next step
Done; committed.
