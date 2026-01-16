# Geoflow SDI Design Tool: Smart Assistant & Product Catalog Implementation Plan

## Overview

This document provides a comprehensive implementation plan for adding two integrated features to the existing Geoflow SDI Design Tool:

1. **Geoflow Product Catalog** - Structured data layer containing all Geoflow products with specifications
2. **Smart Design Assistant** - Intelligence layer providing real-time validation, warnings, recommendations, and bill of materials generation

The assistant should read the uploaded PDF (`Geoflow_Sales_Quick_Reference_Guide_Sept_07.pdf`) to extract accurate product data for the catalog.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  /src/data/geoflow-catalog.ts                                   │
│  • Drip tubes, headworks, zone boxes, control panels            │
│  • Valves, regulators, fittings, flow meters                    │
│  • Stock status, specs, compatibility info                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INTELLIGENCE LAYER                            │
│  /src/assistant/                                                │
│  • Validation engine (rules-based checks)                       │
│  • Recommendation engine (component selection)                  │
│  • BOM generator                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI LAYER                                   │
│  • Enhanced Step 1 (product selection)                          │
│  • Assistant panel (all steps)                                  │
│  • New Step 5 (system configuration + BOM)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Geoflow Product Catalog

### 1.1 Create Type Definitions

**File:** `/src/types/geoflow-products.ts`

```typescript
// Stock status from the PDF
export type StockStatus = 'in-stock' | 'on-demand' | 'discontinued' | 'to-be-discontinued' | 'low-stock';

// Drip Tubing
export interface DripTube {
  sku: string;
  previousPartNumber?: string;
  name: string;
  series: 'Classic' | 'PC' | 'ECO' | 'Blank';
  description: string;
  pressureCompensating: boolean;
  emitterSpacingInches: number | null;  // null for blank tubing
  nominalFlowGPH: number | null;        // null for blank tubing
  tubeOD_mm: number;
  features: string[];                    // ['Geoshield', 'Rootguard']
  stockStatus: StockStatus;
  moqFeet: number;
  weightLbs: number;
  fittingCompatibility: '600-series' | '700-series';
}

// Headworks Assemblies
export interface Headworks {
  sku: string;
  previousPartNumber?: string;
  name: string;
  description: string;
  filterType: 'Vortex' | 'BioDisc';
  filterSize: number;                    // inches
  maxFlowGPM: number;
  flushType: 'auto' | 'manual';
  enclosure: 'HDPE basin' | 'box' | 'guts-only' | 'none';
  enclosureDimensions?: string;
  zoneValveSize?: number;
  zoneValveType?: 'auto' | 'manual';
  stockStatus: StockStatus;
  recommendedReplacement?: string;       // SKU of replacement if discontinued
  weightLbs?: number;
}

// Zone Boxes
export interface ZoneBox {
  sku: string;
  previousPartNumber?: string;
  name: string;
  description: string;
  zones: number;
  solenoidSize: number;                  // inches
  enclosureDimensions: string;
  minFlowGPM: number;
  maxFlowGPM: number;
  stockStatus: StockStatus;
  weightLbs: number;
}

// Control Panels
export interface ControlPanel {
  sku: string;
  previousPartNumber?: string;
  name: string;
  description: string;
  zones: number;
  voltage: string;
  pumpConfig: 'simplex' | 'duplex' | 'dual-duplex' | 'double-duplex';
  phase: number;
  maxHP: number;
  flushType: 'auto' | 'manual';
  features: string[];
  stockStatus: StockStatus;
  recommendedReplacement?: string;
  weightLbs: number;
}

// Hydrotek Indexing Valves
export interface HydrotekValve {
  sku: string;
  previousPartNumber?: string;
  name: string;
  description: string;
  zones: number;
  inletSize: number;                     // inches
  outletSize: number;                    // inches
  minPressure: number;                   // PSI
  maxPressure: number;                   // PSI
  minFlowGPM: number;
  stockStatus: StockStatus;
  weightLbs: number;
}

// Pre-assembled Diverter Valves
export interface DiverterValve {
  sku: string;
  name: string;
  description: string;
  zones: number;
  minPressure: number;
  maxPressure: number;
  minFlowGPM: number;
  maxFlowGPM: number;
  enclosure: string;
  lowFlow: boolean;                      // white stem variants
  stockStatus: StockStatus;
}

// Pressure Regulators
export interface PressureRegulator {
  sku: string;
  previousPartNumber?: string;
  name: string;
  setPressure: number;                   // PSI
  minFlowGPM: number;
  maxFlowGPM: number;
  connectionSize: number;                // inches
  connectionType: 'FIPT';
  stockStatus: StockStatus;
  weightLbs: number;
}

// Flow Meters
export interface FlowMeter {
  sku: string;
  previousPartNumber?: string;
  name: string;
  type: 'MultiJet' | 'Digital' | 'Electromagnetic';
  connectionSize: number;                // inches
  minFlowGPM: number;
  maxFlowGPM: number;
  maxPressure?: number;
  accuracy?: string;
  features: string[];
  stockStatus: StockStatus;
  weightLbs: number;
}

// Filters (standalone)
export interface Filter {
  sku: string;
  previousPartNumber?: string;
  name: string;
  type: 'BioDisc' | 'Vortex' | 'SimTech';
  size: number;                          // inches
  maxFlowGPM?: number;
  meshSize?: number;
  stockStatus: StockStatus;
  weightLbs?: number;
}

// Solenoid Valves
export interface SolenoidValve {
  sku: string;
  previousPartNumber?: string;
  name: string;
  size: number;                          // inches
  voltage: string;
  connectionType: 'FPT' | 'Slip';
  normalState: 'NC' | 'NO';              // Normally Closed or Open
  externalPlumbing: boolean;
  stockStatus: StockStatus;
  weightLbs?: number;
}

// Air Vents
export interface AirVent {
  sku: string;
  previousPartNumber?: string;
  name: string;
  size: number;                          // inches
  type: 'kinetic' | 'continuous';
  connectionType: 'MPT';
  ventStyle?: 'mushroom' | 'elbow';
  stockStatus: StockStatus;
  recommendedReplacement?: string;
  weightLbs?: number;
}

// Fittings
export interface Fitting {
  sku: string;
  previousPartNumber?: string;
  name: string;
  series: '600-series' | '700-series';
  type: 'socket' | 'coupling' | 'tee' | 'elbow' | 'male-adapter';
  compatibleWith: string;                // 'WaterflowPRO' | 'WaterflowECO'
  packageQuantity: number;
  stockStatus: StockStatus;
  weightLbs?: number;
}

// Saddle Tees
export interface SaddleTee {
  sku: string;
  previousPartNumber?: string;
  name: string;
  pipeSize: number;                      // inches
  color: string;
  outletSize: string;
  packageQuantity: number;
  stockStatus: StockStatus;
  weightLbs: number;
}

// Check Valves
export interface CheckValve {
  sku: string;
  previousPartNumber?: string;
  name: string;
  size: number;                          // inches
  type: 'ball' | 'spring';
  material: string;
  connectionType: string;
  openingPressure?: number;              // PSI for spring type
  stockStatus: StockStatus;
  weightLbs: number;
}
```

