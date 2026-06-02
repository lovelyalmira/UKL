'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiRequest } from '@/lib/api'
import { formatCurrency, formatTime, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'
import { MoreHorizontal, RefreshCw, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Order, OrderStatus } from '@/types'

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'preparing', label: 'Diproses' },
  { value: 'ready', label: 'Siap' },
  { value: 'serving', label: 'Diantar' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export function OrderTable() {
  const queryClient = useQueryClient()
  const [branchId] = useState<string>('')
  
  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['orders', 'dashboard'],
    queryFn: async () => {
      try {
        // ✅ AMAN: Menggunakan unknown agar TypeScript adem
        return await apiRequest<unknown>('/toast/orders?limit=20&status=pending,preparing,ready')
      } catch (error) {
        console.warn('Endpoint /toast/orders tabel belum aktif.')
        return null
      }
    },
    refetchInterval: 30000,
    retry: false
  })

  // ✅ AMAN: Ekstrak data array secara type-safe tanpa 'any'
  const getOrdersArray = (): Order[] => {
    if (!responseData || typeof responseData !== 'object') return []
    
    if (Array.isArray(responseData)) {
      return responseData as Order[]
    }
    
    const record = responseData as Record<string, unknown>
    if ('data' in record && Array.isArray(record.data)) {
      return record.data as Order[]
    }
    
    return []
  }

  const orders = getOrdersArray()

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return apiRequest<Order>(`/toast/orders/${orderId}/status`, {
        method: 'PATCH',
        data: { status },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success(`Status diperbarui ke ${STATUS_OPTIONS.find(s => s.value === variables.status)?.label}`)
    },
    onError: () => {
      toast.error('Gagal update status')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Order Terbaru</h3>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Meja</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell>#{order.tableNumber}</TableCell>
              <TableCell>{formatTime(order.createdAt)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {STATUS_OPTIONS.find(s => s.value === order.status)?.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-error">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {orders.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          Tidak ada order aktif
        </div>
      )}
    </div>
  )
}