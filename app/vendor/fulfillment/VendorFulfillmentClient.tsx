'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Package, CheckCircle, Clock, Search, MapPin, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'

type FulfillmentStatus = 'pending' | 'washing' | 'ironing' | 'ready' | 'completed' | 'cancelled'

interface FulfillmentOrder {
  id: number
  order_ref?: string | null
  customer: string
  itemsDescription: string
  total: number
  status: FulfillmentStatus
  address: string
  created_at: string
}

const statusConfig: Record<FulfillmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100' },
  washing: { label: 'Washing', color: 'text-blue-600', bg: 'bg-blue-100' },
  ironing: { label: 'Ironing', color: 'text-amber-600', bg: 'bg-amber-100' },
  ready: { label: 'Ready', color: 'text-purple-600', bg: 'bg-purple-100' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
}

function normalizeStatus(raw: unknown): FulfillmentStatus {
  const s = String(raw ?? '').toLowerCase()
  if (s === 'new') return 'pending'
  if (s === 'confirmed' || s === 'accepted' || s === 'picked_up') return 'washing'
  if (s === 'in_progress' || s === 'processing') return 'washing'
  if (s === 'ready_for_delivery' || s === 'out_for_delivery' || s === 'packed') return 'ready'
  if (s === 'delivered' || s === 'done') return 'completed'
  if (s === 'pending' || s === 'washing' || s === 'ironing' || s === 'ready' || s === 'completed' || s === 'cancelled') return s
  return 'pending'
}

interface VendorFulfillmentClientProps {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

export default function VendorFulfillmentClient({ user }: VendorFulfillmentClientProps) {
  const [fulfillments, setFulfillments] = useState<FulfillmentOrder[]>([])
  const [filter, setFilter] = useState<FulfillmentStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadOrders = async () => {
    await fetch('/api/vendor/laundry-orders')
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => {
        const mapped: FulfillmentOrder[] = (data?.orders ?? []).map((o: any) => ({
          id: Number(o.id),
          order_ref: o.order_ref ?? null,
          customer: o.customer_name ?? 'Customer',
          itemsDescription: o.items_description ?? 'Laundry',
          total: Number(o.total ?? 0),
          status: normalizeStatus(o.status),
          address: o.delivery_address ?? o.pickup_address ?? '—',
          created_at: o.created_at ?? new Date().toISOString(),
        }))
        setFulfillments(mapped)
      })
  }

  useEffect(() => {
    loadOrders().finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (id: number, nextStatus: FulfillmentStatus) => {
    setActionError(null)
    const res = await fetch(`/api/vendor/laundry-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) {
      await loadOrders()
      return
    }
    const data = await res.json().catch(() => null)
    setActionError(data?.message || `Failed to update order (HTTP ${res.status})`)
  }

  const filtered = fulfillments.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch =
      !search ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) ||
      String(o.order_ref ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Fulfillment</h1>
          <p className="text-gray-500 mt-1">Track and manage order pick, pack, and ship</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-gray-900">{fulfillments.filter((o) => o.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-gray-900">{fulfillments.filter((o) => ['washing', 'ironing', 'ready'].includes(o.status)).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-xl font-bold text-gray-900">{fulfillments.filter((o) => o.status === 'completed').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FulfillmentStatus | 'all')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {actionError ? (
          <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {actionError}
          </div>
        ) : null}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Placed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const cfg = statusConfig[o.status] ?? statusConfig.pending
                  return (
                    <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{o.order_ref || `LND-${o.id}`}</td>
                      <td className="py-3 px-4">{o.customer}</td>
                      <td className="py-3 px-4">{o.itemsDescription}</td>
                      <td className="py-3 px-4">RS {o.total.toLocaleString()}</td>
                      <td className="py-3 px-4 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm truncate max-w-[120px]">{o.address}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{new Date(o.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {o.status === 'pending' && (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleStatusUpdate(o.id, 'washing')} className="text-sm text-primary font-medium hover:underline">Start Washing</button>
                            <button onClick={() => handleStatusUpdate(o.id, 'cancelled')} className="text-sm text-red-600 font-medium hover:underline">Cancel</button>
                          </div>
                        )}
                        {o.status === 'washing' && (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleStatusUpdate(o.id, 'ironing')} className="text-sm text-primary font-medium hover:underline">Start Ironing</button>
                            <button onClick={() => handleStatusUpdate(o.id, 'cancelled')} className="text-sm text-red-600 font-medium hover:underline">Cancel</button>
                          </div>
                        )}
                        {o.status === 'ironing' && (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleStatusUpdate(o.id, 'ready')} className="text-sm text-primary font-medium hover:underline">Mark Ready</button>
                            <button onClick={() => handleStatusUpdate(o.id, 'cancelled')} className="text-sm text-red-600 font-medium hover:underline">Cancel</button>
                          </div>
                        )}
                        {o.status === 'ready' && (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleStatusUpdate(o.id, 'completed')} className="text-sm text-primary font-medium hover:underline">Confirm Delivery</button>
                            <button onClick={() => handleStatusUpdate(o.id, 'cancelled')} className="text-sm text-red-600 font-medium hover:underline">Cancel</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500">No orders match your filters</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