### 1.2 Create Product Catalog Data

**File:** `/src/data/geoflow-catalog.ts`

Extract data from the PDF and populate arrays for each product type. The assistant should read the PDF carefully and extract all products with their exact specifications.

```typescript
import {
  DripTube,
  Headworks,
  ZoneBox,
  ControlPanel,
  HydrotekValve,
  DiverterValve,
  PressureRegulator,
  FlowMeter,
  Filter,
  SolenoidValve,
  AirVent,
  Fitting,
  SaddleTee,
  CheckValve,
} from '@/types/geoflow-products';

// ============================================
// DRIP TUBING
// Extract from PDF Page 1
// ============================================

export const dripTubes: DripTube[] = [
  // WaterflowPRO® Classic
  {
    sku: 'G-WFCL-16-4-24',
    previousPartNumber: 'WFCL-16-4-24',
    name: 'WaterflowPRO® Classic 24"',
    series: 'Classic',
    description: 'Classic drip tubing, 24" cylindrical emitter spacing, ~1.0 gph, O.D. 16mm, Geoshield and Rootguard',
    pressureCompensating: false,
    emitterSpacingInches: 24,
    nominalFlowGPH: 1.0,
    tubeOD_mm: 16,
    features: ['Geoshield', 'Rootguard'],
    stockStatus: 'in-stock',
    moqFeet: 500,
    weightLbs: 20.0,
    fittingCompatibility: '600-series',
  },
  {
    sku: 'G-WFCL-16-4-12',
    previousPartNumber: 'WFCL-16-4-12',
    name: 'WaterflowPRO® Classic 12"',
    series: 'Classic',
    description: 'Classic drip tubing, 12" cylindrical emitter spacing, ~1.0 gph, O.D. 16mm, Geoshield and Rootguard',
    pressureCompensating: false,
    emitterSpacingInches: 12,
    nominalFlowGPH: 1.0,
    tubeOD_mm: 16,
    features: ['Geoshield', 'Rootguard'],
    stockStatus: 'on-demand',
    moqFeet: 500,
    weightLbs: 22.0,
    fittingCompatibility: '600-series',
  },
  // WaterflowPRO® PC
  {
    sku: 'G-WFPC-16-2-24',
    previousPartNumber: 'WFPC-16-2-24',
    name: 'WaterflowPRO® PC 24" ~0.6 gph',
    series: 'PC',
    description: 'PC drip tubing, 24" cylindrical emitter spacing, ~0.6 gph, O.D. 16mm, Geoshield and Rootguard',
    pressureCompensating: true,
    emitterSpacingInches: 24,
    nominalFlowGPH: 0.6,
    tubeOD_mm: 16,
    features: ['Geoshield', 'Rootguard'],
    stockStatus: 'in-stock',
    moqFeet: 500,
    weightLbs: 20.0,
    fittingCompatibility: '600-series',
  },
  {
    sku: 'G-WFPC-16-2-12',
    previousPartNumber: 'WFPC-16-2-12',
    name: 'WaterflowPRO® PC 12" ~0.6 gph',
    series: 'PC',
    description: 'PC drip tubing, 12" cylindrical emitter spacing, ~0.6 gph, O.D. 16mm, Geoshield and Rootguard',
    pressureCompensating: true,
    emitterSpacingInches: 12,
    nominalFlowGPH: 0.6,
    tubeOD_mm: 16,
    features: ['Geoshield', 'Rootguard'],
    stockStatus: 'in-stock',
    moqFeet: 500,
    weightLbs: 21.0,
    fittingCompatibility: '600-series',
  },
  {
    sku: 'G-WFPC-16-4-24',
    previousPartNumber: 'WFPC-16-4-24',
    name: 'WaterflowPRO® PC 24" ~0.9 gph',
    series: 'PC',
    description: 'PC drip tubing, 24" cylindrical emitter spacing, ~0.9 gph, O.D. 16mm, Geoshield and Rootguard',
    pressureCompensating: true,
    emitterSpacingInches: 24,
    nominalFlowGPH: 0.9,
    tubeOD_mm: 16,
    features: ['Geoshield', 'Rootguard'],
    stockStatus: 'in-stock',
    moqFeet: 500,
    weightLbs: 20.0,
    fittingCompatibility: '600-series',
  },
  {
    sku: 'G-WFPC-16-4-12',
    previousPartNumber: 'WFPC-16-4-12',
    name: 'WaterflowPRO® PC 12" ~0.9 gph',
    series: 'PC',
    description: 'PC drip tubing, 12" cylindrical emitter spacing, ~0.9 gph, O.D. 16mm, Geoshield and Rootguard',
    pressureCompensating: true,
    emitterSpacingInches: 12,
    nominalFlowGPH: 0.9,
    tubeOD_mm: 16,
    features: ['Geoshield', 'Rootguard'],
    stockStatus: 'in-stock',
    moqFeet: 500,
    weightLbs: 21.0,
    fittingCompatibility: '600-series',
  },
  // WaterflowPRO® Blank
  {
    sku: 'G-WF-PLAIN',
    previousPartNumber: 'WFPLAIN',
    name: 'WaterflowPRO® Blank Tubing',
    series: 'Blank',
    description: 'Blank tubing, O.D. 16mm, GeoShield, 100ft',
    pressureCompensating: false,
    emitterSpacingInches: null,
    nominalFlowGPH: null,
    tubeOD_mm: 16,
    features: ['Geoshield'],
    stockStatus: 'in-stock',
    moqFeet: 100,
    weightLbs: 4.0,
    fittingCompatibility: '600-series',
  },
  // WaterflowECO® PC
  {
    sku: 'G-WFPC-17-1.6-24-ECO',
    name: 'WaterflowECO® PC 24" ~0.4 gph',
    series: 'ECO',
    description: 'Drip tubing PC 24" flat emitter spacing, ~0.4 gph, O.D. 17mm, Geoshield',
    pressureCompensating: true,
    emitterSpacingInches: 24,
    nominalFlowGPH: 0.4,
    tubeOD_mm: 17,
    features: ['Geoshield'],
    stockStatus: 'on-demand',
    moqFeet: 500,
    weightLbs: 20.0,
    fittingCompatibility: '700-series',
  },
  {
    sku: 'G-WFPC-17-2-24-ECO',
    name: 'WaterflowECO® PC 24" ~0.6 gph',
    series: 'ECO',
    description: 'Drip tubing PC 24" flat emitter spacing, ~0.6 gph, O.D. 17mm, Geoshield',
    pressureCompensating: true,
    emitterSpacingInches: 24,
    nominalFlowGPH: 0.6,
    tubeOD_mm: 17,
    features: ['Geoshield'],
    stockStatus: 'in-stock',
    moqFeet: 500,
    weightLbs: 20.0,
    fittingCompatibility: '700-series',
  },
  {
    sku: 'G-WFPC-17-4-24-ECO',
    name: 'WaterflowECO® PC 24" ~1.0 gph',
    series: 'ECO',
    description: 'Drip tubing PC 24" flat emitter spacing, ~1.0 gph, O.D. 17mm, Geoshield',
    pressureCompensating: true,
    emitterSpacingInches: 24,
    nominalFlowGPH: 1.0,
    tubeOD_mm: 17,
    features: ['Geoshield'],
    stockStatus: 'on-demand',
    moqFeet: 500,
    weightLbs: 20.0,
    fittingCompatibility: '700-series',
  },
];

// ============================================
// HEADWORKS ASSEMBLIES
// Extract from PDF Pages 2-3
// Continue extracting ALL headworks...
// ============================================

export const headworks: Headworks[] = [
  // Extract all headworks from the PDF
  // Include: DripFilterECO® Vortex, BioDisc, HDPE Basin variants
  // Note stock status, recommended replacements for discontinued items
];

// ============================================
// ZONE BOXES
// Extract from PDF Page 3
// ============================================

export const zoneBoxes: ZoneBox[] = [
  {
    sku: 'G-WHZONE-100-2',
    previousPartNumber: 'WHZONE-100-2',
    name: '2 Zone Assembly - 1" solenoids',
    description: '2 Zone Assembly, 1" solenoids, 13x24x15, 5 to 25 gpm',
    zones: 2,
    solenoidSize: 1,
    enclosureDimensions: '13x24x15',
    minFlowGPM: 5,
    maxFlowGPM: 25,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-100-3',
    previousPartNumber: 'WHZONE-100-3',
    name: '3 Zone Assembly - 1" solenoids',
    description: '3 Zone Assembly, 1" solenoids, 13x24x15, 5 to 25 gpm',
    zones: 3,
    solenoidSize: 1,
    enclosureDimensions: '13x24x15',
    minFlowGPM: 5,
    maxFlowGPM: 25,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-100-4',
    previousPartNumber: 'WHZONE-100-4',
    name: '4 Zone Assembly - 1" solenoids',
    description: '4 Zone Assembly, 1" solenoids, 13x24x15, 5 to 25 gpm',
    zones: 4,
    solenoidSize: 1,
    enclosureDimensions: '13x24x15',
    minFlowGPM: 5,
    maxFlowGPM: 25,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-150-2',
    previousPartNumber: 'WHZONE-150-2',
    name: '2 Zone Assembly - 1.5" solenoids',
    description: '2 Zone Assembly, 1.5" solenoids, 17x30x15, 25 to 90 gpm',
    zones: 2,
    solenoidSize: 1.5,
    enclosureDimensions: '17x30x15',
    minFlowGPM: 25,
    maxFlowGPM: 90,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-150-3',
    previousPartNumber: 'WHZONE-150-3',
    name: '3 Zone Assembly - 1.5" solenoids',
    description: '3 Zone Assembly, 1.5" solenoids, 17x30x15, 25 to 90 gpm',
    zones: 3,
    solenoidSize: 1.5,
    enclosureDimensions: '17x30x15',
    minFlowGPM: 25,
    maxFlowGPM: 90,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-150-4',
    previousPartNumber: 'WHZONE-150-4',
    name: '4 Zone Assembly - 1.5" solenoids',
    description: '4 Zone Assembly, 1.5" solenoids, 17x30x15, 25 to 90 gpm',
    zones: 4,
    solenoidSize: 1.5,
    enclosureDimensions: '17x30x15',
    minFlowGPM: 25,
    maxFlowGPM: 90,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-200-2',
    previousPartNumber: 'WHZONE-200-2',
    name: '2 Zone Assembly - 2" solenoids',
    description: '2 Zone Assembly, 2" solenoids, 17x30x15, 25 to 90 gpm',
    zones: 2,
    solenoidSize: 2,
    enclosureDimensions: '17x30x15',
    minFlowGPM: 25,
    maxFlowGPM: 90,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-200-3',
    previousPartNumber: 'WHZONE-200-3',
    name: '3 Zone Assembly - 2" solenoids',
    description: '3 Zone Assembly, 2" solenoids, 17x30x15, 25 to 90 gpm',
    zones: 3,
    solenoidSize: 2,
    enclosureDimensions: '17x30x15',
    minFlowGPM: 25,
    maxFlowGPM: 90,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
  {
    sku: 'G-WHZONE-200-4',
    previousPartNumber: 'WHZONE-200-4',
    name: '4 Zone Assembly - 2" solenoids',
    description: '4 Zone Assembly, 2" solenoids, 17x30x15, 25 to 90 gpm',
    zones: 4,
    solenoidSize: 2,
    enclosureDimensions: '17x30x15',
    minFlowGPM: 25,
    maxFlowGPM: 90,
    stockStatus: 'on-demand',
    weightLbs: 46,
  },
];

// ============================================
// CONTROL PANELS
// Extract from PDF Page 4
// ============================================

export const controlPanels: ControlPanel[] = [
  {
    sku: 'G-GEO1-SIM-AUT-B',
    previousPartNumber: 'GEO1-SIM-AUT',
    name: '1 Zone Simplex Auto',
    description: '1 zone, 115/230VAC, simplex, 1P, 2HP max, auto filter/field',
    zones: 1,
    voltage: '115/230VAC',
    pumpConfig: 'simplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: [],
    stockStatus: 'in-stock',
    weightLbs: 18,
  },
  {
    sku: 'G-GEO1-SIM-MAN-B',
    previousPartNumber: 'GEO1-SIM-MAN',
    name: '1 Zone Simplex Manual',
    description: '1 zone, 115/230VAC, simplex, 1P, 2HP max, manual filter/field',
    zones: 1,
    voltage: '115/230VAC',
    pumpConfig: 'simplex',
    phase: 1,
    maxHP: 2,
    flushType: 'manual',
    features: [],
    stockStatus: 'in-stock',
    weightLbs: 16,
  },
  {
    sku: 'G-GEO1-DUP-AUT-B',
    previousPartNumber: 'GEO1-DUP-AUT',
    name: '1 Zone Duplex Auto',
    description: '1 zone, 115/230VAC, duplex, 1P, 2HP max, auto filter/field',
    zones: 1,
    voltage: '115/230VAC',
    pumpConfig: 'duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: [],
    stockStatus: 'in-stock',
    weightLbs: 18,
  },
  {
    sku: 'G-GEO1-DUP-MAN-B',
    previousPartNumber: 'GEO1-DUP-MAN',
    name: '1 Zone Duplex Manual',
    description: '1 zone, 115/230VAC, duplex, 1P, 2HP max, manual filter/field',
    zones: 1,
    voltage: '115/230VAC',
    pumpConfig: 'duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'manual',
    features: [],
    stockStatus: 'in-stock',
    weightLbs: 18,
  },
  {
    sku: 'G-GEO4-SIM-AUT-B',
    previousPartNumber: 'GEO4-SIM-AUT',
    name: '1-4 Zone Simplex Auto',
    description: '1 to 4 zone individual run time, 115/230VAC, simplex, 1P, 2HP max, auto filter/field',
    zones: 4,
    voltage: '115/230VAC',
    pumpConfig: 'simplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'in-stock',
    weightLbs: 18,
  },
  {
    sku: 'G-GEO4-DUP-AUT-B',
    previousPartNumber: 'GEO4-DUP-AUT',
    name: '1-4 Zone Duplex Auto',
    description: '1 to 4 zone individual run time, 115/230VAC, duplex, 1P, 2HP max, auto filter/field',
    zones: 4,
    voltage: '115/230VAC',
    pumpConfig: 'duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'in-stock',
    weightLbs: 23,
  },
  {
    sku: 'G-GEO8-SIM-AUT-B',
    previousPartNumber: 'GEO8-SIM-AUT',
    name: '1-8 Zone Simplex Auto',
    description: '1 to 8 zone individual run time, 115/230VAC, simplex, 1P, 2HP max, auto filter/field',
    zones: 8,
    voltage: '115/230VAC',
    pumpConfig: 'simplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'in-stock',
    weightLbs: 30,
  },
  {
    sku: 'G-GEO8-DUP-AUT-B',
    previousPartNumber: 'GEO8-DUP-AUT',
    name: '1-8 Zone Duplex Auto',
    description: '1 to 8 zone individual run time, 115/230VAC, duplex, 1P, 2HP max, auto filter/field',
    zones: 8,
    voltage: '115/230VAC',
    pumpConfig: 'duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'in-stock',
    weightLbs: 30,
  },
  {
    sku: 'G-GEO12-DUP-DUAL-AUT',
    name: '12 Zone Dual Duplex Auto',
    description: '12 zone individual run time, 115/230VAC, dual duplex, 1P, 1HP to 2HP max, auto',
    zones: 12,
    voltage: '115/230VAC',
    pumpConfig: 'dual-duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'on-demand',
    weightLbs: 30,
  },
  {
    sku: 'G-GEO12-DUP-DOUBLE-AUT',
    name: '12 Zone Double Duplex Auto',
    description: '12 zone individual run time, 115/230VAC, double duplex (2 on/2 off), 1P, 1HP to 2HP max, auto',
    zones: 12,
    voltage: '115/230VAC',
    pumpConfig: 'double-duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'on-demand',
    weightLbs: 30,
  },
  {
    sku: 'G-GEO12-DUP-AUT',
    name: '12 Zone Duplex Auto',
    description: '12 zone individual run time, 115/230VAC, duplex, 1P, 1HP to 2HP max, auto',
    zones: 12,
    voltage: '115/230VAC',
    pumpConfig: 'duplex',
    phase: 1,
    maxHP: 2,
    flushType: 'auto',
    features: ['individual zone run times'],
    stockStatus: 'on-demand',
    weightLbs: 30,
  },
];

// ============================================
// HYDROTEK VALVES
// Extract from PDF Page 7
// ============================================

export const hydrotekValves: HydrotekValve[] = [
  {
    sku: 'G-HT-4402',
    previousPartNumber: 'HT-4402',
    name: 'Hydrotek 2-Zone 1.25" x 1.25"',
    description: '2 zone Hydrotek valve 1.25" x 1.25", 25-75psi, min10gpm',
    zones: 2,
    inletSize: 1.25,
    outletSize: 1.25,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4403',
    previousPartNumber: 'HT-4403',
    name: 'Hydrotek 3-Zone 1.25" x 1.25"',
    description: '3 zone Hydrotek valve 1.25" x 1.25", 25-75psi, min10gpm',
    zones: 3,
    inletSize: 1.25,
    outletSize: 1.25,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4404',
    previousPartNumber: 'HT-4404',
    name: 'Hydrotek 4-Zone 1.25" x 1.25"',
    description: '4 zone Hydrotek valve 1.25" x 1.25", 25-75psi, min10gpm',
    zones: 4,
    inletSize: 1.25,
    outletSize: 1.25,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4602',
    previousPartNumber: 'HT-4602',
    name: 'Hydrotek 2-Zone 1.25" x 1"',
    description: '2 zone Hydrotek valve 1.25" x 1", 25-75psi, min10gpm',
    zones: 2,
    inletSize: 1.25,
    outletSize: 1,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4603',
    previousPartNumber: 'HT-4603',
    name: 'Hydrotek 3-Zone 1.25" x 1"',
    description: '3 zone Hydrotek valve 1.25" x 1", 25-75psi, min10gpm',
    zones: 3,
    inletSize: 1.25,
    outletSize: 1,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4604',
    previousPartNumber: 'HT-4604',
    name: 'Hydrotek 4-Zone 1.25" x 1"',
    description: '4 zone Hydrotek valve 1.25" x 1", 25-75psi, min10gpm',
    zones: 4,
    inletSize: 1.25,
    outletSize: 1,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4605',
    previousPartNumber: 'HT-4605',
    name: 'Hydrotek 5-Zone 1.25" x 1"',
    description: '5 zone Hydrotek valve 1.25" x 1", 25-75psi, min10gpm',
    zones: 5,
    inletSize: 1.25,
    outletSize: 1,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
  {
    sku: 'G-HT-4606',
    previousPartNumber: 'HT-4606',
    name: 'Hydrotek 6-Zone 1.25" x 1"',
    description: '6 zone Hydrotek valve 1.25" x 1", 25-75psi, min10gpm',
    zones: 6,
    inletSize: 1.25,
    outletSize: 1,
    minPressure: 25,
    maxPressure: 75,
    minFlowGPM: 10,
    stockStatus: 'in-stock',
    weightLbs: 1.5,
  },
];

// ============================================
// PRESSURE REGULATORS
// Extract from PDF Page 8
// ============================================

export const pressureRegulators: PressureRegulator[] = [
  // 20 PSI
  { sku: 'G-PMR20-LF', previousPartNumber: 'PMR20-LF', name: '20 PSI - Low Flow', setPressure: 20, minFlowGPM: 0.125, maxFlowGPM: 8, connectionSize: 0.75, connectionType: 'FIPT', stockStatus: 'on-demand', weightLbs: 0.3 },
  { sku: 'G-PMR20-MF', previousPartNumber: 'PMR20-MF', name: '20 PSI - Medium Flow', setPressure: 20, minFlowGPM: 2, maxFlowGPM: 20, connectionSize: 1, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.4 },
  { sku: 'G-PMR20-HF', previousPartNumber: 'PMR20-HF', name: '20 PSI - High Flow', setPressure: 20, minFlowGPM: 10, maxFlowGPM: 32, connectionSize: 1.25, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.6 },
  { sku: 'G-PMR20-UF', previousPartNumber: 'PMR20-UF', name: '20 PSI - Ultra Flow', setPressure: 20, minFlowGPM: 20, maxFlowGPM: 100, connectionSize: 2, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 2.5 },
  // 30 PSI
  { sku: 'G-PMR30-LF', previousPartNumber: 'PMR30-LF', name: '30 PSI - Low Flow', setPressure: 30, minFlowGPM: 0.125, maxFlowGPM: 8, connectionSize: 0.75, connectionType: 'FIPT', stockStatus: 'on-demand', weightLbs: 0.3 },
  { sku: 'G-PMR30-MF', previousPartNumber: 'PMR30-MF', name: '30 PSI - Medium Flow', setPressure: 30, minFlowGPM: 2, maxFlowGPM: 20, connectionSize: 1, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.4 },
  { sku: 'G-PMR30-HF', previousPartNumber: 'PMR30-HF', name: '30 PSI - High Flow', setPressure: 30, minFlowGPM: 10, maxFlowGPM: 32, connectionSize: 1.25, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.6 },
  { sku: 'G-PMR30-UF', previousPartNumber: 'PMR30-UF', name: '30 PSI - Ultra Flow', setPressure: 30, minFlowGPM: 20, maxFlowGPM: 100, connectionSize: 2, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 2.5 },
  // 40 PSI
  { sku: 'G-PMR40-LF', previousPartNumber: 'PMR40-LF', name: '40 PSI - Low Flow', setPressure: 40, minFlowGPM: 0.125, maxFlowGPM: 8, connectionSize: 0.75, connectionType: 'FIPT', stockStatus: 'on-demand', weightLbs: 0.3 },
  { sku: 'G-PMR40-MF', previousPartNumber: 'PMR40-MF', name: '40 PSI - Medium Flow', setPressure: 40, minFlowGPM: 2, maxFlowGPM: 20, connectionSize: 1, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.4 },
  { sku: 'G-PMR40-HF', previousPartNumber: 'PMR40-HF', name: '40 PSI - High Flow', setPressure: 40, minFlowGPM: 10, maxFlowGPM: 32, connectionSize: 1.25, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.6 },
  { sku: 'G-PMR40-UF', previousPartNumber: 'PMR40-UF', name: '40 PSI - Ultra Flow', setPressure: 40, minFlowGPM: 20, maxFlowGPM: 90, connectionSize: 2, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 2.5 },
  // 50 PSI
  { sku: 'G-PMR50-MF', previousPartNumber: 'PMR50-MF', name: '50 PSI - Medium Flow', setPressure: 50, minFlowGPM: 2, maxFlowGPM: 20, connectionSize: 1, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.4 },
  { sku: 'G-PMR50-HF', previousPartNumber: 'PMR50-HF', name: '50 PSI - High Flow', setPressure: 50, minFlowGPM: 10, maxFlowGPM: 32, connectionSize: 1.25, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 0.6 },
  { sku: 'G-PMR50-UF', previousPartNumber: 'PMR50-UF', name: '50 PSI - Ultra Flow', setPressure: 50, minFlowGPM: 20, maxFlowGPM: 90, connectionSize: 2, connectionType: 'FIPT', stockStatus: 'in-stock', weightLbs: 2.5 },
];

// ============================================
// Continue extracting remaining products...
// - Flow Meters (Page 5)
// - Filters (Pages 5-6)
// - Solenoid Valves (Page 7)
// - Air Vents (Page 7)
// - Diverter Valves (Page 8)
// - Check Valves (Page 8)
// - Fittings (Page 9)
// - Saddle Tees (Page 9)
// - Accessories (Page 10)
// ============================================
```

