// Geoflow Product Catalog - Data and Utilities

import productData from './geoflow-products.json'
import type {
  GeoflowProductCatalog,
  DripTubingProduct,
  DripTubingLine,
  FlowMeterProduct,
  ControlPanelProduct,
  HydrotekValveProduct,
  PressureRegulatorProduct,
  ZoneBoxProduct,
} from './geoflow-products.types'

// Export the full catalog
export const geoflowCatalog = productData as unknown as GeoflowProductCatalog

// Export types
export * from './geoflow-products.types'

// ============================================
// Drip Tubing Helpers
// ============================================

/**
 * Get all drip tubing products flattened into a single array
 */
export function getAllDripTubing(): (DripTubingProduct & { lineName: string; pressureCompensating: boolean })[] {
  const { dripTubing } = geoflowCatalog
  const allProducts: (DripTubingProduct & { lineName: string; pressureCompensating: boolean })[] = []

  const lines: [string, DripTubingLine][] = [
    ['WaterflowPRO Classic', dripTubing.waterflowProClassic],
    ['WaterflowPRO PC', dripTubing.waterflowProPC],
    ['WaterflowECO PC', dripTubing.waterflowEcoPC],
  ]

  for (const [lineName, line] of lines) {
    for (const product of line.products) {
      allProducts.push({
        ...product,
        lineName,
        pressureCompensating: line.pressureCompensating ?? false,
      })
    }
  }

  return allProducts
}

/**
 * Find drip tubing by flow rate (gph)
 */
export function findDripTubingByFlowRate(
  targetFlowRate: number,
  options?: { pressureCompensating?: boolean; emitterSpacing?: 12 | 24 }
) {
  let products = getAllDripTubing()

  if (options?.pressureCompensating !== undefined) {
    products = products.filter(p => p.pressureCompensating === options.pressureCompensating)
  }

  if (options?.emitterSpacing) {
    products = products.filter(p => p.emitterSpacing === options.emitterSpacing)
  }

  // Sort by closest flow rate
  return products.sort((a, b) => {
    const diffA = Math.abs((a.flowRate ?? 0) - targetFlowRate)
    const diffB = Math.abs((b.flowRate ?? 0) - targetFlowRate)
    return diffA - diffB
  })
}

// ============================================
// Flow Meter Helpers
// ============================================

/**
 * Get all flow meters flattened into a single array
 */
export function getAllFlowMeters(): (FlowMeterProduct & { type: string })[] {
  const { flowMeters } = geoflowCatalog
  const allMeters: (FlowMeterProduct & { type: string })[] = []

  allMeters.push(...flowMeters.multiJet.products.map(p => ({ ...p, type: 'MultiJet Totalizer' })))
  allMeters.push(...flowMeters.digital.products.map(p => ({ ...p, type: 'Digital Display' })))
  allMeters.push(...flowMeters.electromagnetic.products.map(p => ({ ...p, type: 'Electromagnetic' })))

  return allMeters
}

/**
 * Find flow meters suitable for a given flow rate range
 */
export function findFlowMeterByFlowRate(flowRate: number): (FlowMeterProduct & { type: string })[] {
  return getAllFlowMeters().filter(meter => flowRate >= meter.minFlow && flowRate <= meter.maxFlow)
}

// ============================================
// Control Panel Helpers
// ============================================

/**
 * Get all control panels
 */
export function getAllControlPanels(): ControlPanelProduct[] {
  return geoflowCatalog.controlPanels.standard.products
}

/**
 * Find control panels by zone count
 */
export function findControlPanelByZones(
  zoneCount: number,
  options?: { pumpConfig?: 'simplex' | 'duplex'; flushType?: 'auto' | 'manual' }
): ControlPanelProduct[] {
  let panels = getAllControlPanels().filter(panel => {
    const minZones = panel.minZones ?? panel.zones
    return zoneCount >= minZones && zoneCount <= panel.zones
  })

  if (options?.pumpConfig) {
    panels = panels.filter(p => p.pumpConfig === options.pumpConfig)
  }

  if (options?.flushType) {
    panels = panels.filter(p => p.flushType === options.flushType)
  }

  return panels
}

// ============================================
// Hydrotek Valve Helpers
// ============================================

/**
 * Get all Hydrotek indexing valves
 */
export function getAllHydrotekValves(): HydrotekValveProduct[] {
  return geoflowCatalog.valves.hydrotek.products
}

/**
 * Find Hydrotek valves by zone count
 */
export function findHydrotekValveByZones(zoneCount: number): HydrotekValveProduct[] {
  return getAllHydrotekValves().filter(valve => valve.zones === zoneCount)
}

// ============================================
// Zone Box Helpers
// ============================================

/**
 * Get all zone boxes
 */
export function getAllZoneBoxes(): ZoneBoxProduct[] {
  return geoflowCatalog.zoneBoxes.products
}

/**
 * Find zone boxes by zone count and flow rate
 */
export function findZoneBoxByRequirements(
  zoneCount: number,
  flowRate: number
): ZoneBoxProduct[] {
  return getAllZoneBoxes().filter(
    box => box.zones >= zoneCount && flowRate >= box.minFlow && flowRate <= box.maxFlow
  )
}

// ============================================
// Pressure Regulator Helpers
// ============================================

/**
 * Get all pressure regulators
 */
export function getAllPressureRegulators(): PressureRegulatorProduct[] {
  return geoflowCatalog.pressureRegulators.products
}

/**
 * Find pressure regulators by pressure and flow rate
 */
export function findPressureRegulator(
  targetPressure: number,
  flowRate: number
): PressureRegulatorProduct[] {
  return getAllPressureRegulators().filter(
    reg =>
      reg.pressure === targetPressure &&
      flowRate >= reg.minFlow &&
      flowRate <= reg.maxFlow
  )
}

/**
 * Get available pressure options
 */
export function getAvailablePressures(): number[] {
  const pressures = new Set(getAllPressureRegulators().map(r => r.pressure))
  return Array.from(pressures).sort((a, b) => a - b)
}

// ============================================
// Product Recommendation Engine
// ============================================

export interface SystemRecommendation {
  dripTubing: DripTubingProduct[]
  flowMeter: (FlowMeterProduct & { type: string })[]
  controlPanel: ControlPanelProduct[]
  zoneValve: HydrotekValveProduct[]
  pressureRegulator: PressureRegulatorProduct[]
}

/**
 * Get product recommendations based on system design parameters
 */
export function getSystemRecommendations(params: {
  emitterFlowRate: number // gph
  systemFlowRate: number // gpm
  operatingPressure: number // psi
  zoneCount: number
  pressureCompensating?: boolean
}): SystemRecommendation {
  const {
    emitterFlowRate,
    systemFlowRate,
    operatingPressure,
    zoneCount,
    pressureCompensating = true,
  } = params

  return {
    dripTubing: findDripTubingByFlowRate(emitterFlowRate, { pressureCompensating }).slice(0, 3),
    flowMeter: findFlowMeterByFlowRate(systemFlowRate),
    controlPanel: findControlPanelByZones(zoneCount, { flushType: 'auto' }),
    zoneValve: findHydrotekValveByZones(zoneCount),
    pressureRegulator: findPressureRegulator(
      getAvailablePressures().find(p => p >= operatingPressure) ?? 20,
      systemFlowRate
    ),
  }
}
