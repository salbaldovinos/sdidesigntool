import type { WizardStep } from '@/stores/designStore'

interface Step {
  number: WizardStep
  title: string
}

const steps: Step[] = [
  { number: 1, title: 'Design Inputs' },
  { number: 2, title: 'System Layout' },
  { number: 3, title: 'Zone TDH' },
  { number: 4, title: 'Results' },
  { number: 5, title: 'Configuration' },
]

interface StepIndicatorProps {
  currentStep: WizardStep
  onStepClick?: (step: WizardStep) => void
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentStepData = steps.find(s => s.number === currentStep)

  return (
    <nav aria-label="Progress">
      {/* Mobile: Pill style with step number and title */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="px-3 py-1 bg-teal-600 text-white text-sm font-medium rounded-full">
          Step {currentStep}
        </span>
        <span className="text-sm text-gray-500">
          {currentStepData?.title}
        </span>
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-2">
          {/* Progress pills */}
          <div className="flex items-center gap-1">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => onStepClick?.(step.number)}
                disabled={!onStepClick}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                  ${step.number === currentStep
                    ? 'bg-teal-600 text-white'
                    : step.number < currentStep
                    ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                    : 'bg-gray-100 text-gray-500'
                  }
                  ${onStepClick ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {step.number}
              </button>
            ))}
          </div>

          {/* Current step title */}
          <span className="text-sm text-gray-500 ml-2">
            {currentStepData?.title}
          </span>
        </div>
      </div>
    </nav>
  )
}
