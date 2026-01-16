// Product Availability Validation Rules
// Rules that check product stock status and availability

import type { ValidationRule, StockStatus, DesignState } from '@/types/assistant'
import {
  getAllDripTubing,
  getAllControlPanels,
  getAllHydrotekValves,
  getAllZoneBoxes,
  getAllPressureRegulators,
  getAllFlowMeters,
} from '@/data'

// Helper to normalize stock status for comparison
function normalizeStockStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}

// Helper to check if a product is discontinued
function isDiscontinued(status: string): boolean {
  const normalized = normalizeStockStatus(status)
  return normalized === 'discontinued'
}

// Helper to check if a product is being discontinued
function isBeingDiscontinued(status: string): boolean {
  const normalized = normalizeStockStatus(status)
  return normalized === 'to-be-discontinued'
}

// Helper to check if a product is on demand
function isOnDemand(status: string): boolean {
  const normalized = normalizeStockStatus(status)
  return normalized === 'on-demand'
}

// Helper to check if a product is low stock
function isLowStock(status: string): boolean {
  const normalized = normalizeStockStatus(status)
  return normalized === 'low-stock'
}

// Get product stock status from catalog by SKU
function getProductStatus(sku: string): StockStatus | null {
  // Check drip tubing
  const dripProducts = getAllDripTubing()
  const dripProduct = dripProducts.find((p) => p.partNumber === sku)
  if (dripProduct) return dripProduct.stock

  // Check control panels
  const panels = getAllControlPanels()
  const panel = panels.find((p) => p.partNumber === sku)
  if (panel) return panel.stock

  // Check Hydrotek valves
  const hydrotek = getAllHydrotekValves()
  const valve = hydrotek.find((v) => v.partNumber === sku)
  if (valve) return valve.stock

  // Check zone boxes
  const zoneBoxes = getAllZoneBoxes()
  const zoneBox = zoneBoxes.find((zb) => zb.partNumber === sku)
  if (zoneBox) return zoneBox.stock

  // Check pressure regulators
  const regulators = getAllPressureRegulators()
  const regulator = regulators.find((r) => r.partNumber === sku)
  if (regulator) return regulator.stock

  // Check flow meters
  const meters = getAllFlowMeters()
  const meter = meters.find((m) => m.partNumber === sku)
  if (meter) return meter.stock

  return null
}

// Get all selected products from state
function getSelectedProductSkus(state: DesignState): string[] {
  const skus: string[] = []
  const { selectedProducts } = state

  if (selectedProducts?.dripTubingSku) skus.push(selectedProducts.dripTubingSku)
  if (selectedProducts?.headworksSku) skus.push(selectedProducts.headworksSku)
  if (selectedProducts?.hydrotekValveSku) skus.push(selectedProducts.hydrotekValveSku)
  if (selectedProducts?.zoneBoxSku) skus.push(selectedProducts.zoneBoxSku)
  if (selectedProducts?.controlPanelSku) skus.push(selectedProducts.controlPanelSku)
  if (selectedProducts?.pressureRegulatorSku) skus.push(selectedProducts.pressureRegulatorSku)
  if (selectedProducts?.flowMeterSku) skus.push(selectedProducts.flowMeterSku)

  return skus
}

