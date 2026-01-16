# Geoflow SDI Designer

A Progressive Web App (PWA) for designing Subsurface Drip Irrigation (SDI) systems. Built with React 19, TypeScript, and Tailwind CSS v4.

## Features

### 5-Step Design Wizard
Guided workflow for complete SDI system design:

- **Step 1: Design Inputs** - Field size, emitter specs, operating pressure, soil loading rate
- **Step 2: System Layout** - Pipe segments with lengths, diameters, elevations, C-factors
- **Step 3: Zone TDH** - Friction loss, velocity, dispersal/flush flow calculations
- **Step 4: Results** - Pump selection criteria, area analysis, cycle timing summary
- **Step 5: Configuration** - Equipment selection, product recommendations, Bill of Materials

### Smart Design Assistant
Real-time validation and recommendations displayed in a sticky sidebar:
- Hydraulic validation (velocity limits, pressure requirements, friction loss)
- Product compatibility checks (Hydrotek zones, panel configurations)
- Availability warnings (stock status, lead times)
- Severity-based feedback (errors, warnings, suggestions)

### Product Catalog & Equipment Selection
Complete Geoflow product catalog with ~450 products:
- Drip tubing (WaterflowPRO, WaterflowECO) with emitter spacing filtering
- Headworks/filters (Vortex, BioDisc)
- Zone control (Hydrotek indexing valves OR solenoid boxes + control panels)
- Pressure regulators matched to flow requirements
- Flow meters (MultiJet, Digital, Electromagnetic)

### Bill of Materials (BOM)
Auto-generated equipment list based on design inputs:
- Automatic quantity calculations
- Stock status and lead time display
- Included in PDF report

### PDF Reports
Generate professional 3-page design reports:
- **Page 1:** Design summary, area analysis, pump selection criteria
- **Page 2:** TDH breakdown, pipe layout, design inputs
- **Page 3:** Equipment selection and Bill of Materials

### Hydraulic Calculations
Validated against industry-standard Excel tools:
- Hazen-Williams friction loss formula
- Velocity and flow calculations
- Total Dynamic Head (TDH) breakdown
- Error factor application

### Project Management
- Save/load projects to IndexedDB
- Auto-save with 5-second delay
- Real-time project search with keyboard navigation
- Recent projects quick access

### Additional Features
- **Offline Support** - Full PWA with service worker caching
- **Dark Mode** - Light/Dark/System theme toggle
- **Responsive Design** - Mobile-first with three-column desktop layout
- **Geoflow Branding** - Teal color palette (#008080)

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand with localStorage persistence
- **Database:** Dexie.js (IndexedDB wrapper)
- **PDF Generation:** @react-pdf/renderer
- **PWA:** vite-plugin-pwa with Workbox
- **Testing:** Vitest
- **Math:** decimal.js-light for precision calculations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/salbaldovinos/sdidesigntool.git
cd sdidesigner

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── assistant/
│   ├── rules/            # Validation rules (hydraulic, product, availability)
│   ├── bom-generator.ts  # Bill of Materials generation
│   ├── recommendation-engine.ts
│   └── validation-engine.ts
├── calculations/
│   └── hydraulics/       # Core hydraulic formulas (Hazen-Williams, etc.)
├── components/
│   ├── assistant/        # AssistantPanel UI
│   ├── forms/            # Wizard step forms (Steps 1-4)
│   │   ├── DesignInputsForm.tsx
│   │   ├── SystemLayoutForm.tsx
│   │   ├── ZoneTDHView.tsx
│   │   └── ResultsView.tsx
│   ├── layout/           # Dashboard layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── pdf/              # 3-page PDF report template
│   ├── steps/            # Step 5: SystemConfiguration
│   ├── ui/               # Reusable UI components
│   ├── views/            # Page views (Welcome, Projects, Settings, Help)
│   └── wizard/           # WizardContainer with three-column layout
├── data/                 # Geoflow product catalog (~450 products)
├── hooks/                # Custom React hooks
│   ├── useAssistant.ts   # Validation feedback
│   ├── useAutoSave.ts
│   ├── useDebounce.ts
│   ├── useOnlineStatus.ts
│   └── useTheme.ts       # Dark mode
├── lib/
│   └── db.ts             # Dexie IndexedDB setup
├── stores/
│   └── designStore.ts    # Zustand state management
├── types/
│   ├── assistant.ts      # Validation types
│   └── design.ts         # Design data types
└── App.tsx
```

## Key Formulas

The hydraulic calculations are validated against industry standards:

- **Friction Loss (Hazen-Williams):**
  ```
  hf = 0.2083 × (100/C)^1.852 × Q^1.852 / D^4.866 × 0.433 × L/100
  ```

- **Velocity:**
  ```
  V = 0.4085 × Q / D²
  ```

- **Flow from Velocity:**
  ```
  Q = V × D² / 0.4085
  ```

Where:
- C = Hazen-Williams coefficient
- Q = Flow rate (GPM)
- D = Pipe diameter (inches)
- L = Pipe length (feet)
- V = Velocity (ft/s)

## PWA Installation

The app can be installed as a standalone application:

1. Open the app in Chrome, Edge, or Safari
2. Click the install prompt or use browser menu
3. The app works offline after installation

## Live Demo

https://sdidesigntool.vercel.app

## Color Palette

The app uses the Geoflow brand colors:
- **Primary:** Teal (#008080)
- **Background:** Gray-50 (#F9FAFB)
- **Accent:** Teal variants (50-900)

## Documentation

- See `docs/excel-formula-reference.md` for complete formula documentation
- See `AGENTS.md` for development progress and technical decisions
- See `CLAUDE.md` for architecture overview and patterns

## License

Proprietary - Geoflow Systems

---

Built with React + Vite + Tailwind CSS
