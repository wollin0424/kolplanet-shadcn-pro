<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Icons (Lucide)

- Product / page components: import Lucide-named icons from `@/lib/icons` (e.g. `Settings`, `RefreshCcw` — same names as lucide-react).
- Each export sets `displayName` and `data-icon` to that Lucide name for DevTools / DOM inspection.
- Lookup: `src/lib/icons.catalog.md`.
- Do not import `lucide-react` directly in feature code; add `createIcon(LucideX, "X")` in `src/lib/icons.ts` if missing.
- shadcn primitives under `src/components/ui/*` may keep Lucide `*Icon` imports.
