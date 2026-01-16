# Geoflow SDI Design Tool: Excel-to-SaaS Feasibility Analysis

**Document Version:** 1.0  
**Date:** January 15, 2026  
**Prepared For:** Anua / Geoflow Engineering Team  

---

## Executive Summary

Converting the Geoflow Subsurface Drip Irrigation Design Tool from Excel to a standalone SaaS web application is **technically feasible and economically viable** at approximately **$0-10/month** operating costs for ~300 monthly users. The offline-first requirement is achievable through modern PWA architecture, and the entire application can be built efficiently with AI-assisted development using Claude Code.

### Key Recommendations

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Frontend Framework | Vite + React | Better PWA support, smaller bundle than Next.js |
| Hosting | Vercel | Excellent DX, 100GB bandwidth free tier |
| Database | Supabase | Free tier handles 100K MAU + 500MB storage |
| State Management | Zustand | Minimal boilerplate, built-in persistence |
| Offline Storage | IndexedDB via Dexie.js | Structured data with querying capability |

### Projected Monthly Costs

| User Scale | Estimated Cost |
|------------|----------------|
| 300 users (current) | **$0** |
| 1,000 users | $0-5 |
| 5,000 users | $5-25 |

---

## 1. Technical Architecture

### 1.1 Why Vite + React Over Next.js

For an offline-first engineering calculator, **Vite with React significantly outperforms Next.js**:

| Factor | Vite + React | Next.js |
|--------|-------------|---------|
| Bundle Size | ~70KB gzipped | ~100KB+ gzipped |
| PWA Setup | Single config file (vite-plugin-pwa) | Complex next-pwa setup |
| SSR Benefits | None for this use case | Adds unnecessary complexity |
| Cold Start | Instant (static) | Server function cold starts |
| Offline Support | Native, straightforward | Requires workarounds |

**Next.js excels at** server-rendered content, dynamic routes, and API-heavy applications. **This calculator needs none of that** — all computations run client-side and must function without internet.

### 1.2 Recommended Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (PWA)                          │
├─────────────────────────────────────────────────────────────┤
│  Framework:     Vite + React 18 + TypeScript                │
│  UI Components: Shadcn/ui + Radix UI primitives             │
│  State:         Zustand + zundo (undo/redo)                 │
│  Forms:         React Hook Form + Zod validation            │
│  Charts:        Visx (pump curves) + Recharts (basic)       │
│  PWA:           vite-plugin-pwa + Workbox                   │
│  Offline DB:    Dexie.js (IndexedDB wrapper)                │
│  Math:          decimal.js-light + math.js                  │
│  PDF:           @react-pdf/renderer                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  Hosting:       Vercel (100GB bandwidth, excellent DX)      │
│  Auth:          Supabase Auth (100K MAU free)               │
│  Database:      Supabase PostgreSQL (500MB free)            │
│  Serverless:    Vercel Functions (if needed)                │
│  Product Data:  Static JSON bundles (no DB queries)         │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Bundle Size Budget

| Component | Library | Size (gzipped) |
|-----------|---------|----------------|
| Framework | React + ReactDOM | ~45KB |
| PWA | vite-plugin-pwa | ~3KB |
| State | Zustand + zundo | ~5KB |
| Math | decimal.js-light | ~12KB |
| Units | convert-units | ~5KB |
| UI | Shadcn/ui (tree-shaken) | ~15KB |
| Forms | React Hook Form + Zod | ~12KB |
| **Total Core** | | **~97KB** |
| Product Catalogs | Static JSON | ~120KB |
| **Total Initial Load** | | **~220KB** |

This is well under the 500KB budget for good mobile performance on 3G connections.

---

## 2. Offline-First Architecture

### 2.1 Why Offline-First Matters

Field engineers using this tool often work in areas with:
- No cellular coverage (rural installation sites)
- Intermittent connectivity (moving between buildings)
- Metered/expensive data (international sites)

The architecture treats **offline as the default state**, not an error condition.

### 2.2 Service Worker Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   CACHING STRATEGIES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CACHE-FIRST (Instant access, background update)            │
│  ├── Product catalogs (drip tubes, pumps, pipes)            │
│  ├── Calculation formulas and constants                     │
│  ├── Static assets (JS, CSS, images)                        │
│  └── App shell (HTML, fonts)                                │
│                                                             │
│  STALE-WHILE-REVALIDATE (Fresh when possible)               │
│  ├── User preferences                                       │
│  ├── Project templates                                      │
│  └── Help documentation                                     │
│                                                             │
│  NETWORK-FIRST (Server authoritative)                       │
│  ├── Authentication tokens                                  │
│  ├── Project sync operations                                │
│  └── User account data                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Local Data Storage Schema

