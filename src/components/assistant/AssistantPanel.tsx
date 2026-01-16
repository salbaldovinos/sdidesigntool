// Smart Design Assistant Panel
// Shows real-time validation feedback based on current design state

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DesignFeedback, FeedbackSeverity } from '@/types/assistant'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface AssistantPanelProps {
  feedback: DesignFeedback[]
  title?: string
  className?: string
  defaultExpanded?: boolean
  showEmptyState?: boolean
}

// Severity configuration for styling and icons
const severityConfig: Record<
  FeedbackSeverity,
  {
    icon: typeof AlertCircle
    bgColor: string
    borderColor: string
    textColor: string
    iconColor: string
    label: string
  }
> = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500 dark:text-red-400',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500 dark:text-amber-400',
    label: 'Warning',
  },
  suggestion: {
    icon: Lightbulb,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500 dark:text-blue-400',
    label: 'Suggestion',
  },
  info: {
    icon: Info,
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
    iconColor: 'text-gray-500 dark:text-gray-400',
    label: 'Info',
  },
}

// Individual feedback item component
function FeedbackItem({ item }: { item: DesignFeedback }) {
  const config = severityConfig[item.severity]
  const Icon = config.icon
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn('font-medium text-sm', config.textColor)}>
              {item.title}
            </h4>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full whitespace-nowrap',
                config.bgColor,
                config.textColor,
                'border',
                config.borderColor
              )}
            >
              {config.label}
            </span>
          </div>
          <p className={cn('text-sm mt-1', config.textColor, 'opacity-90')}>
            {item.message}
          </p>
          {item.source && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'text-xs mt-2 flex items-center gap-1 hover:underline',
                config.textColor,
                'opacity-70 hover:opacity-100'
              )}
            >
              {isExpanded ? (
                <>
                  Hide source <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show source <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
          {isExpanded && item.source && (
            <p
              className={cn(
                'text-xs mt-2 p-2 rounded',
                'bg-white/50 dark:bg-black/20',
                config.textColor,
                'opacity-80 italic'
              )}
            >
              {item.source}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Empty state when no issues
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-3">
        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100">
        Looking good!
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        No issues detected with your current design.
      </p>
    </div>
  )
}

// Summary badge showing counts
function FeedbackSummary({ feedback }: { feedback: DesignFeedback[] }) {
  const counts = {
    error: feedback.filter((f) => f.severity === 'error').length,
    warning: feedback.filter((f) => f.severity === 'warning').length,
    suggestion: feedback.filter((f) => f.severity === 'suggestion').length,
    info: feedback.filter((f) => f.severity === 'info').length,
  }

  const badges = [
    { count: counts.error, color: 'bg-red-500', label: 'errors' },
    { count: counts.warning, color: 'bg-amber-500', label: 'warnings' },
    { count: counts.suggestion, color: 'bg-blue-500', label: 'suggestions' },
    { count: counts.info, color: 'bg-gray-500', label: 'info' },
  ].filter((b) => b.count > 0)

  if (badges.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white',
            badge.color
          )}
        >
          {badge.count} {badge.count === 1 ? badge.label.slice(0, -1) : badge.label}
        </span>
      ))}
    </div>
  )
}

export function AssistantPanel({
  feedback,
  title = 'Design Assistant',
  className,
  defaultExpanded = true,
  showEmptyState = true,
}: AssistantPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  const hasIssues = feedback.length > 0
  const hasErrors = feedback.some((f) => f.severity === 'error')

  return (
    <Card
      className={cn(
        'dark:bg-gray-800 dark:border-gray-700',
        hasErrors && 'border-red-200 dark:border-red-800',
        className
      )}
    >
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <CardTitle className="text-base dark:text-gray-100">
              {title}
            </CardTitle>
            {hasIssues && !isExpanded && <FeedbackSummary feedback={feedback} />}
          </div>
          <div className="flex items-center gap-2">
            {!hasIssues && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          {hasIssues ? (
            <div className="space-y-3">
              {feedback.map((item) => (
                <FeedbackItem key={item.id} item={item} />
              ))}
            </div>
          ) : showEmptyState ? (
            <EmptyState />
          ) : null}
        </CardContent>
      )}
    </Card>
  )
}

// Re-export the hook from the dedicated hooks file for convenience
export { useAssistantFeedback } from '@/hooks/useAssistant'
