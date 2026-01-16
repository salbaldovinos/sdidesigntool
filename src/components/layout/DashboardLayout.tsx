import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { X } from 'lucide-react'

type ViewType = 'welcome' | 'designer' | 'projects' | 'settings' | 'help'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onSelectProject: (projectId: string) => void
  headerActions?: React.ReactNode
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  currentView,
  onViewChange,
  onSelectProject,
  headerActions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}
        `}
      >
        <div className="relative h-full pointer-events-auto">
          <Sidebar
            currentView={currentView}
            onViewChange={onViewChange}
            onClose={() => setSidebarOpen(false)}
          />
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 -right-12 p-2 text-white hover:text-gray-200"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar
          currentView={currentView}
          onViewChange={onViewChange}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onSelectProject={onSelectProject}
          actions={headerActions}
        />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