Using Dexie.js for IndexedDB:

```typescript
// Database schema for offline storage
const db = new Dexie('GeoflowSDI');

db.version(1).stores({
  // User projects with sync tracking
  projects: '++id, name, updatedAt, syncStatus, userId',
  
  // Individual calculations within projects
  calculations: '++id, projectId, stepNumber, type, createdAt',
  
  // Cached product catalog (for offline search)
  products: 'sku, category, name, *tags',
  
  // Pending sync queue
  syncQueue: '++id, operation, timestamp, payload'
});
```

### 2.4 Sync Strategy: Last-Write-Wins

For single-user scenarios typical of engineering calculators:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   LOCAL      │     │    SYNC      │     │   SERVER     │
│   CHANGE     │────▶│   QUEUE      │────▶│   UPDATE     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │              (when online)              │
       ▼                    │                    ▼
┌──────────────┐            │            ┌──────────────┐
│   OPTIMISTIC │            │            │   CONFLICT   │
│   UI UPDATE  │◀───────────┴───────────▶│   NOTIFY     │
└──────────────┘                         └──────────────┘
```

- Changes apply immediately to local state
- Sync queue processes when connectivity returns
- Last-Write-Wins with timestamp comparison
- User notification on detected conflicts (rare for single-user)

### 2.5 iOS Safari Limitations & Mitigations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| 50MB cache limit | Can't cache everything | Prioritize essential data, lazy-load extras |
| No Background Sync | Sync only when app open | Trigger sync on `online` event + app focus |
| PWA restrictions | Limited home screen features | Clear "Add to Home Screen" instructions |
| Storage eviction | Data loss under pressure | Critical data in IndexedDB (more persistent) |

---

## 3. Engineering Calculations Implementation

### 3.1 Numerical Precision Requirements

JavaScript's native floating-point arithmetic is **unsuitable for engineering calculations**:

```javascript
// Native JavaScript (WRONG)
0.1 + 0.2 = 0.30000000000000004  // Not 0.3!

// decimal.js (CORRECT)
new Decimal('0.1').plus('0.2').toString() = '0.3'
```

**Required Libraries:**

| Library | Purpose | Size |
|---------|---------|------|
| decimal.js-light | Arbitrary precision arithmetic | 12KB |
| math.js | Unit conversions, complex math | 15KB (tree-shaken) |
| convert-units | GPM↔L/min, ft↔m, PSI↔kPa | 5KB |

### 3.2 Core Formula Implementations

#### Hazen-Williams Head Loss

```typescript
import Decimal from 'decimal.js-light';

interface HazenWilliamsParams {
  flowRate: number;      // GPM
  pipeDiameter: number;  // inches (ID)
  pipeLength: number;    // feet
  coefficient: number;   // C value (typically 150 for PVC)
}

