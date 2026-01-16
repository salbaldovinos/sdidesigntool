import { Search, X } from 'lucide-react'

export interface FilterState {
  search: string
  stockStatus: 'all' | 'in-stock' | 'on-demand' | 'discontinued'
}

interface ProductFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
}

export function ProductFilters({ filters, onFiltersChange, resultCount }: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by part number or description..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stock Status Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Stock:</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'All' },
            { value: 'in-stock', label: 'In Stock' },
            { value: 'on-demand', label: 'On Demand' },
            { value: 'discontinued', label: 'Discontinued' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onFiltersChange({ ...filters, stockStatus: option.value as FilterState['stockStatus'] })}
              className={`
                px-2.5 py-1 text-xs font-medium rounded-full transition-colors
                ${filters.stockStatus === option.value
                  ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {resultCount} {resultCount === 1 ? 'product' : 'products'} found
      </div>
    </div>
  )
}
