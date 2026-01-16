import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'sdi-designer-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'light'
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  if (effectiveTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  return effectiveTheme
}

// Simple store for theme state
let currentTheme: Theme = typeof window !== 'undefined' ? getStoredTheme() : 'light'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentTheme
}

function getServerSnapshot() {
  return 'light' as Theme
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return theme === 'system' ? getSystemTheme() : theme
  })

  const setTheme = useCallback((newTheme: Theme) => {
    currentTheme = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
    const resolved = applyThemeToDOM(newTheme)
    setResolvedTheme(resolved)
    listeners.forEach(listener => listener())
  }, [])

  // Apply theme on mount and listen for system theme changes
  useEffect(() => {
    const resolved = applyThemeToDOM(theme)
    setResolvedTheme(resolved)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (currentTheme === 'system') {
        const resolved = applyThemeToDOM('system')
        setResolvedTheme(resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  }
}
