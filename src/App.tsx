import { WizardContainer } from '@/components/wizard/WizardContainer'
import { ProjectManager } from '@/components/ProjectManager'
import { OfflineIndicator } from '@/components/OfflineIndicator'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Geoflow SDI Designer
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Subsurface Drip Irrigation Design Tool
              </p>
            </div>
            <OfflineIndicator />
          </div>
          <ProjectManager />
        </div>
      </header>

      {/* Main Content - scrollable */}
      <main className="flex-1 overflow-auto">
        <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6">
          <WizardContainer />
        </div>
      </main>
    </div>
  )
}

export default App
