'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Menu } from '@/types'
import { ChefHat, Flame, Plus } from 'lucide-react'
import Image from 'next/image'

interface BestSellerSectionProps {
  items: Menu[]
  onAddToCart: (menu: Menu, toppings?: unknown[]) => void
}

export function BestSellerSection({ items, onAddToCart }: BestSellerSectionProps) {
  if (!items?.length) return null

  return (
    <section className="px-4 py-6 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">🔥 Best Seller</h2>
        <Badge variant="secondary" className="ml-auto">
          Paling Laris
        </Badge>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {items.map((menu) => (
          <Card 
            key={menu.id} 
            className="min-w-[160px] card-hover flex-shrink-0 overflow-hidden border-primary/20"
          >
            <div className="relative">
              <Image
                src={menu.image || '/placeholder-food.jpg'}
                alt={menu.name}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-food.jpg'
                }}
              />
              <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                <ChefHat className="h-3 w-3 mr-1" />
                #1
              </Badge>
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm line-clamp-1">{menu.name}</h3>
              <p className="text-primary font-bold mt-1 text-sm">
                {formatCurrency(menu.price)}
              </p>
              <Button
                size="sm"
                className="w-full mt-2 h-8 text-xs"
                variant="outline"
                onClick={() => onAddToCart(menu)}
                disabled={!menu.isAvailable}
              >
                <Plus className="h-3 w-3 mr-1" />
                Tambah
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}