### 1.3 Create Catalog Lookup Functions

**File:** `/src/data/catalog-utils.ts`

```typescript
import {
  dripTubes,
  headworks,
  zoneBoxes,
  controlPanels,
  hydrotekValves,
  pressureRegulators,
  // ... import other catalogs
} from './geoflow-catalog';

// Generic lookup by SKU
export function getProductBySku<T extends { sku: string }>(
  catalog: T[],
  sku: string
): T | undefined {
  return catalog.find((item) => item.sku === sku);
}

// Specific lookups
export const getDripTube = (sku: string) => getProductBySku(dripTubes, sku);
export const getHeadworks = (sku: string) => getProductBySku(headworks, sku);
export const getZoneBox = (sku: string) => getProductBySku(zoneBoxes, sku);
export const getControlPanel = (sku: string) => getProductBySku(controlPanels, sku);
export const getHydrotekValve = (sku: string) => getProductBySku(hydrotekValves, sku);
export const getPressureRegulator = (sku: string) => getProductBySku(pressureRegulators, sku);

// Filter functions for recommendations
export function getInStockDripTubes() {
  return dripTubes.filter((t) => t.stockStatus === 'in-stock');
}

export function getHeadworksForFlow(maxFlowGPM: number) {
  return headworks
    .filter((hw) => hw.maxFlowGPM >= maxFlowGPM && hw.stockStatus !== 'discontinued')
    .sort((a, b) => a.maxFlowGPM - b.maxFlowGPM);
}

export function getZoneBoxesForZoneCount(zones: number) {
  return zoneBoxes
    .filter((zb) => zb.zones >= zones && zb.stockStatus !== 'discontinued')
    .sort((a, b) => a.zones - b.zones);
}

export function getControlPanelsForRequirements(zones: number, pumpHP: number) {
  return controlPanels
    .filter((cp) => cp.zones >= zones && cp.maxHP >= pumpHP && cp.stockStatus !== 'discontinued')
    .sort((a, b) => {
      if (a.stockStatus === 'in-stock' && b.stockStatus !== 'in-stock') return -1;
      if (b.stockStatus === 'in-stock' && a.stockStatus !== 'in-stock') return 1;
      return a.zones - b.zones;
    });
}

export function getHydrotekValvesForZones(zones: number) {
  return hydrotekValves
    .filter((v) => v.zones >= zones && v.stockStatus !== 'discontinued')
    .sort((a, b) => a.zones - b.zones);
}

export function getPressureRegulatorsForPressure(targetPSI: number, flowGPM: number) {
  const availablePressures = [20, 30, 40, 50];
  const closestPressure = availablePressures.reduce((prev, curr) =>
    Math.abs(curr - targetPSI) < Math.abs(prev - targetPSI) ? curr : prev
  );
  return pressureRegulators.filter(
    (pr) => pr.setPressure === closestPressure && flowGPM >= pr.minFlowGPM && flowGPM <= pr.maxFlowGPM
  );
}

export function getFittingsForTube(tubeSku: string) {
  const tube = getDripTube(tubeSku);
  if (!tube) return [];
  // Return fittings matching the tube's compatibility
  // 600-series for WaterflowPRO, 700-series for WaterflowECO
  return []; // Implement based on fittings catalog
}
```

