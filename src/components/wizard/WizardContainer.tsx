import * as React from 'react'
import { useDesignStore } from '@/stores/designStore'
import { DesignInputsForm } from '@/components/forms/DesignInputsForm'
import { SystemLayoutForm } from '@/components/forms/SystemLayoutForm'
import { ZoneTDHView } from '@/components/forms/ZoneTDHView'
import { ResultsView } from '@/components/forms/ResultsView'
import { SystemConfiguration } from '@/components/steps/SystemConfiguration'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react'
import { AssistantPanel } from '@/components/assistant/AssistantPanel'
import { useAssistantFeedback } from '@/hooks/useAssistant'
import { pdf } from '@react-pdf/renderer'
import { SDIDesignReport, type ReportData, type SelectedEquipment } from '@/components/pdf/SDIDesignReport'
import {
  calculateHazenWilliamsLoss,
  calculateFlowFromVelocity,
} from '@/calculations/hydraulics'
import { generateBOM } from '@/assistant/bom-generator'
import {
  getAllDripTubing,
  getAllHydrotekValves,
  getAllZoneBoxes,
  getAllControlPanels,
  getAllPressureRegulators,
  getAllFlowMeters,
  geoflowCatalog,
} from '@/data'

export function WizardContainer() {
  const { currentStep, setCurrentStep, nextStep, prevStep, designInputs, pipeSegments, selectedProducts } = useDesignStore()
  const { feedback } = useAssistantFeedback(currentStep)
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Generate PDF report
  const handleGenerateReport = React.useCallback(async () => {
    setIsGenerating(true)
    try {
      // Calculate all values (same as ResultsView)
      const {
        projectName = 'SDI System Design',
        maxFlowGPD = 1000,
        soilLoadingRate = 0.5,
        usableAcres = 1,
        emitterSpacing = 12,
        numberOfZones = 4,
        lateralsPerZone = 10,
        lateralLength = 100,
        nominalFlowGPH = 0.9,
        tubeId = 0.55,
        flushVelocity = 1.5,
        cyclesPerDay = 4,
        operatingPressurePSI = 15,
      } = designInputs

      // Area calculations
      const totalAreaSqFt = usableAcres * 43560
      const requiredAreaSqFt = maxFlowGPD / soilLoadingRate
      const areaAdequate = totalAreaSqFt >= requiredAreaSqFt
      const areaUtilization = (requiredAreaSqFt / totalAreaSqFt) * 100

      // Dripline calculations
      const emittersPerLateral = Math.floor((lateralLength * 12) / emitterSpacing)
      const totalLaterals = lateralsPerZone * numberOfZones
      const totalEmitters = emittersPerLateral * totalLaterals
      const actualDriplineInstalled = lateralLength * totalLaterals

      // Flow calculations
      const flowPerLateral = (emittersPerLateral * nominalFlowGPH) / 60
      const dispersalFlowGPM = flowPerLateral * lateralsPerZone
      const flushFlowPerLateral = calculateFlowFromVelocity(flushVelocity, tubeId)
      const flushFlowGPM = (flushFlowPerLateral * lateralsPerZone) + dispersalFlowGPM
      const totalDailyFlowGPD = maxFlowGPD

      // Cycle timing
      const gallonsPerZonePerCycle = maxFlowGPD / (numberOfZones * cyclesPerDay)
      const doseTimeMinutes = gallonsPerZonePerCycle / dispersalFlowGPM

      // Pipe system
      const totalElevation = pipeSegments.reduce((sum, seg) => sum + (seg.elevation ?? 0), 0)

      // TDH calculations
      const dispersalFriction = pipeSegments.reduce((sum, seg) => {
        return sum + calculateHazenWilliamsLoss({
          flowRate: dispersalFlowGPM,
          pipeDiameter: seg.pipeId,
          pipeLength: seg.length,
          coefficient: seg.cFactor,
        })
      }, 0)

      const flushFriction = pipeSegments.reduce((sum, seg) => {
        return sum + calculateHazenWilliamsLoss({
          flowRate: flushFlowGPM,
          pipeDiameter: seg.pipeId,
          pipeLength: seg.length,
          coefficient: seg.cFactor,
        })
      }, 0)

      const emitterPressureFt = operatingPressurePSI * 2.31
      const dispersalTDH = totalElevation + dispersalFriction + emitterPressureFt
      const flushTDH = totalElevation + flushFriction
      const designTDH = Math.max(dispersalTDH, flushTDH)
      const designFlowGPM = Math.max(dispersalFlowGPM, flushFlowGPM)
      const designTDH_PSI = designTDH / 2.31
      const limitingCondition = flushTDH > dispersalTDH ? 'Flushing' : 'Dispersal'

      // Build selected equipment list for report
      const selectedEquipment: SelectedEquipment[] = []

      // Add drip tubing
      if (selectedProducts.dripTubingSku) {
        const tubing = getAllDripTubing().find(t => t.partNumber === selectedProducts.dripTubingSku)
        if (tubing) {
          selectedEquipment.push({
            category: 'Drip Tubing',
            name: `${tubing.lineName} - ${tubing.emitterSpacing}" spacing`,
            sku: tubing.partNumber,
            notes: `${tubing.flowRate} GPH, ${tubing.pressureCompensating ? 'Pressure Compensating' : 'Non-PC'}`,
          })
        }
      }

      // Add headworks
      if (selectedProducts.headworksSku) {
        const { headworks } = geoflowCatalog
        let headworksProduct: { partNumber: string; description: string } | undefined

        // Search all headworks categories
        if (headworks.dripFilterEcoVortex?.categories) {
          for (const cat of Object.values(headworks.dripFilterEcoVortex.categories)) {
            const found = cat.products?.find(p => p.partNumber === selectedProducts.headworksSku)
            if (found) { headworksProduct = found; break }
          }
        }
        if (!headworksProduct && headworks.dripFilterEcoBioDisc?.categories) {
          for (const cat of Object.values(headworks.dripFilterEcoBioDisc.categories)) {
            const found = cat.products?.find(p => p.partNumber === selectedProducts.headworksSku)
            if (found) { headworksProduct = found; break }
          }
        }

        if (headworksProduct) {
          selectedEquipment.push({
            category: 'Headworks',
            name: headworksProduct.description.split(',')[0] || headworksProduct.description,
            sku: headworksProduct.partNumber,
          })
        }
      }

      // Add zone control
      if (selectedProducts.zoneControlType === 'hydrotek' && selectedProducts.hydrotekValveSku) {
        const valve = getAllHydrotekValves().find(v => v.partNumber === selectedProducts.hydrotekValveSku)
        if (valve) {
          selectedEquipment.push({
            category: 'Zone Control - Hydrotek',
            name: `${valve.zones}-Zone Indexing Valve`,
            sku: valve.partNumber,
            notes: 'No electrical required',
          })
        }
      } else if (selectedProducts.zoneControlType === 'solenoid') {
        if (selectedProducts.zoneBoxSku) {
          const zoneBox = getAllZoneBoxes().find(z => z.partNumber === selectedProducts.zoneBoxSku)
          if (zoneBox) {
            selectedEquipment.push({
              category: 'Zone Control - Solenoid Box',
              name: `${zoneBox.zones}-Zone Assembly`,
              sku: zoneBox.partNumber,
              notes: `${zoneBox.solenoidSize}" solenoids`,
            })
          }
        }
        if (selectedProducts.controlPanelSku) {
          const panel = getAllControlPanels().find(p => p.partNumber === selectedProducts.controlPanelSku)
          if (panel) {
            selectedEquipment.push({
              category: 'Control Panel',
              name: `${panel.zones}-Zone Panel`,
              sku: panel.partNumber,
              notes: `${panel.flushType} flush, ${panel.pumpConfig}`,
            })
          }
        }
      }

      // Add pressure regulator
      if (selectedProducts.pressureRegulatorSku) {
        const reg = getAllPressureRegulators().find(r => r.partNumber === selectedProducts.pressureRegulatorSku)
        if (reg) {
          selectedEquipment.push({
            category: 'Pressure Regulator',
            name: `${reg.pressure} PSI Regulator`,
            sku: reg.partNumber,
            notes: `Flow range: ${reg.minFlow}-${reg.maxFlow} GPM`,
          })
        }
      }

      // Add flow meter
      if (selectedProducts.flowMeterSku) {
        const meter = getAllFlowMeters().find(m => m.partNumber === selectedProducts.flowMeterSku)
        if (meter) {
          selectedEquipment.push({
            category: 'Flow Meter',
            name: meter.description.split(',')[0] || `${meter.type} Flow Meter`,
            sku: meter.partNumber,
            notes: `Range: ${meter.minFlow}-${meter.maxFlow} GPM`,
          })
        }
      }

      // Generate BOM
      const bom = generateBOM(
        { designInputs, systemLayout: pipeSegments, results: {}, selectedProducts },
        projectName
      )

      // Build report data
      const reportData: ReportData = {
        projectName,
        generatedDate: new Date().toLocaleDateString(),
        designInputs,
        pipeSegments,
        calculations: {
          totalAreaSqFt,
          requiredAreaSqFt,
          areaAdequate,
          areaUtilization,
          totalLaterals,
          emittersPerLateral,
          totalEmitters,
          actualDriplineInstalled,
          flowPerLateral,
          dispersalFlowGPM,
          flushFlowGPM,
          totalDailyFlowGPD,
          gallonsPerZonePerCycle,
          doseTimeMinutes,
          totalElevation,
          dispersalFriction,
          flushFriction,
          emitterPressureFt,
          dispersalTDH,
          flushTDH,
          designTDH,
          designTDH_PSI,
          designFlowGPM,
          limitingCondition,
        },
        selectedEquipment: selectedEquipment.length > 0 ? selectedEquipment : undefined,
        bomItems: bom.items.length > 0 ? bom.items : undefined,
        bomSummary: bom.items.length > 0 ? bom.summary : undefined,
      }

      // Generate PDF blob
      const blob = await pdf(<SDIDesignReport data={reportData} />).toBlob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sdi-design-report-${projectName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [designInputs, pipeSegments, selectedProducts])

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
      case 5:
        return <SystemConfiguration />
      default:
        return <DesignInputsForm />
    }
  }

  // Step titles for sidebar
  const stepTitles = [
    { number: 1, title: 'Design Inputs', icon: '1' },
    { number: 2, title: 'System Layout', icon: '2' },
    { number: 3, title: 'Zone TDH', icon: '3' },
    { number: 4, title: 'Results', icon: '4' },
    { number: 5, title: 'Configuration', icon: '5' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mobile Step Indicator */}
      <div className="lg:hidden px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-teal-600 text-white text-sm font-medium rounded-full">
            Step {currentStep}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {stepTitles[currentStep - 1]?.title}
          </span>
        </div>
      </div>

      {/* Main Layout - Three columns on desktop */}
      <div className="lg:flex lg:gap-6">
        {/* Left Sidebar - Steps & Actions (Desktop only) */}
        <div className="hidden lg:block lg:w-56 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            {/* Step Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Steps
              </h3>
              <nav className="space-y-1">
                {stepTitles.map((step) => (
                  <button
                    key={step.number}
                    onClick={() => setCurrentStep(step.number as 1 | 2 | 3 | 4 | 5)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      step.number === currentStep
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium'
                        : step.number < currentStep
                        ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                        step.number === currentStep
                          ? 'bg-teal-600 text-white'
                          : step.number < currentStep
                          ? 'bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Generate Report Button */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full"
                variant={currentStep === 5 ? 'default' : 'outline'}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Generate Report</span>
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Download PDF with design calculations and BOM
              </p>
            </div>
          </div>
        </div>

        {/* Center - Main Content */}
        <div className="flex-1 min-w-0 px-4 lg:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
            {renderStep()}
          </div>

          {/* Mobile Design Assistant (below content) */}
          <div className="lg:hidden mt-4">
            <AssistantPanel
              feedback={feedback}
              title="Design Assistant"
              defaultExpanded={feedback.some((f) => f.severity === 'error' || f.severity === 'warning')}
            />
          </div>

          {/* Mobile Navigation - Fixed at bottom */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-30">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </Button>

              {currentStep < 5 ? (
                <Button onClick={nextStep} className="flex-1">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Report</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Spacer for fixed bottom nav on mobile */}
          <div className="h-24 lg:hidden" />
        </div>

        {/* Right Sidebar - Design Assistant (Desktop only, sticky) */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <div className="sticky top-4">
            <AssistantPanel
              feedback={feedback}
              title="Design Assistant"
              defaultExpanded={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
