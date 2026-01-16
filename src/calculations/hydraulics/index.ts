import Decimal from 'decimal.js-light'

export interface HazenWilliamsParams {
  flowRate: number      // GPM
  pipeDiameter: number  // inches (ID)
  pipeLength: number    // feet
  coefficient: number   // C value (typically 150 for PVC)
}

/**
 * Calculate friction head loss using Hazen-Williams formula
 * Standard formula: h_f = 10.67 × L × Q^1.852 / (C^1.852 × D^4.87)
 *
 * @returns Head loss in feet
 */
export function calculateHazenWilliamsLoss(params: HazenWilliamsParams): number {
  const { flowRate, pipeDiameter, pipeLength, coefficient } = params

  // Handle edge cases
  if (flowRate <= 0 || pipeDiameter <= 0 || pipeLength <= 0) {
    return 0
  }

  const Q = new Decimal(flowRate)
  const D = new Decimal(pipeDiameter)
  const L = new Decimal(pipeLength)
  const C = new Decimal(coefficient)

  const numerator = new Decimal('10.67')
    .times(L)
    .times(Q.pow(1.852))

  const denominator = C.pow(1.852).times(D.pow(4.87))

  return numerator.dividedBy(denominator).toNumber()
}

/**
 * Calculate friction loss using the Excel formula variant
 * Excel formula: PSI = 0.2083 * (100/C)^1.852 * Q^1.852 / D^4.866 * 0.433 * Length/100
 *
 * This is the formula used in the Geoflow Excel tool.
 *
 * @returns Friction loss in PSI
 */
export function calculateFrictionLossPSI(params: HazenWilliamsParams): number {
  const { flowRate, pipeDiameter, pipeLength, coefficient } = params

  // Handle edge cases
  if (flowRate <= 0 || pipeDiameter <= 0 || pipeLength <= 0) {
    return 0
  }

  const Q = new Decimal(flowRate)
  const D = new Decimal(pipeDiameter)
  const L = new Decimal(pipeLength)
  const C = new Decimal(coefficient)

  // 0.2083 * (100/C)^1.852 * Q^1.852 / D^4.866 * 0.433 * L/100
  const result = new Decimal('0.2083')
    .times(new Decimal(100).dividedBy(C).pow(1.852))
    .times(Q.pow(1.852))
    .dividedBy(D.pow(4.866))
    .times('0.433')
    .times(L)
    .dividedBy(100)

  return result.toNumber()
}

/**
 * Calculate friction loss with elevation change
 * Matches Excel: frictionPSI + elevationPSI
 *
 * @returns Total head loss in PSI (friction + elevation)
 */
export function calculateTotalLossPSI(
  params: HazenWilliamsParams,
  elevationFeet: number
): number {
  const frictionPSI = calculateFrictionLossPSI(params)
  const elevationPSI = elevationFeet * 0.433

  return frictionPSI + elevationPSI
}

/**
 * Calculate flow velocity in a pipe
 * V = 0.4085 × Q / D²
 *
 * @param flowGPM Flow rate in GPM
 * @param pipeIdInches Inside diameter in inches
 * @returns Velocity in ft/s
 */
export function calculateVelocity(flowGPM: number, pipeIdInches: number): number {
  if (flowGPM <= 0 || pipeIdInches <= 0) {
    return 0
  }

  const Q = new Decimal(flowGPM)
  const D = new Decimal(pipeIdInches)

  return new Decimal('0.4085')
    .times(Q)
    .dividedBy(D.pow(2))
    .toNumber()
}

/**
 * Calculate flush flow rate based on velocity
 * Q = V × D² / 0.4085
 *
 * @param velocityFPS Target velocity in ft/s
 * @param pipeIdInches Inside diameter in inches
 * @returns Flow rate in GPM
 */
export function calculateFlowFromVelocity(
  velocityFPS: number,
  pipeIdInches: number
): number {
  if (velocityFPS <= 0 || pipeIdInches <= 0) {
    return 0
  }

  const V = new Decimal(velocityFPS)
  const D = new Decimal(pipeIdInches)

  return V.times(D.pow(2)).dividedBy('0.4085').toNumber()
}

/**
 * Calculate volume per foot of pipe
 * Gallons/ft = 0.04079905 × ID²
 */
export function calculateVolumePerFoot(pipeIdInches: number): number {
  return new Decimal('0.04079905')
    .times(new Decimal(pipeIdInches).pow(2))
    .toNumber()
}

/**
 * Calculate elevation head in PSI
 * PSI = elevation × 0.433
 *
 * @param elevationFeet Elevation difference in feet
 * @returns Pressure in PSI
 */
export function calculateElevationHead(elevationFeet: number): number {
  return new Decimal(elevationFeet)
    .times('0.433')
    .toNumber()
}

/**
 * Convert feet of head to PSI
 * PSI = ft / 2.31
 */
export function feetToPsi(feet: number): number {
  return new Decimal(feet).dividedBy('2.31').toNumber()
}

/**
 * Convert PSI to feet of head
 * ft = PSI × 2.31
 */
export function psiToFeet(psi: number): number {
  return new Decimal(psi).times('2.31').toNumber()
}

/**
 * Apply error factor for fittings and bends
 * Standard irrigation industry factor is 1.1
 */
export function applyErrorFactor(value: number, factor: number = 1.1): number {
  return new Decimal(value).times(factor).toNumber()
}
