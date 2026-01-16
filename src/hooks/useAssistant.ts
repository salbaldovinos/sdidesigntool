// Hook for using the Design Assistant
// Provides validation feedback for the current wizard step

import { useMemo } from 'react'
import { useDesignStore } from '@/stores/designStore'
import { validateDesign, getFeedbackSummary, hasErrors, hasWarnings } from '@/assistant/validation-engine'
import type { DesignState } from '@/types/assistant'

/**
 * Hook to get validation feedback for the current design state
 * @param step - Optional wizard step to filter rules (1-4)
 * @returns Object containing feedback array and helper functions
 */
export function useAssistantFeedback(step?: number) {
  const designInputs = useDesignStore((state) => state.designInputs)
  const pipeSegments = useDesignStore((state) => state.pipeSegments)
  const results = useDesignStore((state) => state.results)

  const feedback = useMemo(() => {
    const state: DesignState = {
      designInputs,
      systemLayout: pipeSegments,
      results,
    }

    return validateDesign(state, step)
  }, [designInputs, pipeSegments, results, step])

  const summary = useMemo(() => getFeedbackSummary(feedback), [feedback])

  return {
    feedback,
    summary,
    hasErrors: hasErrors(feedback),
    hasWarnings: hasWarnings(feedback),
    isValid: !hasErrors(feedback),
    isEmpty: feedback.length === 0,
  }
}

/**
 * Hook to validate specific wizard step
 * Returns whether the step is valid and ready to proceed
 */
export function useStepValidation(step: number) {
  const { feedback, hasErrors, isValid } = useAssistantFeedback(step)

  // Filter to only errors for step validation
  const errors = feedback.filter((f) => f.severity === 'error')
  const warnings = feedback.filter((f) => f.severity === 'warning')

  return {
    isValid,
    hasErrors,
    errors,
    warnings,
    canProceed: !hasErrors,
  }
}

/**
 * Hook to get current design state for validation
 */
export function useDesignState(): DesignState {
  const designInputs = useDesignStore((state) => state.designInputs)
  const pipeSegments = useDesignStore((state) => state.pipeSegments)
  const results = useDesignStore((state) => state.results)

  return useMemo(
    () => ({
      designInputs,
      systemLayout: pipeSegments,
      results,
    }),
    [designInputs, pipeSegments, results]
  )
}
