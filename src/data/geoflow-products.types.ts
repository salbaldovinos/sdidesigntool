// Geoflow Product Catalog Types

export interface ProductMeta {
  source: string
  version: string
  lastUpdated: string
}

export interface BaseProduct {
  partNumber: string
  previousPartNumber?: string
  description: string
  stock: 'In Stock' | 'In stock' | 'On demand' | 'Discontinued' | 'To Be Discontinued' | 'To be discontinued' | 'Low stock'
  weight?: number
  weightUnit?: 'lbs'
  moq?: number
  moqUnit?: string
}

// Drip Tubing Types
export interface DripTubingProduct extends BaseProduct {
  emitterSpacing?: number
  emitterSpacingUnit?: 'in'
  flowRate?: number
  flowRateUnit?: 'gph'
}

export interface DripTubingLine {
  name: string
  description: string
  outerDiameter: number
  outerDiameterUnit: 'mm'
  emitterType?: 'cylindrical' | 'flat'
  pressureCompensating?: boolean
  features: string[]
  products: DripTubingProduct[]
}

// Headworks Types
export interface HeadworksProduct extends BaseProduct {
  filterSize?: number
  filterSizeUnit?: 'in'
  maxFlow?: number
  maxFlowUnit?: 'gpm'
  flushType?: 'auto' | 'manual'
  filterCount?: number
  dimensions?: string
  dimensionUnit?: 'in'
  compatibleSizes?: string[]
}

export interface HeadworksCategory {
  name: string
  status?: string
  products: HeadworksProduct[]
}

// Zone Box Types
export interface ZoneBoxProduct extends BaseProduct {
  zones: number
  solenoidSize: number
  solenoidSizeUnit: 'in'
  dimensions: string
  minFlow: number
  maxFlow: number
  flowUnit: 'gpm'
}

// Control Panel Types
export interface ControlPanelProduct extends BaseProduct {
  zones: number
  minZones?: number
  voltage: string
  pumpConfig: 'simplex' | 'duplex'
  phase: number
  minHP?: number
  maxHP: number
  flushType: 'auto' | 'manual'
  individualRunTime?: boolean
}

// Flow Meter Types
export interface FlowMeterProduct extends BaseProduct {
  size: number
  sizeUnit: 'in'
  connectionType?: string
  minFlow: number
  maxFlow: number
  flowUnit: 'gpm'
  maxPressure?: number
  pressureUnit?: 'psi'
  accuracy?: number
  accuracyUnit?: '%'
  outputType?: string
}

// Filter Types
export interface FilterProduct extends BaseProduct {
  size: number
  sizeUnit: 'in'
  features?: string[]
  connectionType?: string
  bodyLength?: number
  bodyLengthUnit?: 'in'
  maxFlow?: number
  maxFlowUnit?: 'gpm'
  holes?: number
  screenMaterial?: string
  holeSize?: number
  holeSizeUnit?: 'in'
  assemblyType?: string
}

// Valve Types
export interface ValveProduct extends BaseProduct {
  size: number
  sizeUnit: 'in'
  connectionType?: string
  voltage?: string
  normalState?: 'closed' | 'open'
  plumbing?: string
  material?: string
  wires?: number
  returnType?: string
}

export interface HydrotekValveProduct extends BaseProduct {
  zones: number
  inletSize: number
  outletSize: number
  sizeUnit: 'in'
  minPressure: number
  maxPressure: number
  pressureUnit: 'psi'
  minFlow: number
  flowUnit: 'gpm'
}

export interface DiverterValveProduct extends BaseProduct {
  zones: number
  minPressure: number
  maxPressure: number
  pressureUnit: 'psi'
  minFlow: number
  maxFlow: number
  flowUnit: 'gpm'
  basinDiameter: number
  basinHeight: number
  dimensionUnit: 'in'
}

export interface CheckValveProduct extends BaseProduct {
  size: number
  sizeUnit: 'in'
  material?: string
  connectionTypes?: string[]
  connectionType?: string
  crackingPressure?: number
  crackingPressureUnit?: 'psi'
}

// Pressure Regulator Types
export interface PressureRegulatorProduct extends BaseProduct {
  pressure: number
  pressureUnit: 'psi'
  minFlow: number
  maxFlow: number
  flowUnit: 'gpm'
  size: number
  sizeUnit: 'in'
  connectionType: string
}

