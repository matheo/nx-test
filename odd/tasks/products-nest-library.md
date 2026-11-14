# Feature: products-nest-library

## Objective
Port the `starter/src` Express + routing-controllers product CRUD API into the Nx monorepo:
- `src/data/products`: a Nest library (`@bank/products`).
- `src/apps/backend`: the app that serves it.
- `src/core/models`: a framework-agnostic, types-only library (`@bank/models`) that shares `ProductInterface` with the Angular frontend.

## Problem / Why
- The starter is a standalone Express app outside the workspace.
- The frontend needs the product contract without pulling in Nest, class-validator or Node.
- `src/data/products` is not detected as an Nx project: it has no package.json, and its `tsconfig.lib.json` extends a file that doesn't exist.

## Scope / Constraints
- Use pnpm workspace packages with the `@bank/source` custom condition, not root `paths` aliases.
- `@bank/models` holds types only. Dates are ISO `string`s.
- Backend: port 3002, global prefix `bp`, global ValidationPipe, CORS enabled.
- The frontend proxy targets 3002 and rewrites `/backend` to `/bp`.
- Errors use Nest `NotFoundException` / `BadRequestException` with the `MESSAGE_ERROR` strings as `message`.
- Keep `starter/` (do NOT delete it).
- TDD: off. No project or session TDD config was found, so ordinary functional checks apply.

## Tasks
- [x] T1: Restore `src/core/models` (`@bank/models`), types only, with `ProductInterface`.
- [ ] T2: Make `src/data/products` a real Nest lib with:
  - a package.json
  - a fixed tsconfig
  - message-error const
  - DTO
  - service
  - controller
  - module
  - barrel
  - and class-validator/class-transformer added as deps.
- [ ] T3: Wire up the backend:
  - add the dependency
  - import `ProductsModule`
  - update `main.ts` (prefix, pipe, CORS, port 3002)
  - add a `^build` dependency for the build
  - update the frontend proxy
  - update the root tsconfig references
  - run `nx sync`.
- [ ] T4: Add specs for `ProductsService` (CRUD, 400 on duplicate, 404 on missing) and for the controller.

## Acceptance criteria / Checks
- `pnpm nx show projects` includes `products` and `models`. The graph is `backend → products → models`, and the frontend does not depend on `products`.
- `pnpm nx run-many -t typecheck build eslint:lint` passes.
- `pnpm nx test products` and `pnpm nx test backend` pass.
- curl smoke test on `:3002/bp/products`:
  - create, then a duplicate create returns 400 with the const message
  - get all
  - verification
  - 404 on unknown id
  - invalid body returns 400.

## Progress
- Plan approved 2026-11-13.
- starter/ added to .nxignore and root eslint ignores so it is no longer an Nx project.
- Backend lint was failing on prettier before this work: ran eslint --fix (quote style) and ignored dist in backend lint.
- T1 done: models lib created (nx name `models`); `nx run-many -t typecheck eslint:lint -p models` passed.

## Next step
T2.