---

## Part 2: Smart Design Assistant

### 2.1 Assistant Types

**File:** `/src/types/assistant.ts`

```typescript
export type FeedbackSeverity = 'error' | 'warning' | 'suggestion' | 'info';

export type FeedbackCategory =
  | 'hydraulic'
  | 'product-compatibility'
  | 'product-availability'
  | 'sizing'
  | 'application'
  | 'optimization';

export interface DesignFeedback {
  id: string;
  severity: FeedbackSeverity;
  category: FeedbackCategory;
  title: string;
  message: string;
  field?: string;
  currentValue?: string | number;
  recommendedValue?: string | number;
  source?: string;
  actionable?: boolean;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  appliesTo: number[];  // Which steps [1, 2, 3, 4, 5]
  condition: (state: DesignState) => boolean;
  message: (state: DesignState) => string;
  source?: (state: DesignState) => string;
}

export interface ComponentRecommendation {
  sku: string;
  name: string;
  reason: string;
  isTopChoice: boolean;
  warnings?: string[];
  stockStatus: StockStatus;
}

export interface SystemRecommendations {
  headworks: ComponentRecommendation[];
  zoneControl: {
    hydrotek?: ComponentRecommendation[];
    zoneBoxes?: ComponentRecommendation[];
  };
  controlPanels: ComponentRecommendation[];
  pressureRegulators: ComponentRecommendation[];
  flowMeters: ComponentRecommendation[];
  fittings: ComponentRecommendation[];
  warnings: string[];
}
```

