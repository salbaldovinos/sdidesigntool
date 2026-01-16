import { useState, useMemo } from 'react'
import { geoflowCatalog } from '@/data'
import type { BaseProduct } from '@/data/geoflow-products.types'
import { CategoryNav, type CategoryId } from '@/components/catalog/CategoryNav'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductFilters, type FilterState } from '@/components/catalog/ProductFilters'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Use a simpler product type that allows any additional fields
type AnyProduct = BaseProduct & { [key: string]: unknown }

interface FlattenedProduct {
  product: AnyProduct
  category: CategoryId
  categoryName: string
  subcategory?: string
}

// Flatten all products from the catalog into a single array
function flattenProducts(): FlattenedProduct[] {
  const products: FlattenedProduct[] = []

  // Drip Tubing
  const dripTubingLines = [
    { key: 'waterflowProClassic', data: geoflowCatalog.dripTubing.waterflowProClassic },
    { key: 'waterflowProPC', data: geoflowCatalog.dripTubing.waterflowProPC },
    { key: 'waterflowProBlank', data: geoflowCatalog.dripTubing.waterflowProBlank },
    { key: 'waterflowEcoPC', data: geoflowCatalog.dripTubing.waterflowEcoPC },
  ]
  for (const line of dripTubingLines) {
    for (const product of line.data.products) {
      products.push({
        product: product as unknown as AnyProduct,
        category: 'dripTubing',
        categoryName: 'Drip Tubing',
        subcategory: line.data.name,
      })
    }
  }

  // Headworks - multiple nested categories
  const headworksCategories = [
    geoflowCatalog.headworks.dripFilterEcoVortex,
    geoflowCatalog.headworks.dripFilterEcoBioDisc,
  ]
  for (const hw of headworksCategories) {
    for (const catKey of Object.keys(hw.categories)) {
      const cat = hw.categories[catKey]
      for (const product of cat.products) {
        products.push({
          product: product as unknown as AnyProduct,
          category: 'headworks',
          categoryName: 'Headworks',
          subcategory: hw.name,
        })
      }
    }
  }
  // DripFilterPro
  for (const product of geoflowCatalog.headworks.dripFilterPro.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'headworks',
      categoryName: 'Headworks',
      subcategory: 'DripFilterPRO Commercial',
    })
  }
  // Headworks Boxes
  for (const product of geoflowCatalog.headworks.boxes.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'headworks',
      categoryName: 'Headworks',
      subcategory: 'Boxes',
    })
  }

  // Zone Boxes
  for (const product of geoflowCatalog.zoneBoxes.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'zoneBoxes',
      categoryName: 'Zone Boxes',
    })
  }

  // Control Panels
  for (const product of geoflowCatalog.controlPanels.standard.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'controlPanels',
      categoryName: 'Control Panels',
    })
  }

  // Flow Meters
  const flowMeterTypes = [
    { key: 'multiJet', data: geoflowCatalog.flowMeters.multiJet },
    { key: 'digital', data: geoflowCatalog.flowMeters.digital },
    { key: 'electromagnetic', data: geoflowCatalog.flowMeters.electromagnetic },
  ]
  for (const fm of flowMeterTypes) {
    for (const product of fm.data.products) {
      products.push({
        product: product as unknown as AnyProduct,
        category: 'flowMeters',
        categoryName: 'Flow Meters',
        subcategory: fm.data.name,
      })
    }
  }

  // Filters
  // BioDisc
  for (const product of geoflowCatalog.filters.bioDisc.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'filters',
      categoryName: 'Filters',
      subcategory: 'BioDisc',
    })
  }
  for (const product of geoflowCatalog.filters.bioDisc.replacementParts) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'filters',
      categoryName: 'Filters',
      subcategory: 'BioDisc Replacement Parts',
    })
  }
  // Vortex
  for (const product of geoflowCatalog.filters.vortex.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'filters',
      categoryName: 'Filters',
      subcategory: 'Vortex',
    })
  }
  // Sim/Tech
  for (const product of geoflowCatalog.filters.simTechPressure.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'filters',
      categoryName: 'Filters',
      subcategory: 'Sim/Tech Pressure',
    })
  }

  // Valves
  const valveTypes = [
    { key: 'solenoid', data: geoflowCatalog.valves.solenoid },
    { key: 'actuated', data: geoflowCatalog.valves.actuated },
    { key: 'hydrotek', data: geoflowCatalog.valves.hydrotek },
    { key: 'diverter', data: geoflowCatalog.valves.diverter },
    { key: 'checkBall', data: geoflowCatalog.valves.checkBall },
    { key: 'checkSpring', data: geoflowCatalog.valves.checkSpring },
  ]
  for (const vt of valveTypes) {
    for (const product of vt.data.products) {
      products.push({
        product: product as unknown as AnyProduct,
        category: 'valves',
        categoryName: 'Valves',
        subcategory: vt.data.name,
      })
    }
  }

  // Pressure Regulators
  for (const product of geoflowCatalog.pressureRegulators.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'pressureRegulators',
      categoryName: 'Pressure Regulators',
    })
  }

  // Air Vents
  for (const product of geoflowCatalog.airVents.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'airVents',
      categoryName: 'Air Vents',
    })
  }
  for (const product of geoflowCatalog.airVents.boxes) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'airVents',
      categoryName: 'Air Vents',
      subcategory: 'Boxes',
    })
  }

  // Fittings
  // Lockslip for WaterflowPro
  for (const product of geoflowCatalog.fittings.lockslip.forWaterflowPro) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'fittings',
      categoryName: 'Fittings',
      subcategory: 'Lockslip (WaterflowPRO)',
    })
  }
  // Lockslip for WaterflowEco
  for (const product of geoflowCatalog.fittings.lockslip.forWaterflowEco) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'fittings',
      categoryName: 'Fittings',
      subcategory: 'Lockslip (WaterflowECO)',
    })
  }
  // Flex Loops/Risers
  for (const product of geoflowCatalog.fittings.lockslip.flexLoopsRisers) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'fittings',
      categoryName: 'Fittings',
      subcategory: 'Flex Loops & Risers',
    })
  }
  // Saddle Tees
  for (const product of geoflowCatalog.fittings.saddleTees.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'fittings',
      categoryName: 'Fittings',
      subcategory: 'Saddle Tees',
    })
  }

  // Accessories
  for (const product of geoflowCatalog.accessories.pressureGauges.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'accessories',
      categoryName: 'Accessories',
      subcategory: 'Pressure Gauges',
    })
  }
  for (const product of geoflowCatalog.accessories.unions.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'accessories',
      categoryName: 'Accessories',
      subcategory: 'Unions',
    })
  }
  for (const product of geoflowCatalog.accessories.grommets.products) {
    products.push({
      product: product as unknown as AnyProduct,
      category: 'accessories',
      categoryName: 'Accessories',
      subcategory: 'Grommets',
    })
  }

  return products
}

