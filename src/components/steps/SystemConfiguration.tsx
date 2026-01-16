// Step 5: System Configuration
// Component selection based on design parameters

import * as React from 'react'
import { useDesignStore } from '@/stores/designStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StockBadge } from '@/components/product-selector'
import { generateRecommendations, getRecommendationSummary } from '@/assistant/recommendation-engine'
import { BillOfMaterialsView } from '@/components/bom'
import type { SystemRecommendations, ComponentRecommendation } from '@/types/assistant'
import {
  Package,
  Settings,
  Gauge,
  Activity,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Product option component for selection
function ProductOption({
  product,
  isSelected,
  onSelect,
}: {
  product: ComponentRecommendation
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors',
        isSelected
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {product.name}
            </span>
            {product.isTopChoice && (
              <span className="text-xs px-1.5 py-0.5 bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 rounded">
                Recommended
              </span>
            )}
            <StockBadge status={product.stockStatus} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {product.reason}
          </p>
          {product.warnings && product.warnings.length > 0 && (
            <div className="flex items-start gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{product.warnings[0]}</span>
            </div>
          )}
        </div>
        {isSelected && (
          <Check className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
        )}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
        {product.sku}
      </div>
    </button>
  )
}

// Collapsible section component
function SelectionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-base dark:text-gray-100">{title}</CardTitle>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </CardHeader>
      {isOpen && <CardContent className="pt-2">{children}</CardContent>}
    </Card>
  )
}

