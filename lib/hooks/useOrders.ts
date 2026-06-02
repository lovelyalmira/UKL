import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import type { Order, OrderStatus } from '@/types'

export const useOrders = (filters?: {
  branchId?: string
  tableId?: string
  status?: OrderStatus
  dateFrom?: string
  dateTo?: string
}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.branchId) params.append('branchId', filters.branchId)
      if (filters?.tableId) params.append('tableId', filters.tableId)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)
      
      return apiRequest<Order[]>(`/toast/orders?${params.toString()}`)
    },
  })
}

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      return apiRequest<Order>(`/toast/orders/${orderId}`)
    },
    enabled: !!orderId,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      tableId: string
      items: Array<{ menuId: string; quantity: number; toppingIds?: string[] }>
      paymentMethod: 'CASH' | 'QRIS'
      note?: string
    }) => apiRequest<Order>('/toast/orders', { method: 'POST', data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      return data
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      apiRequest<Order>(`/toast/orders/${orderId}/status`, {
        method: 'PATCH',
        data: { status },
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
    },
  })
}

// Real-time order tracking with polling
export const useRealtimeOrderTracking = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: ['order', orderId, 'realtime'],
    queryFn: async () => {
      return apiRequest<Order>(`/toast/orders/${orderId}`)
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return ['completed', 'cancelled', 'delivered'].includes(status as string)
        ? false
        : 5000 // Poll every 5 seconds
    },
    enabled: enabled && !!orderId,
    staleTime: 2000,
  })
}