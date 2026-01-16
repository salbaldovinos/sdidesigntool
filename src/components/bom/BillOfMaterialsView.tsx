// Bill of Materials View Component
// Displays the generated BOM with export options

import * as React from 'react'
import { useDesignStore } from '@/stores/designStore'
import { generateBOM, formatBOMForDisplay, exportBOMToCSV } from '@/assistant/bom-generator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StockBadge } from '@/components/product-selector'
import type { BillOfMaterials, BOMLineItem } from '@/types/assistant'
import {
  FileSpreadsheet,
  Printer,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Category section component
function BOMCategory({
  name,
  items,
  defaultOpen = true,
}: {
  name: string
  items: BOMLineItem[]
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({items.length} items)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item, index) => (
            <div
              key={`${item.sku}-${index}`}
              className="px-4 py-3 bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {item.sku}
                    </span>
                    <StockBadge status={item.stockStatus} size="sm" />
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {item.description}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {item.quantity.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    {item.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Summary card component
function BOMSummary({ bom }: { bom: BillOfMaterials }) {
  const { summary } = bom

  return (
    <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
              {summary.totalLineItems}
            </p>
            <p className="text-xs text-teal-700 dark:text-teal-300">Line Items</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {summary.inStockCount}
              </p>
            </div>
            <p className="text-xs text-teal-700 dark:text-teal-300">In Stock</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {summary.onDemandCount}
              </p>
            </div>
            <p className="text-xs text-teal-700 dark:text-teal-300">On Demand</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
              {bom.warnings.length}
            </p>
            <p className="text-xs text-teal-700 dark:text-teal-300">Warnings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BillOfMaterialsView() {
  const { designInputs, results, selectedProducts } = useDesignStore()

  // Generate BOM from current state
  const bom = React.useMemo(() => {
    return generateBOM(
      {
        designInputs,
        systemLayout: [],
        results,
        selectedProducts,
      },
      designInputs?.projectName ?? 'SDI System Design'
    )
  }, [designInputs, results, selectedProducts])

  // Format for display
  const formattedBOM = React.useMemo(() => formatBOMForDisplay(bom), [bom])

  // Handle CSV export
  const handleExportCSV = React.useCallback(() => {
    const csv = exportBOMToCSV(bom)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bom-${bom.projectName.replace(/\s+/g, '-').toLowerCase()}-${
      new Date().toISOString().split('T')[0]
    }.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [bom])

  // Handle print
  const handlePrint = React.useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Bill of Materials
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {bom.projectName} • Generated{' '}
            {bom.generatedAt.toLocaleDateString()}
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <BOMSummary bom={bom} />

      {/* Warnings */}
      {bom.warnings.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  BOM Warnings
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                  {bom.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOM Items by Category */}
      <div className="space-y-4">
        {formattedBOM.categories.length > 0 ? (
          formattedBOM.categories.map((category) => (
            <BOMCategory
              key={category.name}
              name={category.name}
              items={category.items}
            />
          ))
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                No items in Bill of Materials
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Select products in the System Configuration step to generate a BOM.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print-only section */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500">
          Generated by GeoFlow SDI Designer • {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}
