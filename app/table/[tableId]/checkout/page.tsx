'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiRequest } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ShoppingBag, ArrowLeft, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'

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

export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const branchId = searchParams.get('branch') || '1'

  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Ambil data keranjang dengan aman di dalam useEffect tanpa memicu amukan ESLint
  useEffect(() => {
    // ✅ FIX ESLINT TOTAL: Pindahkan semua setState ke dalam micro-task asynchronous
    const timer = setTimeout(() => {
      setMounted(true)
      
      const savedCart = localStorage.getItem(`cart_${tableId}`)
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          console.error('Gagal membaca data keranjang', e)
        }
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [tableId])

  // Hitung Total Pembayaran keseluruhan (Harga Menu + Toppings)
  const totalPayment = cart.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce((s, t) => s + t.price, 0)
    return sum + (item.price + toppingsTotal) * item.quantity
  }, 0)

  // Mutasi untuk menembak API pembuatan Order baru ke Backend Railway
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurantId: Number(branchId),
        tableNumber: tableId,
        total: totalPayment,
        items: cart.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
          toppingIds: item.toppings.map(t => t.id) 
        }))
      }

      return await apiRequest<unknown>('/orders', {
        method: 'POST',
        data: payload
      })
    },
    onSuccess: () => {
      toast.success('Pesanan Anda berhasil dibuat!')
      localStorage.removeItem(`cart_${tableId}`)
      
      setTimeout(() => {
        router.push(`/table/${tableId}/orders?branch=${branchId}`)
      }, 1500)
    },
    onError: (error: unknown) => {
      const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengirim pesanan. Silakan coba lagi.'
      toast.error(errorMsg)
    }
  })

  const handleProcessOrder = () => {
    if (cart.length === 0) {
      toast.error('Keranjang belanja Anda kosong')
      return
    }
    createOrderMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href={`/table/${tableId}?branch=${branchId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Konfirmasi Pesanan</h1>
            <p className="text-xs text-muted-foreground">Meja #{tableId}</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {/* Rincian Item */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Menu yang Dipesan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 divide-y divide-muted">
            {!mounted ? (
              <p className="text-center py-6 text-sm text-muted-foreground">Memuat keranjang...</p>
            ) : cart.length === 0 ? (
              <p className="text-center py-6 text-sm text-muted-foreground">Keranjang kosong</p>
            ) : (
              cart.map((item, index) => (
                <div key={item.menuId} className={`pt-3 ${index === 0 ? 'pt-0' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                      {item.toppings.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.toppings.map(t => (
                            <span key={t.id} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              +{t.name} ({formatCurrency(t.price)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-sm">
                      {formatCurrency(
                        (item.price + item.toppings.reduce((s, t) => s + t.price, 0)) * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Ringkasan Pembayaran */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Ringkasan Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(mounted ? totalPayment : 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pajak & Servis</span>
              <span className="text-success">Rp 0</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-base text-primary">
              <span>Total Pembayaran</span>
              <span>{formatCurrency(mounted ? totalPayment : 0)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-base font-semibold py-5 shadow-md"
              disabled={!mounted || cart.length === 0 || createOrderMutation.isPending}
              onClick={handleProcessOrder}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses Pesanan...
                </>
              ) : (
                'Pesan Sekarang (Bayar di Kasir)'
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}