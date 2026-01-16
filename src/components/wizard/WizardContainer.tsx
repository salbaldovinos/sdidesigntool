import { useDesignStore } from '@/stores/designStore'
import { StepIndicator } from './StepIndicator'
import { DesignInputsForm } from '@/components/forms/DesignInputsForm'
import { SystemLayoutForm } from '@/components/forms/SystemLayoutForm'
import { ZoneTDHView } from '@/components/forms/ZoneTDHView'
import { ResultsView } from '@/components/forms/ResultsView'
import { Button } from '@/components/ui/button'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function WizardContainer() {
  const { currentStep, nextStep, prevStep, setCurrentStep } = useDesignStore()

  // Enable auto-save when project is dirty
  useAutoSave()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DesignInputsForm />
      case 2:
        return <SystemLayoutForm />
      case 3:
        return <ZoneTDHView />
      case 4:
        return <ResultsView />
      default:
        return <DesignInputsForm />
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        {renderStep()}
      </div>

      {/* Navigation - Sticky on mobile, inline on desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 z-40">
        <div className="flex gap-3 sm:justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 sm:flex-none"
          >
            <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep} className="flex-1 sm:flex-none">
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
