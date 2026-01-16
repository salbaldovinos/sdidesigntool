// Validation Engine
// Runs validation rules against design state and returns feedback

import type { DesignState, DesignFeedback } from '@/types/assistant'
import { SEVERITY_ORDER, sortBySeverity } from '@/types/assistant'
import { allValidationRules, getRulesForStep } from './rules'

/**
 * Validate design state against all applicable rules
 * @param state - Current design state
 * @param step - Optional wizard step number to filter rules (1-5)
 * @returns Array of design feedback items sorted by severity
 */
export function validateDesign(
  state: DesignState,
  step?: number
): DesignFeedback[] {
  const rules = step !== undefined ? getRulesForStep(step) : allValidationRules
  const feedback: DesignFeedback[] = []

  for (const rule of rules) {
    try {
      // Check if the rule condition is met (indicates an issue)
      if (rule.condition(state)) {
        feedback.push({
          id: rule.id,
          severity: rule.severity,
          category: rule.category,
          title: rule.name,
          message: rule.message(state),
          field: rule.field,
          source: rule.source?.(state),
          actionable: true,
        })
      }
    } catch (error) {
      // Rule couldn't be evaluated (missing data), skip silently
      // This is expected when design state is incomplete
    }
  }

  // Sort by severity (errors first, then warnings, suggestions, info)
  return sortBySeverity(feedback)
}

/**
 * Check if feedback contains any errors
 */
export function hasErrors(feedback: DesignFeedback[]): boolean {
  return feedback.some((f) => f.severity === 'error')
}

/**
 * Check if feedback contains any warnings
 */
export function hasWarnings(feedback: DesignFeedback[]): boolean {
  return feedback.some((f) => f.severity === 'warning')
}

/**
 * Check if design is valid (no errors)
 */
export function isDesignValid(state: DesignState, step?: number): boolean {
  const feedback = validateDesign(state, step)
  return !hasErrors(feedback)
}

/**
 * Get feedback summary by severity
 */
export function getFeedbackSummary(feedback: DesignFeedback[]): {
  errors: number
  warnings: number
  suggestions: number
  info: number
  total: number
} {
  return {
    errors: feedback.filter((f) => f.severity === 'error').length,
    warnings: feedback.filter((f) => f.severity === 'warning').length,
    suggestions: feedback.filter((f) => f.severity === 'suggestion').length,
    info: feedback.filter((f) => f.severity === 'info').length,
    total: feedback.length,
  }
}

/**
 * Filter feedback by category
 */
export function filterByCategory(
  feedback: DesignFeedback[],
  category: DesignFeedback['category']
): DesignFeedback[] {
  return feedback.filter((f) => f.category === category)
}

/**
 * Filter feedback by severity level and above
 * e.g., 'warning' will include both 'error' and 'warning'
 */
export function filterBySeverityAndAbove(
  feedback: DesignFeedback[],
  minSeverity: DesignFeedback['severity']
): DesignFeedback[] {
  const minOrder = SEVERITY_ORDER[minSeverity]
  return feedback.filter((f) => SEVERITY_ORDER[f.severity] <= minOrder)
}

/**
 * Get actionable feedback only
 */
export function getActionableFeedback(
  feedback: DesignFeedback[]
): DesignFeedback[] {
  return feedback.filter((f) => f.actionable !== false)
}

/**
 * Group feedback by category
 */
export function groupByCategory(
  feedback: DesignFeedback[]
): Record<string, DesignFeedback[]> {
  return feedback.reduce(
    (groups, item) => {
      const category = item.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, DesignFeedback[]>
  )
}
