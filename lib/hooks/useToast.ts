import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  // additional sonner toast options
  options?: Record<string, unknown>
}

export const useToast = () => {
  const toast = ({ 
    title, 
    description, 
    variant = 'default', 
    duration = 3000,
    ...options
  }: ToastProps & Record<string, unknown>) => {
    
    const toastFn = {
      success: sonnerToast.success,
      error: sonnerToast.error,
      warning: sonnerToast.warning,
      info: sonnerToast.info,
      default: sonnerToast,
    }[variant]

    return toastFn(title, {
      description,
      duration,
      position: 'top-right',
      richColors: true,
      closeButton: true,
      ...options,
    })
  }

  // Convenience methods
  const success = (title: string, description?: string) => 
    toast({ title, description, variant: 'success' })
  
  const error = (title: string, description?: string) => 
    toast({ title, description, variant: 'error' })
  
  const warning = (title: string, description?: string) => 
    toast({ title, description, variant: 'warning' })
  
  const info = (title: string, description?: string) => 
    toast({ title, description, variant: 'info' })

  return { toast, success, error, warning, info }
}