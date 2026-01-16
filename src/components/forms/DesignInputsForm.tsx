import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDesignStore } from '@/stores/designStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const designInputsSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  maxFlowGPD: z.number()
    .min(100, 'Minimum 100 GPD')
    .max(1000000, 'Maximum 1,000,000 GPD'),
  soilLoadingRate: z.number()
    .min(0.05, 'Minimum 0.05 gpd/ft²')
    .max(1.5, 'Maximum 1.5 gpd/ft²'),
  usableAcres: z.number()
    .min(0.1, 'Minimum 0.1 acres')
    .max(1000, 'Maximum 1000 acres'),
  driplineSpacing: z.number()
    .min(0.5, 'Minimum 0.5 feet')
    .max(10, 'Maximum 10 feet'),
  emitterSpacing: z.number()
    .min(4, 'Minimum 4 inches')
    .max(48, 'Maximum 48 inches'),
  numberOfZones: z.number()
    .int()
    .min(1, 'Minimum 1 zone')
    .max(50, 'Maximum 50 zones'),
  lateralsPerZone: z.number()
    .int()
    .min(1, 'Minimum 1 lateral')
    .max(100, 'Maximum 100 laterals'),
  lateralLength: z.number()
    .min(10, 'Minimum 10 feet')
    .max(2000, 'Maximum 2000 feet'),
  flushVelocity: z.number()
    .min(0.5, 'Minimum 0.5 ft/s')
    .max(3, 'Maximum 3 ft/s'),
  cyclesPerDay: z.number()
    .int()
    .min(1, 'Minimum 1 cycle')
    .max(48, 'Maximum 48 cycles'),
  tubeId: z.number()
    .min(0.3, 'Minimum 0.3 inches')
    .max(1, 'Maximum 1 inch'),
  emitterKd: z.number()
    .min(0.01, 'Minimum 0.01')
    .max(10, 'Maximum 10'),
  emitterExponent: z.number()
    .min(0, 'Minimum 0')
    .max(1, 'Maximum 1'),
  nominalFlowGPH: z.number()
    .min(0.1, 'Minimum 0.1 GPH')
    .max(10, 'Maximum 10 GPH'),
  operatingPressurePSI: z.number()
    .min(5, 'Minimum 5 PSI')
    .max(60, 'Maximum 60 PSI'),
})

type DesignInputsFormData = z.infer<typeof designInputsSchema>