// Air Vent Types
export interface AirVentProduct extends BaseProduct {
  size: number
  sizeUnit: 'in'
  connectionType?: string
  ventType?: string
  type?: string
}

// Fitting Types
export interface FittingProduct extends BaseProduct {
  type: string
  size?: number
  sizeUnit?: 'in'
  threadSize?: number
  threadSizeUnit?: 'in'
  bagQuantity?: number
  length?: number
  lengthUnit?: 'in' | 'ft'
  diameter?: number
  diameterUnit?: 'in'
  adapterCount?: number
}

export interface SaddleTeeProduct extends BaseProduct {
  mainlineSize: number
  mainlineSizeUnit: 'in'
  color: string
  outletSizes: number[]
  outletSizeUnit: 'in'
  bagQuantity: number
}

// Accessory Types
export interface AccessoryProduct extends BaseProduct {
  size?: number
  sizeUnit?: 'in'
  connectionSize?: number
  connectionSizeUnit?: 'in'
  connectionType?: string
  mountType?: string
  length?: number
  lengthUnit?: 'in'
  schedule?: number
  boxQuantity?: number
}

// Main Catalog Interface
export interface GeoflowProductCatalog {
  meta: ProductMeta
  dripTubing: {
    waterflowProClassic: DripTubingLine
    waterflowProPC: DripTubingLine
    waterflowProBlank: DripTubingLine
    waterflowEcoPC: DripTubingLine
  }
  headworks: {
    dripFilterEcoVortex: {
      name: string
      description: string
      categories: Record<string, HeadworksCategory>
    }
    dripFilterEcoBioDisc: {
      name: string
      description: string
      categories: Record<string, HeadworksCategory>
    }
    dripFilterPro: {
      name: string
      description: string
      products: HeadworksProduct[]
    }
    boxes: {
      name: string
      products: HeadworksProduct[]
    }
  }
  zoneBoxes: {
    name: string
    description: string
    products: ZoneBoxProduct[]
  }
  controlPanels: {
    standard: {
      name: string
      description: string
      products: ControlPanelProduct[]
    }
  }
  flowMeters: {
    multiJet: {
      name: string
      description: string
      products: FlowMeterProduct[]
    }
    digital: {
      name: string
      description: string
      products: FlowMeterProduct[]
    }
    electromagnetic: {
      name: string
      description: string
      products: FlowMeterProduct[]
    }
  }
  filters: {
    bioDisc: {
      name: string
      description: string
      products: FilterProduct[]
      replacementParts: FilterProduct[]
    }
    vortex: {
      name: string
      description: string
      products: FilterProduct[]
    }
    simTechPressure: {
      name: string
      description: string
      products: FilterProduct[]
    }
  }
  valves: {
    solenoid: {
      name: string
      description: string
      products: ValveProduct[]
    }
    actuated: {
      name: string
      description: string
      products: ValveProduct[]
    }
    hydrotek: {
      name: string
      description: string
      products: HydrotekValveProduct[]
    }
    diverter: {
      name: string
      description: string
      products: DiverterValveProduct[]
    }
    checkBall: {
      name: string
      description: string
      products: CheckValveProduct[]
    }
    checkSpring: {
      name: string
      description: string
      products: CheckValveProduct[]
    }
  }
  pressureRegulators: {
    name: string
    description: string
    products: PressureRegulatorProduct[]
  }
  airVents: {
    name: string
    description: string
    products: AirVentProduct[]
    boxes: AirVentProduct[]
  }
  fittings: {
    lockslip: {
      name: string
      description: string
      forWaterflowPro: FittingProduct[]
      forWaterflowEco: FittingProduct[]
      flexLoopsRisers: FittingProduct[]
    }
    saddleTees: {
      name: string
      description: string
      products: SaddleTeeProduct[]
    }
  }
  accessories: {
    pressureGauges: {
      name: string
      products: AccessoryProduct[]
    }
    unions: {
      name: string
      products: AccessoryProduct[]
    }
    grommets: {
      name: string
      description: string
      products: AccessoryProduct[]
    }
  }
}

// Helper type for getting all drip tubing products
export type AllDripTubingProducts = DripTubingProduct[]

// Helper function types for product selection
export interface ProductSelectionCriteria {
  flowRate?: { min?: number; max?: number }
  pressure?: { min?: number; max?: number }
  zones?: number
  size?: number
}
