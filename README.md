# Geoflow SDI Designer

A Progressive Web App (PWA) for designing Subsurface Drip Irrigation (SDI) systems. Built with React 19, TypeScript, and Tailwind CSS v4.

## Features

- **Multi-Step Design Wizard** - Guided workflow for SDI system design
  - Step 1: Design Inputs (field size, emitter specs, operating pressure)
  - Step 2: System Layout (pipe segments with lengths, diameters, elevations)
  - Step 3: Zone TDH Calculations (friction loss, velocity, flow rates)
  - Step 4: Results Summary (pump criteria, area analysis, cycle timing)

- **Hydraulic Calculations** - Validated against industry-standard Excel tools
  - Hazen-Williams friction loss formula
  - Velocity and flow calculations
  - Total Dynamic Head (TDH) breakdown
  - Error factor application

- **Project Management**
  - Save/load projects to IndexedDB
  - Auto-save with 5-second delay
  - Real-time project search
  - Recent projects quick access

- **PDF Reports** - Generate professional 2-page design reports

- **Offline Support** - Full PWA with service worker caching

- **Responsive Design** - Mobile-first with dashboard layout

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
git clone <repository-url>
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
├── calculations/
│   └── hydraulics/       # Core hydraulic formulas (Hazen-Williams, etc.)
├── components/
│   ├── forms/            # Wizard step forms
│   │   ├── DesignInputsForm.tsx
│   │   ├── SystemLayoutForm.tsx
│   │   ├── ZoneTDHView.tsx
│   │   └── ResultsView.tsx
│   ├── layout/           # Dashboard layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── pdf/              # PDF report template
│   ├── ui/               # Reusable UI components
│   ├── views/            # Page views (Projects, Settings, Help)
│   └── wizard/           # Wizard container and step indicator
├── hooks/                # Custom React hooks
│   ├── useAutoSave.ts
│   ├── useDebounce.ts
│   └── useOnlineStatus.ts
├── lib/
│   └── db.ts             # Dexie IndexedDB setup
├── stores/
│   └── designStore.ts    # Zustand state management
├── types/
│   └── design.ts         # TypeScript interfaces
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

## Color Palette

The app uses the Geoflow brand colors:
- **Primary:** Teal (#008080)
- **Background:** Gray-50 (#F9FAFB)
- **Accent:** Teal variants (50-900)

## Documentation

- See `docs/excel-formula-reference.md` for complete formula documentation
- See `AGENTS.md` for development progress and technical decisions

## License

Proprietary - Geoflow Systems

---

Built with React + Vite + Tailwind CSS
