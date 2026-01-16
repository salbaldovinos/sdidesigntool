import { useState, useEffect } from 'react'
import { useDesignStore } from '@/stores/designStore'
import { projectDB, type DBProject } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Plus,
  Trash2,
  FolderOpen,
  Calendar,
} from 'lucide-react'

interface ProjectsViewProps {
  onOpenProject: () => void
}

export function ProjectsView({ onOpenProject }: ProjectsViewProps) {
  const [projects, setProjects] = useState<DBProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { projectId, loadFromDatabase, newProject, isDirty } = useDesignStore()

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
    loadProjects()
  }, [])

  const handleLoad = async (id: string) => {
    try {
      await loadFromDatabase(id)
      onOpenProject()
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
    onOpenProject()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your SDI design projects
          </p>
        </div>
        <Button onClick={handleNewProject} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first SDI design project to get started.
            </p>
            <Button onClick={handleNewProject} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`
                cursor-pointer hover:shadow-md transition-shadow
                ${project.id === projectId ? 'ring-2 ring-teal-500' : ''}
              `}
              onClick={() => handleLoad(project.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {project.id === projectId && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                      Currently Open
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
