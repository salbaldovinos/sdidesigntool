import { Menu, Bell, User, Search } from 'lucide-react'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { SearchBar } from '@/components/SearchBar'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick: () => void
  onSelectProject: (projectId: string) => void
  actions?: React.ReactNode
}

export function Header({ title, subtitle, onMenuClick, onSelectProject, actions }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: Search (hidden on mobile, shown on md+) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar onSelectProject={onSelectProject} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {actions}

          <OfflineIndicator />

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Avatar Placeholder */}
          <button className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <SearchBar
            onSelectProject={(id) => {
              onSelectProject(id)
              setMobileSearchOpen(false)
            }}
            placeholder="Search projects..."
          />
        </div>
      )}

      {/* Mobile title bar */}
      <div className="sm:hidden px-4 pb-3">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
