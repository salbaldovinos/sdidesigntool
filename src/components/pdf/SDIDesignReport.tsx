import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { DesignInputs, PipeSegment } from '@/types/design'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  projectName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    color: '#2563eb',
  },
  date: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    color: '#6b7280',
    flex: 1,
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    textAlign: 'right',
  },
  highlightBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  highlightTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  highlightGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  highlightItem: {
    alignItems: 'center',
  },
  highlightValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  highlightLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusAdequate: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusInsufficient: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
})

interface ReportData {
  projectName: string
  generatedDate: string
  designInputs: Partial<DesignInputs>
  pipeSegments: PipeSegment[]
  calculations: {
    // Area
    totalAreaSqFt: number
    requiredAreaSqFt: number
    areaAdequate: boolean
    areaUtilization: number
    // Dripline
    totalLaterals: number
    emittersPerLateral: number
    totalEmitters: number
    actualDriplineInstalled: number
    // Flow
    flowPerLateral: number
    dispersalFlowGPM: number
    flushFlowGPM: number
    totalDailyFlowGPD: number
    // Cycle
    gallonsPerZonePerCycle: number
    doseTimeMinutes: number
    // TDH
    totalElevation: number
    dispersalFriction: number
    flushFriction: number
    emitterPressureFt: number
    dispersalTDH: number
    flushTDH: number
    designTDH: number
    designTDH_PSI: number
    designFlowGPM: number
    limitingCondition: string
  }
}

