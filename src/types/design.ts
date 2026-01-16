// Design Input types for Step 1
export interface DesignInputs {
  projectName: string
  maxFlowGPD: number
  soilLoadingRate: number // gpd/ft²
  usableAcres: number
  driplineSpacing: number // feet
  emitterSpacing: number // inches
  numberOfZones: number
  lateralsPerZone: number
  lateralLength: number // feet
  flushVelocity: number // ft/s
  cyclesPerDay: number
  // Drip tube parameters (user inputs directly, no catalog)
  tubeId: number // inches
  emitterKd: number // discharge coefficient
  emitterExponent: number
  nominalFlowGPH: number
  // Operating parameters
  operatingPressurePSI: number // emitter operating pressure
}

// Pipe segment for System Layout (Step 2)
export interface PipeSegment {
  id: string
  name: string
  pipeSize: string // nominal size like "1", "1.5", "2"
  pipeId: number // inside diameter in inches
  length: number // feet
  elevation: number // feet (positive = uphill, negative = downhill)
  cFactor: number // Hazen-Williams C factor (default 150 for PVC)
}

// Zone TDH calculation results (Step 3)
export interface ZoneTDH {
  dispersalTDH: number
  flushingTDH: number
  staticHead: number
  frictionLoss: number
  emitterPressure: number
}

// Final Results (Step 4)
export interface DesignResults {
  totalArea: number // ft²
  driplineRequired: number // linear feet
  emittersTotal: number
  flowPerZone: number // GPM
  totalSystemFlow: number // GPM
  dispersalFlowGPM: number
  flushFlowGPM: number
  zoneTDH: ZoneTDH
}

// Complete project state
export interface Project {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  designInputs: Partial<DesignInputs>
  systemLayout: PipeSegment[]
  results: Partial<DesignResults>
}

// Default values for design inputs
export const defaultDesignInputs: Partial<DesignInputs> = {
  projectName: '',
  maxFlowGPD: 1000,
  soilLoadingRate: 0.5,
  usableAcres: 1,
  driplineSpacing: 2,
  emitterSpacing: 12,
  numberOfZones: 4,
  lateralsPerZone: 10,
  lateralLength: 100,
  flushVelocity: 1.5,
  cyclesPerDay: 4,
  tubeId: 0.55,
  emitterKd: 0.234,
  emitterExponent: 0.5,
  nominalFlowGPH: 0.9,
  operatingPressurePSI: 15,
}

// Default pipe segment
export const createDefaultPipeSegment = (index: number): PipeSegment => ({
  id: `segment-${Date.now()}-${index}`,
  name: `Segment ${index + 1}`,
  pipeSize: '2',
  pipeId: 2.067,
  length: 50,
  elevation: 0,
  cFactor: 150,
})