export function calculateHazenWilliamsLoss(params: HazenWilliamsParams): number {
  const { flowRate, pipeDiameter, pipeLength, coefficient } = params;
  
  // h_f = 10.67 × L × Q^1.852 / (C^1.852 × D^4.87)
  const Q = new Decimal(flowRate);
  const D = new Decimal(pipeDiameter);
  const L = new Decimal(pipeLength);
  const C = new Decimal(coefficient);
  
  const numerator = new Decimal('10.67')
    .times(L)
    .times(Q.pow(1.852));
    
  const denominator = C.pow(1.852).times(D.pow(4.87));
  
  return numerator.dividedBy(denominator).toNumber();
}
```

#### Velocity Calculation

```typescript
export function calculateVelocity(flowGPM: number, pipeIdInches: number): number {
  // V = 0.4085 × Q / D²
  const Q = new Decimal(flowGPM);
  const D = new Decimal(pipeIdInches);
  
  return new Decimal('0.4085')
    .times(Q)
    .dividedBy(D.pow(2))
    .toNumber();
}
```

#### Elevation Head

```typescript
export function calculateElevationHead(elevationFeet: number): number {
  // PSI = elevation × 0.433
  return new Decimal(elevationFeet)
    .times('0.433')
    .toNumber();
}
```

### 3.3 Calculation Module Structure

```
src/
├── calculations/
│   ├── index.ts                 # Public API exports
│   ├── hydraulics/
│   │   ├── hazen-williams.ts    # Head loss calculations
│   │   ├── darcy-weisbach.ts    # Alternative friction formula
│   │   ├── velocity.ts          # Flow velocity
│   │   └── elevation.ts         # Static head
│   ├── irrigation/
│   │   ├── emitter-flow.ts      # Dripper calculations
│   │   ├── lateral-design.ts    # Lateral sizing
│   │   ├── zone-sizing.ts       # Zone configuration
│   │   └── uniformity.ts        # Emission uniformity (EU%)
│   ├── pump/
│   │   ├── tdh.ts               # Total Dynamic Head
│   │   ├── npsh.ts              # Net Positive Suction Head
│   │   └── curve-interpolation.ts
│   └── units/
│       ├── flow.ts              # GPM, LPM, m³/hr conversions
│       ├── pressure.ts          # PSI, kPa, bar, ft-head
│       └── length.ts            # ft, m, in, mm
├── data/
│   ├── drip-tubes.json          # Product catalog
│   ├── pumps.json               # Pump curves
│   ├── pipes.json               # Pipe specifications
│   ├── headworks.json           # Filter assemblies
│   └── zone-valves.json         # Valve data
└── types/
    ├── products.ts              # Product type definitions
    ├── calculations.ts          # Calculation interfaces
    └── projects.ts              # Project/design types
```

### 3.4 Testing Strategy

Every calculation requires validation against the original Excel:

```typescript
// hazen-williams.test.ts
describe('Hazen-Williams Head Loss', () => {
  it('matches Excel reference within 0.1%', () => {
    const result = calculateHazenWilliamsLoss({
      flowRate: 6.742,      // From Excel A32
      pipeDiameter: 1.049,  // 1" PVC ID
      pipeLength: 140,      // From Excel C20
      coefficient: 150
    });
    
    const excelReference = 3.783;  // From Excel L20
    const tolerance = excelReference * 0.001;  // 0.1%
    
    expect(result).toBeCloseTo(excelReference, tolerance);
  });
});
```

---

## 4. Product Data Architecture

### 4.1 Static JSON vs Database

For ~1,000 product items that change infrequently, **static JSON bundles** outperform database queries:

| Approach | Latency | Offline | Cost | Update Frequency |
|----------|---------|---------|------|------------------|
| Static JSON | 0ms (cached) | ✅ Full | $0 | Build-time |
| Supabase Query | 50-200ms | ❌ None | $0-25 | Real-time |
| Edge Cache | 5-20ms | Partial | $0-10 | Configurable |

**Recommendation:** Bundle product catalogs as static JSON, rebuild/redeploy when catalog updates (quarterly at most).

### 4.2 Product Catalog Schema

```typescript
// types/products.ts

export interface DripTube {
  sku: string;              // "G-WFPC-16-4-12-PRO"
  name: string;             // "Wastewater PC 16mm 0.9GPH 12in"
  tubeId: number;           // inches (0.55)
  emitterKd: number;        // Discharge coefficient
  emitterExponent: number;  // Pressure exponent
  emitterSpacing: number;   // inches
  nominalFlowGPH: number;   // Gallons per hour
  nominalFlowGPM: number;   // Gallons per minute
  maxPressure: number;      // PSI
  minPressure: number;      // PSI
}

export interface Pump {
  sku: string;
  manufacturer: string;
  model: string;
  horsePower: number;
  curve: PumpCurvePoint[];  // Array of {gpm, headFeet}
}

export interface PumpCurvePoint {
  flowGPM: number;
  headFeet: number;
  efficiency?: number;
}

export interface Pipe {
  nominalSize: string;      // "1", "1.5", "2"
  schedule: string;         // "40", "80"
  od: number;               // Outside diameter (inches)
  id: number;               // Inside diameter (inches)
  wallThickness: number;    // inches
}
```

### 4.3 JSON Bundle Structure

```
public/
└── data/
    ├── catalog.json           # Combined manifest (~2KB)
    ├── drip-tubes.json        # ~15KB (50 products)
    ├── pumps.json             # ~40KB (20 pumps × curves)
    ├── pipes.json             # ~10KB (30 sizes)
    ├── headworks.json         # ~8KB (10 assemblies)
    └── zone-valves.json       # ~5KB (15 valves)
                               # Total: ~80KB uncompressed
                               # ~25KB gzipped
