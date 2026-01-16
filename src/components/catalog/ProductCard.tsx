import type { BaseProduct } from '@/data/geoflow-products.types'

type AnyProduct = BaseProduct & { [key: string]: unknown }

interface ProductCardProps {
  product: AnyProduct
  categoryName: string
}

function getStockBadgeColor(stock: string): string {
  const stockLower = stock.toLowerCase()
  if (stockLower === 'in stock') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  if (stockLower === 'on demand') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
  if (stockLower.includes('discontinued')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  if (stockLower === 'low stock') {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  // Extract key specs to display
  const specs: string[] = []

  // Add common specs based on what's available
  if ('size' in product && product.size) {
    const unit = ('sizeUnit' in product ? product.sizeUnit : 'in') as string
    specs.push(`${product.size}${unit}`)
  }
  if ('flowRate' in product && product.flowRate) {
    const unit = ('flowRateUnit' in product ? product.flowRateUnit : 'gph') as string
    specs.push(`${product.flowRate} ${unit}`)
  }
  if ('emitterSpacing' in product && product.emitterSpacing) {
    const unit = ('emitterSpacingUnit' in product ? product.emitterSpacingUnit : 'in') as string
    specs.push(`${product.emitterSpacing}${unit} spacing`)
  }
  if ('minFlow' in product && 'maxFlow' in product) {
    const unit = ('flowUnit' in product ? product.flowUnit : 'gpm') as string
    specs.push(`${product.minFlow}-${product.maxFlow} ${unit}`)
  }
  if ('pressure' in product && product.pressure) {
    const unit = ('pressureUnit' in product ? product.pressureUnit : 'psi') as string
    specs.push(`${product.pressure} ${unit}`)
  }
  if ('zones' in product && product.zones) {
    specs.push(`${product.zones} zone${(product.zones as number) > 1 ? 's' : ''}`)
  }
  if ('filterSize' in product && product.filterSize) {
    const unit = ('filterSizeUnit' in product ? product.filterSizeUnit : 'in') as string
    specs.push(`${product.filterSize}${unit} filter`)
  }
  if ('voltage' in product && product.voltage) {
    specs.push(`${product.voltage}`)
  }
  if ('maxHP' in product && product.maxHP) {
    specs.push(`${product.maxHP} HP max`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-medium text-teal-600 dark:text-teal-400 truncate">
            {product.partNumber}
          </p>
          {product.previousPartNumber && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              Prev: {product.previousPartNumber}
            </p>
          )}
        </div>
        <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${getStockBadgeColor(product.stock)}`}>
          {product.stock}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
        {product.description}
      </p>

      {/* Specs */}
      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {specs.slice(0, 4).map((spec, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span>{categoryName}</span>
        {product.weight && (
          <span>{product.weight} {product.weightUnit || 'lbs'}</span>
        )}
      </div>
    </div>
  )
}
