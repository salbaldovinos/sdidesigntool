import {
  Droplet,
  Filter,
  Gauge,
  LayoutGrid,
  Settings2,
  Waves,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'

export type CategoryId =
  | 'all'
  | 'dripTubing'
  | 'headworks'
  | 'zoneBoxes'
  | 'controlPanels'
  | 'flowMeters'
  | 'filters'
  | 'valves'
  | 'pressureRegulators'
  | 'airVents'
  | 'fittings'
  | 'accessories'

interface Category {
  id: CategoryId
  label: string
  icon: React.ReactNode
}

const categories: Category[] = [
  { id: 'all', label: 'All Products', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'dripTubing', label: 'Drip Tubing', icon: <Waves className="h-4 w-4" /> },
  { id: 'headworks', label: 'Headworks', icon: <Filter className="h-4 w-4" /> },
  { id: 'zoneBoxes', label: 'Zone Boxes', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'controlPanels', label: 'Control Panels', icon: <Zap className="h-4 w-4" /> },
  { id: 'flowMeters', label: 'Flow Meters', icon: <Gauge className="h-4 w-4" /> },
  { id: 'filters', label: 'Filters', icon: <Filter className="h-4 w-4" /> },
  { id: 'valves', label: 'Valves', icon: <Settings2 className="h-4 w-4" /> },
  { id: 'pressureRegulators', label: 'Pressure Regulators', icon: <Gauge className="h-4 w-4" /> },
  { id: 'airVents', label: 'Air Vents', icon: <Wind className="h-4 w-4" /> },
  { id: 'fittings', label: 'Fittings', icon: <Wrench className="h-4 w-4" /> },
  { id: 'accessories', label: 'Accessories', icon: <Droplet className="h-4 w-4" /> },
]

interface CategoryNavProps {
  selectedCategory: CategoryId
  onCategoryChange: (category: CategoryId) => void
  productCounts?: Record<CategoryId, number>
}

export function CategoryNav({ selectedCategory, onCategoryChange, productCounts }: CategoryNavProps) {
  return (
    <nav className="space-y-1">
      {categories.map((category) => {
        const isActive = selectedCategory === category.id
        const count = productCounts?.[category.id]

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            {category.icon}
            <span className="flex-1 text-left">{category.label}</span>
            {count !== undefined && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded
                ${isActive
                  ? 'bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export { categories }
