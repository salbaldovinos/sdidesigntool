// Bill of Materials Generator
// Generates a complete BOM based on design parameters and selected products

import type {
  DesignState,
  BillOfMaterials,
  BOMLineItem,
  StockStatus,
  SelectedProducts,
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

/**
 * Generate Bill of Materials from design state and selected products
 */
export function generateBOM(
  state: DesignState,
  projectName: string = 'SDI System Design'
): BillOfMaterials {
  const { designInputs, selectedProducts = {} } = state
  const warnings: string[] = []
  const items: BOMLineItem[] = []

  // Calculate quantities from design parameters
  const zoneCount = designInputs?.numberOfZones ?? 1
  const lateralLength = designInputs?.lateralLength ?? 0
  const lateralsPerZone = designInputs?.lateralsPerZone ?? 1
  const totalLateralFeet = lateralLength * lateralsPerZone * zoneCount

  // Add drip tubing
  if (selectedProducts.dripTubingSku) {
    const tubing = findDripTubing(selectedProducts.dripTubingSku)
    if (tubing) {
      items.push({
        sku: tubing.partNumber,
        description: `${tubing.lineName} - ${tubing.emitterSpacing}" spacing, ${tubing.flowRate} GPH`,
        category: 'Drip Tubing',
        quantity: Math.ceil(totalLateralFeet),
        unit: 'ft',
        stockStatus: tubing.stock as StockStatus,
        notes: `${lateralsPerZone} laterals × ${zoneCount} zones × ${lateralLength} ft/lateral`,
      })
    } else {
      warnings.push(`Selected drip tubing ${selectedProducts.dripTubingSku} not found in catalog`)
    }
  } else {
    warnings.push('No drip tubing selected')
  }

  // Add headworks
  if (selectedProducts.headworksSku) {
    const headworks = findHeadworks(selectedProducts.headworksSku)
    if (headworks) {
      items.push({
        sku: headworks.partNumber,
        description: headworks.description,
        category: 'Headworks',
        quantity: 1,
        unit: 'ea',
        stockStatus: headworks.stock as StockStatus,
      })
    } else {
      warnings.push(`Selected headworks ${selectedProducts.headworksSku} not found in catalog`)
    }
  }

  // Add zone control
  if (selectedProducts.zoneControlType === 'hydrotek' && selectedProducts.hydrotekValveSku) {
    const valve = findHydrotekValve(selectedProducts.hydrotekValveSku)
    if (valve) {
      items.push({
        sku: valve.partNumber,
        description: valve.description,
        category: 'Zone Control - Hydrotek',
        quantity: 1,
        unit: 'ea',
        stockStatus: valve.stock as StockStatus,
        notes: `${valve.zones}-zone indexing valve`,
      })
    } else {
      warnings.push(`Selected Hydrotek valve ${selectedProducts.hydrotekValveSku} not found`)
    }
  } else if (selectedProducts.zoneControlType === 'solenoid') {
    // Add zone box
    if (selectedProducts.zoneBoxSku) {
      const zoneBox = findZoneBox(selectedProducts.zoneBoxSku)
      if (zoneBox) {
        items.push({
          sku: zoneBox.partNumber,
          description: zoneBox.description,
          category: 'Zone Control - Solenoid Box',
          quantity: 1,
          unit: 'ea',
          stockStatus: zoneBox.stock as StockStatus,
          notes: `${zoneBox.zones}-zone solenoid assembly`,
        })
      } else {
        warnings.push(`Selected zone box ${selectedProducts.zoneBoxSku} not found`)
      }
    }

    // Add control panel (required for solenoid)
    if (selectedProducts.controlPanelSku) {
      const panel = findControlPanel(selectedProducts.controlPanelSku)
      if (panel) {
        items.push({
          sku: panel.partNumber,
          description: panel.description,
          category: 'Control Panel',
          quantity: 1,
          unit: 'ea',
          stockStatus: panel.stock as StockStatus,
          notes: `${panel.zones}-zone capacity, ${panel.flushType} flush`,
        })
      } else {
        warnings.push(`Selected control panel ${selectedProducts.controlPanelSku} not found`)
      }
    }
  }

  // Add pressure regulator
  if (selectedProducts.pressureRegulatorSku) {
    const regulator = findPressureRegulator(selectedProducts.pressureRegulatorSku)
    if (regulator) {
      items.push({
        sku: regulator.partNumber,
        description: regulator.description,
        category: 'Pressure Regulator',
        quantity: 1,
        unit: 'ea',
        stockStatus: regulator.stock as StockStatus,
        notes: `${regulator.pressure} PSI set point`,
      })
    } else {
      warnings.push(`Selected pressure regulator ${selectedProducts.pressureRegulatorSku} not found`)
    }
  }

  // Add flow meter
  if (selectedProducts.flowMeterSku) {
    const meter = findFlowMeter(selectedProducts.flowMeterSku)
    if (meter) {
      items.push({
        sku: meter.partNumber,
        description: meter.description,
        category: 'Flow Meter',
        quantity: 1,
        unit: 'ea',
        stockStatus: meter.stock as StockStatus,
        notes: `Range: ${meter.minFlow}-${meter.maxFlow} GPM`,
      })
    } else {
      warnings.push(`Selected flow meter ${selectedProducts.flowMeterSku} not found`)
    }
  }

  // Add fittings based on tubing selection
  const fittingItems = calculateFittings(selectedProducts, zoneCount, lateralsPerZone)
  items.push(...fittingItems)

  // Calculate summary
  const summary = {
    totalLineItems: items.length,
    totalWeight: items.reduce((sum, item) => sum + (item.weight ?? 0) * item.quantity, 0),
    inStockCount: items.filter((i) => i.stockStatus.toLowerCase().includes('stock')).length,
    onDemandCount: items.filter((i) => i.stockStatus.toLowerCase().includes('demand')).length,
  }

  return {
    projectName,
    generatedAt: new Date(),
    items,
    summary,
    warnings,
  }
}

/**
 * Calculate fitting quantities based on tubing and layout
 */
function calculateFittings(
  selectedProducts: SelectedProducts,
  zoneCount: number,
  lateralsPerZone: number
): BOMLineItem[] {
  const items: BOMLineItem[] = []
  const totalLaterals = zoneCount * lateralsPerZone

  if (!selectedProducts.dripTubingSku) {
    return items
  }

  // Determine fitting series based on tubing
  const tubing = findDripTubing(selectedProducts.dripTubingSku)
  if (!tubing) return items

  const isECO = tubing.lineName.includes('ECO')
  const fittingSeries = isECO ? '700' : '600'
  const { fittings } = geoflowCatalog
  const lockslipFittings = isECO
    ? fittings.lockslip.forWaterflowEco
    : fittings.lockslip.forWaterflowPro

  if (!lockslipFittings || lockslipFittings.length === 0) {
    return items
  }

  // Find common fittings
  const coupling = lockslipFittings.find((f) =>
    f.description.toLowerCase().includes('coupling')
  )
  const socket = lockslipFittings.find((f) =>
    f.description.toLowerCase().includes('socket')
  )
  const plug = lockslipFittings.find((f) =>
    f.description.toLowerCase().includes('plug') || f.description.toLowerCase().includes('cap')
  )

  // Calculate quantities
  // - 2 sockets per lateral (inlet + outlet/flush)
  // - 1 plug per lateral (end cap)
  // - Allow 10% extra for wastage

  if (socket) {
    const socketQty = Math.ceil(totalLaterals * 2 * 1.1)
    items.push({
      sku: socket.partNumber,
      description: socket.description,
      category: `Fittings - ${fittingSeries} Series`,
      quantity: socketQty,
      unit: 'ea',
      stockStatus: socket.stock as StockStatus,
      notes: `2 per lateral × ${totalLaterals} laterals + 10% contingency`,
    })
  }

  if (plug) {
    const plugQty = Math.ceil(totalLaterals * 1.1)
    items.push({
      sku: plug.partNumber,
      description: plug.description,
      category: `Fittings - ${fittingSeries} Series`,
      quantity: plugQty,
      unit: 'ea',
      stockStatus: plug.stock as StockStatus,
      notes: `1 per lateral × ${totalLaterals} laterals + 10% contingency`,
    })
  }

  // Add coupling for repairs/connections (suggest 5% of lateral count)
  if (coupling) {
    const couplingQty = Math.max(10, Math.ceil(totalLaterals * 0.1))
    items.push({
      sku: coupling.partNumber,
      description: coupling.description,
      category: `Fittings - ${fittingSeries} Series`,
      quantity: couplingQty,
      unit: 'ea',
      stockStatus: coupling.stock as StockStatus,
      notes: 'Recommended spare inventory for repairs',
    })
  }

  return items
}

// Lookup helpers
function findDripTubing(sku: string) {
  return getAllDripTubing().find((t) => t.partNumber === sku)
}

function findHeadworks(sku: string) {
  const { headworks } = geoflowCatalog

  // Search all headworks categories
  const allProducts: Array<{ partNumber: string; description: string; stock: string }> = []

  if (headworks.dripFilterEcoVortex?.categories) {
    Object.values(headworks.dripFilterEcoVortex.categories).forEach((cat) => {
      cat.products?.forEach((p) => allProducts.push(p))
    })
  }

  if (headworks.dripFilterEcoBioDisc?.categories) {
    Object.values(headworks.dripFilterEcoBioDisc.categories).forEach((cat) => {
      cat.products?.forEach((p) => allProducts.push(p))
    })
  }

  if (headworks.dripFilterPro?.products) {
    headworks.dripFilterPro.products.forEach((p) => allProducts.push(p))
  }

  if (headworks.boxes?.products) {
    headworks.boxes.products.forEach((p) => allProducts.push(p))
  }

  return allProducts.find((p) => p.partNumber === sku)
}

function findHydrotekValve(sku: string) {
  return getAllHydrotekValves().find((v) => v.partNumber === sku)
}

function findZoneBox(sku: string) {
  return getAllZoneBoxes().find((z) => z.partNumber === sku)
}

function findControlPanel(sku: string) {
  return getAllControlPanels().find((p) => p.partNumber === sku)
}

function findPressureRegulator(sku: string) {
  return getAllPressureRegulators().find((r) => r.partNumber === sku)
}

function findFlowMeter(sku: string) {
  return getAllFlowMeters().find((m) => m.partNumber === sku)
}

/**
 * Format BOM for display
 */
export function formatBOMForDisplay(bom: BillOfMaterials): {
  categories: Array<{
    name: string
    items: BOMLineItem[]
  }>
} {
  const categoryMap = new Map<string, BOMLineItem[]>()

  bom.items.forEach((item) => {
    const existing = categoryMap.get(item.category) ?? []
    existing.push(item)
    categoryMap.set(item.category, existing)
  })

  return {
    categories: Array.from(categoryMap.entries()).map(([name, items]) => ({
      name,
      items,
    })),
  }
}

/**
 * Export BOM to CSV format
 */
export function exportBOMToCSV(bom: BillOfMaterials): string {
  const headers = ['SKU', 'Description', 'Category', 'Quantity', 'Unit', 'Stock Status', 'Notes']
  const rows = bom.items.map((item) => [
    item.sku,
    `"${item.description.replace(/"/g, '""')}"`,
    item.category,
    item.quantity.toString(),
    item.unit,
    item.stockStatus,
    item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '',
  ])

  const csvContent = [
    `# Bill of Materials - ${bom.projectName}`,
    `# Generated: ${bom.generatedAt.toISOString()}`,
    `# Total Items: ${bom.summary.totalLineItems}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Get BOM summary text
 */
export function getBOMSummaryText(bom: BillOfMaterials): string {
  const { summary } = bom
  const lines = [
    `Bill of Materials: ${bom.projectName}`,
    `Generated: ${bom.generatedAt.toLocaleDateString()}`,
    '',
    `Total Line Items: ${summary.totalLineItems}`,
    `In Stock: ${summary.inStockCount}`,
    `On Demand: ${summary.onDemandCount}`,
  ]

  if (bom.warnings.length > 0) {
    lines.push('', 'Warnings:', ...bom.warnings.map((w) => `  • ${w}`))
  }

  return lines.join('\n')
}
