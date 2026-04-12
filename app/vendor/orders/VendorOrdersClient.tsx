'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import {
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  DollarSign,
  Search,
  Plus,
  Trash2,
  Loader2,
  X,
} from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface Order {
  id: string
  customer: string
  phone: string
  items: { name: string; quantity: number; price: number }[]
  totalAmount: number
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  time: string
  location: string
  deliveryTime?: string
  notes?: string
}

interface MenuItem {
  id: number
  name: string
  price: number
}

function getApiError(data: unknown, status: number, fallback: string): string {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.message === 'string' && o.message.trim()) return o.message
    if (typeof o.error === 'string' && o.error.trim()) return o.error
  }
  return status >= 500 ? 'Server error, try again.' : fallback
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((Date.now() - d) / 60000)
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff} mins ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`
  return `${Math.floor(diff / 1440)} days ago`
}

function dbToOrder(db: {
  id: number
  customer_name: string
  customer_phone: string | null
  items: string | { name: string; quantity: number; price: number }[] | null
  total: number
  status: string
  delivery_address: string | null
  notes?: string | null
  created_at: string
}): Order {
  let itemsParsed: { name: string; quantity: number; price: number }[] = []
  try {
    if (typeof db.items === 'string') {
      itemsParsed = db.items ? JSON.parse(db.items) : []
    } else if (Array.isArray(db.items)) {
      itemsParsed = db.items
    } else {
      itemsParsed = []
    }
  } catch {
    itemsParsed = []
  }
  return {
    id: `#ORD-${db.id}`,
    customer: db.customer_name,
    phone: db.customer_phone || '',
    items: itemsParsed,
    totalAmount: Number(db.total),
    status: db.status as Order['status'],
    time: timeAgo(db.created_at),
    location: db.delivery_address || '',
    notes: db.notes || '',
  }
}

const statusConfig = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New', color: 'text-blue-600' },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing', color: 'text-yellow-600' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready', color: 'text-green-600' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completed', color: 'text-emerald-600' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', color: 'text-red-600' },
}

interface VendorOrdersClientProps {
  user: {
    id: number
    auth_id: string
    name: string
    email: string
    role: UserRole
    avatar_url?: string
  }
}

