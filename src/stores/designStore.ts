import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  DesignInputs,
  PipeSegment,
  DesignResults,
  Project,
} from '@/types/design'
import {
  defaultDesignInputs,
  createDefaultPipeSegment,
} from '@/types/design'
import { projectDB, type DBProject } from '@/lib/db'

export type WizardStep = 1 | 2 | 3 | 4

interface DesignState {
  // Current wizard step
  currentStep: WizardStep

  // Project data
  projectId: string | null
  projectName: string
  lastSavedAt: Date | null
  isDirty: boolean

  // Step 1: Design Inputs
  designInputs: Partial<DesignInputs>

  // Step 2: System Layout
  pipeSegments: PipeSegment[]

  // Step 3 & 4: Results
  results: Partial<DesignResults>

  // Actions
  setCurrentStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void

  // Design Inputs actions
  updateDesignInputs: (inputs: Partial<DesignInputs>) => void
  resetDesignInputs: () => void

  // Pipe Segment actions
  addPipeSegment: () => void
  updatePipeSegment: (id: string, updates: Partial<PipeSegment>) => void
  removePipeSegment: (id: string) => void
  resetPipeSegments: () => void

  // Results actions
  setResults: (results: Partial<DesignResults>) => void
  clearResults: () => void

  // Project actions
  newProject: () => void
  loadProject: (project: Project) => void
  getProjectData: () => Project

  // Database actions
  saveToDatabase: () => Promise<string>
  loadFromDatabase: (id: string) => Promise<void>
  markClean: () => void
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1 as WizardStep,
      projectId: null,
      projectName: 'New Project',
      lastSavedAt: null,
      isDirty: false,
      designInputs: { ...defaultDesignInputs },
      pipeSegments: [createDefaultPipeSegment(0)],
      results: {},

      // Step navigation
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4) as WizardStep,
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as WizardStep,
        })),

      // Design Inputs
      updateDesignInputs: (inputs) =>
        set((state) => ({
          designInputs: { ...state.designInputs, ...inputs },
          isDirty: true,
        })),
      resetDesignInputs: () =>
        set({ designInputs: { ...defaultDesignInputs }, isDirty: true }),

      // Pipe Segments
      addPipeSegment: () =>
        set((state) => ({
          pipeSegments: [
            ...state.pipeSegments,
            createDefaultPipeSegment(state.pipeSegments.length),
          ],
          isDirty: true,
        })),
      updatePipeSegment: (id, updates) =>
        set((state) => ({
          pipeSegments: state.pipeSegments.map((seg) =>
            seg.id === id ? { ...seg, ...updates } : seg
          ),
          isDirty: true,
        })),
      removePipeSegment: (id) =>
        set((state) => ({
          pipeSegments: state.pipeSegments.filter((seg) => seg.id !== id),
          isDirty: true,
        })),
      resetPipeSegments: () =>
        set({ pipeSegments: [createDefaultPipeSegment(0)], isDirty: true }),

      // Results
      setResults: (results) =>
        set((state) => ({
          results: { ...state.results, ...results },
        })),
      clearResults: () => set({ results: {} }),

      // Project management
      newProject: () =>
        set({
          projectId: crypto.randomUUID(),
          projectName: 'New Project',
          currentStep: 1 as WizardStep,
          designInputs: { ...defaultDesignInputs },
          pipeSegments: [createDefaultPipeSegment(0)],
          results: {},
          lastSavedAt: null,
          isDirty: false,
        }),

      loadProject: (project) =>
        set({
          projectId: project.id,
          projectName: project.name,
          currentStep: 1 as WizardStep,
          designInputs: project.designInputs,
          pipeSegments: project.systemLayout,
          results: project.results,
          isDirty: false,
        }),

      getProjectData: () => {
        const state = get()
        return {
          id: state.projectId || crypto.randomUUID(),
          name: state.designInputs.projectName || state.projectName,
          createdAt: new Date(),
          updatedAt: new Date(),
          designInputs: state.designInputs,
          systemLayout: state.pipeSegments,
          results: state.results,
        }
      },

      // Database operations
      saveToDatabase: async () => {
        const state = get()
        const projectId = state.projectId || crypto.randomUUID()
        const projectName = state.designInputs.projectName || state.projectName || 'Untitled Project'

        const dbProject: DBProject = {
          id: projectId,
          name: projectName,
          createdAt: new Date(),
          updatedAt: new Date(),
          designInputs: state.designInputs,
          systemLayout: state.pipeSegments,
          results: state.results,
        }

        await projectDB.save(dbProject)

        set({
          projectId,
          projectName,
          lastSavedAt: new Date(),
          isDirty: false,
        })

        return projectId
      },

      loadFromDatabase: async (id: string) => {
        const project = await projectDB.getById(id)
        if (project) {
          set({
            projectId: project.id,
            projectName: project.name,
            currentStep: 1 as WizardStep,
            designInputs: project.designInputs,
            pipeSegments: project.systemLayout,
            results: project.results,
            lastSavedAt: project.updatedAt,
            isDirty: false,
          })
        }
      },

      markClean: () => set({ isDirty: false }),
    }),
    {
      name: 'geoflow-sdi-design',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
        currentStep: state.currentStep,
        designInputs: state.designInputs,
        pipeSegments: state.pipeSegments,
        results: state.results,
      }),
    }
  )
)
