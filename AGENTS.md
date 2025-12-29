# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` is the Next.js App Router, with route groups like `(public)`, `(admin)`, `(customer)` and API routes under `src/app/api/`.
- `src/components/` holds shared UI and forms; `src/lib/` holds auth helpers, Supabase clients, server actions, email helpers, and utilities.
- `src/types/` stores TypeScript types (including generated DB types) and `src/styles/` contains global CSS and Tailwind setup.
- `tests/` contains `tests/setup.ts` for Vitest and `tests/e2e/` for Playwright.
- `docs/` provides setup and deployment guides; `public/` is for static assets.

## Build, Test, and Development Commands
- `pnpm dev` starts the local dev server on `http://localhost:3000`.
- `pnpm build` creates the production build; `pnpm start` runs it.
- `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm type-check` enforce code quality.
- `pnpm test`, `pnpm test:coverage` run Vitest; `pnpm test:e2e` runs Playwright (auto-starts the dev server).
- `pnpm supabase:generate-types` regenerates `src/types/database.ts` (requires local Supabase).

## Coding Style & Naming Conventions
- TypeScript and React are the defaults; prefer server components and add `use client` only when required.
- Formatting is handled by Prettier (Tailwind plugin) and ESLint; run formatters instead of manual alignment.
- Use kebab-case for file names (for example, `customer-login-form.tsx`), PascalCase for React components, and camelCase for variables and functions.

## Testing Guidelines
- Unit tests use Vitest (JSDOM) with setup in `tests/setup.ts`; name tests `*.test.ts(x)` or `*.spec.ts(x)`.
- E2E tests live in `tests/e2e/` and target the running app via Playwright.
- No fixed coverage threshold is enforced; cover critical auth, registration, and payment flows.

## Commit & Pull Request Guidelines
- Follow conventional commits seen in history (for example, `feat:`, `fix:`, `docs:`); keep scope short and imperative.
- PRs should include a clear description, linked issue or ticket if available, tests run, and screenshots or recordings for UI changes.

## Security & Configuration
- Copy `.env.local.example` to `.env.local` and keep secrets out of git.
- Supabase and email credentials are required; see `docs/ENVIRONMENT_VARIABLES.md`.
