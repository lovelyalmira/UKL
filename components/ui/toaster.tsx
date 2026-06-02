'use client'

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  const { theme } = useTheme()
  
  return (
    <SonnerToaster
      position="top-right"
      theme={theme as 'light' | 'dark' | 'system'}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-lg',
          title: 'text-sm font-medium',
          description: 'text-xs text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        },
      }}
      expand
      closeButton
    />
  )
}