```

---

## 5. User Interface Design

### 5.1 Component Library: Shadcn/ui

**Why Shadcn/ui for engineering applications:**

| Factor | Shadcn/ui | Material UI | Chakra UI |
|--------|-----------|-------------|-----------|
| Bundle Size | 2.3KB initial | 91KB initial | 45KB initial |
| Customization | Full source access | Theme overrides | Props/theme |
| Accessibility | Radix primitives (excellent) | Good | Good |
| Claude Code Support | MCP server available | None | None |
| Table Component | TanStack integration | Basic | Basic |

### 5.2 Multi-Step Wizard Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DESIGN WIZARD FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │  STEP 1  │──▶│  STEP 2  │──▶│  STEP 3  │──▶│ RESULTS  │ │
│  │  Design  │   │  System  │   │  Zone    │   │  & Pump  │ │
│  │  Inputs  │   │  Layout  │   │  TDH     │   │ Selection│ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       │              │              │              │        │
│       ▼              ▼              ▼              ▼        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ZUSTAND STATE (persisted)               │  │
│  │  {                                                   │  │
│  │    currentStep: 1,                                   │  │
│  │    designInputs: { flowGPD, soilRate, ... },        │  │
│  │    systemLayout: { segments: [...] },               │  │
│  │    zoneTDH: { ... },                                │  │
│  │    results: { pumpRecommendations: [...] }          │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              IndexedDB (offline persistence)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Form Handling with React Hook Form

```typescript
// Example: Step 1 Design Inputs Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const designInputsSchema = z.object({
  maxFlowGPD: z.number()
    .min(100, 'Minimum 100 GPD')
    .max(100000, 'Maximum 100,000 GPD'),
  soilLoadingRate: z.number()
    .min(0.05, 'Minimum 0.05 gpd/ft²')
    .max(1.5, 'Maximum 1.5 gpd/ft²'),
  usableAcres: z.number()
    .min(0.1, 'Minimum 0.1 acres')
    .max(100, 'Maximum 100 acres'),
  dripTubeSku: z.string().min(1, 'Select a drip tube'),
  driplineSpacing: z.number().min(1).max(10),
  emitterSpacing: z.number().min(0.5).max(4),
  numberOfZones: z.number().int().min(1).max(20),
  lateralsPerZone: z.number().int().min(1).max(50),
  lateralLength: z.number().min(10).max(1000),
  flushVelocity: z.number().min(0.5).max(3),
  cyclesPerDay: z.number().int().min(1).max(48),
});

type DesignInputs = z.infer<typeof designInputsSchema>;
```

### 5.4 Data Visualization Components

#### Pump Curve Chart (Visx)

```typescript
// components/PumpCurveChart.tsx
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface PumpCurveProps {
  pumpCurve: PumpCurvePoint[];
  systemCurve: { gpm: number; head: number }[];
  operatingPoint?: { gpm: number; head: number };
}

// Renders H-Q curve with system curve overlay
// Highlights operating point intersection
// Shows BEP (Best Efficiency Point) if available
```

#### Results Summary Table

Using TanStack Table with Shadcn/ui styling for pump comparison matrix.

---

## 6. Hosting & Deployment

### 6.1 Platform Comparison

| Platform | Free Tier | Bandwidth | Functions | Best For |
|----------|-----------|-----------|-----------|----------|
| **Vercel** | Unlimited projects | 100GB/mo | 100K/mo | **This project** |
| Cloudflare Pages | Unlimited sites | Unlimited | 100K/day | Edge-heavy apps |
| Netlify | 1 site | 100GB/mo | 125K/mo | JAMstack |
| Render | 1 static | 100GB/mo | N/A | Full-stack |
| Railway | $5 credit | Metered | Containers | Databases |

**Vercel wins** because:
- Excellent developer experience and dashboard
- Automatic preview deployments on every PR
- Built-in analytics on free tier
- Seamless GitHub integration
- 100GB bandwidth more than covers ~300 users (~3GB/month)
- Easy upgrade path to Pro ($20/mo) if needed

### 6.2 Deployment Pipeline

Vercel automatically deploys from GitHub with zero configuration. Simply:

1. Connect your GitHub repository to Vercel
2. Vercel auto-detects Vite and configures build settings
3. Every push to `main` triggers production deployment
4. Every PR gets a preview deployment

**Optional: Custom Build Configuration**

```json
// vercel.json (only if customization needed)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Environment Variables**

