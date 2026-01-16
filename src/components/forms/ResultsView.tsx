import { useDesignStore } from '@/stores/designStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import {
  calculateHazenWilliamsLoss,
  calculateFlowFromVelocity,
} from '@/calculations/hydraulics'
import { Printer, CheckCircle, AlertTriangle, Download, Loader2 } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { SDIDesignReport, type ReportData } from '@/components/pdf/SDIDesignReport'

export function ResultsView() {
  const { designInputs, pipeSegments } = useDesignStore()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Calculate all results
  const results = useMemo(() => {
    const {
      projectName = 'Untitled Project',
      maxFlowGPD = 1000,
      soilLoadingRate = 0.5,
      usableAcres = 1,
      driplineSpacing = 2,
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
    const driplineRequired = requiredAreaSqFt / driplineSpacing
    const driplineAvailable = totalAreaSqFt / driplineSpacing
    const emittersPerLateral = Math.floor((lateralLength * 12) / emitterSpacing)
    const totalLaterals = lateralsPerZone * numberOfZones
    const totalEmitters = emittersPerLateral * totalLaterals
    const actualDriplineInstalled = lateralLength * totalLaterals

    // Flow calculations
    const flowPerLateral = (emittersPerLateral * nominalFlowGPH) / 60 // GPM
    const dispersalFlowGPM = flowPerLateral * lateralsPerZone // per zone

    // Flush flow calculation - CORRECT formula: Q = V × D² / 0.4085
    const flushFlowPerLateral = calculateFlowFromVelocity(flushVelocity, tubeId)
    const flushFlowGPM = (flushFlowPerLateral * lateralsPerZone) + dispersalFlowGPM

    // Daily flow calculations
    const totalDailyFlowGPD = maxFlowGPD // Design flow

    // Cycle timing (assuming we need to distribute maxFlowGPD across cycles)
    const gallonsPerZonePerCycle = maxFlowGPD / (numberOfZones * cyclesPerDay)
    const doseTimeMinutes = gallonsPerZonePerCycle / dispersalFlowGPM

    // Pipe system summary
    const totalPipeLength = pipeSegments.reduce((sum, seg) => sum + seg.length, 0)
    const totalElevation = pipeSegments.reduce((sum, seg) => sum + (seg.elevation ?? 0), 0)

    // TDH calculations with elevation
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

    // Convert operating pressure to feet of head
    const emitterPressureFt = operatingPressurePSI * 2.31

    // TDH = Elevation + Friction + Emitter Pressure (for dispersal)
    const dispersalTDH = totalElevation + dispersalFriction + emitterPressureFt
    const flushTDH = totalElevation + flushFriction // No emitter pressure for flushing

    // Design TDH is the higher of the two
    const designTDH = Math.max(dispersalTDH, flushTDH)
    const designFlowGPM = Math.max(dispersalFlowGPM, flushFlowGPM)
    const designTDH_PSI = designTDH / 2.31

    // Determine limiting condition
    const limitingCondition = flushTDH > dispersalTDH ? 'Flushing' : 'Dispersal'

    return {
      // Project
      projectName,

      // Area
      totalAreaSqFt,
      requiredAreaSqFt,
      areaAdequate,
      areaUtilization,

      // Dripline
      driplineRequired,
      driplineAvailable,
      actualDriplineInstalled,
      emittersPerLateral,
      totalLaterals,
      totalEmitters,

      // Flow
      flowPerLateral,
      dispersalFlowGPM,
      flushFlowPerLateral,
      flushFlowGPM,
      totalDailyFlowGPD,

      // Cycle timing
      cyclesPerDay,
      numberOfZones,
      gallonsPerZonePerCycle,
      doseTimeMinutes,

      // System
      totalPipeLength,
      totalElevation,
      operatingPressurePSI,

      // TDH
      dispersalTDH,
      flushTDH,
      dispersalFriction,
      flushFriction,
      emitterPressureFt,
      designTDH,
      designTDH_PSI,
      designFlowGPM,
      limitingCondition,
    }
  }, [designInputs, pipeSegments])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const reportData: ReportData = {
        projectName: results.projectName,
        generatedDate: new Date().toLocaleDateString(),
        designInputs,
        pipeSegments,
        calculations: {
          totalAreaSqFt: results.totalAreaSqFt,
          requiredAreaSqFt: results.requiredAreaSqFt,
          areaAdequate: results.areaAdequate,
          areaUtilization: results.areaUtilization,
          totalLaterals: results.totalLaterals,
          emittersPerLateral: results.emittersPerLateral,
          totalEmitters: results.totalEmitters,
          actualDriplineInstalled: results.actualDriplineInstalled,
          flowPerLateral: results.flowPerLateral,
          dispersalFlowGPM: results.dispersalFlowGPM,
          flushFlowGPM: results.flushFlowGPM,
          totalDailyFlowGPD: results.totalDailyFlowGPD,
          gallonsPerZonePerCycle: results.gallonsPerZonePerCycle,
          doseTimeMinutes: results.doseTimeMinutes,
          totalElevation: results.totalElevation,
          dispersalFriction: results.dispersalFriction,
          flushFriction: results.flushFriction,
          emitterPressureFt: results.emitterPressureFt,
          dispersalTDH: results.dispersalTDH,
          flushTDH: results.flushTDH,
          designTDH: results.designTDH,
          designTDH_PSI: results.designTDH_PSI,
          designFlowGPM: results.designFlowGPM,
          limitingCondition: results.limitingCondition,
        },
      }

      const blob = await pdf(<SDIDesignReport data={reportData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${results.projectName.replace(/[^a-z0-9]/gi, '_')}_SDI_Design.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Design Results Summary</h2>
        <p className="text-lg sm:text-xl font-semibold text-gray-700 mt-1">{results.projectName || 'Untitled Project'}</p>
        <p className="text-sm text-gray-500 mt-1">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Action Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 print:hidden">
        <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="flex-1 sm:flex-none">
          {isGeneratingPdf ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1 sm:flex-none">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        results.areaAdequate
          ? 'bg-green-50 border border-green-200'
          : 'bg-amber-50 border border-amber-200'
      }`}>
        {results.areaAdequate ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        )}
        <div>
          <p className={`font-medium ${results.areaAdequate ? 'text-green-900' : 'text-amber-900'}`}>
            {results.areaAdequate
              ? 'Design meets area requirements'
              : 'Warning: Available area may be insufficient'}
          </p>
          <p className={`text-sm ${results.areaAdequate ? 'text-green-700' : 'text-amber-700'}`}>
            Area utilization: {results.areaUtilization.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Pump Selection - Most Important */}
      <Card className="bg-teal-50 border-teal-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-teal-900">Pump Selection Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-3">
            <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-teal-100">
              <div className="text-xl sm:text-3xl font-bold text-teal-600">
                {results.designFlowGPM.toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">GPM</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-teal-100">
              <div className="text-xl sm:text-3xl font-bold text-teal-600">
                {results.designTDH.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">ft TDH</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-teal-100">
              <div className="text-xl sm:text-3xl font-bold text-teal-600">
                {results.designTDH_PSI.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">PSI</div>
            </div>
          </div>
          <p className="text-sm text-teal-800 mt-4 text-center">
            Limiting condition: <strong>{results.limitingCondition}</strong> mode.
            Select a pump with operating point at or above these values.
          </p>
        </CardContent>
      </Card>

      {/* Main Results Grid */}
      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 print:grid print:grid-cols-2">
        {/* Area Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Area Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Available Area:</span>
                <span className="font-medium">
                  {results.totalAreaSqFt.toLocaleString()} ft²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Required Area:</span>
                <span className="font-medium">
                  {results.requiredAreaSqFt.toLocaleString()} ft²
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  results.areaAdequate ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.areaAdequate ? 'Adequate' : 'Insufficient'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emitter Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dripline & Emitters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Laterals:</span>
                <span className="font-medium">{results.totalLaterals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emitters per Lateral:</span>
                <span className="font-medium">{results.emittersPerLateral}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Emitters:</span>
                <span className="font-medium">
                  {results.totalEmitters.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Dripline Installed:</span>
                <span className="font-medium">
                  {results.actualDriplineInstalled.toLocaleString()} ft
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Requirements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Flow Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Flow per Lateral:</span>
                <span className="font-medium">
                  {results.flowPerLateral.toFixed(3)} GPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dispersal Flow/Zone:</span>
                <span className="font-medium">
                  {results.dispersalFlowGPM.toFixed(2)} GPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Flush Flow/Zone:</span>
                <span className="font-medium">
                  {results.flushFlowGPM.toFixed(2)} GPM
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Design Daily Flow:</span>
                <span className="font-medium">
                  {results.totalDailyFlowGPD.toLocaleString()} GPD
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Timing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cycle Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cycles per Day:</span>
                <span className="font-medium">{results.cyclesPerDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Zones:</span>
                <span className="font-medium">{results.numberOfZones}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dose per Zone/Cycle:</span>
                <span className="font-medium">
                  {results.gallonsPerZonePerCycle.toFixed(1)} gal
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Dose Time:</span>
                <span className="font-medium">
                  {results.doseTimeMinutes.toFixed(1)} min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TDH Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">TDH Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Component</th>
                  <th className="text-right py-2 font-medium">Dispersal</th>
                  <th className="text-right py-2 font-medium">Flushing</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Static Head (Elevation)</td>
                  <td className="text-right py-2">{results.totalElevation.toFixed(1)} ft</td>
                  <td className="text-right py-2">{results.totalElevation.toFixed(1)} ft</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Friction Loss</td>
                  <td className="text-right py-2">{results.dispersalFriction.toFixed(2)} ft</td>
                  <td className="text-right py-2">{results.flushFriction.toFixed(2)} ft</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Emitter Pressure ({results.operatingPressurePSI} PSI)</td>
                  <td className="text-right py-2">{results.emitterPressureFt.toFixed(1)} ft</td>
                  <td className="text-right py-2 text-gray-400">N/A</td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="py-2">Total TDH</td>
                  <td className="text-right py-2">{results.dispersalTDH.toFixed(1)} ft</td>
                  <td className="text-right py-2">{results.flushTDH.toFixed(1)} ft</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2">Total TDH (PSI)</td>
                  <td className="text-right py-2">{(results.dispersalTDH / 2.31).toFixed(1)} PSI</td>
                  <td className="text-right py-2">{(results.flushTDH / 2.31).toFixed(1)} PSI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* System Summary */}
      <div className="bg-gray-100 p-4 rounded-lg print:bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">System Configuration Summary</h3>
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Pipe Length:</span>
            <span className="font-medium">{results.totalPipeLength} ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Elevation Change:</span>
            <span className="font-medium">{results.totalElevation} ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pipe Segments:</span>
            <span className="font-medium">{pipeSegments.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Zones:</span>
            <span className="font-medium">{results.numberOfZones}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Laterals per Zone:</span>
            <span className="font-medium">{designInputs.lateralsPerZone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lateral Length:</span>
            <span className="font-medium">{designInputs.lateralLength} ft</span>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-xs text-gray-500 pt-4 border-t">
        <p>Generated by Geoflow SDI Designer</p>
        <p>Subsurface Drip Irrigation Design Tool</p>
      </div>
    </div>
  )
}
