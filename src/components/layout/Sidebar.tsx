import { useDesignStore, type WizardStep } from '@/stores/designStore'
import {
  FolderOpen,
  Settings,
  HelpCircle,
  ChevronRight,
  Droplets,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  active?: boolean
  badge?: string
}

interface SidebarProps {
  currentView: 'designer' | 'projects' | 'settings' | 'help'
  onViewChange: (view: 'designer' | 'projects' | 'settings' | 'help') => void
  onClose?: () => void
}

export function Sidebar({ currentView, onViewChange, onClose }: SidebarProps) {
  const { currentStep, setCurrentStep } = useDesignStore()

  const mainNavItems: NavItem[] = [
    {
      id: 'designer',
      label: 'Design Tool',
      icon: <Droplets className="h-5 w-5" />,
      onClick: () => {
        onViewChange('designer')
        onClose?.()
      },
      active: currentView === 'designer',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderOpen className="h-5 w-5" />,
      onClick: () => {
        onViewChange('projects')
        onClose?.()
      },
      active: currentView === 'projects',
    },
  ]

  const bottomNavItems: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      onClick: () => {
        onViewChange('settings')
        onClose?.()
      },
      active: currentView === 'settings',
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: () => {
        onViewChange('help')
        onClose?.()
      },
      active: currentView === 'help',
    },
  ]

  const wizardSteps: { step: WizardStep; label: string }[] = [
    { step: 1, label: 'Design Inputs' },
    { step: 2, label: 'System Layout' },
    { step: 3, label: 'Zone TDH' },
    { step: 4, label: 'Results' },
  ]

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600">
          <Droplets className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">Geoflow</h1>
          <p className="text-xs text-gray-500">SDI Designer</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${item.active
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* Wizard Steps - Only show when on designer view */}
        {currentView === 'designer' && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Design Steps
            </h3>
            <div className="space-y-1">
              {wizardSteps.map(({ step, label }) => (
                <button
                  key={step}
                  onClick={() => {
                    setCurrentStep(step)
                    onClose?.()
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${currentStep === step
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : currentStep > step
                      ? 'text-gray-600 hover:bg-gray-50'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }
                  `}
                >
                  <span className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                    ${currentStep === step
                      ? 'bg-teal-600 text-white'
                      : currentStep > step
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-500'
                    }
                  `}>
                    {step}
                  </span>
                  <span>{label}</span>
                  {currentStep === step && (
                    <ChevronRight className="ml-auto h-4 w-4 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${item.active
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
