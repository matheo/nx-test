# Feature: products-list-frontend (F1)

## Objective
Build the F1 financial products list in the Angular `frontend` app (`src/apps/frontend`). It loads products from `GET /backend/products`, which the proxy maps to `:3002/bp/products`, and follows the D1 mockup:
- a header with a money icon and "BANCO"
- a search input on the left
- a table with the columns Logo, Product name, Description, Release date and Revision date, where the last three headers have an info hint
- a footer with "X Resultados" and a page-size select (5/10/20).

## Problem / Why
The frontend is an empty shell: no HttpClient, no routes, no UI. The brief forbids UI component and style libraries, so the generic components need a home of their own. That home is the new `@bank/ui` library, which future features (F2 add, F3 edit, F4 delete) will reuse.

## Scope / Constraints
- No UI libraries: native HTML plus custom SCSS. Design tokens are CSS custom properties.
- New lib `@bank/ui` at `src/core/ui`:
  - an Angular lib with standalone components, scss, vitest and prefix `ui`
  - tags `scope:shared` and `type:ui`
  - generic and presentational only.
- Products feature at `src/apps/frontend/src/app/products/`:
  - `api/product.repository.ts`: the abstract class, which is also the DI token
  - `api/http-product.repository.ts`
  - `state/product-list.store.ts`: signals
  - `pages/product-list.page.ts`: the container
  - `products.routes.ts`.
- Dates are stored as `yyyy-mm-dd` and shown as `dd/mm/yyyy`. The `displayDate` pipe in `@bank/ui` does this by splitting the string, with no `Date`, so there is no timezone shift.
- Routes: `/` is the list. `/new`, `/:id` and `?query=` come later. Enable `withComponentInputBinding()` now.
- Libs resolve through pnpm `workspace:*` and the `@bank/source` condition, not `paths`.
- Follow the ~400 changed lines per task heuristic, but treat it as advisory only.
- TDD: off. This is inherited from the products-nest-library doc and no TDD config exists, so ordinary functional checks apply. The runner is vitest (`pnpm nx test <project>`).

## Tasks
- [x] T1: Generate `@bank/ui` (`src/core/ui`) and wire it up:
  - add a tokens SCSS
  - add `@bank/models` and `@bank/ui` as frontend deps, then `pnpm install` and `nx sync`
  - lint boundaries: app may use ui and model; ui may use ui only
  - in `app.config`: `provideHttpClient(withFetch())`, `withComponentInputBinding()`, and the repository provider.
- [x] T2: `@bank/ui` F1 components:
  - header
  - search-input
  - select
  - avatar with initials fallback
  - info-hint
  - table-card
  - the `displayDate` pipe.
- [x] T3: Products `api/` (repository plus HTTP adapter) and `state/product-list.store.ts`:
  - filter by name and description, case-insensitive
  - pageSize 5/10/20
  - total
  - loading, error and empty states.
- [x] T4: `pages/product-list.page.ts`, `products.routes.ts` at `''`, and `app.html` (`ui-header` + `main` + `router-outlet`).
- [x] T5: Tests:
  - ui: avatar fallback, select emit, search emit, date pipe
  - frontend: store filter, page size and count; page renders N rows; `app.spec` finds "Banco"
  - then run lint and build.

## Acceptance criteria / Checks
- `pnpm nx test ui` and `pnpm nx test frontend` pass.
- `pnpm nx run-many -t lint build -p ui frontend` passes.
- Manual check:
  1. Run `pnpm nx run-many -t start -p backend frontend`.
  2. POST a few products.
  3. Confirm that search filters, that 5/10/20 limits the rows, that the counter is right, that dates show as `dd/mm/yyyy`, and that the table scrolls sideways at narrow widths.

## Roadmap (separate docs later)
- F2 `/new`: add product with a reactive form and ID verification.
- F3 `/:id`: edit, with the ID disabled.
- F4: delete through the row menu and a confirm dialog.
- ~~Search stored in the URL~~ Done as F2 (2026-11-14): the param is `?search=` (user's choice, not `?query=`). The page has a `search` input bound through `withComponentInputBinding`, and an effect syncs it into `store.query`. Typing navigates with `replaceUrl` and `merge`, and an empty term removes the param. Checks: frontend test (10), eslint:lint, typecheck and build all pass.

## Progress
- Plan approved 2026-11-13. The user overrode the brief's 5/10/15 to **5/10/20**.
- T1 done: `@bank/ui` generated buildable (vitest-angular needs buildable). Frontend got a package.json with workspace deps. Lib exports use `@bank/source` -> src, `default` -> dist (ng-packagr full mode), because the unit-test builder externalizes packages (src would be JIT'd and signal inputs break). `frontend:test` dependsOn `^build`. Check: `nx build ui`, frontend build pass.
- T2 done: header, search-input, select, avatar, info-hint, table-card, displayDate in `@bank/ui`.
- T3/T4 done: repository, HTTP adapter, store, page, routes, app shell. Check: `nx build frontend` passes (no budget warnings).
- T5 done: `nx test ui` 15 passed; `nx test frontend` 8 passed (app.spec adapted to exact 'BANCO'); `nx run-many -t eslint:lint build typecheck -p ui frontend` all pass. Note: no `lint` target name exists; it is `eslint:lint`.

- Independent verifier (2026-11-14): nothing blocking. Applied: `frontend:start` dependsOn `^build` (ui `default` export points to git-ignored dist, so a fresh clone could fail to serve); HTTP adapter maps `response.data ?? []`. Re-ran `run-many -t test eslint:lint build typecheck -p ui frontend`: all pass (ui 15, frontend 8 tests).

- Dev-server fix (2026-11-14): the `src/**/*` workspace glob picked up `src/core/ui/dist` as a duplicate `@bank/ui` package and frontend linked to it. Added `!**/dist` globs to pnpm-workspace.yaml; ui exports gained `types: ./dist/bank-ui.d.ts` with default `./dist/esm2022/bank-ui.js`; frontend `start` sets `prebundle.exclude: [@bank/ui, @bank/models]` so Vite does not resolve them from `.angular/vite-root`. Checks re-run: all pass. Dev server not yet verified (user restart pending).
- Hot-reload fix (2026-11-14): the Angular builder ignores tsconfig `customConditions`, so the dev server bundled `@bank/ui` from `dist`. The frontend `development` build now sets `conditions: ["@bank/source", "module", "development"]` (source in dev, dist in prod/tests). Tried and rejected tsconfig `paths`: they break the backend runtime (tsc does not rewrite paths) and the frontend project-references typecheck (TS6059/TS6307). Checks: run-many test eslint:lint build typecheck, all 6 projects pass.

## Next step
Manual check (serve backend + frontend, POST products), then commit on user request.