### 2.2 Validation Rules

Create validation rules in `/src/assistant/rules/` directory:

**Key Rule Categories:**

#### Hydraulic Rules (`hydraulic-rules.ts`)
- Mainline velocity > 5.0 ft/s → ERROR
- Flush velocity < 1.0 ft/s (wastewater) → WARNING
- Flush velocity > 2.5 ft/s → WARNING

#### Product Compatibility Rules (`product-compatibility-rules.ts`)
- ECO tube + wastewater application → WARNING (no Rootguard)
- Hydrotek pressure > 75 PSI → ERROR
- Hydrotek pressure < 25 PSI → ERROR
- Hydrotek flow < 10 GPM → WARNING
- Zone box flow > max rating → ERROR
- Zone box flow < min rating → WARNING
- Control panel HP < pump HP → ERROR
- Control panel zones < design zones → ERROR
- Fitting series ≠ tube compatibility → ERROR

#### Product Availability Rules (`product-availability-rules.ts`)
- Discontinued product selected → WARNING
- On-demand products → INFO (lead time)

#### Sizing Rules (`sizing-rules.ts`)
- Headworks capacity < zone flow → ERROR

#### Application Rules (`application-rules.ts`)
- Non-PC emitters + elevation > 10 ft → WARNING

### 2.3 Validation Engine

