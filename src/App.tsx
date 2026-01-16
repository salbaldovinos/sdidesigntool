import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { WizardContainer } from '@/components/wizard/WizardContainer'
import { WelcomeView } from '@/components/views/WelcomeView'
import { ProjectsView } from '@/components/views/ProjectsView'
import { SettingsView } from '@/components/views/SettingsView'
import { HelpView } from '@/components/views/HelpView'
import { CatalogView } from '@/components/views/CatalogView'
import { useDesignStore } from '@/stores/designStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Button } from '@/components/ui/button'
import { Save, Check, AlertCircle } from 'lucide-react'

type ViewType = 'welcome' | 'designer' | 'projects' | 'catalog' | 'settings' | 'help'

const viewConfig: Record<ViewType, { title: string; subtitle: string }> = {
  welcome: {
    title: 'Welcome',
    subtitle: 'Get started with Geoflow SDI Designer',
  },
  designer: {
    title: 'Design Tool',
    subtitle: 'Create and configure your SDI system',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Manage your saved designs',
  },
  catalog: {
    title: 'Product Catalog',
    subtitle: 'Browse Geoflow products and specifications',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Configure your preferences',
  },
  help: {
    title: 'Help',
    subtitle: 'Documentation and support',
  },
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('welcome')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const { designInputs, saveToDatabase, loadFromDatabase, newProject, isDirty } = useDesignStore()
  const projectName = designInputs.projectName || 'Untitled Project'

  // Enable auto-save
  useAutoSave()

  // Handle starting a new project from Welcome view
  const handleGetStarted = () => {
    newProject()
    setCurrentView('designer')
  }

  // Handle project selection from search
  const handleSelectProject = async (projectId: string) => {
    try {
      await loadFromDatabase(projectId)
      setCurrentView('designer')
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await saveToDatabase()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save project:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeView onGetStarted={handleGetStarted} onNavigateToHelp={() => setCurrentView('help')} />
      case 'designer':
        return <WizardContainer />
      case 'projects':
        return <ProjectsView onOpenProject={() => setCurrentView('designer')} />
      case 'catalog':
        return <CatalogView />
      case 'settings':
        return <SettingsView />
      case 'help':
        return <HelpView />
      default:
        return <WelcomeView onGetStarted={handleGetStarted} onNavigateToHelp={() => setCurrentView('help')} />
    }
  }

  // Build header title with project name when in designer view
  const headerTitle = currentView === 'designer'
    ? `${projectName}${isDirty ? ' *' : ''}`
    : viewConfig[currentView].title

  // Header actions (save button when in designer view)
  const headerActions = currentView === 'designer' ? (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={saveStatus === 'saving'}
      className="gap-1.5"
    >
      {saveStatus === 'saving' ? (
        <>
          <span className="animate-spin">
            <Save className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Saving...</span>
        </>
      ) : saveStatus === 'saved' ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="hidden sm:inline">Saved</span>
        </>
      ) : saveStatus === 'error' ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="hidden sm:inline">Error</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </>
      )}
    </Button>
  ) : null

  return (
    <DashboardLayout
      title={headerTitle}
      subtitle={viewConfig[currentView].subtitle}
      currentView={currentView}
      onViewChange={setCurrentView}
      onSelectProject={handleSelectProject}
      headerActions={headerActions}
    >
      {renderView()}
    </DashboardLayout>
  )
}

export default App
