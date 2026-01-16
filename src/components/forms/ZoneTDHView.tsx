import { useDesignStore } from '@/stores/designStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'
import {
  calculateHazenWilliamsLoss,
  calculateVelocity,
  calculateFlowFromVelocity,
} from '@/calculations/hydraulics'

export function ZoneTDHView() {
  const { designInputs, pipeSegments } = useDesignStore()

  // Calculate TDH values
  const calculations = useMemo(() => {
    const {
      lateralsPerZone = 10,
      lateralLength = 100,
      emitterSpacing = 12,
      nominalFlowGPH = 0.9,
      tubeId = 0.55,
      flushVelocity = 1.5,
      operatingPressurePSI = 15,
    } = designInputs

    // Calculate emitters per lateral (emitterSpacing is in inches, lateralLength in feet)
    const emittersPerLateral = Math.floor((lateralLength * 12) / emitterSpacing)

    // Calculate flow per lateral (GPM) - converting GPH to GPM
    const flowPerLateral = (emittersPerLateral * nominalFlowGPH) / 60

    // Calculate flow per zone (GPM) - dispersal mode
    const dispersalFlowGPM = flowPerLateral * lateralsPerZone

    // Calculate flush flow per lateral using correct formula: Q = V × D² / 0.4085
    // This matches Excel: =A30/0.4085*0.55^2*A29+A33
    const flushFlowPerLateral = calculateFlowFromVelocity(flushVelocity, tubeId)

    // Total flushing flow = flush flow per lateral × laterals + dispersal flow
    // (Flush happens while dispersal is also occurring)
    const flushFlowGPM = (flushFlowPerLateral * lateralsPerZone) + dispersalFlowGPM

    // Calculate friction losses and elevation for each pipe segment at dispersal flow
    const dispersalFrictionLosses = pipeSegments.map((seg) => {
      const headLoss = calculateHazenWilliamsLoss({
        flowRate: dispersalFlowGPM,
        pipeDiameter: seg.pipeId,
        pipeLength: seg.length,
        coefficient: seg.cFactor,
      })
      return {
        segment: seg.name,
        flowGPM: dispersalFlowGPM,
        headLoss,
        elevation: seg.elevation ?? 0,
        velocity: calculateVelocity(dispersalFlowGPM, seg.pipeId),
      }
    })

    // Calculate friction losses for flushing flow
    const flushFrictionLosses = pipeSegments.map((seg) => {
      const headLoss = calculateHazenWilliamsLoss({
        flowRate: flushFlowGPM,
        pipeDiameter: seg.pipeId,
        pipeLength: seg.length,
        coefficient: seg.cFactor,
      })
      return {
        segment: seg.name,
        flowGPM: flushFlowGPM,
        headLoss,
        elevation: seg.elevation ?? 0,
        velocity: calculateVelocity(flushFlowGPM, seg.pipeId),
      }
    })

    // Total friction losses
    const totalDispersalFriction = dispersalFrictionLosses.reduce(
      (sum, l) => sum + l.headLoss,
      0
    )
    const totalFlushFriction = flushFrictionLosses.reduce(
      (sum, l) => sum + l.headLoss,
      0
    )

    // Total elevation (sum of all segment elevations)
    const totalElevation = pipeSegments.reduce(
      (sum, seg) => sum + (seg.elevation ?? 0),
      0
    )

    // Convert operating pressure to feet of head (PSI × 2.31)
    const emitterPressureFt = operatingPressurePSI * 2.31

    // Calculate Total Dynamic Head
    // TDH = Static Head (elevation) + Friction Loss + Emitter Pressure (for dispersal)
    const dispersalTDH = totalElevation + totalDispersalFriction + emitterPressureFt

    // Flushing TDH doesn't include emitter pressure (water is flowing through, not emitting)
    const flushTDH = totalElevation + totalFlushFriction

    // Convert TDH to PSI for display (ft / 2.31)
    const dispersalTDH_PSI = dispersalTDH / 2.31
    const flushTDH_PSI = flushTDH / 2.31

    return {
      emittersPerLateral,
      flowPerLateral,
      dispersalFlowGPM,
      flushFlowPerLateral,
      flushFlowGPM,
      dispersalFrictionLosses,
      flushFrictionLosses,
      totalDispersalFriction,
      totalFlushFriction,
      totalElevation,
      emitterPressureFt,
      operatingPressurePSI,
      dispersalTDH,
      dispersalTDH_PSI,
      flushTDH,
      flushTDH_PSI,
    }
  }, [designInputs, pipeSegments])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Zone TDH Calculations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Total Dynamic Head calculations for dispersal and flushing modes.
        </p>
      </div>

      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dispersal Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Flow Rate:</span>
                <span className="font-medium">
                  {calculations.dispersalFlowGPM.toFixed(2)} GPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Static Head (Elevation):</span>
                <span className="font-medium">
                  {calculations.totalElevation.toFixed(1)} ft
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Friction Loss:</span>
                <span className="font-medium">
                  {calculations.totalDispersalFriction.toFixed(2)} ft
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emitter Pressure ({calculations.operatingPressurePSI} PSI):</span>
                <span className="font-medium">
                  {calculations.emitterPressureFt.toFixed(1)} ft
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total TDH:</span>
                <span className="text-teal-600">
                  {calculations.dispersalTDH.toFixed(1)} ft ({calculations.dispersalTDH_PSI.toFixed(1)} PSI)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flushing Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Flow Rate:</span>
                <span className="font-medium">
                  {calculations.flushFlowGPM.toFixed(2)} GPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Static Head (Elevation):</span>
                <span className="font-medium">
                  {calculations.totalElevation.toFixed(1)} ft
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Friction Loss:</span>
                <span className="font-medium">
                  {calculations.totalFlushFriction.toFixed(2)} ft
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total TDH:</span>
                <span className="text-teal-600">
                  {calculations.flushTDH.toFixed(1)} ft ({calculations.flushTDH_PSI.toFixed(1)} PSI)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Friction Loss Breakdown (Dispersal)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Segment</th>
                  <th className="text-right py-2">Flow (GPM)</th>
                  <th className="text-right py-2">Velocity (ft/s)</th>
                  <th className="text-right py-2">Elevation (ft)</th>
                  <th className="text-right py-2">Friction (ft)</th>
                </tr>
              </thead>
              <tbody>
                {calculations.dispersalFrictionLosses.map((loss, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2">{loss.segment}</td>
                    <td className="text-right py-2">{loss.flowGPM.toFixed(2)}</td>
                    <td className="text-right py-2">{loss.velocity.toFixed(2)}</td>
                    <td className="text-right py-2">{loss.elevation.toFixed(1)}</td>
                    <td className="text-right py-2">{loss.headLoss.toFixed(3)}</td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-100">
                  <td className="py-2">Total</td>
                  <td className="text-right py-2">-</td>
                  <td className="text-right py-2">-</td>
                  <td className="text-right py-2">{calculations.totalElevation.toFixed(1)}</td>
                  <td className="text-right py-2">
                    {calculations.totalDispersalFriction.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Friction Loss Breakdown (Flushing)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Segment</th>
                  <th className="text-right py-2">Flow (GPM)</th>
                  <th className="text-right py-2">Velocity (ft/s)</th>
                  <th className="text-right py-2">Elevation (ft)</th>
                  <th className="text-right py-2">Friction (ft)</th>
                </tr>
              </thead>
              <tbody>
                {calculations.flushFrictionLosses.map((loss, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2">{loss.segment}</td>
                    <td className="text-right py-2">{loss.flowGPM.toFixed(2)}</td>
                    <td className="text-right py-2">{loss.velocity.toFixed(2)}</td>
                    <td className="text-right py-2">{loss.elevation.toFixed(1)}</td>
                    <td className="text-right py-2">{loss.headLoss.toFixed(3)}</td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-100">
                  <td className="py-2">Total</td>
                  <td className="text-right py-2">-</td>
                  <td className="text-right py-2">-</td>
                  <td className="text-right py-2">{calculations.totalElevation.toFixed(1)}</td>
                  <td className="text-right py-2">
                    {calculations.totalFlushFriction.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">System Summary</h3>
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex justify-between">
            <span>Emitters per Lateral:</span>
            <span className="font-medium">{calculations.emittersPerLateral}</span>
          </div>
          <div className="flex justify-between">
            <span>Flow per Lateral:</span>
            <span className="font-medium">
              {calculations.flowPerLateral.toFixed(3)} GPM
            </span>
          </div>
          <div className="flex justify-between">
            <span>Dispersal Flow (per zone):</span>
            <span className="font-medium">
              {calculations.dispersalFlowGPM.toFixed(2)} GPM
            </span>
          </div>
          <div className="flex justify-between">
            <span>Flush Flow per Lateral:</span>
            <span className="font-medium">
              {calculations.flushFlowPerLateral.toFixed(3)} GPM
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Flush Flow (per zone):</span>
            <span className="font-medium">
              {calculations.flushFlowGPM.toFixed(2)} GPM
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Pipe Length:</span>
            <span className="font-medium">
              {pipeSegments.reduce((sum, seg) => sum + seg.length, 0).toFixed(0)} ft
            </span>
          </div>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2 text-teal-900">Pump Requirement</h3>
        <p className="text-sm text-teal-800">
          The pump must be capable of delivering{' '}
          <strong>{calculations.flushFlowGPM.toFixed(1)} GPM</strong> at{' '}
          <strong>{calculations.flushTDH.toFixed(0)} ft</strong> ({calculations.flushTDH_PSI.toFixed(0)} PSI)
          TDH for flushing mode, which is the higher demand condition.
        </p>
      </div>
    </div>
  )
}