**File:** `/src/assistant/validation-engine.ts`

```typescript
import { DesignState } from '@/types/design';
import { DesignFeedback } from '@/types/assistant';
import { allValidationRules, getRulesForStep } from './rules';

export function validateDesign(state: DesignState, step?: number): DesignFeedback[] {
  const rules = step ? getRulesForStep(step) : allValidationRules;
  const feedback: DesignFeedback[] = [];

  for (const rule of rules) {
    try {
      if (rule.condition(state)) {
        feedback.push({
          id: rule.id,
          severity: rule.severity,
          category: rule.category,
          title: rule.name,
          message: rule.message(state),
          source: rule.source?.(state),
        });
      }
    } catch (error) {
      // Rule couldn't be evaluated, skip
    }
  }

  // Sort by severity: error > warning > suggestion > info
  const severityOrder = { error: 0, warning: 1, suggestion: 2, info: 3 };
  return feedback.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function hasErrors(feedback: DesignFeedback[]): boolean {
  return feedback.some((f) => f.severity === 'error');
}
```

### 2.4 Recommendation Engine

**File:** `/src/assistant/recommendation-engine.ts`

Implement `generateRecommendations(state: DesignState): SystemRecommendations`

This function should:
1. Calculate flow per zone from design state
2. Find compatible headworks based on flow
3. Find Hydrotek valves if zones ≤ 6 and pressure within 25-75 PSI
4. Find compatible zone boxes based on zone count and flow
5. Find control panels matching zones and pump HP
6. Find pressure regulators closest to target pressure
7. Auto-select fittings based on tube compatibility (600 vs 700 series)
8. Collect warnings for any constraints not met

