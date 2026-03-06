'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle,
  XCircle,
  Truck,
  Utensils,
  Store,
} from 'lucide-react'
import Link from 'next/link'

type FoodStall = { id: number; shop_name: string; owner_email: string }
type LaundryShop = { id: number; shop_name: string; owner_email: string }

export default function VendorDashboardClient({ userName }: { userName: string }) {
  const [foodStalls, setFoodStalls] = useState<FoodStall[]>([])
  const [laundryShops, setLaundryShops] = useState<LaundryShop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vendor/shops')
      .then((r) => (r.ok ? r.json() : { food_stalls: [], laundry_shops: [] }))
      .then((data) => {
        setFoodStalls(data.food_stalls ?? [])
        setLaundryShops(data.laundry_shops ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hasFood = foodStalls.length > 0
  const hasLaundry = laundryShops.length > 0
  const hasShops = hasFood || hasLaundry

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!hasShops) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Shops Registered</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Your account ({userName}) has no food stalls or laundry shops linked. Contact your campus admin to register your business using your login email.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Today's Orders" value="24" color="bg-blue-500" />
        <StatCard icon={Clock} label="Pending" value="8" color="bg-yellow-500" />
        <StatCard icon={DollarSign} label="Today's Revenue" value="RS 45,200" color="bg-green-500" />
        <StatCard icon={TrendingUp} label="This Week" value="RS 312,500" color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {hasFood && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Utensils size={20} className="text-amber-500" /> Food Stall – Active Orders
              </h2>
              <Link href="/vendor/orders" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Your shops: {foodStalls.map((s) => s.shop_name).join(', ')}
            </p>
            <div className="space-y-3">
              <OrderCard id="#ORD-2451" items="Jollof Rice, Chicken" customer="John D." time="5 mins ago" status="new" />
              <OrderCard id="#ORD-2450" items="Fried Rice, Fish" customer="Sarah M." time="12 mins ago" status="preparing" />
            </div>
          </div>
        )}

        {hasLaundry && !hasFood && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck size={20} className="text-blue-500" /> Laundry Shop – Active Orders
              </h2>
              <Link href="/vendor/laundry/orders" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Your shops: {laundryShops.map((s) => s.shop_name).join(', ')}
            </p>
            <div className="space-y-3">
              <OrderCard id="#LND-101" items="Wash & Iron (5 kg)" customer="Mike O." time="20 mins ago" status="ready" />
            </div>
          </div>
        )}

        {hasFood && hasLaundry && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Businesses</h2>
            <div className="space-y-3">
              {foodStalls.map((s) => (
                <Link key={s.id} href="/vendor/orders" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Utensils size={20} className="text-amber-600" />
                  <span className="font-medium text-gray-900">{s.shop_name}</span>
                  <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </Link>
              ))}
              {laundryShops.map((s) => (
                <Link key={s.id} href="/vendor/laundry/orders" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Truck size={20} className="text-blue-600" />
                  <span className="font-medium text-gray-900">{s.shop_name}</span>
                  <ArrowRight size={16} className="text-gray-400 ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {hasFood && <ActionButton href="/vendor/orders" label="Food Orders" icon={Package} />}
              {hasLaundry && <ActionButton href="/vendor/laundry/orders" label="Laundry Orders" icon={Truck} />}
              {hasFood && <ActionButton href="/vendor/menu" label="Manage Menu" icon={Plus} />}
              <ActionButton href="/vendor/settings" label="Store Settings" icon={Store} />
              <ActionButton href="/vendor/analytics" label="View Analytics" icon={TrendingUp} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Status</h2>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">Store is Open</span>
              </div>
              <button type="button" className="text-xs text-green-700 hover:underline">Change</button>
            </div>
          </div>
        </div>
      </div>

      {hasFood && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Items Today</h2>
            <Link href="/vendor/menu" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              Manage menu <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PopularItem name="Jollof Rice" orders={15} price="RS 1,200" />
            <PopularItem name="Fried Rice" orders={12} price="RS 1,500" />
            <PopularItem name="Chicken & Chips" orders={10} price="RS 2,000" />
            <PopularItem name="Shawarma" orders={8} price="RS 1,800" />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function OrderCard({
  id,
  items,
  customer,
  time,
  status,
}: {
  id: string
  items: string
  customer: string
  time: string
  status: 'new' | 'preparing' | 'ready'
}) {
  const config = {
    new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
    preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing' },
    ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready' },
  }[status]
  return (
    <div className="p-4 rounded-xl border border-gray-200">
      <div className="flex justify-between mb-2">
        <span className="font-semibold text-gray-900">{id}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{items}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{customer}</span>
        <span>{time}</span>
      </div>
      {status === 'new' && (
        <div className="flex gap-2 mt-3">
          <button type="button" className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 flex items-center justify-center gap-1">
            <CheckCircle size={14} /> Accept
          </button>
          <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
            <XCircle size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function ActionButton({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <Icon size={18} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}

function PopularItem({ name, orders, price }: { name: string; orders: number; price: string }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 text-center">
      <p className="font-medium text-gray-900">{name}</p>
      <p className="text-sm text-gray-500 mt-1">{orders} orders</p>
      <p className="text-sm font-semibold text-green-600 mt-1">{price}</p>
    </div>
  )
}
