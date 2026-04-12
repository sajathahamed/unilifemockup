'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import {
  ChevronDown,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Truck,
  Search,
  Plus,
  Loader2,
} from 'lucide-react'
import { UserRole } from '@/lib/auth'

type DbOrder = {
  id: number
  laundry_shop_id: number | string
  order_ref?: string | null
  customer_name: string
  customer_phone: string | null
  items_description: string | null
  total: number
  status: string
  pickup_address: string | null
  delivery_address: string | null
  notes?: string | null
  created_at: string
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((Date.now() - d) / 60000)
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff} mins ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`
  return `${Math.floor(diff / 1440)} days ago`
}

const statusConfig = {
  pending: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending' },
  washing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Washing' },
  ironing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Ironing' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
}

function normalizeOrderStatus(raw: string): keyof typeof statusConfig {
  const s = String(raw || '').toLowerCase()
  if (s === 'pending' || s === 'new' || s === 'confirmed') return 'pending'
  if (s === 'washing' || s === 'in_progress' || s === 'processing') return 'washing'
  if (s === 'ironing') return 'ironing'
  if (s === 'ready' || s === 'ready_for_delivery' || s === 'out_for_delivery') return 'ready'
  if (s === 'completed' || s === 'delivered') return 'completed'
  if (s === 'cancelled' || s === 'canceled' || s === 'rejected') return 'cancelled'
  return 'pending'
}

interface VendorLaundryOrdersClientProps {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

export default function VendorLaundryOrdersClient({ user }: VendorLaundryOrdersClientProps) {
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [shops, setShops] = useState<{ id: number; shop_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOrder, setNewOrder] = useState({ customer: '', phone: '', service: 'Wash & Iron', items: 1, address: '', shop_id: 0 })
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  function isValidSriLankaPhone(value: string): boolean {
    const digits = String(value ?? '').replace(/[^\d]/g, '')
    // Digits-only Sri Lanka formats: 0XXXXXXXXX or 94XXXXXXXXX
    return /^0(7\d{8}|1\d{8}|2\d{8})$/.test(digits) || /^94(7\d{8}|1\d{8}|2\d{8})$/.test(digits)
  }

  const loadOrdersAndShops = async () => {
    const [ordRes, shopRes] = await Promise.all([
      fetch('/api/vendor/laundry-orders').then((r) => (r.ok ? r.json() : { orders: [] })),
      fetch('/api/vendor/shops').then((r) => (r.ok ? r.json() : { laundry_shops: [] })),
    ])
    setOrders(ordRes.orders ?? [])
    const ls = shopRes.laundry_shops ?? []
    setShops(ls.map((s: { id: number; shop_name: string }) => ({ id: s.id, shop_name: s.shop_name })))
    if (ls.length > 0) setNewOrder((p) => ({ ...p, shop_id: p.shop_id || ls[0].id }))
  }

  useEffect(() => {
    loadOrdersAndShops().finally(() => setLoading(false))
  }, [])

  const filteredOrders = orders.filter((o) => {
    const normalized = normalizeOrderStatus(o.status)
    const matchesStatus = filterStatus === 'all' || normalized === filterStatus
    const matchesSearch = !searchTerm || o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || String(o.id).includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = async (id: number, nextStatus: string) => {
    const res = await fetch(`/api/vendor/laundry-orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) })
    if (res.ok) await loadOrdersAndShops()
    setExpandedOrder(null)
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)

    if (!newOrder.customer.trim()) {
      setCreateError('Customer name is required.')
      return
    }

    if (!isValidSriLankaPhone(newOrder.phone)) {
      setCreateError('Enter a valid Sri Lankan phone number (digits only, e.g. 0712345678).')
      return
    }

    if (!newOrder.address.trim()) {
      setCreateError('Delivery address is required.')
      return
    }

    if (!newOrder.items || newOrder.items < 1) {
      setCreateError('Items must be at least 1.')
      return
    }

    const amount = newOrder.service === 'Wash & Iron' ? 500 * newOrder.items : newOrder.service === 'Dry Clean' ? 2000 * newOrder.items : 200 * newOrder.items
    setSaving(true)
    try {
      const res = await fetch('/api/vendor/laundry-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          laundry_shop_id: newOrder.shop_id || shops[0]?.id,
          customer_name: newOrder.customer,
          customer_phone: newOrder.phone,
          items_description: `${newOrder.service} (${newOrder.items} kg)`,
          total: amount,
          pickup_address: newOrder.address,
          delivery_address: newOrder.address,
          notes: null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setCreateError(data?.message || `Failed to create order (HTTP ${res.status})`)
        return
      }

      // Close modal for any successful create response.
      if (data && data.id) await loadOrdersAndShops()
      setNewOrder({ customer: '', phone: '', service: 'Wash & Iron', items: 1, address: '', shop_id: newOrder.shop_id || shops[0]?.id })
      setShowCreateModal(false)
    } finally {
      setSaving(false)
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laundry Orders</h1>
            <p className="text-gray-500 mt-1">Manage and track laundry pickups and deliveries</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={shops.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            <Plus size={18} />
            Create Order
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const normalizedStatus = normalizeOrderStatus(order.status)
            const config = statusConfig[normalizedStatus] ?? statusConfig.pending
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">#LND-{order.id}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{order.customer_name} • {order.items_description || 'Laundry'} • {timeAgo(order.created_at)}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">RS {Number(order.total).toLocaleString()}</p>
                  <ChevronDown size={20} className={`text-gray-400 ml-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Phone size={16} className="text-gray-400 mt-0.5" />
                        <p className="text-sm">{order.customer_phone || '—'}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <p className="text-sm">{order.delivery_address || order.pickup_address || '—'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {normalizedStatus === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(order.id, 'washing')} className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1">
                            <CheckCircle size={16} /> Accept
                          </button>
                          <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {normalizedStatus === 'washing' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'ironing')} className="w-full py-2 bg-amber-500 text-white text-sm font-medium rounded-lg">Start Ironing</button>
                      )}
                      {normalizedStatus === 'ironing' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'ready')} className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg">Mark Ready</button>
                      )}
                      {normalizedStatus === 'ready' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1">
                          <Truck size={16} /> Confirm Delivery
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No laundry orders found</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Laundry Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {shops.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
                  <select value={newOrder.shop_id} onChange={(e) => setNewOrder((p) => ({ ...p, shop_id: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    {shops.map((s) => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input required value={newOrder.customer} onChange={(e) => setNewOrder((p) => ({ ...p, customer: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newOrder.phone}
                  onChange={(e) => setNewOrder((p) => ({ ...p, phone: e.target.value.replace(/[^\d]/g, '') }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="0712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select value={newOrder.service} onChange={(e) => setNewOrder((p) => ({ ...p, service: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option>Wash & Iron</option>
                  <option>Wash Only</option>
                  <option>Dry Clean</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items (kg)</label>
                <input type="number" min={1} value={newOrder.items} onChange={(e) => setNewOrder((p) => ({ ...p, items: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input required value={newOrder.address} onChange={(e) => setNewOrder((p) => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Block 12, Hostel A" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}Create
                </button>
              </div>
              {createError ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>
              ) : null}
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
