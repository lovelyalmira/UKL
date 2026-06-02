'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  items: Array<{
    menuId: string
    name: string
    price: number
    quantity: number
    toppings: Array<{ id: string; name: string; price: number }>
  }>
  onUpdateQuantity: (menuId: string, quantity: number) => void
  total: number
  onCheckout: () => void
}

export function CartDrawer({
  isOpen,
  onOpenChange,
  items,
  onUpdateQuantity,
  total,
  onCheckout,
}: CartDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Keranjang Pesanan</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Keranjang masih kosong</p>
              <p className="text-sm mt-1">Pilih menu untuk mulai memesan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const toppingsTotal = item.toppings.reduce((s, t) => s + t.price, 0)
                const itemTotal = (item.price + toppingsTotal) * item.quantity
                
                return (
                  <div key={item.menuId} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      {item.toppings.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{item.toppings.map(t => t.name).join(', ')}
                        </p>
                      )}
                      <p className="text-primary font-semibold mt-1">
                        {formatCurrency(item.price + toppingsTotal)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-error"
                        onClick={() => onUpdateQuantity(item.menuId, 0)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2 bg-card rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.menuId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.menuId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        
        {items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="p-4 sm:p-6">
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
                <Button 
                  className="w-full btn-primary py-6 text-lg"
                  onClick={onCheckout}
                >
                  Lanjut ke Pembayaran
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}