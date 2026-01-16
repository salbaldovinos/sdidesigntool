// Drip Tube Selector Component
// Dropdown for selecting Geoflow drip tubing products

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getAllDripTubing } from '@/data'
import { StockBadge, LeadTimeNote } from './StockBadge'
import { ChevronDown, Check, Droplets, Info } from 'lucide-react'
import type { StockStatus } from '@/types/assistant'

interface DripTubeSelectorProps {
  value?: string // Selected SKU
  onChange: (sku: string) => void
  className?: string
}

// Group tubing by product line
type TubingGroup = {
  name: string
  description: string
  pressureCompensating: boolean
  products: Array<{
    partNumber: string
    description: string
    emitterSpacing?: number
    flowRate?: number
    stock: string
    lineName: string
  }>
}

export function DripTubeSelector({
  value,
  onChange,
  className,
}: DripTubeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Get all tubing and group by product line
  const allTubing = React.useMemo(() => getAllDripTubing(), [])

  const groups = React.useMemo<TubingGroup[]>(() => {
    const groupMap = new Map<string, TubingGroup>()

    allTubing.forEach((tube) => {
      const key = tube.lineName
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          name: key,
          description: tube.pressureCompensating
            ? 'Pressure Compensating'
            : 'Non-PC',
          pressureCompensating: tube.pressureCompensating,
          products: [],
        })
      }
      groupMap.get(key)!.products.push(tube)
    })

    // Sort groups: PRO PC first, then PRO Classic, then ECO
    return Array.from(groupMap.values()).sort((a, b) => {
      const order = ['WaterflowPRO PC', 'WaterflowPRO Classic', 'WaterflowECO PC']
      return order.indexOf(a.name) - order.indexOf(b.name)
    })
  }, [allTubing])

  // Get selected product details
  const selectedProduct = React.useMemo(() => {
    if (!value) return null
    return allTubing.find((t) => t.partNumber === value)
  }, [value, allTubing])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5',
          'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg',
          'text-left text-sm',
          'hover:border-teal-500 dark:hover:border-teal-400',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          'transition-colors'
        )}
      >
        {selectedProduct ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedProduct.lineName}
              </span>
              <StockBadge status={selectedProduct.stock as StockStatus} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {selectedProduct.emitterSpacing}" spacing •{' '}
              {selectedProduct.flowRate} GPH •{' '}
              {selectedProduct.pressureCompensating ? 'PC' : 'Non-PC'}
            </div>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            Select drip tubing...
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full',
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            'max-h-80 overflow-auto'
          )}
        >
          {/* Recommendation Note */}
          <div className="px-3 py-2 bg-teal-50 dark:bg-teal-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2 text-xs text-teal-700 dark:text-teal-300">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>WaterflowPRO</strong> with Rootguard is recommended for
                wastewater applications.
              </span>
            </div>
          </div>

          {/* Product Groups */}
          {groups.map((group) => (
            <div key={group.name}>
              {/* Group Header */}
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {group.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({group.description})
                  </span>
                </div>
              </div>

              {/* Products in Group */}
              {group.products.map((product) => (
                <button
                  key={product.partNumber}
                  type="button"
                  onClick={() => {
                    onChange(product.partNumber)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 text-left',
                    'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    'transition-colors',
                    value === product.partNumber &&
                      'bg-teal-50 dark:bg-teal-900/20'
                  )}
                >
                  {/* Check mark */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {value === product.partNumber && (
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {product.emitterSpacing}" spacing
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ~{product.flowRate} GPH
                      </span>
                      <StockBadge status={product.stock as StockStatus} />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {product.partNumber}
                    </div>
                    <LeadTimeNote status={product.stock as StockStatus} />
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Selected Product Details */}
      {selectedProduct && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Part Number:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {selectedProduct.partNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Emitter Spacing:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {selectedProduct.emitterSpacing}"
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Flow Rate:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {selectedProduct.flowRate} GPH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {selectedProduct.pressureCompensating ? 'Pressure Compensating' : 'Non-PC'}
              </span>
            </div>
            {selectedProduct.lineName.includes('ECO') && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> WaterflowECO does not include Rootguard
                root barrier treatment.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
