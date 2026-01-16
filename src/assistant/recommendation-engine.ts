// Recommendation Engine
// Generates product recommendations based on design parameters

import type {
  DesignState,
  SystemRecommendations,
  ComponentRecommendation,
  StockStatus,
} from '@/types/assistant'
import {
  getAllDripTubing,
  getAllFlowMeters,
  getAllControlPanels,
  getAllHydrotekValves,
  getAllZoneBoxes,
  getAllPressureRegulators,
  geoflowCatalog,
} from '@/data'

// Hydrotek constraints
const HYDROTEK_MIN_PRESSURE = 25
const HYDROTEK_MAX_PRESSURE = 75
const HYDROTEK_MIN_FLOW = 10
const HYDROTEK_MAX_ZONES = 6

/**
 * Generate product recommendations based on design state
 */
export function generateRecommendations(state: DesignState): SystemRecommendations {
  const { designInputs, results } = state
  const warnings: string[] = []

  const flowPerZone = results?.flowPerZone ?? 0
  const zoneCount = designInputs?.numberOfZones ?? 1
  const operatingPressure = designInputs?.operatingPressurePSI ?? 15
  const emitterFlowRate = designInputs?.nominalFlowGPH ?? 0.9

  // Get drip tubing recommendations
  const dripTubing = recommendDripTubing(emitterFlowRate, warnings)

  // Get headworks recommendations (based on flow)
  const headworks = recommendHeadworks(flowPerZone, warnings)

  // Determine zone control strategy
  const zoneControl = recommendZoneControl(
    zoneCount,
    flowPerZone,
    operatingPressure,
    warnings
  )

  // Get control panel recommendations (if using solenoids)
  const controlPanels = recommendControlPanels(zoneCount, warnings)

  // Get pressure regulator recommendations
  const pressureRegulators = recommendPressureRegulators(
    operatingPressure,
    flowPerZone,
    warnings
  )

  // Get flow meter recommendations
  const flowMeters = recommendFlowMeters(flowPerZone, warnings)

  // Get fitting recommendations based on tubing
  const fittings = recommendFittings(dripTubing, warnings)

  return {
    dripTubing,
    headworks,
    zoneControl,
    controlPanels,
    pressureRegulators,
    flowMeters,
    fittings,
    warnings,
  }
}

/**
 * Recommend drip tubing based on emitter flow rate
 */
function recommendDripTubing(
  targetFlowRate: number,
  warnings: string[]
): ComponentRecommendation[] {
  const allTubing = getAllDripTubing()
  const recommendations: ComponentRecommendation[] = []

  // Filter and sort by flow rate match
  const pcTubing = allTubing
    .filter((t) => t.pressureCompensating && t.flowRate !== undefined)
    .sort((a, b) => {
      const diffA = Math.abs((a.flowRate ?? 0) - targetFlowRate)
      const diffB = Math.abs((b.flowRate ?? 0) - targetFlowRate)
      return diffA - diffB
    })

  // Add top PC recommendations (prefer WaterflowPRO for wastewater)
  const proTubing = pcTubing.filter((t) => t.lineName.includes('PRO'))
  const ecoTubing = pcTubing.filter((t) => t.lineName.includes('ECO'))

  if (proTubing.length > 0) {
    const top = proTubing[0]
    recommendations.push({
      sku: top.partNumber,
      name: `${top.lineName} ${top.emitterSpacing}"`,
      description: top.description,
      reason: 'Recommended for wastewater - includes Rootguard root barrier',
      isTopChoice: true,
      stockStatus: top.stock as StockStatus,
    })

    // Add second option if different spacing
    if (proTubing.length > 1 && proTubing[1].emitterSpacing !== top.emitterSpacing) {
      const second = proTubing[1]
      recommendations.push({
        sku: second.partNumber,
        name: `${second.lineName} ${second.emitterSpacing}"`,
        description: second.description,
        reason: `Alternative spacing option (${second.emitterSpacing}" vs ${top.emitterSpacing}")`,
        isTopChoice: false,
        stockStatus: second.stock as StockStatus,
      })
    }
  }

  // Add ECO option with warning
  if (ecoTubing.length > 0) {
    const eco = ecoTubing[0]
    recommendations.push({
      sku: eco.partNumber,
      name: `${eco.lineName} ${eco.emitterSpacing}"`,
      description: eco.description,
      reason: 'Budget option - lower cost but no Rootguard',
      isTopChoice: false,
      warnings: ['No Rootguard - not recommended for wastewater applications'],
      stockStatus: eco.stock as StockStatus,
    })
  }

  if (recommendations.length === 0) {
    warnings.push('No suitable drip tubing found for specified flow rate')
  }

  return recommendations
}

