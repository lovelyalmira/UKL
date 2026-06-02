'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { MenuGrid } from '@/components/customer/MenuGrid'
import { CartDrawer } from '@/components/customer/CartDrawer'
import { BestSellerSection } from '@/components/customer/BestSellerSection'
import { MenuSkeleton } from '@/components/shared/SkeletonLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Menu } from '@/types'

interface Topping {
  id: string
  name: string
  price: number
}

interface CartItem {
  menuId: string
  name: string
  price: number
  quantity: number
  toppings: Topping[]
}

export default function TablePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const branchId = searchParams.get('branch') || '1'

  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  // KITA KEMBALIKAN KE /toast/menus KARENA BACKEND KAMU TERNYATA MASIH PAKAI PREFIX INI
  const { data: responseMenus, isLoading, error, refetch } = useQuery({
    queryKey: ['menus', branchId],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams()
        queryParams.append('branchId', branchId)
        queryParams.append('available', 'true')
        return await apiRequest<unknown>(`/toast/menus?${queryParams.toString()}`)
      } catch (err) {
        console.warn('Endpoint /toast/menus eror, mencoba fallback ke /menus...')
        try {
          return await apiRequest<unknown>(`/menus?branchId=${branchId}`)
        } catch {
          return null
        }
      }
    },
  })

  const { data: responseBestSellers } = useQuery({
    queryKey: ['bestsellers', branchId],
    queryFn: async () => {
      try {
        return await apiRequest<unknown>(`/toast/menus/bestsellers?branchId=${branchId}&limit=4`)
      } catch (err) {
        return null
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false
  })

  const getArrayData = (res: unknown): Menu[] => {
    if (!res || typeof res !== 'object') return []
    if (Array.isArray(res)) return res as Menu[]
    const record = res as Record<string, unknown>
    if ('data' in record && Array.isArray(record.data)) return record.data as Menu[]
    return []
  }

  const menus = getArrayData(responseMenus)
  const bestSellers = getArrayData(responseBestSellers)

  const addToCart = (menu: Menu, toppings: unknown[] = []) => {
    const toppingsTyped = toppings as Topping[]
    setCart(prev => {
      const existing = prev.find(item => item.menuId === menu.id)
      if (existing) {
        return prev.map(item => item.menuId === menu.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { menuId: menu.id, name: menu.name, price: menu.price, quantity: 1, toppings: toppingsTyped }]
    })
  }

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.menuId !== menuId))
    } else {
      setCart(prev => prev.map(item => item.menuId === menuId ? { ...item, quantity } : item))
    }
  }

  const cartTotal = cart.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce((s, t) => s + t.price, 0)
    return sum + (item.price + toppingsTotal) * item.quantity
  }, 0)

  const handleCheckout = () => {
    localStorage.setItem(`cart_${tableId}`, JSON.stringify(cart))
    router.push(`/table/${tableId}/checkout?branch=${branchId}`)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <EmptyState
          title="Tidak dapat memuat menu"
          description="Periksa koneksi internet Anda"
          action={{ label: 'Refresh', onClick: () => refetch() }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-primary">Toast Order</h1>
            <p className="text-sm text-muted-foreground">Meja #{tableId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {bestSellers.length > 0 && <BestSellerSection items={bestSellers} onAddToCart={addToCart} />}

      <main className="p-4">
        <h2 className="text-lg font-semibold mb-4">Semua Menu</h2>
        {isLoading ? (
          <MenuSkeleton />
        ) : menus.length === 0 ? (
          <EmptyState title="Menu belum tersedia" description="Silakan hubungi staff" />
        ) : (
          <MenuGrid menus={menus} onAddToCart={addToCart} />
        )}
      </main>

      <CartDrawer isOpen={cartOpen} onOpenChange={setCartOpen} items={cart} onUpdateQuantity={updateQuantity} total={cartTotal} onCheckout={handleCheckout} />

      {cart.length > 0 && (
        <button onClick={() => setCartOpen(true)} className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
          <span className="text-lg font-bold">{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
        </button>
      )}
    </div>
  )
}