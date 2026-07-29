<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# rettaine — Next.js 16 app

## Commands
- `npm run dev` — dev server (Turbopack, default in v16, no `--turbopack` flag needed)
- `npm run build` — production build
- `npm run lint` — ESLint (no `next lint`, use ESLint directly; flat config in `eslint.config.mjs`)
- No test runner configured yet

## Next.js 16 quirks
- **Middleware** → `proxy.ts` + `export function proxy()` (old `middleware.ts` deprecated but still works)
- **Async request APIs**: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are all Promises — must `await`
- **Parallel route slots** require explicit `default.js` or build fails
- **No `next lint` command** — run ESLint via `npm run lint` or `npx eslint`
- **Turbopack by default** — webpack requires `--webpack` flag; custom webpack configs cause errors unless opted out

## Tailwind CSS v4
- Uses `@import "tailwindcss"` (not v3 `@tailwind` directives)
- The `@tailwindcss/postcss` plugin is the PostCSS integration
- Theme tokens defined via `@theme` blocks in CSS

## Project structure
- Single-page app under `app/` (layout.tsx, page.tsx, globals.css)
- Path alias `@/*` maps to project root (`./*`)
- `next.config.ts` is generic (no `cacheComponents` or custom config yet)
- No `.env` files committed (`.env*` in `.gitignore`)
- No tests, no CI workflows, no Makefile
