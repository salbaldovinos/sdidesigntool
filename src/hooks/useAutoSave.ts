import { useEffect, useRef } from 'react'
import { useDesignStore } from '@/stores/designStore'

const AUTO_SAVE_DELAY = 5000 // 5 seconds after last change

export function useAutoSave() {
  const { isDirty, designInputs, pipeSegments, saveToDatabase } = useDesignStore()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Only auto-save if project has a name and is dirty
    const projectName = designInputs.projectName
    if (!isDirty || !projectName || projectName.trim() === '') {
      return
    }

    // Set a new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return

      isSavingRef.current = true
      try {
        await saveToDatabase()
        console.log('Auto-saved project:', projectName)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        isSavingRef.current = false
      }
    }, AUTO_SAVE_DELAY)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isDirty, designInputs, pipeSegments, saveToDatabase])
}
