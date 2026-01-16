// Product Compatibility Validation Rules
// Rules that check if selected products are compatible with design parameters

import type { ValidationRule } from '@/types/assistant'
import {
  getAllZoneBoxes,
  getAllControlPanels,
  getAllPressureRegulators,
} from '@/data'

// Hydrotek valve constraints from specifications
const HYDROTEK_MIN_PRESSURE = 25 // PSI
const HYDROTEK_MAX_PRESSURE = 75 // PSI
const HYDROTEK_MIN_FLOW = 10 // GPM
const HYDROTEK_MAX_ZONES = 6


export const productCompatibilityRules: ValidationRule[] = [
  // Rule: Hydrotek valve pressure too high
  {
    id: 'product-hydrotek-pressure-high',
    name: 'Hydrotek Pressure Too High',
    description: 'Operating pressure exceeds Hydrotek valve maximum',
    category: 'product-compatibility',
    severity: 'error',
    appliesTo: [1, 3, 4, 5],
    condition: (state) => {
      const { selectedProducts, designInputs, results } = state
      if (selectedProducts?.zoneControlType !== 'hydrotek') return false

      // Calculate pressure at Hydrotek valve (TDH + operating pressure)
      const operatingPressure = designInputs?.operatingPressurePSI ?? 0
      const tdhPSI = results?.zoneTDH?.dispersalTDH ?? 0
      const totalPressure = operatingPressure + tdhPSI

      return totalPressure > HYDROTEK_MAX_PRESSURE
    },
    message: (state) => {
      const operatingPressure = state.designInputs?.operatingPressurePSI ?? 0
      const tdhPSI = state.results?.zoneTDH?.dispersalTDH ?? 0
      const totalPressure = operatingPressure + tdhPSI

      return `System pressure of ${totalPressure.toFixed(0)} PSI exceeds Hydrotek valve maximum of ${HYDROTEK_MAX_PRESSURE} PSI. Consider using solenoid zone valves instead.`
    },
    source: () => 'Hydrotek Specifications: Operating range 25-75 PSI',
  },

  // Rule: Hydrotek valve pressure too low
  {
    id: 'product-hydrotek-pressure-low',
    name: 'Hydrotek Pressure Too Low',
    description: 'Operating pressure is below Hydrotek valve minimum',
    category: 'product-compatibility',
    severity: 'error',
    appliesTo: [1, 3, 4, 5],
    condition: (state) => {
      const { selectedProducts, designInputs } = state
      if (selectedProducts?.zoneControlType !== 'hydrotek') return false

      const operatingPressure = designInputs?.operatingPressurePSI ?? 0
      return operatingPressure < HYDROTEK_MIN_PRESSURE
    },
    message: (state) => {
      const operatingPressure = state.designInputs?.operatingPressurePSI ?? 0
      return `Operating pressure of ${operatingPressure} PSI is below Hydrotek valve minimum of ${HYDROTEK_MIN_PRESSURE} PSI. Consider using solenoid zone valves or increasing system pressure.`
    },
    source: () => 'Hydrotek Specifications: Operating range 25-75 PSI',
  },

  // Rule: Hydrotek valve flow too low
  {
    id: 'product-hydrotek-flow-low',
    name: 'Hydrotek Flow Too Low',
    description: 'Zone flow is below Hydrotek valve minimum',
    category: 'product-compatibility',
    severity: 'warning',
    appliesTo: [3, 4, 5],
    condition: (state) => {
      const { selectedProducts, results } = state
      if (selectedProducts?.zoneControlType !== 'hydrotek') return false

      const flowPerZone = results?.flowPerZone ?? 0
      return flowPerZone < HYDROTEK_MIN_FLOW
    },
    message: (state) => {
      const flowPerZone = state.results?.flowPerZone ?? 0
      return `Zone flow of ${flowPerZone.toFixed(1)} GPM is below Hydrotek valve minimum of ${HYDROTEK_MIN_FLOW} GPM. Valve may not index properly. Consider solenoid zone valves instead.`
    },
    source: () => 'Hydrotek Specifications: Minimum 10 GPM for reliable indexing',
  },

  // Rule: Too many zones for Hydrotek
  {
    id: 'product-hydrotek-zones-exceeded',
    name: 'Too Many Zones for Hydrotek',
    description: 'Zone count exceeds maximum Hydrotek valve capacity',
    category: 'product-compatibility',
    severity: 'error',
    appliesTo: [1, 5],
    condition: (state) => {
      const { selectedProducts, designInputs } = state
      if (selectedProducts?.zoneControlType !== 'hydrotek') return false

      const zones = designInputs?.numberOfZones ?? 0
      return zones > HYDROTEK_MAX_ZONES
    },
    message: (state) => {
      const zones = state.designInputs?.numberOfZones ?? 0
      return `Design requires ${zones} zones, but Hydrotek valves support maximum ${HYDROTEK_MAX_ZONES} zones. Use solenoid zone box for systems with more than 6 zones.`
    },
    source: () => 'Hydrotek valve maximum configuration: 6 zones',
  },

  // Rule: Zone box flow exceeds maximum
  {
    id: 'product-zonebox-flow-high',
    name: 'Zone Box Flow Exceeded',
    description: 'Zone flow exceeds zone box maximum capacity',
    category: 'product-compatibility',
    severity: 'error',
    appliesTo: [3, 4, 5],
    condition: (state) => {
      const { selectedProducts, results } = state
      if (!selectedProducts?.zoneBoxSku) return false

      const flowPerZone = results?.flowPerZone ?? 0
      const zoneBoxes = getAllZoneBoxes()
      const selectedBox = zoneBoxes.find((zb) => zb.partNumber === selectedProducts.zoneBoxSku)

      return selectedBox !== undefined && flowPerZone > selectedBox.maxFlow
    },
    message: (state) => {
      const flowPerZone = state.results?.flowPerZone ?? 0
      const zoneBoxes = getAllZoneBoxes()
      const selectedBox = zoneBoxes.find(
        (zb) => zb.partNumber === state.selectedProducts?.zoneBoxSku
      )

      return `Zone flow of ${flowPerZone.toFixed(1)} GPM exceeds zone box maximum of ${selectedBox?.maxFlow} GPM. Select a larger zone box or reduce zone flow.`
    },
    source: () => 'Zone Box Specifications',
  },

  // Rule: Zone box flow below minimum
  {
    id: 'product-zonebox-flow-low',
    name: 'Zone Box Flow Too Low',
    description: 'Zone flow is below zone box minimum',
    category: 'product-compatibility',
    severity: 'warning',
    appliesTo: [3, 4, 5],
    condition: (state) => {
      const { selectedProducts, results } = state
      if (!selectedProducts?.zoneBoxSku) return false

      const flowPerZone = results?.flowPerZone ?? 0
      const zoneBoxes = getAllZoneBoxes()
      const selectedBox = zoneBoxes.find((zb) => zb.partNumber === selectedProducts.zoneBoxSku)

      return selectedBox !== undefined && flowPerZone < selectedBox.minFlow
    },
    message: (state) => {
      const flowPerZone = state.results?.flowPerZone ?? 0
      const zoneBoxes = getAllZoneBoxes()
      const selectedBox = zoneBoxes.find(
        (zb) => zb.partNumber === state.selectedProducts?.zoneBoxSku
      )

      return `Zone flow of ${flowPerZone.toFixed(1)} GPM is below zone box minimum of ${selectedBox?.minFlow} GPM. Valves may not operate properly.`
    },
    source: () => 'Zone Box Specifications',
  },

  // Rule: Control panel zones insufficient
  {
    id: 'product-panel-zones-insufficient',
    name: 'Control Panel Zone Capacity',
    description: 'Control panel does not support required zone count',
    category: 'product-compatibility',
    severity: 'error',
    appliesTo: [1, 5],
    condition: (state) => {
      const { selectedProducts, designInputs } = state
      if (!selectedProducts?.controlPanelSku) return false

      const requiredZones = designInputs?.numberOfZones ?? 0
      const panels = getAllControlPanels()
      const selectedPanel = panels.find((p) => p.partNumber === selectedProducts.controlPanelSku)

      return selectedPanel !== undefined && requiredZones > selectedPanel.zones
    },
    message: (state) => {
      const requiredZones = state.designInputs?.numberOfZones ?? 0
      const panels = getAllControlPanels()
      const selectedPanel = panels.find(
        (p) => p.partNumber === state.selectedProducts?.controlPanelSku
      )

      return `Design requires ${requiredZones} zones, but selected control panel supports only ${selectedPanel?.zones} zones. Select a panel with higher zone capacity.`
    },
    source: () => 'Control Panel Specifications',
  },

  // Rule: Pressure regulator flow mismatch
  {
    id: 'product-regulator-flow-mismatch',
    name: 'Pressure Regulator Flow Mismatch',
    description: 'Zone flow is outside pressure regulator operating range',
    category: 'product-compatibility',
    severity: 'warning',
    appliesTo: [3, 4, 5],
    condition: (state) => {
      const { selectedProducts, results } = state
      if (!selectedProducts?.pressureRegulatorSku) return false

      const flowPerZone = results?.flowPerZone ?? 0
      const regulators = getAllPressureRegulators()
      const selectedReg = regulators.find(
        (r) => r.partNumber === selectedProducts.pressureRegulatorSku
      )

      if (!selectedReg) return false
      return flowPerZone < selectedReg.minFlow || flowPerZone > selectedReg.maxFlow
    },
    message: (state) => {
      const flowPerZone = state.results?.flowPerZone ?? 0
      const regulators = getAllPressureRegulators()
      const selectedReg = regulators.find(
        (r) => r.partNumber === state.selectedProducts?.pressureRegulatorSku
      )

      return `Zone flow of ${flowPerZone.toFixed(1)} GPM is outside pressure regulator range (${selectedReg?.minFlow}-${selectedReg?.maxFlow} GPM). Select appropriate flow class (LF/MF/HF/UF).`
    },
    source: () => 'Pressure Regulator Specifications',
  },

  // Rule: ECO tubing with wastewater (no Rootguard)
  {
    id: 'product-eco-wastewater-warning',
    name: 'ECO Tubing in Wastewater',
    description: 'WaterflowECO tubing lacks Rootguard treatment',
    category: 'product-compatibility',
    severity: 'warning',
    appliesTo: [1, 5],
    condition: (state) => {
      const { selectedProducts } = state
      if (!selectedProducts?.dripTubingSku) return false

      // Check if selected tubing is ECO series
      const isECO = selectedProducts.dripTubingSku.includes('ECO')
      // This is a wastewater design tool, so this warning always applies to ECO tubing
      return isECO
    },
    message: () => {
      return `WaterflowECO tubing does not include Rootguard root barrier treatment. For wastewater applications, WaterflowPRO with Rootguard is recommended to prevent root intrusion.`
    },
    source: () => 'Geoflow Product Guide: WaterflowPRO includes Rootguard, ECO does not',
  },

  // Rule: Fitting compatibility check
  {
    id: 'product-fitting-compatibility',
    name: 'Fitting Compatibility',
    description: 'Selected fittings may not be compatible with selected tubing',
    category: 'product-compatibility',
    severity: 'error',
    appliesTo: [5],
    condition: (state) => {
      const { selectedProducts } = state
      if (!selectedProducts?.dripTubingSku) return false

      // Determine required fitting series based on tubing
      // 600-series for WaterflowPRO (16mm), 700-series for WaterflowECO (17mm)
      // This is a placeholder - actual implementation would check selected fittings
      // For now, just return false (no error) since we're not tracking individual fittings
      return false
    },
    message: (state) => {
      const isECO = state.selectedProducts?.dripTubingSku?.includes('ECO')
      const requiredSeries = isECO ? '700-series (17mm)' : '600-series (16mm)'
      return `Selected fittings are not compatible with tubing. ${isECO ? 'WaterflowECO' : 'WaterflowPRO'} requires ${requiredSeries} fittings.`
    },
    source: () => '600-series = 16mm (WaterflowPRO), 700-series = 17mm (WaterflowECO)',
  },

  // Rule: High zone count recommendation
  {
    id: 'product-high-zone-recommendation',
    name: 'Large Zone Count',
    description: 'Systems with many zones may benefit from solenoid control',
    category: 'product-compatibility',
    severity: 'suggestion',
    appliesTo: [1, 5],
    condition: (state) => {
      const zones = state.designInputs?.numberOfZones ?? 0
      return zones > 4 && zones <= 6
    },
    message: (state) => {
      const zones = state.designInputs?.numberOfZones ?? 0
      return `With ${zones} zones, consider using solenoid zone valves with control panel for more flexibility and individual zone run time control.`
    },
    source: () => 'Geoflow Design Recommendations',
  },

  // Rule: Non-PC emitters with elevation
  {
    id: 'product-non-pc-elevation',
    name: 'Non-PC Emitters with Elevation',
    description: 'Classic (non-PC) emitters with significant elevation change',
    category: 'application',
    severity: 'warning',
    appliesTo: [1, 2, 5],
    condition: (state) => {
      const { selectedProducts, systemLayout } = state
      if (!selectedProducts?.dripTubingSku) return false

      // Check if using Classic (non-PC) tubing
      const isClassic = selectedProducts.dripTubingSku.includes('Classic')
      if (!isClassic) return false

      // Check elevation change
      const totalElevation = systemLayout?.reduce((sum, seg) => sum + seg.elevation, 0) ?? 0
      return Math.abs(totalElevation) > 10
    },
    message: (state) => {
      const totalElevation = state.systemLayout?.reduce((sum, seg) => sum + seg.elevation, 0) ?? 0
      const pressureChange = Math.abs(totalElevation * 0.433).toFixed(1)
      return `Using Classic (non-PC) emitters with ${Math.abs(totalElevation).toFixed(0)} ft elevation change (${pressureChange} PSI). Pressure-compensating emitters recommended for uniform application with >10 ft elevation.`
    },
    source: () => 'PC emitters maintain uniform flow regardless of pressure variations',
  },
]