export function DesignInputsForm() {
  const { designInputs, updateDesignInputs } = useDesignStore()

  const {
    register,
    formState: { errors },
  } = useForm<DesignInputsFormData>({
    resolver: zodResolver(designInputsSchema),
    defaultValues: {
      projectName: designInputs.projectName || '',
      maxFlowGPD: designInputs.maxFlowGPD || 1000,
      soilLoadingRate: designInputs.soilLoadingRate || 0.5,
      usableAcres: designInputs.usableAcres || 1,
      driplineSpacing: designInputs.driplineSpacing || 2,
      emitterSpacing: designInputs.emitterSpacing || 12,
      numberOfZones: designInputs.numberOfZones || 4,
      lateralsPerZone: designInputs.lateralsPerZone || 10,
      lateralLength: designInputs.lateralLength || 100,
      flushVelocity: designInputs.flushVelocity || 1.5,
      cyclesPerDay: designInputs.cyclesPerDay || 4,
      tubeId: designInputs.tubeId || 0.55,
      emitterKd: designInputs.emitterKd || 0.234,
      emitterExponent: designInputs.emitterExponent || 0.5,
      nominalFlowGPH: designInputs.nominalFlowGPH || 0.9,
      operatingPressurePSI: designInputs.operatingPressurePSI || 15,
    },
  })

  // Update store on blur instead of on every change
  const handleBlur = (field: keyof DesignInputsFormData) => (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'number'
      ? parseFloat(e.target.value) || 0
      : e.target.value
    updateDesignInputs({ [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Design Inputs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the basic parameters for your SDI system design.
        </p>
      </div>

      <form className="space-y-6">
        {/* Project Information */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Project Information
          </h3>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              {...register('projectName')}
              onBlur={handleBlur('projectName')}
              placeholder="Enter project name"
            />
            {errors.projectName && (
              <p className="text-sm text-red-500">{errors.projectName.message}</p>
            )}
          </div>
        </section>

        {/* Site Parameters */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Site Parameters
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxFlowGPD">Max Flow (GPD)</Label>
              <Input
                id="maxFlowGPD"
                type="number"
                step="1"
                {...register('maxFlowGPD', { valueAsNumber: true })}
                onBlur={handleBlur('maxFlowGPD')}
              />
              {errors.maxFlowGPD && (
                <p className="text-sm text-red-500">{errors.maxFlowGPD.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilLoadingRate">Soil Loading Rate (gpd/ft²)</Label>
              <Input
                id="soilLoadingRate"
                type="number"
                step="0.01"
                {...register('soilLoadingRate', { valueAsNumber: true })}
                onBlur={handleBlur('soilLoadingRate')}
              />
              {errors.soilLoadingRate && (
                <p className="text-sm text-red-500">{errors.soilLoadingRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usableAcres">Usable Acres</Label>
              <Input
                id="usableAcres"
                type="number"
                step="0.1"
                {...register('usableAcres', { valueAsNumber: true })}
                onBlur={handleBlur('usableAcres')}
              />
              {errors.usableAcres && (
                <p className="text-sm text-red-500">{errors.usableAcres.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Dripline Configuration */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Dripline Configuration
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="driplineSpacing">Dripline Spacing (ft)</Label>
              <Input
                id="driplineSpacing"
                type="number"
                step="0.5"
                {...register('driplineSpacing', { valueAsNumber: true })}
                onBlur={handleBlur('driplineSpacing')}
              />
              {errors.driplineSpacing && (
                <p className="text-sm text-red-500">{errors.driplineSpacing.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emitterSpacing">Emitter Spacing (in)</Label>
              <Input
                id="emitterSpacing"
                type="number"
                step="1"
                {...register('emitterSpacing', { valueAsNumber: true })}
                onBlur={handleBlur('emitterSpacing')}
              />
              {errors.emitterSpacing && (
                <p className="text-sm text-red-500">{errors.emitterSpacing.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Zone Configuration */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Zone Configuration
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="numberOfZones">Number of Zones</Label>
              <Input
                id="numberOfZones"
                type="number"
                step="1"
                {...register('numberOfZones', { valueAsNumber: true })}
                onBlur={handleBlur('numberOfZones')}
              />
              {errors.numberOfZones && (
                <p className="text-sm text-red-500">{errors.numberOfZones.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateralsPerZone">Laterals per Zone</Label>
              <Input
                id="lateralsPerZone"
                type="number"
                step="1"
                {...register('lateralsPerZone', { valueAsNumber: true })}
                onBlur={handleBlur('lateralsPerZone')}
              />
              {errors.lateralsPerZone && (
                <p className="text-sm text-red-500">{errors.lateralsPerZone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateralLength">Lateral Length (ft)</Label>
              <Input
                id="lateralLength"
                type="number"
                step="1"
                {...register('lateralLength', { valueAsNumber: true })}
                onBlur={handleBlur('lateralLength')}
              />
              {errors.lateralLength && (
                <p className="text-sm text-red-500">{errors.lateralLength.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Operating Parameters */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Operating Parameters
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="flushVelocity">Flush Velocity (ft/s)</Label>
              <Input
                id="flushVelocity"
                type="number"
                step="0.1"
                {...register('flushVelocity', { valueAsNumber: true })}
                onBlur={handleBlur('flushVelocity')}
              />
              {errors.flushVelocity && (
                <p className="text-sm text-red-500">{errors.flushVelocity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cyclesPerDay">Cycles per Day</Label>
              <Input
                id="cyclesPerDay"
                type="number"
                step="1"
                {...register('cyclesPerDay', { valueAsNumber: true })}
                onBlur={handleBlur('cyclesPerDay')}
              />
              {errors.cyclesPerDay && (
                <p className="text-sm text-red-500">{errors.cyclesPerDay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingPressurePSI">Operating Pressure (PSI)</Label>
              <Input
                id="operatingPressurePSI"
                type="number"
                step="1"
                {...register('operatingPressurePSI', { valueAsNumber: true })}
                onBlur={handleBlur('operatingPressurePSI')}
              />
              {errors.operatingPressurePSI && (
                <p className="text-sm text-red-500">{errors.operatingPressurePSI.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Drip Tube Parameters */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Drip Tube Parameters
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tubeId">Tube ID (inches)</Label>
              <Input
                id="tubeId"
                type="number"
                step="0.01"
                {...register('tubeId', { valueAsNumber: true })}
                onBlur={handleBlur('tubeId')}
              />
              {errors.tubeId && (
                <p className="text-sm text-red-500">{errors.tubeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nominalFlowGPH">Nominal Flow (GPH)</Label>
              <Input
                id="nominalFlowGPH"
                type="number"
                step="0.1"
                {...register('nominalFlowGPH', { valueAsNumber: true })}
                onBlur={handleBlur('nominalFlowGPH')}
              />
              {errors.nominalFlowGPH && (
                <p className="text-sm text-red-500">{errors.nominalFlowGPH.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emitterKd">Emitter Kd</Label>
              <Input
                id="emitterKd"
                type="number"
                step="0.001"
                {...register('emitterKd', { valueAsNumber: true })}
                onBlur={handleBlur('emitterKd')}
              />
              {errors.emitterKd && (
                <p className="text-sm text-red-500">{errors.emitterKd.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emitterExponent">Emitter Exponent</Label>
              <Input
                id="emitterExponent"
                type="number"
                step="0.01"
                {...register('emitterExponent', { valueAsNumber: true })}
                onBlur={handleBlur('emitterExponent')}
              />
              {errors.emitterExponent && (
                <p className="text-sm text-red-500">{errors.emitterExponent.message}</p>
              )}
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
