import { useState, useEffect, useRef } from 'react'
import { Search, X, FolderOpen, Clock, Loader2 } from 'lucide-react'
import { projectDB, type DBProject } from '@/lib/db'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSelectProject: (projectId: string) => void
  placeholder?: string
}

export function SearchBar({ onSelectProject, placeholder = 'Search projects...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DBProject[]>([])
  const [recentProjects, setRecentProjects] = useState<DBProject[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 200)

  // Load recent projects on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const projects = await projectDB.getAll()
        // Sort by most recently updated, take top 5
        const sorted = projects
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
        setRecentProjects(sorted)
      } catch (error) {
        console.error('Failed to load recent projects:', error)
      }
    }
    loadRecent()
  }, [])

  // Search projects when debounced query changes
  useEffect(() => {
    const searchProjects = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const allProjects = await projectDB.getAll()
        const searchTerm = debouncedQuery.toLowerCase()

        const filtered = allProjects.filter(project =>
          project.name.toLowerCase().includes(searchTerm)
        )

        // Sort by relevance (starts with > contains)
        filtered.sort((a, b) => {
          const aStartsWith = a.name.toLowerCase().startsWith(searchTerm)
          const bStartsWith = b.name.toLowerCase().startsWith(searchTerm)
          if (aStartsWith && !bStartsWith) return -1
          if (!aStartsWith && bStartsWith) return 1
          return a.name.localeCompare(b.name)
        })

        setResults(filtered.slice(0, 10))
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchProjects()
  }, [debouncedQuery])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [results])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (projectId: string) => {
    onSelectProject(projectId)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.trim() ? results : recentProjects

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelect(items[selectedIndex].id)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  const showDropdown = isOpen && (query.trim() || recentProjects.length > 0)
  const displayItems = query.trim() ? results : recentProjects
  const showRecent = !query.trim() && recentProjects.length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {/* Section Header */}
          {showRecent && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
              <Clock className="inline h-3 w-3 mr-1" />
              Recent Projects
            </div>
          )}
          {query.trim() && results.length > 0 && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
              <Search className="inline h-3 w-3 mr-1" />
              Search Results
            </div>
          )}

          {/* Results List */}
          {displayItems.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {displayItems.map((project, index) => (
                <li key={project.id}>
                  <button
                    onClick={() => handleSelect(project.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                      ${selectedIndex === index ? 'bg-teal-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0">
                      <FolderOpen className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedIndex === index ? 'text-teal-700' : 'text-gray-900'}`}>
                        {query.trim() ? highlightMatch(project.name, query) : project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated {formatDate(project.updatedAt)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() && !isLoading ? (
            <div className="px-4 py-6 text-center">
              <FolderOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No projects found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : null}

          {/* Keyboard hint */}
          <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Esc</kbd> Close
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <span className="bg-teal-100 text-teal-800 rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  )
}
