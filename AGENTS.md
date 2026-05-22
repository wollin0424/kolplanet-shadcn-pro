<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Icons (Lucide)

- Product / page components: import semantic icon **components** from `@/lib/icons` (e.g. `<IconRefresh />` → Lucide `RefreshCcw`).
- Icons are wrapped with `displayName` + `data-icon` / `data-lucide` on the SVG for DevTools and DOM inspection.
- Lookup: `src/lib/icons.catalog.md` lists semantic name, Lucide name, and usage.
- Do not import `lucide-react` directly in feature code; add `createIcon(...)` in `src/lib/icons.ts` first.
- shadcn primitives under `src/components/ui/*` may keep Lucide `*Icon` imports.
