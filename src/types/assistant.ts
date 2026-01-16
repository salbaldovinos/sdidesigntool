// Smart Design Assistant Types

import type { DesignInputs, PipeSegment, DesignResults } from './design'

// Feedback severity levels (ordered by priority)
export type FeedbackSeverity = 'error' | 'warning' | 'suggestion' | 'info'

// Feedback categories for grouping and filtering
export type FeedbackCategory =
  | 'hydraulic'
  | 'product-compatibility'
  | 'product-availability'
  | 'sizing'
  | 'application'
  | 'optimization'

// Design feedback item shown in the assistant panel
export interface DesignFeedback {
  id: string
  severity: FeedbackSeverity
  category: FeedbackCategory
  title: string
  message: string
  field?: string // Which input field this relates to
  currentValue?: string | number
  recommendedValue?: string | number
  source?: string // Citation for the rule (e.g., "ASAE EP405.1" or product specs)
  actionable?: boolean // Can the user do something about this?
}

// Complete design state for validation (combines all wizard step data)
export interface DesignState {
  designInputs: Partial<DesignInputs>
  systemLayout: PipeSegment[]
  results: Partial<DesignResults>
  selectedProducts?: SelectedProducts
}

// Products selected by the user for their system
export interface SelectedProducts {
  dripTubingSku?: string
  headworksSku?: string
  zoneControlType?: 'hydrotek' | 'solenoid'
  hydrotekValveSku?: string
  zoneBoxSku?: string
  controlPanelSku?: string
  pressureRegulatorSku?: string
  flowMeterSku?: string
}

// Validation rule definition
export interface ValidationRule {
  id: string
  name: string
  description: string
  category: FeedbackCategory
  severity: FeedbackSeverity
  appliesTo: number[] // Which wizard steps [1, 2, 3, 4, 5]
  condition: (state: DesignState) => boolean
  message: (state: DesignState) => string
  field?: string
  source?: (state: DesignState) => string
}

// Stock status from the product catalog
export type StockStatus =
  | 'In Stock'
  | 'In stock'
  | 'On demand'
  | 'Discontinued'
  | 'To Be Discontinued'
  | 'To be discontinued'
  | 'Low stock'

// Component recommendation from the recommendation engine
export interface ComponentRecommendation {
  sku: string
  name: string
  description?: string
  reason: string
  isTopChoice: boolean
  warnings?: string[]
  stockStatus: StockStatus
}

// System-wide recommendations based on design parameters
export interface SystemRecommendations {
  dripTubing: ComponentRecommendation[]
  headworks: ComponentRecommendation[]
  zoneControl: {
    hydrotek?: ComponentRecommendation[]
    zoneBoxes?: ComponentRecommendation[]
    recommendation: 'hydrotek' | 'solenoid' | 'either'
    reason: string
  }
  controlPanels: ComponentRecommendation[]
  pressureRegulators: ComponentRecommendation[]
  flowMeters: ComponentRecommendation[]
  fittings: ComponentRecommendation[]
  warnings: string[]
}

// Bill of Materials line item
export interface BOMLineItem {
  sku: string
  description: string
  category: string
  quantity: number
  unit: string
  stockStatus: StockStatus
  weight?: number
  weightUnit?: string
  notes?: string
}

// Complete Bill of Materials
export interface BillOfMaterials {
  projectName: string
  generatedAt: Date
  items: BOMLineItem[]
  summary: {
    totalLineItems: number
    totalWeight: number
    inStockCount: number
    onDemandCount: number
  }
  warnings: string[]
}

// Assistant panel state
export interface AssistantPanelState {
  isExpanded: boolean
  activeTab: 'validation' | 'recommendations' | 'bom'
  feedback: DesignFeedback[]
  recommendations?: SystemRecommendations
  bom?: BillOfMaterials
}

// Helper function to check if feedback has errors
export function hasErrors(feedback: DesignFeedback[]): boolean {
  return feedback.some((f) => f.severity === 'error')
}

// Helper function to check if feedback has warnings
export function hasWarnings(feedback: DesignFeedback[]): boolean {
  return feedback.some((f) => f.severity === 'warning')
}

// Helper function to count feedback by severity
export function countBySeverity(feedback: DesignFeedback[]): Record<FeedbackSeverity, number> {
  return feedback.reduce(
    (acc, f) => {
      acc[f.severity]++
      return acc
    },
    { error: 0, warning: 0, suggestion: 0, info: 0 } as Record<FeedbackSeverity, number>
  )
}

// Severity order for sorting (lower = higher priority)
export const SEVERITY_ORDER: Record<FeedbackSeverity, number> = {
  error: 0,
  warning: 1,
  suggestion: 2,
  info: 3,
}

// Sort feedback by severity
export function sortBySeverity(feedback: DesignFeedback[]): DesignFeedback[] {
  return [...feedback].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}
