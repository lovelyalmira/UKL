'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface OrderItem {
  id: string
  menuName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  tableNumber: string
  total: number
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  items?: OrderItem[]
}

export function RecentOrders() {
  // ✅ FIX RUTING & FALLBACK: Mencoba rute /orders, /toast/orders, atau /orders/all
  const { data: responseOrders, isLoading } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      // Strategi 1: Coba rute global baru /orders
      try {
        return await apiRequest<unknown>('/orders')
      } catch (err) {
        // Strategi 2: Jika 404, coba rute dengan prefix lama /toast/orders
        try {
          console.log('Mencoba fallback admin ke rute /toast/orders...')
          return await apiRequest<unknown>('/toast/orders')
        } catch (fallbackErr) {
          // Strategi 3: Coba rute alternatif umum backend /orders/all
          try {
            return await apiRequest<unknown>('/orders/all')
          } catch {
            console.warn('Endpoint /orders belum aktif atau eror di backend.')
            return null
          }
        }
      }
    },
    refetchInterval: 5000, // Lakukan auto-refresh tiap 5 detik untuk memantau pesanan masuk
  })

  // Fungsi pembongkar data agar tidak merusak UI jika data dari backend kosong/aneh
  const getArrayData = (res: unknown): Order[] => {
    if (!res || typeof res !== 'object') return []
    if (Array.isArray(res)) return res as Order[]
    const record = res as Record<string, unknown>
    if ('data' in record && Array.isArray(record.data)) return record.data as Order[]
    if ('orders' in record && Array.isArray(record.orders)) return record.orders as Order[]
    return []
  }

  const orders = getArrayData(responseOrders).slice(0, 5) // Ambil 5 pesanan terbaru saja

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      PENDING: 'bg-warning text-warning-foreground',
      PREPARING: 'bg-blue-500 text-white',
      SERVED: 'bg-purple-500 text-white',
      COMPLETED: 'bg-success text-success-foreground',
      CANCELLED: 'bg-destructive text-destructive-foreground',
    }
    return <Badge className={styles[status] || ''}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Pesanan Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Belum ada pesanan masuk atau backend belum siap.
          </p>
        ) : (
          <div className="divide-y divide-muted space-y-3">
            {orders.map((order, idx) => (
              <div key={order.id} className={`flex items-center justify-between pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                <div>
                  <p className="font-medium text-sm">Meja #{order.tableNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}