### 2.5 Bill of Materials Generator

**File:** `/src/assistant/bom-generator.ts`

Implement `generateBOM(state: DesignState): BillOfMaterials`

The BOM should include:
- Drip tubing (calculate coils needed from total length)
- Blank tubing for headers
- Headworks assembly
- Zone control (Hydrotek OR zone box)
- Control panel (if using solenoid valves)
- Pressure regulators (quantity = number of zones)
- Flow meter
- Fittings (calculate quantities based on laterals)
- Saddle tees
- Air vents (1 per zone)
- Valve boxes for air vents
- Check valve

Calculate totals: weight, line item count, in-stock vs on-demand counts.

---

## Part 3: UI Components

### 3.1 Assistant Panel

**File:** `/src/components/assistant/AssistantPanel.tsx`

- Shows real-time feedback based on current step
- Groups by severity (errors first, then warnings, then info)
- Shows "Looking good" state when no issues
- Each feedback item shows title, message, and source

### 3.2 Product Selectors

**File:** `/src/components/product-selector/DripTubeSelector.tsx`

- Dropdown grouped by series (PC, Classic, ECO)
- Shows stock status badge
- Shows selected tube details (spacing, flow, features)

**File:** `/src/components/product-selector/StockBadge.tsx`

- Color-coded badges for stock status
- Green: In Stock
- Yellow: On Demand
- Orange: Low Stock / Being Phased Out
- Red: Discontinued

