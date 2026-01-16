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
  onNavigateToHelp: () => void
}

export function WelcomeView({ onGetStarted, onNavigateToHelp }: WelcomeViewProps) {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          SDI Design Made Simple
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Geoflow SDI Designer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
          How It Works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <Card key={step.number} className="relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600 dark:text-teal-400">{step.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug mt-1">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <Card className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800 border-teal-100 dark:border-teal-800">
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-teal-200 dark:sm:divide-teal-700">
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">Accurate</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Hazen-Williams calculations validated against industry standards
              </p>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">Offline</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Works without internet - perfect for field use
              </p>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">Professional</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Generate PDF reports ready for clients and contractors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5">•</span>
            Your work is automatically saved every 5 seconds
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5">•</span>
            Use the search bar to quickly find and load previous projects
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5">•</span>
            The system diagram in Step 2 shows pipe segment numbering
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 mt-0.5">•</span>
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Need help? Visit the <button onClick={onNavigateToHelp} className="text-teal-600 dark:text-teal-400 hover:underline">Help section</button> for detailed documentation.
        </p>
      </div>
    </div>
  )
}
