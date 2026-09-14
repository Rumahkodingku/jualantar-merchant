# AGENTS.md

React Router **v7.15.1 framework mode** (SSR) + React 19 + TypeScript + Tailwind v4 + shadcn/ui. PWA.

## Commands

Package manager is **bun** (`bun.lock` is the only lockfile). Do not use npm/yarn/pnpm.

- `bun run dev` — dev server (exposed on LAN via `host: true`; `/api` proxied to `API_PROXY_TARGET`, default `http://127.0.0.1:8001` — copy `.env.example` to `.env`)
- `bun run build` — `react-router build` then esbuild bundles the service worker to `build/client/sw.js`
- `bun run build:sw` — bundle only the service worker
- `bun run typecheck` — runs `react-router typegen` **then** `tsc` **then** `tsc -p tsconfig.sw.json`. The typegen step is required: route files import generated `./+types/*` types that do not exist until it runs.
- `bun run test` / `bun run test:run` — Vitest (jsdom, globals, setup file)
- `bun run format` — Prettier (only `.ts`/`.tsx`)
- `bun run start` — serve built app (`react-router-serve`)

There is **no lint script**. Verification order: `bun run typecheck` then `bun run test:run`.

## Gotchas

- **Dockerfile is broken**: it runs `npm ci` and copies `package-lock.json`, which does not exist in this repo. Don't trust it as a build reference until it's switched to bun.
- **Import alias is `~/*` → `app/*`** (tsconfig + `components.json`). `docs/ARCHITECTURE.md` examples use `@/...`, which does **not** resolve. Use `~/`.
- `docs/ARCHITECTURE.md` header says "v8" and its routing section says "Data Mode", but the installed/actual setup is **v7 framework mode** with a `routes.ts` registry and `ssr: true`. Trust the installed version.
- `cn` is re-exported from the `cn` package in `app/lib/utils.ts`, not a local `clsx`+`twMerge`.
- The service worker (`app/pwa/sw.ts`) is excluded from `tsconfig.json` and typechecked separately via `tsconfig.sw.json`; it is bundled by esbuild to `build/client/sw.js` and only registers in production (`import.meta.env.PROD`). To test the PWA, run `bun run build && bun run start` and access via `localhost` (a LAN HTTP origin is not a secure context, so the SW will not register there).

## Conventions (from `docs/ARCHITECTURE.md`)

Read that file before adding features — it is the source of truth for structure. Key points an agent would otherwise guess wrong:

- Feature code lives in `app/modules/<name>/` (components, hooks, pages, routes, services, optional schemas/types/utils, `index.ts` public API). **This directory does not exist yet** — only the `home` route is wired. Create modules as you add features.
- `app/routes.ts` is a thin central registry; module-owned routes (including nested/layout routes) are defined inside the module and registered here.
- Server state uses **TanStack Query**, not loaders/actions (loaders only for route-level prefetch/`ensureQueryData`). Mutations use TanStack Query mutations.
- API calls go through a single Axios instance in `app/lib/api.ts` (not yet created); components must not make HTTP calls directly.
- Runtime validation uses **Zod**; schema/type owned by the module.
- **Named exports** everywhere except route files, which use **default export**.
- Shared layer (`app/components`, `app/hooks`, `app/stores`, `app/lib`) must not depend on modules or hold domain business logic. Cross-module imports go through the other module's `index.ts`.
- Global client/UI state uses Zustand (`app/stores`); no Zustand for single-module state.

## Repo-local skills (`.agents/skills/`)

Untracked, OpenCode-discoverable skills for UI work: `frontend-design`, `design-taste-frontend`, `web-design-guidelines`, `ui-ux-pro-max` (searchable styles/palettes/UX data), and `vercel-react-best-practices` (React perf rules — the Next.js framing doesn't apply here, the React rules do). Load the relevant one before UI/UX or perf work.

## Formatting

Prettier: no semicolons, double quotes, 2-space indent, trailing comma `es5`, print width 80, Tailwind class sorting via `prettier-plugin-tailwindcss` (`tailwindStylesheet: app/app.css`). Run `bun run format` before finishing.