### 3.3 Step 5: System Configuration

**File:** `/src/components/steps/SystemConfiguration.tsx`

New wizard step containing:
1. Design summary (flow, zones, pressure)
2. Headworks selection with recommendations
3. Zone control selection (Hydrotek vs Solenoid options)
4. Control panel selection (if using solenoids)
5. Pressure regulator selection
6. Flow meter selection
7. Auto-populated fittings
8. Real-time validation in assistant panel
9. Generate BOM button

### 3.4 Bill of Materials View

**File:** `/src/components/bom/BillOfMaterialsView.tsx`

- Table grouped by category
- Columns: SKU, Description, Qty, Unit, Stock Status, Weight
- Highlight on-demand items with lead time note
- Summary section with totals
- Export buttons: PDF, CSV, Email Quote Request

---

## Part 4: Implementation Order

### Phase 1: Data Layer (Week 1)
1. ☐ Create type definitions
2. ☐ Extract ALL products from PDF into catalog
3. ☐ Create catalog utility functions
4. ☐ Test data accuracy

### Phase 2: Validation Rules (Week 1-2)
1. ☐ Create assistant types
2. ☐ Implement hydraulic rules
3. ☐ Implement product compatibility rules
4. ☐ Implement availability rules
5. ☐ Create validation engine

### Phase 3: Step 1 Enhancement (Week 2)
1. ☐ Create DripTubeSelector
2. ☐ Create StockBadge
3. ☐ Add Assistant Panel to Step 1
4. ☐ Integrate into existing form

### Phase 4: Assistant Panel (Week 2-3)
1. ☐ Create AssistantPanel component
2. ☐ Add to all wizard steps
3. ☐ Make contextual per step

### Phase 5: Recommendation Engine (Week 3)
1. ☐ Implement generateRecommendations()
2. ☐ Test against various scenarios

### Phase 6: Step 5 - System Configuration (Week 3-4)
1. ☐ Create new wizard step
2. ☐ Implement component selection UI
3. ☐ Connect to recommendation engine
4. ☐ Add real-time validation

### Phase 7: BOM Generator (Week 4)
1. ☐ Implement generateBOM()
2. ☐ Create BOM display component
3. ☐ Add export functionality

### Phase 8: Testing & Polish (Week 4-5)
1. ☐ Test all validation rules
2. ☐ Verify BOM accuracy
3. ☐ User acceptance testing

---

## Key Implementation Notes

### Critical Data Points from PDF

1. **Hydrotek Valve Constraints**
   - Pressure range: 25-75 PSI (HARD LIMITS)
   - Minimum flow: 10 GPM
   - Max zones: 6

2. **Zone Box Flow Ranges**
   - 1" solenoids: 5-25 GPM
   - 1.5" solenoids: 25-90 GPM
   - 2" solenoids: 25-90 GPM

3. **Control Panel Limits**
   - All standard panels: 2HP max
   - Zone counts: 1, 4, 8, or 12

4. **Fitting Compatibility (CRITICAL)**
   - 600-series: WaterflowPRO® (16mm OD)
   - 700-series: WaterflowECO® (17mm OD)
   - THESE ARE NOT INTERCHANGEABLE

5. **Pressure Regulator Options**
   - Available set pressures: 20, 30, 40, 50 PSI only
   - Flow ranges vary by size (LF, MF, HF, UF)

6. **Stock Status Categories**
   - In Stock: Ready to ship
   - On Demand: 2-4 week lead time
   - Discontinued: Suggest replacement
   - To Be Discontinued: Warn user

### Validation Rule Sources

Every rule should cite its source:
- "ASAE EP405.1, Section X.X" for industry standards
- "G-XXXX specifications" for product-specific limits
- "Geoflow Installation Guidelines" for best practices

### Testing Checklist

- [ ] All products from PDF pages 1-10 are in catalog
- [ ] Stock status matches PDF exactly
- [ ] Fitting compatibility warnings fire correctly
- [ ] Hydrotek pressure/flow validation works
- [ ] Zone box flow range validation works
- [ ] Control panel HP/zone validation works
- [ ] BOM quantities calculate correctly
- [ ] BOM total weight is accurate
- [ ] Discontinued product warnings appear
- [ ] On-demand lead time info appears

---

## File Structure Summary

```
/src
├── types/
│   ├── geoflow-products.ts      # Product type definitions
│   └── assistant.ts             # Assistant type definitions
├── data/
│   ├── geoflow-catalog.ts       # All product data from PDF
│   └── catalog-utils.ts         # Lookup and filter functions
├── assistant/
│   ├── rules/
│   │   ├── index.ts
│   │   ├── hydraulic-rules.ts
│   │   ├── product-compatibility-rules.ts
│   │   ├── product-availability-rules.ts
│   │   ├── sizing-rules.ts
│   │   └── application-rules.ts
│   ├── validation-engine.ts
│   ├── recommendation-engine.ts
│   └── bom-generator.ts
├── components/
│   ├── assistant/
│   │   └── AssistantPanel.tsx
│   ├── product-selector/
│   │   ├── DripTubeSelector.tsx
│   │   └── StockBadge.tsx
│   ├── steps/
│   │   └── SystemConfiguration.tsx
│   └── bom/
│       └── BillOfMaterialsView.tsx
└── store/
    └── design-store.ts          # Add selectedComponents state
```
