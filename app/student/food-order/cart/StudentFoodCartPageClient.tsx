'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { UserProfile } from '@/lib/auth'
import { ShoppingCart, Truck, ReceiptText } from 'lucide-react'

type CartRow = {
  id: string
  shop_ref: string
  item_name: string
  item_emoji?: string | null
  qty: number
  unit_price: number
}

type FoodOrderRow = {
  id: number
  customer_name: string
  items: any
  total_final: number
  status: string
  delivery_address?: string | null
  delivery_type: 'delivery' | 'pickup'
  payment_method: string
  created_at: string
}

type LaundryOrderRow = {
  id: number
  customer_name: string
  items_description_final: string
  pickup_address?: string | null
  delivery_address?: string | null
  total_final: number
  status: string
  payment_method: string
  created_at: string
}

function getStatusColor(status: string): { bg: string; text: string } {
  const s = (status || '').toLowerCase()
  switch (s) {
    case 'pending':
    case 'new':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'confirmed':
    case 'accepted':
      return { bg: 'bg-purple-100', text: 'text-purple-700' }
    case 'processing':
    case 'in_progress':
    case 'washing':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' }
    case 'preparing':
    case 'ironing':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'ready':
    case 'ready_for_delivery':
      return { bg: 'bg-green-100', text: 'text-green-700' }
    case 'out_for_delivery':
    case 'delivered':
    case 'done':
    case 'completed':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-700' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' }
  }
}

export default function StudentFoodCartPageClient({ user }: { user: UserProfile }) {
  const [cartItems, setCartItems] = useState<CartRow[]>([])
  const [orders, setOrders] = useState<FoodOrderRow[]>([])
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/student/cart-items?cart_type=food', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { items: [] })),
      fetch('/api/student/food-orders', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { orders: [] })),
      fetch('/api/student/laundry-orders', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { orders: [] })),
    ]).then(([cartRes, orderRes, laundryRes]) => {
      setCartItems(Array.isArray(cartRes?.items) ? cartRes.items : [])
      setOrders(Array.isArray(orderRes?.orders) ? orderRes.orders : [])
      setLaundryOrders(Array.isArray(laundryRes?.orders) ? laundryRes.orders : [])
    }).finally(() => setLoading(false))
  }, [])

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, i) => acc + Number(i.unit_price || 0) * Number(i.qty || 0), 0),
    [cartItems]
  )

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="py-12 text-center text-gray-500">Loading cart details...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add to Cart</h1>
          <p className="text-gray-500 mt-1">View your current cart and recent food/laundry orders.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ShoppingCart size={18} /> Current Cart</h2>
            <span className="text-sm text-gray-500">{cartItems.length} item(s)</span>
          </div>
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">No active cart items. <Link href="/student/food-order" className="text-primary hover:underline">Browse shops</Link></p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((i) => (
                <div key={i.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2">
                  <div className="text-sm text-gray-800">
                    <span className="mr-2">{i.item_emoji || '🍽️'}</span>
                    <span className="font-medium">{i.item_name}</span>
                    <span className="text-gray-500 ml-2">x{i.qty}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">RS {(Number(i.unit_price || 0) * Number(i.qty || 0)).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 text-right font-bold text-gray-900">Total: RS {cartTotal.toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ReceiptText size={18} /> Recent Orders</h2>
            <span className="text-sm text-gray-500">{orders.length} order(s)</span>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">Order #{o.id}</p>
                    {(() => {
                      const { bg, text } = getStatusColor(o.status)
                      return <span className={`text-xs px-2 py-1 rounded-full ${bg} ${text} capitalize`}>{o.status || 'new'}</span>
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Customer: {o.customer_name}</p>
                  <p className="text-sm text-gray-600">Order details: {Array.isArray(o.items) ? o.items.map((it: any) => `${it.name} x${it.quantity}`).join(', ') : '—'}</p>
                  <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                    <Truck size={14} />
                    <span>Delivery details: {o.delivery_type === 'pickup' ? 'Pickup from shop' : (o.delivery_address || 'Not provided')}</span>
                  </div>
                  <p className="text-sm text-gray-600">Payment: {o.payment_method}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">Total: RS {Number(o.total_final || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ReceiptText size={18} /> Laundry Orders</h2>
            <span className="text-sm text-gray-500">{laundryOrders.length} order(s)</span>
          </div>
          {laundryOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No laundry orders yet.</p>
          ) : (
            <div className="space-y-3">
              {laundryOrders.map((o) => (
                <div key={o.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">Laundry Order #{o.id}</p>
                    {(() => {
                      const { bg, text } = getStatusColor(o.status)
                      return <span className={`text-xs px-2 py-1 rounded-full ${bg} ${text} capitalize`}>{o.status || 'pending'}</span>
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Customer: {o.customer_name}</p>
                  <p className="text-sm text-gray-600">Order details: {o.items_description_final}</p>
                  <div className="mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Truck size={14} />
                      <span>Pickup: {o.pickup_address || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Truck size={14} />
                      <span>Delivery: {o.delivery_address || '—'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Payment: {o.payment_method}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">Total: RS {Number(o.total_final || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

