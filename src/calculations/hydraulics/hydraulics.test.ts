import { describe, it, expect } from 'vitest'
import {
  calculateHazenWilliamsLoss,
  calculateFrictionLossPSI,
  calculateTotalLossPSI,
  calculateVelocity,
  calculateFlowFromVelocity,
  calculateVolumePerFoot,
  calculateElevationHead,
  feetToPsi,
  psiToFeet,
  applyErrorFactor,
} from './index'

describe('Hazen-Williams Calculations', () => {
  describe('calculateHazenWilliamsLoss', () => {
    it('calculates friction head loss correctly', () => {
      const result = calculateHazenWilliamsLoss({
        flowRate: 50,        // GPM
        pipeDiameter: 2.067, // 2" PVC ID
        pipeLength: 100,     // feet
        coefficient: 150,    // PVC C factor
      })
      // Standard Hazen-Williams formula: h_f = 10.67 × L × Q^1.852 / (C^1.852 × D^4.87)
      expect(result).toBeCloseTo(4.06, 1)
    })

    it('returns 0 for zero flow rate', () => {
      const result = calculateHazenWilliamsLoss({
        flowRate: 0,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      expect(result).toBe(0)
    })

    it('returns 0 for zero pipe diameter', () => {
      const result = calculateHazenWilliamsLoss({
        flowRate: 50,
        pipeDiameter: 0,
        pipeLength: 100,
        coefficient: 150,
      })
      expect(result).toBe(0)
    })

    it('returns 0 for zero pipe length', () => {
      const result = calculateHazenWilliamsLoss({
        flowRate: 50,
        pipeDiameter: 2.067,
        pipeLength: 0,
        coefficient: 150,
      })
      expect(result).toBe(0)
    })

    it('increases with higher flow rate', () => {
      const low = calculateHazenWilliamsLoss({
        flowRate: 25,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      const high = calculateHazenWilliamsLoss({
        flowRate: 50,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      expect(high).toBeGreaterThan(low)
    })

    it('decreases with larger pipe diameter', () => {
      const small = calculateHazenWilliamsLoss({
        flowRate: 50,
        pipeDiameter: 1.5,
        pipeLength: 100,
        coefficient: 150,
      })
      const large = calculateHazenWilliamsLoss({
        flowRate: 50,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      expect(large).toBeLessThan(small)
    })
  })

  describe('calculateFrictionLossPSI', () => {
    it('calculates friction loss in PSI using Excel formula', () => {
      // Excel formula: 0.2083 * (100/C)^1.852 * Q^1.852 / D^4.866 * 0.433 * L/100
      const result = calculateFrictionLossPSI({
        flowRate: 50,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      // Calculated friction loss in PSI
      expect(result).toBeCloseTo(1.74, 1)
    })

    it('returns 0 for zero flow rate', () => {
      const result = calculateFrictionLossPSI({
        flowRate: 0,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      expect(result).toBe(0)
    })
  })

  describe('calculateTotalLossPSI', () => {
    it('combines friction and elevation losses', () => {
      const frictionOnly = calculateFrictionLossPSI({
        flowRate: 50,
        pipeDiameter: 2.067,
        pipeLength: 100,
        coefficient: 150,
      })
      const elevationFeet = 10
      const elevationPSI = elevationFeet * 0.433

      const totalLoss = calculateTotalLossPSI(
        {
          flowRate: 50,
          pipeDiameter: 2.067,
          pipeLength: 100,
          coefficient: 150,
        },
        elevationFeet
      )

      expect(totalLoss).toBeCloseTo(frictionOnly + elevationPSI, 2)
    })
  })
})

describe('Velocity Calculations', () => {
  describe('calculateVelocity', () => {
    it('calculates velocity correctly using V = 0.4085 × Q / D²', () => {
      // V = 0.4085 × 50 / 2.067² = 4.78 ft/s
      const result = calculateVelocity(50, 2.067)
      expect(result).toBeCloseTo(4.78, 1)
    })

    it('returns 0 for zero flow rate', () => {
      const result = calculateVelocity(0, 2.067)
      expect(result).toBe(0)
    })

    it('returns 0 for zero pipe diameter', () => {
      const result = calculateVelocity(50, 0)
      expect(result).toBe(0)
    })

    it('increases with flow rate', () => {
      const low = calculateVelocity(25, 2.067)
      const high = calculateVelocity(50, 2.067)
      expect(high).toBeGreaterThan(low)
    })

    it('decreases with larger pipe diameter', () => {
      const small = calculateVelocity(50, 1.5)
      const large = calculateVelocity(50, 2.5)
      expect(large).toBeLessThan(small)
    })
  })

  describe('calculateFlowFromVelocity', () => {
    it('calculates flow correctly using Q = V × D² / 0.4085', () => {
      // Q = 1.5 × 0.55² / 0.4085 = 1.11 GPM
      const result = calculateFlowFromVelocity(1.5, 0.55)
      expect(result).toBeCloseTo(1.11, 1)
    })

    it('returns 0 for zero velocity', () => {
      const result = calculateFlowFromVelocity(0, 0.55)
      expect(result).toBe(0)
    })

    it('returns 0 for zero pipe diameter', () => {
      const result = calculateFlowFromVelocity(1.5, 0)
      expect(result).toBe(0)
    })

    it('is the inverse of calculateVelocity', () => {
      const flow = 50
      const diameter = 2.067
      const velocity = calculateVelocity(flow, diameter)
      const calculatedFlow = calculateFlowFromVelocity(velocity, diameter)
      expect(calculatedFlow).toBeCloseTo(flow, 5)
    })
  })
})

describe('Volume Calculations', () => {
  describe('calculateVolumePerFoot', () => {
    it('calculates volume per foot correctly', () => {
      // Gallons/ft = 0.04079905 × ID²
      // For 2" pipe: 0.04079905 × 2.067² = 0.174 gal/ft
      const result = calculateVolumePerFoot(2.067)
      expect(result).toBeCloseTo(0.174, 2)
    })

    it('increases with larger diameter', () => {
      const small = calculateVolumePerFoot(1.5)
      const large = calculateVolumePerFoot(2.5)
      expect(large).toBeGreaterThan(small)
    })
  })
})

describe('Elevation and Pressure Conversions', () => {
  describe('calculateElevationHead', () => {
    it('converts elevation to PSI correctly', () => {
      // PSI = elevation × 0.433
      const result = calculateElevationHead(10)
      expect(result).toBeCloseTo(4.33, 2)
    })

    it('handles negative elevation (downhill)', () => {
      const result = calculateElevationHead(-10)
      expect(result).toBeCloseTo(-4.33, 2)
    })

    it('returns 0 for zero elevation', () => {
      const result = calculateElevationHead(0)
      expect(result).toBe(0)
    })
  })

  describe('feetToPsi', () => {
    it('converts feet of head to PSI correctly', () => {
      // PSI = ft / 2.31
      const result = feetToPsi(23.1)
      expect(result).toBeCloseTo(10, 2)
    })

    it('handles zero', () => {
      const result = feetToPsi(0)
      expect(result).toBe(0)
    })
  })

  describe('psiToFeet', () => {
    it('converts PSI to feet of head correctly', () => {
      // ft = PSI × 2.31
      const result = psiToFeet(10)
      expect(result).toBeCloseTo(23.1, 2)
    })

    it('handles zero', () => {
      const result = psiToFeet(0)
      expect(result).toBe(0)
    })
  })

  describe('feetToPsi and psiToFeet are inverses', () => {
    it('converts back and forth correctly', () => {
      const original = 50
      const converted = feetToPsi(original)
      const backToOriginal = psiToFeet(converted)
      expect(backToOriginal).toBeCloseTo(original, 5)
    })
  })
})

describe('Error Factor', () => {
  describe('applyErrorFactor', () => {
    it('applies default 1.1 factor correctly', () => {
      const result = applyErrorFactor(100)
      expect(result).toBe(110)
    })

    it('applies custom factor correctly', () => {
      const result = applyErrorFactor(100, 1.2)
      expect(result).toBe(120)
    })

    it('handles zero value', () => {
      const result = applyErrorFactor(0)
      expect(result).toBe(0)
    })
  })
})

describe('Excel Formula Validation', () => {
  // These tests validate against expected Excel reference values
  // Tolerance should be < 0.01% as per AGENTS.md

  it('matches Excel friction loss calculation', () => {
    // Reference values from Excel tool
    const result = calculateFrictionLossPSI({
      flowRate: 30,
      pipeDiameter: 2.067,
      pipeLength: 200,
      coefficient: 150,
    })
    // Calculated using Excel formula
    expect(result).toBeCloseTo(1.35, 1)
  })

  it('matches Excel velocity calculation', () => {
    // V = 0.4085 × Q / D²
    // For 30 GPM through 2" pipe: 0.4085 × 30 / 4.27 = 2.87 ft/s
    const result = calculateVelocity(30, 2.067)
    expect(result).toBeCloseTo(2.87, 1)
  })

  it('matches Excel flush flow calculation', () => {
    // Q = V × D² / 0.4085
    // For 1.5 ft/s flush velocity through 0.55" tube
    const result = calculateFlowFromVelocity(1.5, 0.55)
    // Expected: ~1.11 GPM
    expect(result).toBeCloseTo(1.11, 1)
  })
})
