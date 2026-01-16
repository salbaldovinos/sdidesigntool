// Hydraulic Validation Rules
// Rules that check hydraulic calculations and flow parameters

import type { ValidationRule } from '@/types/assistant'
import { calculateVelocity, calculateFrictionLossPSI } from '@/calculations/hydraulics'

// Maximum recommended mainline velocity (ft/s)
const MAX_MAINLINE_VELOCITY = 5.0

// Minimum flush velocity for wastewater applications (ft/s)
const MIN_FLUSH_VELOCITY_WASTEWATER = 1.0

// Maximum flush velocity to prevent emitter damage (ft/s)
const MAX_FLUSH_VELOCITY = 2.5

// Maximum recommended friction loss per segment (PSI)
const MAX_FRICTION_LOSS_PER_100FT = 2.0

// Type import for function signatures
import type { DesignState } from '@/types/assistant'

// Calculate mainline velocity from state
function getMainlineVelocity(state: DesignState): number | null {
  const { results, systemLayout } = state
  if (!results?.flowPerZone || !systemLayout?.[0]) return null

  // Use the first pipe segment for mainline velocity
  const mainlineSegment = systemLayout[0]
  return calculateVelocity(results.flowPerZone, mainlineSegment.pipeId)
}

export const hydraulicRules: ValidationRule[] = [
  // Rule: Mainline velocity too high
  {
    id: 'hydraulic-mainline-velocity-high',
    name: 'High Mainline Velocity',
    description: 'Mainline velocity exceeds recommended maximum of 5.0 ft/s',
    category: 'hydraulic',
    severity: 'error',
    appliesTo: [2, 3, 4],
    condition: (state) => {
      const velocity = getMainlineVelocity(state)
      return velocity !== null && velocity > MAX_MAINLINE_VELOCITY
    },
    message: (state) => {
      const velocity = getMainlineVelocity(state)
      return `Mainline velocity of ${velocity?.toFixed(2)} ft/s exceeds the maximum recommended value of ${MAX_MAINLINE_VELOCITY} ft/s. Consider increasing pipe diameter or reducing zone flow.`
    },
    field: 'pipeSize',
    source: () => 'ASAE EP405.1: Recommended max velocity is 5 ft/s to minimize surge and water hammer',
  },

  // Rule: Mainline velocity approaching limit
  {
    id: 'hydraulic-mainline-velocity-warning',
    name: 'Mainline Velocity Approaching Limit',
    description: 'Mainline velocity is above 4.0 ft/s',
    category: 'hydraulic',
    severity: 'warning',
    appliesTo: [2, 3, 4],
    condition: (state) => {
      const velocity = getMainlineVelocity(state)
      return velocity !== null && velocity > 4.0 && velocity <= MAX_MAINLINE_VELOCITY
    },
    message: (state) => {
      const velocity = getMainlineVelocity(state)
      return `Mainline velocity of ${velocity?.toFixed(2)} ft/s is approaching the ${MAX_MAINLINE_VELOCITY} ft/s limit. Consider increasing pipe diameter for safety margin.`
    },
    field: 'pipeSize',
    source: () => 'Best practice: Maintain velocity below 4 ft/s for optimal performance',
  },

  // Rule: Flush velocity too low for wastewater
  {
    id: 'hydraulic-flush-velocity-low',
    name: 'Low Flush Velocity',
    description: 'Flush velocity is below recommended minimum for adequate cleaning',
    category: 'hydraulic',
    severity: 'warning',
    appliesTo: [1, 3, 4],
    condition: (state) => {
      const flushVel = state.designInputs?.flushVelocity
      return flushVel !== undefined && flushVel < MIN_FLUSH_VELOCITY_WASTEWATER
    },
    message: (state) => {
      const flushVel = state.designInputs?.flushVelocity
      return `Flush velocity of ${flushVel?.toFixed(2)} ft/s is below the minimum ${MIN_FLUSH_VELOCITY_WASTEWATER} ft/s recommended for wastewater applications. This may result in inadequate lateral flushing.`
    },
    field: 'flushVelocity',
    source: () => 'Geoflow Installation Guidelines: Minimum 1.0 ft/s for SDI wastewater systems',
  },

  // Rule: Flush velocity too high
  {
    id: 'hydraulic-flush-velocity-high',
    name: 'High Flush Velocity',
    description: 'Flush velocity exceeds recommended maximum',
    category: 'hydraulic',
    severity: 'warning',
    appliesTo: [1, 3, 4],
    condition: (state) => {
      const flushVel = state.designInputs?.flushVelocity
      return flushVel !== undefined && flushVel > MAX_FLUSH_VELOCITY
    },
    message: (state) => {
      const flushVel = state.designInputs?.flushVelocity
      return `Flush velocity of ${flushVel?.toFixed(2)} ft/s exceeds the recommended maximum of ${MAX_FLUSH_VELOCITY} ft/s. High velocities may damage emitters over time.`
    },
    field: 'flushVelocity',
    source: () => 'Geoflow Installation Guidelines: Maximum 2.5 ft/s to prevent emitter wear',
  },

  // Rule: High friction loss in pipe segment
  {
    id: 'hydraulic-friction-loss-high',
    name: 'High Friction Loss',
    description: 'Friction loss in a pipe segment exceeds recommended limits',
    category: 'hydraulic',
    severity: 'warning',
    appliesTo: [2, 3, 4],
    condition: (state) => {
      const { systemLayout, results } = state
      if (!systemLayout?.length || !results?.flowPerZone) return false

      return systemLayout.some((segment) => {
        const frictionPer100ft = calculateFrictionLossPSI({
          flowRate: results.flowPerZone!,
          pipeDiameter: segment.pipeId,
          coefficient: segment.cFactor,
          pipeLength: 100,
        })
        return frictionPer100ft > MAX_FRICTION_LOSS_PER_100FT
      })
    },
    message: (state) => {
      const { systemLayout, results } = state
      if (!systemLayout?.length || !results?.flowPerZone) return ''

      const highLossSegments = systemLayout.filter((segment) => {
        const frictionPer100ft = calculateFrictionLossPSI({
          flowRate: results.flowPerZone!,
          pipeDiameter: segment.pipeId,
          coefficient: segment.cFactor,
          pipeLength: 100,
        })
        return frictionPer100ft > MAX_FRICTION_LOSS_PER_100FT
      })

      return `High friction loss detected in ${highLossSegments.map((s) => s.name).join(', ')}. Consider increasing pipe diameter to reduce head loss.`
    },
    source: () => 'Industry standard: Keep friction loss below 2 PSI per 100ft for efficiency',
  },

  // Rule: Operating pressure too low for PC emitters
  {
    id: 'hydraulic-pressure-low-for-pc',
    name: 'Low Operating Pressure',
    description: 'Operating pressure may be too low for pressure-compensating emitters',
    category: 'hydraulic',
    severity: 'warning',
    appliesTo: [1, 3, 4],
    condition: (state) => {
      const pressure = state.designInputs?.operatingPressurePSI
      return pressure !== undefined && pressure < 10
    },
    message: (state) => {
      const pressure = state.designInputs?.operatingPressurePSI
      return `Operating pressure of ${pressure} PSI is below the typical minimum for pressure-compensating emitters (10-15 PSI). Verify emitter specifications.`
    },
    field: 'operatingPressurePSI',
    source: () => 'Most PC emitters require 10-45 PSI operating range',
  },

  // Rule: Operating pressure too high
  {
    id: 'hydraulic-pressure-high',
    name: 'High Operating Pressure',
    description: 'Operating pressure exceeds typical emitter ratings',
    category: 'hydraulic',
    severity: 'warning',
    appliesTo: [1, 3, 4],
    condition: (state) => {
      const pressure = state.designInputs?.operatingPressurePSI
      return pressure !== undefined && pressure > 45
    },
    message: (state) => {
      const pressure = state.designInputs?.operatingPressurePSI
      return `Operating pressure of ${pressure} PSI exceeds typical PC emitter maximum (45 PSI). Verify emitter specifications and ensure adequate pressure regulation.`
    },
    field: 'operatingPressurePSI',
    source: () => 'Geoflow drip tubing: Recommended 15-30 PSI operating pressure',
  },

  // Rule: Very low flow rate per zone
  {
    id: 'hydraulic-flow-too-low',
    name: 'Very Low Zone Flow',
    description: 'Zone flow rate is below typical system minimums',
    category: 'hydraulic',
    severity: 'info',
    appliesTo: [3, 4],
    condition: (state) => {
      const flowPerZone = state.results?.flowPerZone
      return flowPerZone !== undefined && flowPerZone < 5
    },
    message: (state) => {
      const flowPerZone = state.results?.flowPerZone
      return `Zone flow of ${flowPerZone?.toFixed(1)} GPM is relatively low. Some equipment like Hydrotek valves require minimum 10 GPM flow.`
    },
    source: () => 'Hydrotek Valve Specifications: Minimum 10 GPM operating flow',
  },

  // Rule: Total elevation change is significant
  {
    id: 'hydraulic-elevation-significant',
    name: 'Significant Elevation Change',
    description: 'Total elevation change may require careful pressure management',
    category: 'hydraulic',
    severity: 'info',
    appliesTo: [2, 3, 4],
    condition: (state) => {
      const totalElevation = state.systemLayout?.reduce((sum, seg) => sum + seg.elevation, 0) ?? 0
      return Math.abs(totalElevation) > 20
    },
    message: (state) => {
      const totalElevation = state.systemLayout?.reduce((sum, seg) => sum + seg.elevation, 0) ?? 0
      const direction = totalElevation > 0 ? 'uphill' : 'downhill'
      const headChange = Math.abs(totalElevation * 0.433).toFixed(1)
      return `Total elevation change of ${Math.abs(totalElevation).toFixed(0)} ft ${direction} adds ${headChange} PSI static head. Ensure pump TDH accounts for this.`
    },
    source: () => '1 foot elevation = 0.433 PSI head',
  },
]
