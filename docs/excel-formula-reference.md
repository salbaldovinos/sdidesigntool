# Excel Formula Reference

## Key Formulas Extracted from Geoflow ES Calcs Design Tool v1.1.xlsx

### Step 1 - Design Inputs

| Cell | Formula | Description | Sample Value |
|------|---------|-------------|--------------|
| A10 | `=A7/A8` | Total area ft² = maxFlowGPD / soilLoadingRate | 5250 |
| A14 | `=A10/A13` | Dripline required ft = totalArea / driplineSpacing | 2625 |
| A33 | `=A29*A28/A15*A18/60` | Dispersal flow GPM = laterals × lateralLength / emitterSpacing × emitterGPH / 60 | 13.13 |
| A34 | `=A30/0.4085*0.55^2*A29+A33` | Flushing flow GPM = flushVelocity / 0.4085 × tubeID² × laterals + dispersalFlow | 17.94 |

### Step 3 - Zone TDH (Friction Loss - Hazen-Williams Variant)

The Excel uses this friction loss formula (outputs PSI directly):

```
PSI Loss = 0.2083 * (100/C)^1.852 * Q^1.852 / ID^4.866 * 0.433 * Length/100 + ElevationPSI
```

Where:
- C = 150 (Hazen-Williams coefficient for PVC)
- Q = flow rate in GPM
- ID = pipe inside diameter in inches
- Length = pipe length in feet
- ElevationPSI = elevation × 0.433

### Velocity Formula
```
Velocity (fps) = 0.4085 × Q / D²
```

### Volume per Foot of Pipe
```
Gallons/ft = 0.04079905 × ID²
```

---

## Test Case from Excel

### Input Values (Step 3 - Zone TDH sheet)
- Drip Tube: G-WFPC-16-4-12-PRO
- Tube ID: 0.55 inches
- Emitter Spacing: 1 ft
- Nominal Flow: 0.015 GPM (0.9 GPH)
- Longest Lateral: 126 ft
- Number of Laterals: 2
- Flushing Velocity: 2 fps
- Max Inlet Pressure: 20 PSI
- Min Outlet Pressure: 20 PSI

### Pipe Configuration (rows 14-22)
| Segment | Pipe ID (in) | Length (ft) | Elevation (ft) |
|---------|--------------|-------------|----------------|
| 1. Headworks to flush discharge | 1.049 | 20 | -5 |
| 3. Return manifold to headworks | 1.049 | 140 | -5 |
| 5. Zone valve to supply manifold | 1.049 | 0 | 0 |
| 7. Headworks to zone valve | 1.049 | 140 | +5 |
| 9. Pump discharge to headworks | 1.049 | 20 | +5 |

### Calculated Flow Rates
- Dispersal Q/Lateral: 1.89 GPM
- Dispersal Q Zone: 3.78 GPM
- Flushing Q/Lateral: 3.371 GPM
- Flushing Q Zone: 6.742 GPM
- Return Q: 2.962 GPM

### Expected Results
| Metric | Value | Unit |
|--------|-------|------|
| Dispersal TDH | 37.46 | PSI |
| Dispersal TDH | 86.52 | ft |
| Flushing TDH | 63.49 | PSI |
| Flushing TDH | 146.67 | ft |

---

## Drip Tube Data

| Model | Tube ID | Emitter Kd | Exponent | Spacing (ft) | GPH |
|-------|---------|------------|----------|--------------|-----|
| G-WFPC-16-2-12-PRO | 0.55 | 2.07 | 0.05 | 1 | 0.6 |
| G-WFPC-16-2-24-PRO | 0.55 | 2.07 | 0.05 | 2 | 0.6 |
| G-WFPC-16-4-12-PRO | 0.55 | 2.07 | 0.02 | 1 | 0.9 |
| G-WFPC-16-4-24-PRO | 0.55 | 2.07 | 0.02 | 2 | 0.9 |
| G-WFPC-17-1.6-12-ECO | 0.56 | 0.92 | 0 | 1 | 0.42 |
| G-WFPC-17-1.6-24-ECO | 0.56 | 0.92 | 0 | 2 | 0.42 |

---

## Pipe Data (PVC Schedule 40)

| Nominal | OD (in) | ID (in) |
|---------|---------|---------|
| 1/2" | 0.84 | 0.622 |
| 3/4" | 1.05 | 0.824 |
| 1" | 1.315 | 1.049 |
| 1-1/4" | 1.66 | 1.38 |
| 1-1/2" | 1.9 | 1.61 |
| 2" | 2.375 | 2.067 |
| 2-1/2" | 2.875 | 2.469 |
| 3" | 3.5 | 3.068 |
| 4" | 4.5 | 4.026 |

---

## Constants Used
- Hazen-Williams C Factor (PVC): 150
- Error Factor (fittings/bends): 1.1
- PSI to ft conversion: 2.31
- ft to PSI conversion: 0.433
- Velocity constant: 0.4085
- Volume constant: 0.04079905
