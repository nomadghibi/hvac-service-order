# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Serve the dist/ build locally
```

No test suite is configured.

## Architecture

Single-page app: React 19 + TypeScript + Vite + Tailwind CSS v4.

**Entire app is one component:** `src/components/HVACServiceOrderInvoiceForm.tsx`. `App.tsx` just renders it; `main.tsx` mounts to `#root`. There are no routes, no context providers, no external state libraries.

### State model

All form state lives in a single `FormState` object managed by one `useState` call. Auto-persisted to `localStorage` under key `hvac-service-order-v1` via `useEffect`. Initialized from localStorage on mount; cleared via `handleClear`.

Dynamic table rows (`materials`, `labor`) use random `uid()` string IDs. Row amounts auto-calculate when qty/unitPrice or hours/rate change via `autoAmount()`. Amount fields are also directly editable.

Environmental checklist items (`EnvKey` union type) are nested objects (`EnvItem`) inside `FormState` — not an array. Each has `checked`, `qty`, `type`. Inputs disable when `checked` is false.

Work performed checklist uses `workPerformed: Record<string, boolean>` keyed as `"${category.title}:${item}"`.

### Totals flow

```
totalMaterials + totalLabor + travel = subtotal
subtotal * (taxRate / 100) = tax
subtotal + tax = finalTotal
```

All computed inline on every render — no `useMemo`.

### Print behavior

`window.print()` triggered after validation (invoice #, bill-to, date required). Print styles in `src/index.css`: `@media print` hides `.no-print` elements, sets letter size with 0.4in margins. Work performed checklist always renders all items on print (`print:block` overrides the collapse state).

### Styling conventions

Shared Tailwind class strings defined as module-level constants (`INPUT`, `LABEL`, `CARD`, `SECTION_TITLE`, `TH`). Use these constants rather than duplicating class lists.
