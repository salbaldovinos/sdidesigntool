import { useDesignStore } from '@/stores/designStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { SystemLayoutDiagram } from '@/components/SystemLayoutDiagram'

// Common PVC pipe sizes with inside diameters
const PIPE_SIZES = [
  { size: '0.75', id: 0.824, label: '3/4" PVC' },
  { size: '1', id: 1.049, label: '1" PVC' },
  { size: '1.25', id: 1.38, label: '1-1/4" PVC' },
  { size: '1.5', id: 1.61, label: '1-1/2" PVC' },
  { size: '2', id: 2.067, label: '2" PVC' },
  { size: '2.5', id: 2.469, label: '2-1/2" PVC' },
  { size: '3', id: 3.068, label: '3" PVC' },
  { size: '4', id: 4.026, label: '4" PVC' },
]

export function SystemLayoutForm() {
  const {
    pipeSegments,
    addPipeSegment,
    updatePipeSegment,
    removePipeSegment,
  } = useDesignStore()

  const handlePipeSizeChange = (id: string, size: string) => {
    const pipe = PIPE_SIZES.find((p) => p.size === size)
    if (pipe) {
      updatePipeSegment(id, { pipeSize: size, pipeId: pipe.id })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">System Layout</h2>
        <p className="text-sm text-gray-500 mt-1">
          Define the pipe segments from the pump to the zone manifolds.
        </p>
      </div>

      {/* Reference Diagram */}
      <SystemLayoutDiagram />

      {/* Pipe Segments Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200 mb-4">
          Pipe Segments
        </h3>
      </div>

      <div className="space-y-4">
        {pipeSegments.map((segment, index) => (
          <Card key={segment.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Segment {index + 1}: {segment.name}</span>
                {pipeSegments.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePipeSegment(segment.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`name-${segment.id}`}>Segment Name</Label>
                  <Input
                    id={`name-${segment.id}`}
                    value={segment.name}
                    onChange={(e) =>
                      updatePipeSegment(segment.id, { name: e.target.value })
                    }
                    placeholder="e.g., Main Line"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`size-${segment.id}`}>Pipe Size</Label>
                  <select
                    id={`size-${segment.id}`}
                    value={segment.pipeSize}
                    onChange={(e) =>
                      handlePipeSizeChange(segment.id, e.target.value)
                    }
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base shadow-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {PIPE_SIZES.map((pipe) => (
                      <option key={pipe.size} value={pipe.size}>
                        {pipe.label} (ID: {pipe.id}")
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`length-${segment.id}`}>Length (ft)</Label>
                  <Input
                    id={`length-${segment.id}`}
                    type="number"
                    step="1"
                    min="1"
                    value={segment.length}
                    onChange={(e) =>
                      updatePipeSegment(segment.id, {
                        length: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`elevation-${segment.id}`}>Elevation (ft)</Label>
                  <Input
                    id={`elevation-${segment.id}`}
                    type="number"
                    step="1"
                    value={segment.elevation}
                    onChange={(e) =>
                      updatePipeSegment(segment.id, {
                        elevation: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="+5 or -5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cfactor-${segment.id}`}>C Factor</Label>
                  <Input
                    id={`cfactor-${segment.id}`}
                    type="number"
                    step="1"
                    min="100"
                    max="160"
                    value={segment.cFactor}
                    onChange={(e) =>
                      updatePipeSegment(segment.id, {
                        cFactor: parseFloat(e.target.value) || 150,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addPipeSegment} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Pipe Segment
      </Button>

      <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
        <h3 className="font-semibold text-teal-900 mb-3">Total Pipe Summary</h3>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="flex justify-between sm:flex-col sm:text-center">
            <span className="text-teal-700">Total Segments</span>
            <span className="font-semibold text-teal-900">{pipeSegments.length}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:text-center">
            <span className="text-teal-700">Total Length</span>
            <span className="font-semibold text-teal-900">
              {pipeSegments.reduce((sum, seg) => sum + seg.length, 0).toFixed(0)} ft
            </span>
          </div>
          <div className="flex justify-between sm:flex-col sm:text-center">
            <span className="text-teal-700">Total Elevation</span>
            <span className="font-semibold text-teal-900">
              {pipeSegments.reduce((sum, seg) => sum + seg.elevation, 0).toFixed(0)} ft
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
