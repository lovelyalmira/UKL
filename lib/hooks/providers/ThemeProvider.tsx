'use client'

import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme
    }

    const stored = localStorage.getItem('theme') as Theme | null
    return stored ?? defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme === 'dark' ? 'dark' : 'light'
    }

    const stored = localStorage.getItem('theme') as Theme | null
    const initialTheme = stored ?? defaultTheme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = initialTheme === 'dark' || (initialTheme === 'system' && enableSystem && systemPrefersDark)

    return isDark ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    applyTheme(theme, root, attribute, enableSystem, setResolvedTheme)
  }, [theme, attribute, enableSystem])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    const root = window.document.documentElement
    if (!disableTransitionOnChange) {
      root.style.setProperty('transition', 'none')
    }
    applyTheme(newTheme, root, attribute, enableSystem, setResolvedTheme)
    
    if (!disableTransitionOnChange) {
      setTimeout(() => {
        root.style.removeProperty('transition')
      }, 0)
    }
  }

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement
        applyTheme('system', root, attribute, enableSystem, setResolvedTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, attribute, enableSystem])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyTheme(
  theme: Theme,
  root: HTMLElement,
  attribute: string,
  enableSystem: boolean,
  setResolvedTheme: (theme: 'light' | 'dark') => void
) {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && enableSystem && systemPrefersDark)
  
  if (attribute === 'class') {
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  } else {
    root.setAttribute(attribute, isDark ? 'dark' : 'light')
  }
  
  setResolvedTheme(isDark ? 'dark' : 'light')
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme Toggle Component
export function ThemeToggle() {
  const {setTheme, resolvedTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className="w-9 h-9"
    >
      {resolvedTheme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}