# Feature: code-improvements

## Objective

Apply the verified improvements from the post-F6 code review: items 1, 2, 3, 9 and 10. Items 7 and 11 were checked and found invalid, so they need no change.

## Problem / Why

- Test fakes and the jsdom `<dialog>` stub are duplicated across specs.
- HTTP `{data}` unwrapping is repeated in the repository.
- Every row's dropdown keeps document and window listeners attached while it is closed.
- The dropdown's z-index and shadow are hard-coded instead of using tokens.
- An avatar with an empty name renders `role="img"` with no accessible name.

## Scope / Constraints

- New plain TS lib `@bank/testing` at `src/core/testing`, tagged `scope:shared` and `type:testing`. It holds only framework-free helpers: `makeProducts` and `stubDialogApi`.
- User decision: `FakeProductRepository` stays in the frontend (`products/testing/`), next to its port. A core lib cannot import from the app.
- No behaviour change, apart from the dropdown listener lifetime and the a11y of a nameless avatar.
- The ~400 lines per task heuristic is advisory only.
- TDD is off (no project config). The runner is vitest, through `pnpm nx test <project>`.

## Tasks

- [x] T1: the `@bank/testing` lib, holding `makeProducts` and `stubDialogApi`, plus its deps in the ui and frontend package.json files and the ESLint depConstraints.
- [x] T2: `FakeProductRepository` in the frontend. Replace the 4 ad-hoc fakes, use `@bank/testing` helpers, and delete the old `make-products.ts`.
- [x] T3: an `unwrapData` helper in `HttpProductRepository`.
- [x] T4: the dropdown listens only while open, and gets the `--ui-z-dropdown` and `--ui-shadow-md` tokens.
- [x] T5: an avatar with an empty name is `aria-hidden`, with specs.
- [x] T6: `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend testing`.

## Acceptance criteria / Checks

- The run-many command in T6 passes.
- Manual check:
  - The dropdown still closes on an outside click, Escape, scroll and resize.
  - The delete dialog works.
  - List, create and edit load.

## Progress

- Plan approved 2026-11-14.
- T1-T6 done. `pnpm nx run-many -t test eslint:lint typecheck build -p ui frontend testing --skip-nx-cache`: 13 tasks succeeded.
- Tests: ui 39 passed (10 files), frontend 53 passed (5 files). `testing` has targets build, typecheck and eslint:lint, and no test target.
- Deviations:
  - `@bank/testing` emits JS (`emitDeclarationOnly: false`, `type: module`, `.js` import suffixes), because vitest resolves it at runtime. The `models` lib is type-only.
  - The frontend `test` target sets `splitting: false`. Without it, the shared vitest chunk sits at the workspace root and cannot resolve `@bank/testing`. The option is deprecated in Angular and prints a warning.
  - `tsconfig.app.json` excludes `src/**/testing/**`, so the `vi`-based fake stays out of the app build.
  - The ui `@nx/dependency-checks` rule now ignores `**/*.spec.ts`, since specs import the devDependency `@bank/testing`.
  - `nx sync` added the `@bank/testing` project references to `tsconfig.json`, `tsconfig.app.json` and `ui/tsconfig.lib.json`.
- Manual browser check: not done.

## Next step

Manual check of the dropdown, the delete dialog and the list/create/edit pages. Commit only when the user asks.
