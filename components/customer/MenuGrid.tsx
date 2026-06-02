'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Menu } from '@/types'
import { Plus, ChefHat } from 'lucide-react'
import { useState } from 'react'

interface MenuGridProps {
  menus: Menu[]
  onAddToCart: (menu: Menu, toppings?: unknown[]) => void
}

// ✅ PINTU DARURAT GAMBAR: URL gambar makanan gratis berkualitas tinggi yang selalu aktif di internet
const ONLINE_PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'

export function MenuGrid({ menus, onAddToCart }: MenuGridProps) {
  // Menyimpan id gambar yang error agar bisa diganti ke placeholder secara aman di Next.js Image
  const [fallbackImages, setFallbackImages] = useState<Record<string, string>>({})

  const handleImageError = (menuId: string) => {
    setFallbackImages((prev) => ({
      ...prev,
      [menuId]: ONLINE_PLACEHOLDER, // ✅ FIX: Ganti ke URL online kalau gambar error
    }))
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menus.map((menu) => (
        <Card key={menu.id} className="card-hover overflow-hidden">
          {/* Wrapper relative wajib ada jika komponen Image menggunakan properti 'fill' */}
          <div className="relative w-full h-40 bg-muted">
            <Image
              // ✅ FIX: Ganti '/placeholder-food.jpg' menjadi ONLINE_PLACEHOLDER
              src={fallbackImages[menu.id] || menu.image || ONLINE_PLACEHOLDER}
              alt={menu.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              onError={() => handleImageError(menu.id)}
            />
            
            {menu.isBestSeller && (
              <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground z-10">
                <ChefHat className="h-3 w-3 mr-1" />
                Best Seller
              </Badge>
            )}
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm line-clamp-1">{menu.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {menu.description}
            </p>
            <p className="text-primary font-bold mt-2">
              {formatCurrency(menu.price)}
            </p>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <Button
              size="sm"
              className="w-full"
              onClick={() => onAddToCart(menu)}
              disabled={!menu.isAvailable}
            >
              <Plus className="h-4 w-4 mr-1" />
              {menu.isAvailable ? 'Tambah' : 'Habis'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}