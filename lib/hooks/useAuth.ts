import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import type { User } from '@/types'

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      return apiRequest<User>('/toast/auth/me')
    },
    retry: false,
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest<{ token: string; user: User }>('/toast/auth/login', {
        method: 'POST',
        data: credentials,
      })
      // Set cookie
      document.cookie = `token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      return apiRequest('/toast/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.clear()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: {
      name: string
      email: string
      password: string
      role: 'STAFF' | 'ADMIN'
      branchId?: string
    }) => apiRequest('/toast/auth/register', { method: 'POST', data }),
  })
}