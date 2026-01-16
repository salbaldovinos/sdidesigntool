import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Droplets,
  Layers,
  Calculator,
  FileOutput,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface WelcomeViewProps {
  onGetStarted: () => void
}

export function WelcomeView({ onGetStarted }: WelcomeViewProps) {
  const steps = [
    {
      number: '1',
      icon: <Droplets className="h-5 w-5" />,
      title: 'Design Inputs',
      description: 'Enter field size, emitter specs, flow rates, and operating pressure',
    },
    {
      number: '2',
      icon: <Layers className="h-5 w-5" />,
      title: 'System Layout',
      description: 'Define pipe segments with sizes, lengths, and elevations',
    },
    {
      number: '3',
      icon: <Calculator className="h-5 w-5" />,
      title: 'TDH Calculations',
      description: 'Review friction losses, velocities, and Total Dynamic Head',
    },
    {
      number: '4',
      icon: <FileOutput className="h-5 w-5" />,
      title: 'Results & Export',
      description: 'Get pump criteria and download professional PDF reports',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          SDI Design Made Simple
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Welcome to GeoFlow SDI Designer
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Design professional subsurface drip irrigation systems with accurate hydraulic calculations and instant PDF reports.
        </p>
        <Button
          size="lg"
          onClick={onGetStarted}
          className="mt-4 gap-2"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* How It Works */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          How It Works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <Card key={step.number} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">{step.icon}</span>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-100">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div>
              <div className="text-2xl font-bold text-teal-700">Accurate</div>
              <p className="text-sm text-gray-600 mt-1">
                Hazen-Williams calculations validated against industry standards
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-700">Offline</div>
              <p className="text-sm text-gray-600 mt-1">
                Works without internet - perfect for field use
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-700">Professional</div>
              <p className="text-sm text-gray-600 mt-1">
                Generate PDF reports ready for clients and contractors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-gray-900">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            Your work is automatically saved every 5 seconds
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            Use the search bar to quickly find and load previous projects
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            The system diagram in Step 2 shows pipe segment numbering
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            Flushing mode typically determines your pump requirements
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center pb-6">
        <Button
          size="lg"
          onClick={onGetStarted}
          className="gap-2"
        >
          Start New Design
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          Need help? Visit the <button className="text-teal-600 hover:underline">Help section</button> for detailed documentation.
        </p>
      </div>
    </div>
  )
}