export default function VendorOrdersClient({ user }: VendorOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stalls, setStalls] = useState<{ id: number; shop_name: string }[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedStallId, setSelectedStallId] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null)
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(true)
  const [assignForm, setAssignForm] = useState<{
    deliveryType: 'pickup' | 'delivery'
    location: string
    mapLink: string
  }>({
    deliveryType: 'pickup',
    location: '',
    mapLink: '',
  })
  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    location: '',
    mapLink: '',
    deliveryType: 'delivery' as 'delivery' | 'pickup',
    notes: '',
    stall_id: 0,
    orderItems: [] as { name: string; quantity: number; price: number }[],
  })

  const loadOrders = async (stallId?: number) => {
    const qs = stallId ? `?food_stall_id=${stallId}` : ''
    const r = await fetch(`/api/vendor/food-orders${qs}`)
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      setMessage({ type: 'error', text: getApiError(data, r.status, 'Failed to load orders.') })
      return
    }
    setOrders((data.orders ?? []).map(dbToOrder))
  }

  const loadMenuItems = async (stallId?: number) => {
    const qs = stallId ? `?food_stall_id=${stallId}&available_only=true` : '?available_only=true'
    const r = await fetch(`/api/vendor/menu-items${qs}`)
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      setMessage({ type: 'error', text: getApiError(data, r.status, 'Failed to load menu items.') })
      return
    }
    const items = Array.isArray(data.items) ? data.items : []
    setMenuItems(
      items.map((item: { id: number; name: string; price: number }) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
      }))
    )
  }

  useEffect(() => {
    fetch('/api/vendor/shops')
      .then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) }))
      .then(async (shopRes) => {
        if (!shopRes.ok) {
          setMessage({ type: 'error', text: getApiError(shopRes.data, shopRes.status, 'Failed to load shops.') })
          return
        }
        const fs = shopRes.data.food_stalls ?? []
        const mapped = fs.map((s: { id: number; shop_name: string }) => ({ id: s.id, shop_name: s.shop_name }))
        setStalls(mapped)
        const firstStallId = mapped[0]?.id || 0
        if (firstStallId) {
          setSelectedStallId(firstStallId)
          setNewOrder((p) => ({ ...p, stall_id: p.stall_id || firstStallId }))
          await loadOrders(firstStallId)
          await loadMenuItems(firstStallId)
        } else {
          setOrders([])
          setMenuItems([])
        }
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Network error while loading orders.' })
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedStallId) return
    loadOrders(selectedStallId).catch(() => setMessage({ type: 'error', text: 'Network error while loading orders.' }))
    loadMenuItems(selectedStallId).catch(() => setMessage({ type: 'error', text: 'Network error while loading menu items.' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStallId])

  const addOrderItem = (item: { name: string; price: number }) => {
    const existing = newOrder.orderItems.find((i) => i.name === item.name)
    if (existing) {
      setNewOrder((p) => ({
        ...p,
        orderItems: p.orderItems.map((i) => (i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i)),
      }))
    } else {
      setNewOrder((p) => ({ ...p, orderItems: [...p.orderItems, { ...item, quantity: 1 }] }))
    }
  }

  const totalAmount = newOrder.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const customer = newOrder.customer.trim()
    const phone = newOrder.phone.trim()
    const location = newOrder.location.trim()
    const mapLink = newOrder.mapLink.trim()
    if (customer.length < 2) {
      setMessage({ type: 'error', text: 'Customer name must be at least 2 characters.' })
      return
    }
    if (!/^[+0-9][0-9\s-]{6,19}$/.test(phone)) {
      setMessage({ type: 'error', text: 'Enter a valid customer phone number.' })
      return
    }
    if (newOrder.deliveryType === 'delivery' && location.length < 4) {
      setMessage({ type: 'error', text: 'Delivery location must be at least 4 characters.' })
      return
    }
    if (mapLink && !/^https?:\/\/\S+$/i.test(mapLink)) {
      setMessage({ type: 'error', text: 'Map link must be a valid URL.' })
      return
    }
    if (newOrder.orderItems.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item.' })
      return
    }
    if (newOrder.orderItems.some((i) => !i.name.trim() || i.quantity <= 0 || i.price < 0)) {
      setMessage({ type: 'error', text: 'Order items contain invalid values.' })
      return
    }
    if (totalAmount <= 0) {
      setMessage({ type: 'error', text: 'Order total must be greater than 0.' })
      return
    }
    const stallId = newOrder.stall_id || selectedStallId || stalls[0]?.id
    if (!stallId) {
      setMessage({ type: 'error', text: 'Select a stall first.' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/vendor/food-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_stall_id: stallId,
          customer_name: customer,
          customer_phone: phone,
          items: newOrder.orderItems,
          total: totalAmount,
          delivery_type: newOrder.deliveryType,
          delivery_address: location || null,
          map_link: mapLink || null,
          notes: newOrder.notes.trim() || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.id) {
        await loadOrders(stallId)
        setNewOrder({
          customer: '',
          phone: '',
          location: '',
          mapLink: '',
          deliveryType: 'delivery',
          notes: '',
          stall_id: stallId,
          orderItems: [],
        })
        setShowCreateModal(false)
        setMessage({ type: 'success', text: 'Order created successfully.' })
      } else {
        setMessage({ type: 'error', text: getApiError(data, res.status, 'Failed to create order.') })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while creating order.' })
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    setMessage(null)
    const numId = id.replace('#ORD-', '')
    try {
      const res = await fetch(`/api/vendor/food-orders/${numId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        await loadOrders(selectedStallId || newOrder.stall_id || stalls[0]?.id)
        setMessage({ type: 'success', text: 'Order status updated.' })
      } else {
        setMessage({ type: 'error', text: getApiError(data, res.status, 'Failed to update order status.') })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while updating order status.' })
    }
    setExpandedOrder(null)
  }

  const openAssignDeliveryModal = (order: Order) => {
    setAssigningOrder(order)
    setAssignForm({
      deliveryType: 'pickup',
      location: order.location || '',
      mapLink: '',
    })
    fetch('/api/delivery/availability', { cache: 'no-store' })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then((res) => setDeliveryAvailable(Boolean(res.ok && res.data?.available)))
      .catch(() => setDeliveryAvailable(false))
  }

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningOrder) return

    const numId = assigningOrder.id.replace('#ORD-', '')
    const location = assignForm.location.trim()
    const mapLink = assignForm.mapLink.trim()

    if (assignForm.deliveryType === 'delivery') {
      if (!deliveryAvailable) {
        setMessage({ type: 'error', text: 'Delivery not available' })
        return
      }
      if (location.length < 4) {
        setMessage({ type: 'error', text: 'Delivery location must be at least 4 characters.' })
        return
      }
      if (mapLink && !/^https?:\/\/\S+$/i.test(mapLink)) {
        setMessage({ type: 'error', text: 'Map link must be a valid URL.' })
        return
      }
    }

    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/vendor/food-orders/${numId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          delivery_type: assignForm.deliveryType,
          delivery_address: location || null,
          map_link: mapLink || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage({ type: 'error', text: getApiError(data, res.status, 'Failed to confirm order.') })
        return
      }

      await loadOrders(selectedStallId || newOrder.stall_id || stalls[0]?.id)
      setAssigningOrder(null)
      setMessage({
        type: 'success',
        text: assignForm.deliveryType === 'delivery'
          ? 'Order confirmed and sent to delivery admin.'
          : 'Order confirmed as pickup.',
      })
    } catch {
      setMessage({ type: 'error', text: 'Network error while confirming order.' })
    } finally {
      setSaving(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm)
    return matchesStatus && matchesSearch
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-1">Manage and track all your orders</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={stalls.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            <Plus size={18} />
            Create Order
          </button>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, order ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Orders</option>
                <option value="new">New</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative flex-1">
              <select
                value={selectedStallId || ''}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10) || 0
                  setSelectedStallId(id)
                  setNewOrder((p) => ({ ...p, stall_id: id || p.stall_id }))
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
                disabled={stalls.length === 0}
              >
                {stalls.map((s) => (
                  <option key={s.id} value={s.id}>{s.shop_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredOrders.length}</span> order(s)
        </div>

        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                onStatusUpdate={handleStatusUpdate}
                onConfirmDelivery={() => openAssignDeliveryModal(order)}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {stalls.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Stall</label>
                  <select value={newOrder.stall_id} onChange={(e) => setNewOrder((p) => ({ ...p, stall_id: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    {stalls.map((s) => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input required value={newOrder.customer} onChange={(e) => setNewOrder((p) => ({ ...p, customer: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="John D." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input required value={newOrder.phone} onChange={(e) => setNewOrder((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="+234 901 234 5678" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOrder((p) => ({ ...p, deliveryType: 'pickup' }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${newOrder.deliveryType === 'pickup' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700'}`}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrder((p) => ({ ...p, deliveryType: 'delivery' }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${newOrder.deliveryType === 'delivery' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700'}`}
                  >
                    Delivery
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                <input
                  required={newOrder.deliveryType === 'delivery'}
                  value={newOrder.location}
                  onChange={(e) => setNewOrder((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Nearby building mark (e.g. Block 12, Hostel A)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Map Link (optional)</label>
                <input
                  value={newOrder.mapLink}
                  onChange={(e) => setNewOrder((p) => ({ ...p, mapLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Items</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {menuItems.map((item) => (
                    <button key={item.name} type="button" onClick={() => addOrderItem(item)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                      {item.name} (+RS {item.price})
                    </button>
                  ))}
                </div>
                {menuItems.length === 0 && (
                  <p className="text-sm text-gray-500 mb-2">No menu items found for this stall.</p>
                )}
                {newOrder.orderItems.length > 0 && (
                  <div className="space-y-1 border rounded-lg p-2 bg-gray-50">
                    {newOrder.orderItems.map((i) => (
                      <div key={i.name} className="flex justify-between items-center text-sm">
                        <span>{i.name} x{i.quantity}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setNewOrder((p) => ({ ...p, orderItems: p.orderItems.filter((x) => x.name !== i.name) }))} className="text-red-600">
                            <Trash2 size={14} />
                          </button>
                          <span>RS {(i.price * i.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    <p className="font-semibold pt-2 border-t">Total: RS {totalAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input value={newOrder.notes} onChange={(e) => setNewOrder((p) => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="No spice please" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700">Cancel</button>
                <button type="submit" disabled={newOrder.orderItems.length === 0 || saving} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assigningOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAssigningOrder(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delivery</h3>
              <button onClick={() => setAssigningOrder(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleConfirmDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignForm((p) => ({ ...p, deliveryType: 'pickup' }))}
                    className={`px-3 py-2 rounded-lg border ${assignForm.deliveryType === 'pickup' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700'}`}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignForm((p) => ({ ...p, deliveryType: 'delivery' }))}
                    className={`px-3 py-2 rounded-lg border ${assignForm.deliveryType === 'delivery' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700'}`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
                <input
                  value={assignForm.location}
                  onChange={(e) => setAssignForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Delivery or pickup location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Map Link (optional)</label>
                <input
                  value={assignForm.mapLink}
                  onChange={(e) => setAssignForm((p) => ({ ...p, mapLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {assignForm.deliveryType === 'delivery' && (
                <div className={`text-xs rounded-lg px-3 py-2 border ${deliveryAvailable ? 'text-gray-500 bg-blue-50 border-blue-100' : 'text-red-700 bg-red-50 border-red-200'}`}>
                  {deliveryAvailable ? 'This order will be sent to delivery admin for assignment.' : 'Delivery not available'}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAssigningOrder(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving || (assignForm.deliveryType === 'delivery' && !deliveryAvailable)} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function OrderItem({
  order,
  isExpanded,
  onToggle,
  onStatusUpdate,
  onConfirmDelivery,
}: {
  order: Order
  isExpanded: boolean
  onToggle: () => void
  onStatusUpdate: (id: string, status: Order['status']) => void
  onConfirmDelivery: () => void
}) {
  const config = statusConfig[order.status]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold text-gray-900">{order.id}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {order.customer} • {order.time}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">RS {order.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 ml-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    RS {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Delivery Location</p>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900">{order.location}</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Customer Phone</p>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900">{order.phone}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {order.deliveryTime && (
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Estimated Delivery</p>
                <div className="flex items-start gap-2">
                  <Clock size={16} className={`${config.color} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm font-medium text-gray-900">{order.deliveryTime}</p>
                </div>
              </div>
            )}
            {order.notes && (
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Special Notes</p>
                <p className="text-sm font-medium text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Total Amount</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                RS {order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {order.status === 'new' && (
              <>
                <button onClick={() => onStatusUpdate(order.id, 'preparing')} className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Accept Order
                </button>
                <button onClick={() => onStatusUpdate(order.id, 'cancelled')} className="flex-1 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}
            {order.status === 'preparing' && (
              <button onClick={() => onStatusUpdate(order.id, 'ready')} className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">
                Mark as Ready
              </button>
            )}
            {order.status === 'ready' && (
              <button onClick={onConfirmDelivery} className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Confirm Delivery
              </button>
            )}
            {(order.status === 'completed' || order.status === 'cancelled') && (
              <button className="w-full py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed">
                {order.status === 'completed' ? 'Order Completed' : 'Order Cancelled'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
