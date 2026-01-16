/**
 * Validate calculations against Excel reference values
 * Run with: node scripts/validate-calculations.js
 */

import Decimal from 'decimal.js-light';

// Calculation functions (matching src/calculations/hydraulics/index.ts)

function calculateVelocity(flowGPM, pipeIdInches) {
  const Q = new Decimal(flowGPM);
  const D = new Decimal(pipeIdInches);
  return new Decimal('0.4085').times(Q).dividedBy(D.pow(2)).toNumber();
}

function calculateFrictionLossPSI(flowRate, pipeDiameter, pipeLength, coefficient = 150) {
  if (flowRate <= 0 || pipeDiameter <= 0 || pipeLength <= 0) return 0;

  const Q = new Decimal(flowRate);
  const D = new Decimal(pipeDiameter);
  const L = new Decimal(pipeLength);
  const C = new Decimal(coefficient);

  // Excel formula: 0.2083 * (100/C)^1.852 * Q^1.852 / D^4.866 * 0.433 * L/100
  const result = new Decimal('0.2083')
    .times(new Decimal(100).dividedBy(C).pow(1.852))
    .times(Q.pow(1.852))
    .dividedBy(D.pow(4.866))
    .times('0.433')
    .times(L)
    .dividedBy(100);

  return result.toNumber();
}

function calculateFlowFromVelocity(velocityFPS, pipeIdInches) {
  const V = new Decimal(velocityFPS);
  const D = new Decimal(pipeIdInches);
  return V.times(D.pow(2)).dividedBy('0.4085').toNumber();
}

// Test helper
function assertClose(actual, expected, tolerance, description) {
  const diff = Math.abs(actual - expected);
  const percentDiff = (diff / expected) * 100;
  const passed = percentDiff <= tolerance;

  console.log(`${passed ? '✓' : '✗'} ${description}`);
  console.log(`  Expected: ${expected}`);
  console.log(`  Actual:   ${actual.toFixed(6)}`);
  console.log(`  Diff:     ${percentDiff.toFixed(4)}% (tolerance: ${tolerance}%)`);
  console.log('');

  return passed;
}

// Run tests
console.log('='.repeat(60));
console.log('VALIDATING CALCULATIONS AGAINST EXCEL REFERENCE');
console.log('='.repeat(60));
console.log('');

let allPassed = true;

// Test 1: Velocity calculation
// Excel: J14 = 0.4085*G14/(LOOKUP($B$14,Table5[OD Inches],Table5[ID Inches]))^2
// G14 (return flow) = 2.962 GPM, 1" pipe ID = 1.049
console.log('--- Test 1: Velocity Calculation ---');
const velocity1 = calculateVelocity(2.962, 1.049);
allPassed &= assertClose(velocity1, 1.0996, 1, 'Return velocity (2.962 GPM, 1" pipe)');

// Test 2: Flush flow from velocity
// Excel calculates flush flow based on 2 fps velocity and 0.55" tube ID
console.log('--- Test 2: Flush Flow from Velocity ---');
const flushFlow = calculateFlowFromVelocity(2, 0.55);
allPassed &= assertClose(flushFlow, 1.481, 1, 'Flush flow per lateral (2 fps, 0.55" tube)');

// Test 3: Friction loss calculation
// Excel L20: 3.783 PSI for segment 7 (headworks to zone valve)
// Flow: 6.742 GPM, Pipe ID: 1.049", Length: 140 ft, Elevation: +5 ft
console.log('--- Test 3: Friction Loss PSI ---');
const frictionLoss = calculateFrictionLossPSI(6.742, 1.049, 140, 150);
const elevationPSI = 5 * 0.433;
const totalLoss = frictionLoss + elevationPSI;
allPassed &= assertClose(totalLoss, 3.783, 2, 'Total loss segment 7 (6.742 GPM, 140ft, +5ft elev)');

// Test 4: Zone dispersal flow calculation
// Q Zone = laterals × (emitters/lateral) × emitter GPH / 60
// 2 laterals × (126/1) emitters × 0.9 GPH / 60 = 3.78 GPM
console.log('--- Test 4: Zone Dispersal Flow ---');
const laterals = 2;
const lateralLength = 126;
const emitterSpacingFt = 1;
const emitterGPH = 0.9;
const emittersPerLateral = Math.floor(lateralLength / emitterSpacingFt);
const dispersalFlow = (emittersPerLateral * laterals * emitterGPH) / 60;
allPassed &= assertClose(dispersalFlow, 3.78, 1, 'Zone dispersal flow');

// Test 5: Zone flushing flow calculation
// Q Flush = dispersal flow + (flush flow per lateral × laterals)
// = 3.78 + (1.481 × 2) = 6.742 GPM
console.log('--- Test 5: Zone Flushing Flow ---');
const flushFlowPerLateral = calculateFlowFromVelocity(2, 0.55);
const zoneFlushFlow = dispersalFlow + (flushFlowPerLateral * laterals);
allPassed &= assertClose(zoneFlushFlow, 6.742, 1, 'Zone flushing flow');

// Test 6: Full TDH calculation (simplified - just friction + elevation)
// From Excel, flushing TDH should be ~63.49 PSI / 146.67 ft
console.log('--- Test 6: Simplified TDH Check ---');
// Using single segment for validation
const segment7Loss = calculateFrictionLossPSI(6.742, 1.049, 140, 150);
console.log(`  Segment 7 friction only: ${segment7Loss.toFixed(4)} PSI`);

console.log('');
console.log('='.repeat(60));
console.log(allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED');
console.log('='.repeat(60));

// Print summary of key values for comparison
console.log('');
console.log('KEY VALUES FOR MANUAL VERIFICATION:');
console.log('-----------------------------------');
console.log(`Velocity (2.962 GPM, 1.049" pipe): ${calculateVelocity(2.962, 1.049).toFixed(4)} fps`);
console.log(`Velocity (6.742 GPM, 1.049" pipe): ${calculateVelocity(6.742, 1.049).toFixed(4)} fps`);
console.log(`Flush flow (2 fps, 0.55" tube): ${calculateFlowFromVelocity(2, 0.55).toFixed(4)} GPM`);
console.log(`Friction (6.742 GPM, 1.049", 140ft): ${calculateFrictionLossPSI(6.742, 1.049, 140, 150).toFixed(4)} PSI`);
console.log(`Friction (3.78 GPM, 1.049", 140ft): ${calculateFrictionLossPSI(3.78, 1.049, 140, 150).toFixed(4)} PSI`);
