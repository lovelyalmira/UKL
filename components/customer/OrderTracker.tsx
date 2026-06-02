'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime, getStatusColor } from '@/lib/utils'
import type { Order } from '@/types'
import { Clock, ChefHat, Package, Truck, CheckCircle } from 'lucide-react'

interface OrderTrackerProps {
  order: Order
}

const STATUS_CONFIG = [
  { key: 'pending', label: 'Diterima', icon: Clock, color: 'text-warning' },
  { key: 'preparing', label: 'Diproses', icon: ChefHat, color: 'text-blue-500' },
  { key: 'ready', label: 'Siap', icon: Package, color: 'text-success' },
  { key: 'serving', label: 'Diantar', icon: Truck, color: 'text-purple-500' },
  { key: 'completed', label: 'Selesai', icon: CheckCircle, color: 'text-green-600' },
]

export function OrderTracker({ order }: OrderTrackerProps) {
  const currentIndex = STATUS_CONFIG.findIndex(s => s.key === order.status)
  
  return (
    <Card>
      <CardContent className="pt-6">
        {/* Progress Bar */}
        <div className="relative mb-6">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded transition-all duration-500"
            style={{ width: `${(currentIndex / (STATUS_CONFIG.length - 1)) * 100}%` }}
          />
          
          <div className="relative flex justify-between">
            {STATUS_CONFIG.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentIndex
              const isCurrent = index === currentIndex
              
              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-card border-muted text-muted-foreground'}
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Status Info */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <p className="text-sm font-medium">Status Saat Ini</p>
            <p className="text-xs text-muted-foreground">
              Diperbarui: {formatTime(order.updatedAt)}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.toUpperCase()}
          </Badge>
        </div>
        
        {/* Estimated Time */}
        {['pending', 'preparing'].includes(order.status) && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            ⏱️ Estimasi siap: <span className="font-medium text-foreground">15-20 menit</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}