Set in Vercel Dashboard → Project → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 6.3 Cost Projection (Monthly)

| Component | 300 Users | 1,000 Users | 5,000 Users |
|-----------|-----------|-------------|-------------|
| Vercel Hosting | $0 | $0 | $0 |
| Supabase Auth | $0 | $0 | $0 |
| Supabase DB | $0 | $0 | $25 |
| Domain | $1 | $1 | $1 |
| **Total** | **$1** | **$1** | **$26** |

**Bandwidth Usage Estimate:**
- Initial app load: ~500KB
- Returning user (cached): ~10KB
- 300 users × 5 visits × 500KB = ~750MB/month
- Well under Vercel's 100GB free tier

**Scaling Trigger:** If you exceed 100GB bandwidth or need team features, Vercel Pro is $20/month.

---

## 7. Authentication & User Management

### 7.1 Supabase Auth Implementation

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Auth hooks
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}
```

### 7.2 Project Storage Schema

```sql
-- Supabase PostgreSQL schema
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  design_inputs JSONB NOT NULL,
  system_layout JSONB,
  zone_tdh JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects"
  ON projects
  FOR ALL
  USING (auth.uid() = user_id);
```

### 7.3 Optional: Anonymous Usage

For users who don't want accounts, support local-only storage:

```typescript
// Store preference in localStorage
const STORAGE_MODE = 'geoflow_storage_mode'; // 'cloud' | 'local'

function saveProject(project: Project) {
  const mode = localStorage.getItem(STORAGE_MODE) || 'local';
  
  if (mode === 'cloud' && supabase.auth.getUser()) {
    return saveToSupabase(project);
  } else {
    return saveToIndexedDB(project);
  }
}
```

---

## 8. PDF Report Generation

### 8.1 Report Structure

```typescript
// components/PDFReport.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  section: { marginBottom: 15 },
  table: { display: 'flex', flexDirection: 'column' },
  row: { flexDirection: 'row', borderBottom: '1px solid #ccc' },
  cell: { flex: 1, padding: 5, fontSize: 10 },
});

interface ReportProps {
  project: Project;
  results: CalculationResults;
}

export function SDIDesignReport({ project, results }: ReportProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Cover Page */}
        <View style={styles.header}>
          <Text>Subsurface Drip Irrigation Design Report</Text>
          <Text>{project.name}</Text>
        </View>
        
        {/* Design Inputs Summary */}
        <DesignInputsSection inputs={project.designInputs} />
        
        {/* System Layout */}
        <SystemLayoutSection layout={project.systemLayout} />
        
        {/* TDH Calculations */}
        <TDHSection tdh={project.zoneTDH} />
        
        {/* Pump Recommendations */}
        <PumpRecommendationsSection pumps={results.pumps} />
        
        {/* Footer with Geoflow branding */}
        <Footer />
      </Page>
    </Document>
  );
}
```

### 8.2 Chart Rendering for PDF

Charts must be rendered as static SVG for PDF compatibility:

```typescript
import { renderToStaticMarkup } from 'react-dom/server';
import { Svg, G, Path } from '@react-pdf/renderer';

