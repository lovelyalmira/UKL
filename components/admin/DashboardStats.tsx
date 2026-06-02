'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { AnalyticsData } from '@/types'
import { TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react'

interface DashboardStatsProps {
  data?: AnalyticsData
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Pendapatan',
      value: data?.totalRevenue ? formatCurrency(data.totalRevenue) : 'Rp 0',
      icon: DollarSign,
      color: 'text-primary',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Pesanan',
      value: data?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-secondary',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Rata-rata Order',
      value: data?.averageOrderValue ? formatCurrency(data.averageOrderValue) : 'Rp 0',
      icon: TrendingUp,
      color: 'text-success',
      trend: '+3.1%',
      trendUp: true,
    },
    {
      title: 'Meja Aktif',
      value: '12',
      icon: Users,
      color: 'text-warning',
      trend: '-2',
      trendUp: false,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 ${stat.trendUp ? 'text-success' : 'text-error'}`}>
                {stat.trendUp ? '↑' : '↓'} {stat.trend} dari kemarin
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}