/**
 * Recommend headworks based on system flow
 */
function recommendHeadworks(
  flowPerZone: number,
  warnings: string[]
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = []

  // Access headworks from catalog
  const { headworks } = geoflowCatalog

  // Collect all headworks products
  const allHeadworks: Array<{
    partNumber: string
    description: string
    stock: string
    maxFlow?: number
    filterType: string
    flushType?: string
  }> = []

  // DripFilterECO Vortex
  if (headworks.dripFilterEcoVortex?.categories) {
    Object.values(headworks.dripFilterEcoVortex.categories).forEach((category) => {
      category.products?.forEach((product) => {
        allHeadworks.push({
          ...product,
          filterType: 'Vortex',
        })
      })
    })
  }

  // DripFilterECO BioDisc
  if (headworks.dripFilterEcoBioDisc?.categories) {
    Object.values(headworks.dripFilterEcoBioDisc.categories).forEach((category) => {
      category.products?.forEach((product) => {
        allHeadworks.push({
          ...product,
          filterType: 'BioDisc',
        })
      })
    })
  }

  // Filter by flow capacity and sort by closest match
  const suitable = allHeadworks
    .filter((hw) => {
      const maxFlow = hw.maxFlow ?? 0
      return maxFlow >= flowPerZone && hw.stock !== 'Discontinued'
    })
    .sort((a, b) => (a.maxFlow ?? 999) - (b.maxFlow ?? 999))

  // Add top recommendations
  suitable.slice(0, 3).forEach((hw, index) => {
    recommendations.push({
      sku: hw.partNumber,
      name: hw.description.split(',')[0] || hw.description,
      description: hw.description,
      reason:
        index === 0
          ? `Best match for ${flowPerZone.toFixed(1)} GPM zone flow`
          : `Alternative with ${hw.maxFlow} GPM capacity`,
      isTopChoice: index === 0,
      stockStatus: hw.stock as StockStatus,
    })
  })

  if (recommendations.length === 0) {
    warnings.push(
      `No headworks found with sufficient capacity for ${flowPerZone.toFixed(1)} GPM`
    )
  }

  return recommendations
}

/**
 * Recommend zone control (Hydrotek vs Solenoid)
 */