export function SDIDesignReport({ data }: { data: ReportData }) {
  const { projectName, generatedDate, designInputs, pipeSegments, calculations } = data

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Geoflow SDI Design Report</Text>
          <Text style={styles.subtitle}>Subsurface Drip Irrigation System Design</Text>
          <Text style={styles.projectName}>{projectName}</Text>
          <Text style={styles.date}>Generated: {generatedDate}</Text>
        </View>

        {/* Pump Selection Criteria - Highlighted */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>Pump Selection Criteria</Text>
          <View style={styles.highlightGrid}>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightValue}>{calculations.designFlowGPM.toFixed(1)}</Text>
              <Text style={styles.highlightLabel}>GPM (Design Flow)</Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightValue}>{calculations.designTDH.toFixed(0)}</Text>
              <Text style={styles.highlightLabel}>ft TDH</Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightValue}>{calculations.designTDH_PSI.toFixed(0)}</Text>
              <Text style={styles.highlightLabel}>PSI</Text>
            </View>
          </View>
          <Text style={{ fontSize: 9, color: '#1e40af', marginTop: 8, textAlign: 'center' }}>
            Limiting Condition: {calculations.limitingCondition} Mode
          </Text>
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Left Column */}
          <View style={styles.column}>
            {/* Area Analysis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Area Analysis</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Available Area</Text>
                <Text style={styles.value}>{calculations.totalAreaSqFt.toLocaleString()} ft²</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Required Area</Text>
                <Text style={styles.value}>{calculations.requiredAreaSqFt.toLocaleString()} ft²</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Area Utilization</Text>
                <Text style={styles.value}>{calculations.areaUtilization.toFixed(1)}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, { color: calculations.areaAdequate ? '#166534' : '#92400e' }]}>
                  {calculations.areaAdequate ? 'Adequate' : 'Insufficient'}
                </Text>
              </View>
            </View>

            {/* Dripline & Emitters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dripline & Emitters</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Total Laterals</Text>
                <Text style={styles.value}>{calculations.totalLaterals}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Emitters per Lateral</Text>
                <Text style={styles.value}>{calculations.emittersPerLateral}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total Emitters</Text>
                <Text style={styles.value}>{calculations.totalEmitters.toLocaleString()}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dripline Installed</Text>
                <Text style={styles.value}>{calculations.actualDriplineInstalled.toLocaleString()} ft</Text>
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {/* Flow Requirements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Flow Requirements</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Flow per Lateral</Text>
                <Text style={styles.value}>{calculations.flowPerLateral.toFixed(3)} GPM</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dispersal Flow/Zone</Text>
                <Text style={styles.value}>{calculations.dispersalFlowGPM.toFixed(2)} GPM</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Flush Flow/Zone</Text>
                <Text style={styles.value}>{calculations.flushFlowGPM.toFixed(2)} GPM</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Design Daily Flow</Text>
                <Text style={styles.value}>{calculations.totalDailyFlowGPD.toLocaleString()} GPD</Text>
              </View>
            </View>

            {/* Cycle Timing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cycle Timing</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Cycles per Day</Text>
                <Text style={styles.value}>{designInputs.cyclesPerDay}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Number of Zones</Text>
                <Text style={styles.value}>{designInputs.numberOfZones}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dose per Zone/Cycle</Text>
                <Text style={styles.value}>{calculations.gallonsPerZonePerCycle.toFixed(1)} gal</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dose Time</Text>
                <Text style={styles.value}>{calculations.doseTimeMinutes.toFixed(1)} min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TDH Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TDH Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Component</Text>
              <Text style={styles.tableCellRight}>Dispersal</Text>
              <Text style={styles.tableCellRight}>Flushing</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Static Head (Elevation)</Text>
              <Text style={styles.tableCellRight}>{calculations.totalElevation.toFixed(1)} ft</Text>
              <Text style={styles.tableCellRight}>{calculations.totalElevation.toFixed(1)} ft</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Friction Loss</Text>
              <Text style={styles.tableCellRight}>{calculations.dispersalFriction.toFixed(2)} ft</Text>
              <Text style={styles.tableCellRight}>{calculations.flushFriction.toFixed(2)} ft</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Emitter Pressure ({designInputs.operatingPressurePSI} PSI)</Text>
              <Text style={styles.tableCellRight}>{calculations.emitterPressureFt.toFixed(1)} ft</Text>
              <Text style={styles.tableCellRight}>N/A</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>Total TDH</Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>{calculations.dispersalTDH.toFixed(1)} ft</Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>{calculations.flushTDH.toFixed(1)} ft</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>Total TDH (PSI)</Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>{(calculations.dispersalTDH / 2.31).toFixed(1)} PSI</Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>{(calculations.flushTDH / 2.31).toFixed(1)} PSI</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Geoflow SDI Designer | Subsurface Drip Irrigation Design Tool</Text>
        </View>
      </Page>

      {/* Page 2 - Design Inputs & Pipe Layout */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Design Inputs & System Layout</Text>
          <Text style={styles.projectName}>{projectName}</Text>
        </View>

        <View style={styles.twoColumn}>
          {/* Site Parameters */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Site Parameters</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Max Flow</Text>
                <Text style={styles.value}>{designInputs.maxFlowGPD?.toLocaleString()} GPD</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Soil Loading Rate</Text>
                <Text style={styles.value}>{designInputs.soilLoadingRate} gpd/ft²</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Usable Acres</Text>
                <Text style={styles.value}>{designInputs.usableAcres}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dripline Configuration</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Dripline Spacing</Text>
                <Text style={styles.value}>{designInputs.driplineSpacing} ft</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Emitter Spacing</Text>
                <Text style={styles.value}>{designInputs.emitterSpacing} in</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Zone Configuration</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Number of Zones</Text>
                <Text style={styles.value}>{designInputs.numberOfZones}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Laterals per Zone</Text>
                <Text style={styles.value}>{designInputs.lateralsPerZone}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Lateral Length</Text>
                <Text style={styles.value}>{designInputs.lateralLength} ft</Text>
              </View>
            </View>
          </View>

          {/* Drip Tube & Operating Parameters */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Drip Tube Parameters</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Tube ID</Text>
                <Text style={styles.value}>{designInputs.tubeId} in</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nominal Flow</Text>
                <Text style={styles.value}>{designInputs.nominalFlowGPH} GPH</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Emitter Kd</Text>
                <Text style={styles.value}>{designInputs.emitterKd}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Emitter Exponent</Text>
                <Text style={styles.value}>{designInputs.emitterExponent}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operating Parameters</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Flush Velocity</Text>
                <Text style={styles.value}>{designInputs.flushVelocity} ft/s</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cycles per Day</Text>
                <Text style={styles.value}>{designInputs.cyclesPerDay}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Operating Pressure</Text>
                <Text style={styles.value}>{designInputs.operatingPressurePSI} PSI</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pipe Layout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pipe Layout</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Segment</Text>
              <Text style={styles.tableCellRight}>Pipe Size</Text>
              <Text style={styles.tableCellRight}>Length (ft)</Text>
              <Text style={styles.tableCellRight}>Elevation (ft)</Text>
              <Text style={styles.tableCellRight}>C Factor</Text>
            </View>
            {pipeSegments.map((segment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{segment.name}</Text>
                <Text style={styles.tableCellRight}>{segment.pipeSize}" PVC</Text>
                <Text style={styles.tableCellRight}>{segment.length}</Text>
                <Text style={styles.tableCellRight}>{segment.elevation ?? 0}</Text>
                <Text style={styles.tableCellRight}>{segment.cFactor}</Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Total</Text>
              <Text style={styles.tableCellRight}>-</Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>
                {pipeSegments.reduce((sum, s) => sum + s.length, 0)}
              </Text>
              <Text style={[styles.tableCellRight, { fontFamily: 'Helvetica-Bold' }]}>
                {pipeSegments.reduce((sum, s) => sum + (s.elevation ?? 0), 0)}
              </Text>
              <Text style={styles.tableCellRight}>-</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Geoflow SDI Designer | Subsurface Drip Irrigation Design Tool</Text>
        </View>
      </Page>
    </Document>
  )
}

export type { ReportData }
