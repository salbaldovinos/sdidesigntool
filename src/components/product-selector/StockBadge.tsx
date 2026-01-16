// Stock Status Badge Component
// Color-coded badge showing product availability

import { cn } from '@/lib/utils'
import type { StockStatus } from '@/types/assistant'

interface StockBadgeProps {
  status: StockStatus | string
  size?: 'sm' | 'md'
  className?: string
}

// Normalize stock status string for comparison
function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}

// Get badge styling based on status
function getStatusConfig(status: string): {
  bgColor: string
  textColor: string
  label: string
} {
  const normalized = normalizeStatus(status)

  switch (normalized) {
    case 'in-stock':
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        label: 'In Stock',
      }
    case 'on-demand':
      return {
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-300',
        label: 'On Demand',
      }
    case 'low-stock':
      return {
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        label: 'Low Stock',
      }
    case 'to-be-discontinued':
      return {
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        label: 'Phasing Out',
      }
    case 'discontinued':
      return {
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        label: 'Discontinued',
      }
    default:
      return {
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-400',
        label: status,
      }
  }
}

export function StockBadge({ status, size = 'sm', className }: StockBadgeProps) {
  const config = getStatusConfig(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgColor,
        config.textColor,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
    >
      {config.label}
    </span>
  )
}

// Helper component for showing lead time info
export function LeadTimeNote({ status }: { status: StockStatus | string }) {
  const normalized = normalizeStatus(status)

  if (normalized === 'on-demand') {
    return (
      <span className="text-xs text-amber-600 dark:text-amber-400">
        2-4 week lead time
      </span>
    )
  }

  if (normalized === 'to-be-discontinued') {
    return (
      <span className="text-xs text-orange-600 dark:text-orange-400">
        Limited availability - consider alternatives
      </span>
    )
  }

  if (normalized === 'discontinued') {
    return (
      <span className="text-xs text-red-600 dark:text-red-400">
        No longer available - select alternative
      </span>
    )
  }

  return null
}