function recommendZoneControl(
  zoneCount: number,
  flowPerZone: number,
  operatingPressure: number,
  warnings: string[]
): SystemRecommendations['zoneControl'] {
  const hydrotekOptions: ComponentRecommendation[] = []
  const zoneBoxOptions: ComponentRecommendation[] = []

  // Check if Hydrotek is viable
  const hydrotekViable =
    zoneCount <= HYDROTEK_MAX_ZONES &&
    operatingPressure >= HYDROTEK_MIN_PRESSURE &&
    operatingPressure <= HYDROTEK_MAX_PRESSURE &&
    flowPerZone >= HYDROTEK_MIN_FLOW

  // Get Hydrotek recommendations if viable
  if (hydrotekViable) {
    const hydrotekValves = getAllHydrotekValves()
    const suitable = hydrotekValves
      .filter((v) => v.zones >= zoneCount && v.stock !== 'Discontinued')
      .sort((a, b) => a.zones - b.zones)

    suitable.slice(0, 2).forEach((valve, index) => {
      hydrotekOptions.push({
        sku: valve.partNumber,
        name: valve.description.split(',')[0] || `Hydrotek ${valve.zones}-Zone`,
        description: valve.description,
        reason:
          index === 0
            ? 'Simplest option - no electrical required'
            : `Alternative ${valve.zones}-zone configuration`,
        isTopChoice: index === 0,
        stockStatus: valve.stock as StockStatus,
      })
    })
  }

  // Get zone box recommendations
  const zoneBoxes = getAllZoneBoxes()
  const suitableBoxes = zoneBoxes
    .filter(
      (zb) =>
        zb.zones >= zoneCount &&
        flowPerZone >= zb.minFlow &&
        flowPerZone <= zb.maxFlow &&
        zb.stock !== 'Discontinued'
    )
    .sort((a, b) => a.zones - b.zones)

  suitableBoxes.slice(0, 2).forEach((box, index) => {
    zoneBoxOptions.push({
      sku: box.partNumber,
      name: `${box.zones} Zone Assembly - ${box.solenoidSize}" solenoids`,
      description: box.description,
      reason:
        index === 0
          ? 'Best match for flow and zone count'
          : 'Alternative configuration',
      isTopChoice: index === 0,
      stockStatus: box.stock as StockStatus,
    })
  })

  // Determine recommendation
  let recommendation: 'hydrotek' | 'solenoid' | 'either'
  let reason: string

  if (hydrotekViable && hydrotekOptions.length > 0) {
    if (zoneBoxOptions.length > 0) {
      recommendation = 'either'
      reason = `Both options viable. Hydrotek is simpler (no electrical), solenoid offers individual zone control.`
    } else {
      recommendation = 'hydrotek'
      reason = `Hydrotek indexing valve recommended - simpler installation, no electrical required.`
    }
  } else {
    recommendation = 'solenoid'
    if (zoneCount > HYDROTEK_MAX_ZONES) {
      reason = `Solenoid zone box required - ${zoneCount} zones exceeds Hydrotek maximum of ${HYDROTEK_MAX_ZONES}.`
    } else if (flowPerZone < HYDROTEK_MIN_FLOW) {
      reason = `Solenoid zone box recommended - flow of ${flowPerZone.toFixed(1)} GPM is below Hydrotek minimum of ${HYDROTEK_MIN_FLOW} GPM.`
    } else if (
      operatingPressure < HYDROTEK_MIN_PRESSURE ||
      operatingPressure > HYDROTEK_MAX_PRESSURE
    ) {
      reason = `Solenoid zone box required - operating pressure of ${operatingPressure} PSI is outside Hydrotek range (${HYDROTEK_MIN_PRESSURE}-${HYDROTEK_MAX_PRESSURE} PSI).`
    } else {
      reason = `Solenoid zone box recommended for this configuration.`
    }
  }

  if (zoneBoxOptions.length === 0 && !hydrotekViable) {
    warnings.push(
      `No suitable zone control found. Flow: ${flowPerZone.toFixed(1)} GPM, Zones: ${zoneCount}`
    )
  }

  return {
    hydrotek: hydrotekOptions.length > 0 ? hydrotekOptions : undefined,
    zoneBoxes: zoneBoxOptions.length > 0 ? zoneBoxOptions : undefined,
    recommendation,
    reason,
  }
}

/**
 * Recommend control panels based on zone count
 */
