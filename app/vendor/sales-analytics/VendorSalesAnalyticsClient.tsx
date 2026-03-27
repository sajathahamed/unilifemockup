'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface VendorSalesAnalyticsClientProps {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

const iconMap = { DollarSign, Package, TrendingUp, Users }

const statusColors: Record<string, string> = {
  completed: 'bg-green-500',
  delivered: 'bg-green-500',
  done: 'bg-green-500',
  preparing: 'bg-amber-500',
  washing: 'bg-amber-500',
  ironing: 'bg-amber-500',
  in_progress: 'bg-amber-500',
  processing: 'bg-amber-500',
  ready: 'bg-blue-500',
  ready_for_delivery: 'bg-blue-500',
  out_for_delivery: 'bg-blue-500',
  pending: 'bg-blue-500',
  new: 'bg-blue-500',
  confirmed: 'bg-blue-500',
  accepted: 'bg-blue-500',
  cancelled: 'bg-red-500',
  canceled: 'bg-red-500',
  rejected: 'bg-red-500',
}

export default function VendorSalesAnalyticsClient({ user }: VendorSalesAnalyticsClientProps) {
  const [stats, setStats] = useState<{ label: string; value: string; change: string; color: string; bg: string; icon: string }[]>([])
  const [chartData, setChartData] = useState<{ day: string; revenue: number; orders: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number; revenue: number }[]>([])
  const [statusDistribution, setStatusDistribution] = useState<{ label: string; count: number; pct: number }[]>([])
  const [shopType, setShopType] = useState<'food' | 'laundry' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/vendor/analytics')
        const data = await res.json()
        if (data.stats) setStats(data.stats)
        if (data.chartData) setChartData(data.chartData)
        if (data.topProducts) setTopProducts(data.topProducts)
        if (data.statusDistribution) setStatusDistribution(data.statusDistribution)
        if (data.shopType === 'food' || data.shopType === 'laundry') setShopType(data.shopType)
      } catch (e) {
        console.error('Analytics fetch error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const maxRevenue = chartData.length ? Math.max(...chartData.map((d) => d.revenue), 1) : 1

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales & Analysis</h1>
          <p className="text-gray-500 mt-1">
            {shopType === 'laundry'
              ? 'Track laundry revenue, order flow, and top services from your shop'
              : 'Track revenue, orders, and performance from your store'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = iconMap[s.icon as keyof typeof iconMap] ?? DollarSign
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  {s.change && <span className={`text-sm font-medium ${s.color}`}>{s.change}</span>}
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Weekly Revenue</h3>
          <div className="flex items-end gap-2 h-48">
            {chartData.length ? (
              chartData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary min-h-[4px]"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{d.day}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {d.revenue >= 1000 ? `RS ${(d.revenue / 1000).toFixed(1)}k` : `RS ${d.revenue}`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">No revenue data for this week</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{shopType === 'laundry' ? 'Top Laundry Services This Week' : 'Top Products This Week'}</h3>
            <div className="space-y-3">
              {topProducts.length ? (
                topProducts.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono w-6">{i + 1}</span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="text-primary font-semibold">RS {p.revenue.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">{shopType === 'laundry' ? 'No laundry orders yet' : 'No product sales yet'}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <div className="space-y-4">
              {statusDistribution.length ? (
                statusDistribution.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{s.label}</span>
                      <span className="font-medium">
                        {s.count} ({s.pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusColors[s.label.toLowerCase()] ?? 'bg-gray-400'} rounded-full`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
