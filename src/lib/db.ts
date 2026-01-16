import Dexie, { type EntityTable } from 'dexie'
import type { DesignInputs, PipeSegment, DesignResults } from '@/types/design'

// Database project type (stored in IndexedDB)
export interface DBProject {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  designInputs: Partial<DesignInputs>
  systemLayout: PipeSegment[]
  results: Partial<DesignResults>
}

// Dexie database class
class SDIDesignerDB extends Dexie {
  projects!: EntityTable<DBProject, 'id'>

  constructor() {
    super('SDIDesignerDB')

    this.version(1).stores({
      projects: 'id, name, updatedAt, createdAt'
    })
  }
}

// Create database instance
export const db = new SDIDesignerDB()

// Project CRUD operations
export const projectDB = {
  // Get all projects, sorted by most recently updated
  async getAll(): Promise<DBProject[]> {
    return await db.projects
      .orderBy('updatedAt')
      .reverse()
      .toArray()
  },

  // Get a single project by ID
  async getById(id: string): Promise<DBProject | undefined> {
    return await db.projects.get(id)
  },

  // Create a new project
  async create(project: Omit<DBProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date()

    await db.projects.add({
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    })

    return id
  },

  // Update an existing project
  async update(id: string, updates: Partial<Omit<DBProject, 'id' | 'createdAt'>>): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  // Save project (create or update)
  async save(project: DBProject): Promise<string> {
    const existing = await db.projects.get(project.id)

    if (existing) {
      await db.projects.update(project.id, {
        ...project,
        updatedAt: new Date(),
      })
      return project.id
    } else {
      const now = new Date()
      await db.projects.add({
        ...project,
        createdAt: now,
        updatedAt: now,
      })
      return project.id
    }
  },

  // Delete a project
  async delete(id: string): Promise<void> {
    await db.projects.delete(id)
  },

  // Delete all projects
  async deleteAll(): Promise<void> {
    await db.projects.clear()
  },

  // Get project count
  async count(): Promise<number> {
    return await db.projects.count()
  },

  // Search projects by name
  async searchByName(query: string): Promise<DBProject[]> {
    const lowerQuery = query.toLowerCase()
    return await db.projects
      .filter(project => project.name.toLowerCase().includes(lowerQuery))
      .toArray()
  },
}