function recommendControlPanels(
  zoneCount: number,
  warnings: string[]
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = []
  const panels = getAllControlPanels()

  // Filter panels that support required zones
  const suitable = panels
    .filter((p) => {
      const minZones = p.minZones ?? p.zones
      return zoneCount >= minZones && zoneCount <= p.zones && p.stock !== 'Discontinued'
    })
    .sort((a, b) => {
      // Prefer in-stock, then by zone count (closest match)
      if (a.stock === 'In Stock' && b.stock !== 'In Stock') return -1
      if (b.stock === 'In Stock' && a.stock !== 'In Stock') return 1
      return a.zones - b.zones
    })

  // Add auto-flush options first (preferred for SDI)
  const autoFlush = suitable.filter((p) => p.flushType === 'auto')
  const manualFlush = suitable.filter((p) => p.flushType === 'manual')

  autoFlush.slice(0, 2).forEach((panel, index) => {
    recommendations.push({
      sku: panel.partNumber,
      name: panel.description.split(',')[0] || `${panel.zones} Zone Panel`,
      description: panel.description,
      reason:
        index === 0
          ? 'Recommended - automatic flush for SDI systems'
          : 'Alternative auto-flush option',
      isTopChoice: index === 0,
      stockStatus: panel.stock as StockStatus,
    })
  })

  // Add manual option
  if (manualFlush.length > 0) {
    const manual = manualFlush[0]
    recommendations.push({
      sku: manual.partNumber,
      name: manual.description.split(',')[0] || `${manual.zones} Zone Panel`,
      description: manual.description,
      reason: 'Budget option - manual flush',
      isTopChoice: false,
      stockStatus: manual.stock as StockStatus,
    })
  }

  if (recommendations.length === 0) {
    warnings.push(`No control panels found supporting ${zoneCount} zones`)
  }

  return recommendations
}

/**
 * Recommend pressure regulators
 */
function recommendPressureRegulators(
  targetPressure: number,
  flowRate: number,
  warnings: string[]
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = []
  const regulators = getAllPressureRegulators()

  // Available set pressures
  const availablePressures = [20, 30, 40, 50]
  const closestPressure = availablePressures.reduce((prev, curr) =>
    Math.abs(curr - targetPressure) < Math.abs(prev - targetPressure) ? curr : prev
  )

  // Filter by pressure and flow range
  const suitable = regulators.filter(
    (r) =>
      r.pressure === closestPressure &&
      flowRate >= r.minFlow &&
      flowRate <= r.maxFlow &&
      r.stock !== 'Discontinued'
  )

  suitable.forEach((reg, index) => {
    recommendations.push({
      sku: reg.partNumber,
      name: `${reg.pressure} PSI Regulator`,
      description: reg.description,
      reason:
        index === 0
          ? `Best match for ${flowRate.toFixed(1)} GPM flow`
          : 'Alternative flow range',
      isTopChoice: index === 0,
      stockStatus: reg.stock as StockStatus,
    })
  })

  if (recommendations.length === 0) {
    // Try adjacent pressures
    const altPressures = availablePressures.filter((p) => p !== closestPressure)
    for (const pressure of altPressures) {
      const alt = regulators.find(
        (r) =>
          r.pressure === pressure &&
          flowRate >= r.minFlow &&
          flowRate <= r.maxFlow &&
          r.stock !== 'Discontinued'
      )
      if (alt) {
        recommendations.push({
          sku: alt.partNumber,
          name: `${alt.pressure} PSI Regulator`,
          description: alt.description,
          reason: `Closest available (${alt.pressure} PSI vs ${targetPressure} PSI target)`,
          isTopChoice: true,
          warnings: [`Set pressure differs from target by ${Math.abs(alt.pressure - targetPressure)} PSI`],
          stockStatus: alt.stock as StockStatus,
        })
        break
      }
    }
  }

  if (recommendations.length === 0) {
    warnings.push(
      `No pressure regulators found for ${targetPressure} PSI at ${flowRate.toFixed(1)} GPM`
    )
  }

  return recommendations
}

/**
 * Recommend flow meters
 */
