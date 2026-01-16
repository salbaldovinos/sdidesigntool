# Geoflow SDI Designer

Subsurface Drip Irrigation Design Tool - A Progressive Web App for field engineers.

> **IMPORTANT:** Always read `AGENTS.md` first to understand current progress, lessons learned, and next steps. Update it when completing tasks or encountering new issues.

## Build & Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework:** Vite 7 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, CSS-first config)
- **State:** Zustand with localStorage persistence
- **Forms:** React Hook Form + Zod validation
- **Math:** decimal.js-light for precision calculations
- **PWA:** vite-plugin-pwa + Workbox

### Project Structure
```
src/
├── calculations/       # Engineering calculation modules
│   └── hydraulics/     # Hazen-Williams, velocity, friction loss
├── components/
│   ├── ui/             # Shadcn-style UI primitives (Button, Input, Card, Label)
│   ├── forms/          # Wizard step forms
│   └── wizard/         # Wizard container and navigation
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
└── lib/                # Utility functions (cn helper)
```

## Key Patterns

### State Management
All design data flows through `src/stores/designStore.ts`:
- Persists to localStorage under key `geoflow-sdi-design`
- 4-step wizard state (Design Inputs → System Layout → Zone TDH → Results)
- Form updates happen on blur, not on every keystroke

### Calculation Engine
Hydraulic calculations in `src/calculations/hydraulics/index.ts` use decimal.js-light for precision.
Key formulas validated against Excel reference:

- **Friction Loss (PSI):** `0.2083 × (100/C)^1.852 × Q^1.852 / D^4.866 × 0.433 × L/100`
- **Velocity:** `V = 0.4085 × Q / D²`
- **Flow from Velocity:** `Q = V × D² / 0.4085`

### Tailwind CSS v4 Notes
- Uses `@tailwindcss/vite` plugin (not PostCSS)
- CSS-first config via `@import "tailwindcss"` in `src/index.css`
- Standard Tailwind colors (e.g., `bg-white`, `text-gray-900`), not custom CSS variables

### Form Validation
Zod schemas in form components define validation rules. Use `valueAsNumber: true` in register() for numeric inputs.

## Important Files

- `vite.config.ts` - Vite, PWA, and Tailwind configuration
- `src/stores/designStore.ts` - Central state management
- `src/calculations/hydraulics/index.ts` - Core engineering calculations
- `src/types/design.ts` - TypeScript interfaces for design data
- `docs/excel-formula-reference.md` - Extracted Excel formulas for reference
- `scripts/validate-calculations.js` - Test script for calculation accuracy

## Known Issues & Gotchas

1. **Form infinite loops:** Never use `watch()` + `useEffect` to sync form state to store. Use `onBlur` handlers instead.
2. **zundo compatibility:** The zundo undo/redo middleware was removed due to compatibility issues with Zustand 5.
3. **PWA caching:** Service worker caches static assets; clear cache when testing major changes.

## Progress Tracking

**Always read `AGENTS.md` before starting work.** It contains:
- Current development phase and completion status
- Prioritized next steps
- Lessons learned and bugs to avoid
- File status reference table

**Update `AGENTS.md` when:**
- Completing a task (check it off)
- Encountering a new bug or gotcha (add to Lessons Learned)
- Making architectural decisions (document rationale)
- Starting work on a new phase