export function SystemConfiguration() {
  const { designInputs, results, selectedProducts, updateSelectedProducts } =
    useDesignStore()

  // Generate recommendations based on current design
  const recommendations = React.useMemo<SystemRecommendations>(() => {
    return generateRecommendations({
      designInputs,
      systemLayout: [],
      results,
    })
  }, [designInputs, results])

  const summary = React.useMemo(
    () => getRecommendationSummary(recommendations),
    [recommendations]
  )

  // Auto-select top choices on first render if nothing selected
  React.useEffect(() => {
    if (!selectedProducts.headworksSku && recommendations.headworks.length > 0) {
      const topChoice = recommendations.headworks.find((h) => h.isTopChoice)
      if (topChoice) {
        updateSelectedProducts({ headworksSku: topChoice.sku })
      }
    }
  }, [recommendations.headworks, selectedProducts.headworksSku, updateSelectedProducts])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          System Configuration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select equipment for your SDI system based on design calculations.
        </p>
      </div>

      {/* Design Summary */}
      <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-teal-700 dark:text-teal-300">
                Flow per Zone
              </Label>
              <p className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                {results?.flowPerZone?.toFixed(1) ?? '—'} GPM
              </p>
            </div>
            <div>
              <Label className="text-xs text-teal-700 dark:text-teal-300">
                Number of Zones
              </Label>
              <p className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                {designInputs?.numberOfZones ?? '—'} zones
              </p>
            </div>
            <div>
              <Label className="text-xs text-teal-700 dark:text-teal-300">
                Operating Pressure
              </Label>
              <p className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                {designInputs?.operatingPressurePSI ?? '—'} PSI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {recommendations.warnings.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Design Warnings
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                  {recommendations.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Headworks Selection */}
      <SelectionSection title="Headworks" icon={Package}>
        {recommendations.headworks.length > 0 ? (
          <div className="space-y-2">
            {recommendations.headworks.map((product) => (
              <ProductOption
                key={product.sku}
                product={product}
                isSelected={selectedProducts.headworksSku === product.sku}
                onSelect={() =>
                  updateSelectedProducts({ headworksSku: product.sku })
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suitable headworks found for this design.
          </p>
        )}
      </SelectionSection>

      {/* Zone Control Selection */}
      <SelectionSection title="Zone Control" icon={Settings}>
        <div className="space-y-4">
          {/* Zone control type selection */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {recommendations.zoneControl.reason}
            </p>
            <div className="flex gap-2">
              {recommendations.zoneControl.hydrotek &&
                recommendations.zoneControl.hydrotek.length > 0 && (
                  <Button
                    variant={
                      selectedProducts.zoneControlType === 'hydrotek'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      updateSelectedProducts({
                        zoneControlType: 'hydrotek',
                        zoneBoxSku: undefined,
                        controlPanelSku: undefined,
                      })
                    }
                  >
                    Hydrotek Indexing
                  </Button>
                )}
              {recommendations.zoneControl.zoneBoxes &&
                recommendations.zoneControl.zoneBoxes.length > 0 && (
                  <Button
                    variant={
                      selectedProducts.zoneControlType === 'solenoid'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      updateSelectedProducts({
                        zoneControlType: 'solenoid',
                        hydrotekValveSku: undefined,
                      })
                    }
                  >
                    Solenoid Zone Box
                  </Button>
                )}
            </div>
          </div>

          {/* Hydrotek options */}
          {selectedProducts.zoneControlType === 'hydrotek' &&
            recommendations.zoneControl.hydrotek && (
              <div className="space-y-2">
                <Label className="text-sm">Select Hydrotek Valve</Label>
                {recommendations.zoneControl.hydrotek.map((product) => (
                  <ProductOption
                    key={product.sku}
                    product={product}
                    isSelected={selectedProducts.hydrotekValveSku === product.sku}
                    onSelect={() =>
                      updateSelectedProducts({ hydrotekValveSku: product.sku })
                    }
                  />
                ))}
              </div>
            )}

          {/* Zone box options */}
          {selectedProducts.zoneControlType === 'solenoid' &&
            recommendations.zoneControl.zoneBoxes && (
              <div className="space-y-2">
                <Label className="text-sm">Select Zone Box</Label>
                {recommendations.zoneControl.zoneBoxes.map((product) => (
                  <ProductOption
                    key={product.sku}
                    product={product}
                    isSelected={selectedProducts.zoneBoxSku === product.sku}
                    onSelect={() =>
                      updateSelectedProducts({ zoneBoxSku: product.sku })
                    }
                  />
                ))}
              </div>
            )}
        </div>
      </SelectionSection>

      {/* Control Panel (if solenoid selected) */}
      {selectedProducts.zoneControlType === 'solenoid' && (
        <SelectionSection title="Control Panel" icon={Settings} defaultOpen={true}>
          {recommendations.controlPanels.length > 0 ? (
            <div className="space-y-2">
              {recommendations.controlPanels.map((product) => (
                <ProductOption
                  key={product.sku}
                  product={product}
                  isSelected={selectedProducts.controlPanelSku === product.sku}
                  onSelect={() =>
                    updateSelectedProducts({ controlPanelSku: product.sku })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No suitable control panels found.
            </p>
          )}
        </SelectionSection>
      )}

      {/* Pressure Regulator */}
      <SelectionSection title="Pressure Regulator" icon={Gauge}>
        {recommendations.pressureRegulators.length > 0 ? (
          <div className="space-y-2">
            {recommendations.pressureRegulators.map((product) => (
              <ProductOption
                key={product.sku}
                product={product}
                isSelected={selectedProducts.pressureRegulatorSku === product.sku}
                onSelect={() =>
                  updateSelectedProducts({ pressureRegulatorSku: product.sku })
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suitable pressure regulators found.
          </p>
        )}
      </SelectionSection>

      {/* Flow Meter */}
      <SelectionSection title="Flow Meter" icon={Activity}>
        {recommendations.flowMeters.length > 0 ? (
          <div className="space-y-2">
            {recommendations.flowMeters.map((product) => (
              <ProductOption
                key={product.sku}
                product={product}
                isSelected={selectedProducts.flowMeterSku === product.sku}
                onSelect={() =>
                  updateSelectedProducts({ flowMeterSku: product.sku })
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suitable flow meters found.
          </p>
        )}
      </SelectionSection>

      {/* Selection Summary */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-gray-100">
            Selection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Products Selected
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Object.values(selectedProducts).filter(Boolean).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">In Stock</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {summary.inStock}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">On Demand</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {summary.onDemand}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill of Materials Section */}
      <SelectionSection title="Bill of Materials" icon={ClipboardList} defaultOpen={false}>
        <BillOfMaterialsView />
      </SelectionSection>
    </div>
  )
}