function recommendFlowMeters(
  flowRate: number,
  warnings: string[]
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = []
  const meters = getAllFlowMeters()

  // Filter by flow range
  const suitable = meters
    .filter(
      (m) =>
        flowRate >= m.minFlow &&
        flowRate <= m.maxFlow &&
        m.stock !== 'Discontinued'
    )
    .sort((a, b) => {
      // Prefer meters where flow is in middle of range
      const midA = (a.minFlow + a.maxFlow) / 2
      const midB = (b.minFlow + b.maxFlow) / 2
      return Math.abs(flowRate - midA) - Math.abs(flowRate - midB)
    })

  suitable.slice(0, 3).forEach((meter, index) => {
    recommendations.push({
      sku: meter.partNumber,
      name: meter.description.split(',')[0] || `${meter.type} Flow Meter`,
      description: meter.description,
      reason:
        index === 0
          ? `Best fit for ${flowRate.toFixed(1)} GPM (range: ${meter.minFlow}-${meter.maxFlow} GPM)`
          : `Alternative - ${meter.type} type`,
      isTopChoice: index === 0,
      stockStatus: meter.stock as StockStatus,
    })
  })

  if (recommendations.length === 0) {
    warnings.push(`No flow meters found for ${flowRate.toFixed(1)} GPM flow rate`)
  }

  return recommendations
}

/**
 * Recommend fittings based on tubing selection
 */
function recommendFittings(
  tubingRecommendations: ComponentRecommendation[],
  warnings: string[]
): ComponentRecommendation[] {
  const recommendations: ComponentRecommendation[] = []

  // Determine fitting series based on top tubing recommendation
  const topTubing = tubingRecommendations.find((t) => t.isTopChoice)
  if (!topTubing) {
    warnings.push('Cannot recommend fittings without tubing selection')
    return recommendations
  }

  const isECO = topTubing.sku.includes('ECO')
  const fittingSeries = isECO ? '700-series' : '600-series'
  const tubingType = isECO ? 'WaterflowECO (17mm)' : 'WaterflowPRO (16mm)'

  // Get fittings from catalog
  const { fittings } = geoflowCatalog
  const lockslipFittings = isECO
    ? fittings.lockslip.forWaterflowEco
    : fittings.lockslip.forWaterflowPro

  // Add basic fitting kit recommendation
  if (lockslipFittings && lockslipFittings.length > 0) {
    // Find coupling and socket
    const coupling = lockslipFittings.find((f) =>
      f.description.toLowerCase().includes('coupling')
    )
    const socket = lockslipFittings.find((f) =>
      f.description.toLowerCase().includes('socket')
    )

    if (coupling) {
      recommendations.push({
        sku: coupling.partNumber,
        name: `${fittingSeries} Coupling`,
        description: coupling.description,
        reason: `Required for ${tubingType} connections`,
        isTopChoice: true,
        stockStatus: coupling.stock as StockStatus,
      })
    }

    if (socket) {
      recommendations.push({
        sku: socket.partNumber,
        name: `${fittingSeries} Socket`,
        description: socket.description,
        reason: `Required for ${tubingType} end connections`,
        isTopChoice: false,
        stockStatus: socket.stock as StockStatus,
      })
    }
  }

  // Add info about fitting compatibility
  recommendations.push({
    sku: 'INFO',
    name: `${fittingSeries} Fittings Required`,
    description: `All fittings must be ${fittingSeries} for compatibility with ${tubingType}`,
    reason: 'CRITICAL: 600-series and 700-series fittings are NOT interchangeable',
    isTopChoice: false,
    stockStatus: 'In Stock' as StockStatus,
  })

  return recommendations
}

/**
 * Get a summary of recommendations
 */
export function getRecommendationSummary(recommendations: SystemRecommendations): {
  totalProducts: number
  inStock: number
  onDemand: number
  warnings: number
} {
  const allProducts = [
    ...recommendations.dripTubing,
    ...recommendations.headworks,
    ...(recommendations.zoneControl.hydrotek ?? []),
    ...(recommendations.zoneControl.zoneBoxes ?? []),
    ...recommendations.controlPanels,
    ...recommendations.pressureRegulators,
    ...recommendations.flowMeters,
    ...recommendations.fittings.filter((f) => f.sku !== 'INFO'),
  ]

  return {
    totalProducts: allProducts.length,
    inStock: allProducts.filter((p) =>
      p.stockStatus.toLowerCase().includes('stock')
    ).length,
    onDemand: allProducts.filter((p) =>
      p.stockStatus.toLowerCase().includes('demand')
    ).length,
    warnings: recommendations.warnings.length,
  }
}
