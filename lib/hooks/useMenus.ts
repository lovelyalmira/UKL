import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import type { CreateMenuDto, Menu, UpdateMenuDto } from '@/types'


export const useMenus = (
  branchId?: string, 
  options?: Omit<UseQueryOptions<Menu[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['menus', branchId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (branchId) params.append('branchId', branchId)
      params.append('available', 'true')
      
      return apiRequest<Menu[]>(`/toast/menus?${params.toString()}`)
    },
    enabled: !!branchId,
    ...options, 
  })
}

// 2. useBestSellers sudah aman dan solid
export const useBestSellers = (branchId: string, limit = 5) => {
  return useQuery({
    queryKey: ['bestsellers', branchId],
    queryFn: async () => {
      return apiRequest<Menu[]>(
        `/toast/menus/bestsellers?branchId=${branchId}&limit=${limit}`
      )
    },
    enabled: !!branchId,
  })
}

// 3. useCreateMenu memakai tipe CreateMenuDto untuk parameter mutasinya
export const useCreateMenu = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateMenuDto) => 
      apiRequest<Menu>('/toast/menus', { method: 'POST', data }),
    onSuccess: () => {
      // Menghapus cache agar list menu otomatis ter-refresh di layar
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

// 4. useUpdateMenu menerima objek berisi id dan data ter-update
export const useUpdateMenu = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuDto }) =>
      apiRequest<Menu>(`/toast/menus/${id}`, { method: 'PATCH', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

// 5. useDeleteMenu menerima id string untuk dihapus
export const useDeleteMenu = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/toast/menus/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}