// Convert Visx chart to PDF-compatible SVG
function PumpCurveForPDF({ curve }: { curve: PumpCurvePoint[] }) {
  // Generate path data from curve points
  const pathData = generatePathData(curve);
  
  return (
    <Svg width={400} height={200} viewBox="0 0 400 200">
      <Path d={pathData} stroke="#2563eb" fill="none" strokeWidth={2} />
      {/* Axes, labels, etc. */}
    </Svg>
  );
}
```

---

## 9. Implementation Roadmap

### Phase 1: Core Calculator (4-6 weeks)

| Week | Deliverables |
|------|--------------|
| 1-2 | Project setup: Vite, React, TypeScript, Shadcn/ui, Zustand |
| 2-3 | Calculation engine: Hazen-Williams, velocity, elevation head |
| 3-4 | Step 1 form: Design inputs with validation |
| 4-5 | Step 2 form: System layout pipe segments |
| 5-6 | Step 3 form: Zone TDH calculations |

### Phase 2: Data & Offline (2-3 weeks)

| Week | Deliverables |
|------|--------------|
| 7 | Product catalog JSON bundles, data loading |
| 8 | PWA setup: service worker, caching strategy |
| 9 | IndexedDB persistence, offline indicators |

### Phase 3: User Features (2-3 weeks)

| Week | Deliverables |
|------|--------------|
| 10 | Supabase auth integration, project save/load |
| 11 | Results dashboard, pump selection matrix |
| 12 | PDF report generation, pump curve charts |

### Phase 4: Polish & Launch (1-2 weeks)

| Week | Deliverables |
|------|--------------|
| 13 | Testing, bug fixes, performance optimization |
| 14 | Documentation, deployment, soft launch |

**Total Timeline: 12-14 weeks**

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| iOS PWA limitations | Medium | Medium | Aggressive cache management, clear user guidance |
| Calculation precision errors | Low | High | Comprehensive test suite against Excel reference |
| Offline sync conflicts | Low | Low | Last-Write-Wins with user notification |
| Free tier changes | Medium | Medium | Architecture allows provider migration |
| Scope creep | Medium | Medium | Strict PRD adherence, phased delivery |

---

## 11. PRD & TRD Outline

### 11.1 Product Requirements Document Sections

1. **Executive Summary**
2. **Problem Statement**
3. **Target Users & Personas**
4. **User Stories & Acceptance Criteria**
5. **Functional Requirements**
   - Design Inputs Module
   - System Layout Module
   - Zone TDH Module
   - Results & Pump Selection
   - Project Management
   - PDF Reports
6. **Non-Functional Requirements**
   - Performance (load time, calculation speed)
   - Offline Capability
   - Accessibility (WCAG 2.1 AA)
   - Browser Support
7. **Calculation Accuracy Criteria**
8. **Success Metrics**
9. **Out of Scope**
10. **Timeline & Milestones**

### 11.2 Technical Requirements Document Sections

1. **System Architecture**
   - C4 Diagrams (Context, Container, Component)
   - Data Flow Diagrams
2. **Technology Stack**
3. **API Specifications** (if any)
4. **Database Schema**
5. **Calculation Documentation**
   - Formula specifications with LaTeX
   - Variable definitions and units
   - Test cases and tolerances
   - Excel cell references for traceability
6. **Security Requirements**
7. **Deployment Architecture**
8. **Monitoring & Logging**
9. **Testing Strategy**
10. **Development Standards**

---

## 12. Conclusion & Recommendation

### Feasibility: ✅ HIGH

The Geoflow SDI Design Tool conversion is **highly feasible** with:
- Proven technology stack (React, Vite, PWA)
- Minimal infrastructure costs ($0-10/month)
- Clear offline-first architecture
- AI-assisted development path

### Recommended Next Steps

1. **Approve feasibility analysis** and budget
2. **Create detailed PRD** with user stories
3. **Create TRD** with calculation specifications
4. **Set up development environment** with Claude Code
5. **Begin Phase 1** implementation

### Expected Outcomes

| Metric | Excel Tool | Web App |
|--------|------------|---------|
| Accessibility | Download required | Instant web access |
| Offline Use | Full | Full (PWA) |
| Updates | Manual download | Automatic |
| Mobile Use | Poor | Excellent |
| Collaboration | Email files | Cloud sync |
| Analytics | None | Usage insights |
| Maintenance | Excel expertise | Standard web dev |

---

## Appendix A: Reference Links

- [Vite PWA Plugin Documentation](https://vite-pwa-org.netlify.app/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel + Vite Guide](https://vercel.com/docs/frameworks/vite)
- [React Hook Form](https://react-hook-form.com/)
- [decimal.js Documentation](https://mikemcl.github.io/decimal.js/)
- [Dexie.js Documentation](https://dexie.org/)

---

## Appendix B: Excel Formula Reference

| Excel Location | Formula | Web Function |
|----------------|---------|--------------|
| Step 1!A10 | `=A7/A8` | `calculateTotalArea()` |
| Step 1!A14 | `=A10/A13` | `calculateDriplineRequired()` |
| Step 1!A33 | `=A29*A28/A15*A18/60` | `calculateDispersalFlow()` |
| Step 3!L14 | Hazen-Williams | `calculateHazenWilliamsLoss()` |
| Step 3!A31 | `=A7+((SUM(K17:K22))*A37)` | `calculateDispersalTDH()` |
| Step 3!A33 | `=A7+((SUM(L14:L22))*A37)` | `calculateFlushingTDH()` |

---

*Document prepared for Anua/Geoflow Engineering Team*  
*Analysis conducted January 2026*
