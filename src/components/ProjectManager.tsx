import { useState, useEffect } from 'react'
import { useDesignStore } from '@/stores/designStore'
import { projectDB, type DBProject } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Save,
  FolderOpen,
  Plus,
  Trash2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react'

export function ProjectManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState<DBProject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const {
    projectId,
    isDirty,
    designInputs,
    saveToDatabase,
    loadFromDatabase,
    newProject,
  } = useDesignStore()

  const projectName = designInputs.projectName || 'Untitled Project'

  // Load projects list
  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const allProjects = await projectDB.getAll()
      setProjects(allProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadProjects()
    }
  }, [isOpen])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await saveToDatabase()
      setSaveStatus('saved')
      loadProjects()
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save project:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleLoad = async (id: string) => {
    try {
      await loadFromDatabase(id)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectDB.delete(id)
        loadProjects()
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const handleNewProject = () => {
    if (isDirty && !confirm('You have unsaved changes. Start a new project anyway?')) {
      return
    }
    newProject()
    setIsOpen(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative">
      {/* Project Header Bar - Responsive */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Project name - hidden on small screens, shown in header dropdown instead */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-gray-500">Project:</span>
          <span className="font-medium text-gray-900 max-w-[120px] truncate">
            {projectName}
            {isDirty && <span className="text-amber-500 ml-1">*</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="gap-1"
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-1"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </Button>
        </div>
      </div>

      {/* Projects Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - Full width on mobile */}
          <Card className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-96 z-50 shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Saved Projects</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="w-full mb-4 gap-2"
                onClick={handleNewProject}
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>

              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No saved projects</p>
                  <p className="text-sm mt-1">Click Save to save your current project</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleLoad(project.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        project.id === projectId
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(project.updatedAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(project.id, e)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
