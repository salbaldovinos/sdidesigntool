// Validation Rules Index
// Exports all validation rules and helper functions

import type { ValidationRule } from '@/types/assistant'
import { hydraulicRules } from './hydraulic-rules'
import { productCompatibilityRules } from './product-compatibility-rules'
import { productAvailabilityRules } from './product-availability-rules'

// Combine all validation rules
export const allValidationRules: ValidationRule[] = [
  ...hydraulicRules,
  ...productCompatibilityRules,
  ...productAvailabilityRules,
]

// Get rules that apply to a specific wizard step
export function getRulesForStep(step: number): ValidationRule[] {
  return allValidationRules.filter((rule) => rule.appliesTo.includes(step))
}

// Get rules by category
export function getRulesByCategory(
  category: ValidationRule['category']
): ValidationRule[] {
  return allValidationRules.filter((rule) => rule.category === category)
}

// Get rules by severity
export function getRulesBySeverity(
  severity: ValidationRule['severity']
): ValidationRule[] {
  return allValidationRules.filter((rule) => rule.severity === severity)
}

// Export individual rule modules for testing
export { hydraulicRules } from './hydraulic-rules'
export { productCompatibilityRules } from './product-compatibility-rules'
export { productAvailabilityRules } from './product-availability-rules'
