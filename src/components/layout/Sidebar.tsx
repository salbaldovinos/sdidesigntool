import {
  Home,
  FolderOpen,
  Settings,
  HelpCircle,
  Droplets,
  Package,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  active?: boolean
  badge?: string
}

type ViewType = 'welcome' | 'designer' | 'projects' | 'catalog' | 'settings' | 'help'

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onClose?: () => void
}

export function Sidebar({ currentView, onViewChange, onClose }: SidebarProps) {

  const mainNavItems: NavItem[] = [
    {
      id: 'welcome',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      onClick: () => {
        onViewChange('welcome')
        onClose?.()
      },
      active: currentView === 'welcome',
    },
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
    {
      id: 'catalog',
      label: 'Products',
      icon: <Package className="h-5 w-5" />,
      onClick: () => {
        onViewChange('catalog')
        onClose?.()
      },
      active: currentView === 'catalog',
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

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600">
          <Droplets className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Geoflow</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">SDI Designer</p>
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
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${item.active
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
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
