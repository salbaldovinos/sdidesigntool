# Geoflow SDI Designer

Subsurface Drip Irrigation Design Tool - A Progressive Web App for field engineers.

> **IMPORTANT:** Always read `AGENTS.md` first to understand current progress, lessons learned, and next steps. Update it when completing tasks or encountering new issues.

## Build & Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
npm test         # Run Vitest tests
```

## Architecture

### Tech Stack
- **Framework:** Vite 7 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, CSS-first config)
- **State:** Zustand with localStorage persistence
- **Forms:** React Hook Form + Zod validation
- **Math:** decimal.js-light for precision calculations
- **PDF:** @react-pdf/renderer for report generation
- **PWA:** vite-plugin-pwa + Workbox
- **Database:** Dexie.js (IndexedDB wrapper)

### Project Structure
```
src/
├── assistant/          # Smart Design Assistant
│   ├── rules/          # Validation rules (hydraulic, product, availability)
│   ├── bom-generator.ts
│   ├── recommendation-engine.ts
│   └── validation-engine.ts
├── calculations/       # Engineering calculation modules
│   └── hydraulics/     # Hazen-Williams, velocity, friction loss
├── components/
│   ├── assistant/      # AssistantPanel UI component
│   ├── forms/          # Wizard step forms (Steps 1-4)
│   ├── layout/         # Dashboard layout (Sidebar, Header)
│   ├── pdf/            # PDF report template (3 pages)
│   ├── steps/          # Step 5: SystemConfiguration
│   ├── ui/             # Shadcn-style UI primitives
│   ├── views/          # Page views (Welcome, Projects, Settings, Help)
│   └── wizard/         # WizardContainer with three-column layout
├── data/               # Geoflow product catalog (~450 products)
├── hooks/              # Custom hooks (useTheme, useAutoSave, useAssistant)
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
└── lib/                # Utilities (cn helper, Dexie DB)
```

## Key Patterns

### State Management
All design data flows through `src/stores/designStore.ts`:
- Persists to localStorage under key `geoflow-sdi-design`
- 5-step wizard state (Design Inputs → System Layout → Zone TDH → Results → Configuration)
- Form updates happen on blur, not on every keystroke
- Selected products stored for BOM generation

### Calculation Engine
Hydraulic calculations in `src/calculations/hydraulics/index.ts` use decimal.js-light for precision.
Key formulas validated against Excel reference:

- **Friction Loss (PSI):** `0.2083 × (100/C)^1.852 × Q^1.852 / D^4.866 × 0.433 × L/100`
- **Velocity:** `V = 0.4085 × Q / D²`
- **Flow from Velocity:** `Q = V × D² / 0.4085`

### Smart Design Assistant
The assistant provides real-time validation feedback:
- `src/assistant/validation-engine.ts` - Core validation logic
- `src/assistant/rules/` - Validation rules by category
- `src/hooks/useAssistant.ts` - React hook for feedback
- `src/components/assistant/AssistantPanel.tsx` - Sticky sidebar UI

### Product Catalog & BOM
- `src/data/geoflow-products.json` - ~450 Geoflow products
- `src/assistant/bom-generator.ts` - Generates Bill of Materials
- `src/assistant/recommendation-engine.ts` - Smart product recommendations

### Wizard Layout
Three-column layout on desktop (`src/components/wizard/WizardContainer.tsx`):
- **Left sidebar:** Step navigation + Generate Report button
- **Center:** Main form content with Previous/Next buttons
- **Right sidebar:** Sticky Design Assistant panel

### Tailwind CSS v4 Notes
- Uses `@tailwindcss/vite` plugin (not PostCSS)
- CSS-first config via `@import "tailwindcss"` in `src/index.css`
- Standard Tailwind colors (e.g., `bg-white`, `text-gray-900`), not custom CSS variables
- Geoflow brand: Teal (#008080) as primary color

### Form Validation
Zod schemas in form components define validation rules. Use `valueAsNumber: true` in register() for numeric inputs.

## Important Files

- `vite.config.ts` - Vite, PWA, and Tailwind configuration
- `src/stores/designStore.ts` - Central state management
- `src/calculations/hydraulics/index.ts` - Core engineering calculations
- `src/types/design.ts` - TypeScript interfaces for design data
- `src/components/wizard/WizardContainer.tsx` - Main wizard with PDF generation
- `src/components/steps/SystemConfiguration.tsx` - Step 5 product selection
- `src/components/pdf/SDIDesignReport.tsx` - 3-page PDF report template
- `src/assistant/bom-generator.ts` - Bill of Materials generation
- `docs/excel-formula-reference.md` - Extracted Excel formulas for reference

## Known Issues & Gotchas

1. **Form infinite loops:** Never use `watch()` + `useEffect` to sync form state to store. Use `onBlur` handlers instead.
2. **zundo compatibility:** The zundo undo/redo middleware was removed due to compatibility issues with Zustand 5.
3. **PWA caching:** Service worker caches static assets; clear cache when testing major changes.
4. **Generate Report:** Button is disabled until user reaches Step 5 (Configuration).

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
