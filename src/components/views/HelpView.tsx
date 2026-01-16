import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  MessageCircle,
  FileText,
  ExternalLink,
  Droplets,
  Calculator,
  Layers,
  FileOutput,
} from 'lucide-react'

export function HelpView() {
  const features = [
    {
      icon: <Droplets className="h-5 w-5 text-teal-600" />,
      title: 'Design Inputs',
      description: 'Enter your project parameters including flow rates, soil loading, and emitter specifications.',
    },
    {
      icon: <Layers className="h-5 w-5 text-teal-600" />,
      title: 'System Layout',
      description: 'Define pipe segments from pump to zone manifolds with sizes, lengths, and elevations.',
    },
    {
      icon: <Calculator className="h-5 w-5 text-teal-600" />,
      title: 'Zone TDH Calculations',
      description: 'View Total Dynamic Head calculations for both dispersal and flushing modes.',
    },
    {
      icon: <FileOutput className="h-5 w-5 text-teal-600" />,
      title: 'Results & Reports',
      description: 'Review design summary and generate PDF reports for your SDI system.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Help & Documentation</h2>
        <p className="text-sm text-gray-500 mt-1">
          Learn how to use the Geoflow SDI Designer
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-gray-500" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            The Geoflow SDI Designer helps you design subsurface drip irrigation systems
            by calculating hydraulic requirements and generating professional reports.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-gray-500" />
            Key Concepts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">Total Dynamic Head (TDH)</h4>
              <p className="text-sm text-gray-500">
                The total pressure required by the pump, including static head (elevation),
                friction losses, and operating pressure at the emitters.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Hazen-Williams Formula</h4>
              <p className="text-sm text-gray-500">
                Used to calculate friction losses in pipes based on flow rate, pipe diameter,
                length, and the C-factor (roughness coefficient).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Dispersal vs Flushing Modes</h4>
              <p className="text-sm text-gray-500">
                Dispersal mode is normal operation through emitters. Flushing mode requires
                higher flow rates to clean the system, typically the limiting design condition.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-gray-500" />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Need help with your SDI design? Contact Geoflow support for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://geoflow.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2 w-full">
                <ExternalLink className="h-4 w-4" />
                Visit Geoflow Website
              </Button>
            </a>
            <a
              href="https://geoflow.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2 w-full">
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