export const productAvailabilityRules: ValidationRule[] = [
  // Rule: Discontinued product selected
  {
    id: 'availability-discontinued',
    name: 'Discontinued Product Selected',
    description: 'A selected product has been discontinued',
    category: 'product-availability',
    severity: 'warning',
    appliesTo: [1, 5],
    condition: (state) => {
      const skus = getSelectedProductSkus(state)
      return skus.some((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isDiscontinued(status)
      })
    },
    message: (state) => {
      const skus = getSelectedProductSkus(state)
      const discontinued = skus.filter((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isDiscontinued(status)
      })

      if (discontinued.length === 1) {
        return `Product ${discontinued[0]} has been discontinued. Please select an alternative product.`
      }
      return `${discontinued.length} selected products have been discontinued. Please select alternatives.`
    },
    source: () => 'Geoflow Product Catalog',
  },

  // Rule: Product being phased out
  {
    id: 'availability-phasing-out',
    name: 'Product Being Discontinued',
    description: 'A selected product is scheduled to be discontinued',
    category: 'product-availability',
    severity: 'warning',
    appliesTo: [1, 5],
    condition: (state) => {
      const skus = getSelectedProductSkus(state)
      return skus.some((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isBeingDiscontinued(status)
      })
    },
    message: (state) => {
      const skus = getSelectedProductSkus(state)
      const phasingOut = skus.filter((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isBeingDiscontinued(status)
      })

      return `Product ${phasingOut.join(', ')} is scheduled to be discontinued. Consider selecting an alternative for future orders.`
    },
    source: () => 'Geoflow Product Catalog',
  },

  // Rule: On-demand products selected
  {
    id: 'availability-on-demand',
    name: 'On-Demand Products',
    description: 'Selected products require lead time for manufacturing',
    category: 'product-availability',
    severity: 'info',
    appliesTo: [1, 5],
    condition: (state) => {
      const skus = getSelectedProductSkus(state)
      return skus.some((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isOnDemand(status)
      })
    },
    message: (state) => {
      const skus = getSelectedProductSkus(state)
      const onDemand = skus.filter((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isOnDemand(status)
      })

      if (onDemand.length === 1) {
        return `Product ${onDemand[0]} is made on demand. Allow 2-4 weeks lead time for manufacturing.`
      }
      return `${onDemand.length} products are made on demand. Allow 2-4 weeks lead time for manufacturing.`
    },
    source: () => 'Geoflow Order Processing: On-demand items typically ship in 2-4 weeks',
  },

  // Rule: Low stock warning
  {
    id: 'availability-low-stock',
    name: 'Low Stock Alert',
    description: 'Selected product has limited availability',
    category: 'product-availability',
    severity: 'info',
    appliesTo: [1, 5],
    condition: (state) => {
      const skus = getSelectedProductSkus(state)
      return skus.some((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isLowStock(status)
      })
    },
    message: (state) => {
      const skus = getSelectedProductSkus(state)
      const lowStock = skus.filter((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isLowStock(status)
      })

      return `Product ${lowStock.join(', ')} has low stock. Contact Geoflow to confirm availability before ordering.`
    },
    source: () => 'Geoflow Inventory Status',
  },

  // Rule: Multiple on-demand items
  {
    id: 'availability-multiple-on-demand',
    name: 'Multiple Lead Time Items',
    description: 'Several products in design require manufacturing lead time',
    category: 'product-availability',
    severity: 'suggestion',
    appliesTo: [5],
    condition: (state) => {
      const skus = getSelectedProductSkus(state)
      const onDemandCount = skus.filter((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isOnDemand(status)
      }).length

      return onDemandCount >= 3
    },
    message: (state) => {
      const skus = getSelectedProductSkus(state)
      const onDemandCount = skus.filter((sku) => {
        const status = getProductStatus(sku)
        return status !== null && isOnDemand(status)
      }).length

      return `${onDemandCount} products require on-demand manufacturing. Consider placing order early to accommodate combined lead times. Contact Geoflow for expedited options.`
    },
    source: () => 'Geoflow Order Processing',
  },

  // Rule: All products in stock (positive feedback)
  {
    id: 'availability-all-in-stock',
    name: 'All Products In Stock',
    description: 'All selected products are in stock',
    category: 'product-availability',
    severity: 'info',
    appliesTo: [5],
    condition: (state) => {
      const skus = getSelectedProductSkus(state)
      if (skus.length === 0) return false

      // Check that ALL products are in stock
      return skus.every((sku) => {
        const status = getProductStatus(sku)
        if (!status) return true // If status unknown, don't block
        const normalized = normalizeStockStatus(status)
        return normalized === 'in-stock'
      })
    },
    message: () => {
      return `All selected products are in stock and ready to ship.`
    },
    source: () => 'Geoflow Inventory Status',
  },
]