const PRODUCTS_PER_PAGE = 24

export function CatalogView() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    stockStatus: 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Get all flattened products
  const allProducts = useMemo(() => flattenProducts(), [])

  // Calculate product counts per category
  const productCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: allProducts.length,
      dripTubing: 0,
      headworks: 0,
      zoneBoxes: 0,
      controlPanels: 0,
      flowMeters: 0,
      filters: 0,
      valves: 0,
      pressureRegulators: 0,
      airVents: 0,
      fittings: 0,
      accessories: 0,
    }
    for (const p of allProducts) {
      counts[p.category]++
    }
    return counts
  }, [allProducts])

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = allProducts

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.product.partNumber.toLowerCase().includes(searchLower) ||
          p.product.description.toLowerCase().includes(searchLower) ||
          (p.product.previousPartNumber?.toLowerCase().includes(searchLower) ?? false)
      )
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      result = result.filter((p) => {
        const stockLower = p.product.stock.toLowerCase()
        switch (filters.stockStatus) {
          case 'in-stock':
            return stockLower === 'in stock'
          case 'on-demand':
            return stockLower === 'on demand'
          case 'discontinued':
            return stockLower.includes('discontinued')
          default:
            return true
        }
      })
    }

    return result
  }, [allProducts, selectedCategory, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  // Reset page when filters change
  const handleCategoryChange = (category: CategoryId) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop Category Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Categories</h2>
          <CategoryNav
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            productCounts={productCounts}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Category Select */}
        <div className="lg:hidden mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Products ({productCounts.all})</option>
            <option value="dripTubing">Drip Tubing ({productCounts.dripTubing})</option>
            <option value="headworks">Headworks ({productCounts.headworks})</option>
            <option value="zoneBoxes">Zone Boxes ({productCounts.zoneBoxes})</option>
            <option value="controlPanels">Control Panels ({productCounts.controlPanels})</option>
            <option value="flowMeters">Flow Meters ({productCounts.flowMeters})</option>
            <option value="filters">Filters ({productCounts.filters})</option>
            <option value="valves">Valves ({productCounts.valves})</option>
            <option value="pressureRegulators">Pressure Regulators ({productCounts.pressureRegulators})</option>
            <option value="airVents">Air Vents ({productCounts.airVents})</option>
            <option value="fittings">Fittings ({productCounts.fittings})</option>
            <option value="accessories">Accessories ({productCounts.accessories})</option>
          </select>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            resultCount={filteredProducts.length}
          />
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedProducts.map((item, index) => (
              <ProductCard
                key={`${item.product.partNumber}-${index}`}
                product={item.product}
                categoryName={item.subcategory || item.categoryName}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
            <button
              onClick={() => {
                setFilters({ search: '', stockStatus: 'all' })
                setSelectedCategory('all')
              }}
              className="mt-2 text-teal-600 dark:text-teal-400 hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
