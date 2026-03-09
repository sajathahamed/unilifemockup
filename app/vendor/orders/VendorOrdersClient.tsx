'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import {
  ChevronDown,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  DollarSign,
  Search,
  Plus,
  Trash2,
  Loader2,
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

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((Date.now() - d) / 60000)
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff} mins ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`
  return `${Math.floor(diff / 1440)} days ago`
}

function dbToOrder(db: { id: number; customer_name: string; customer_phone: string | null; items: string | null; total_amount: number; status: string; address: string | null; created_at: string }): Order {
  let itemsParsed: { name: string; quantity: number; price: number }[] = []
  try {
    itemsParsed = db.items ? JSON.parse(db.items) : []
  } catch {
    itemsParsed = []
  }
  return {
    id: `#ORD-${db.id}`,
    customer: db.customer_name,
    phone: db.customer_phone || '',
    items: itemsParsed,
    totalAmount: Number(db.total_amount),
    status: db.status as Order['status'],
    time: timeAgo(db.created_at),
    location: db.address || '',
  }
}

const statusConfig = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New', color: 'text-blue-600' },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing', color: 'text-yellow-600' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready', color: 'text-green-600' },
  completed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed', color: 'text-purple-600' },
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

const SAMPLE_ITEMS = [
  { name: 'Jollof Rice', price: 1200 },
  { name: 'Fried Rice', price: 1500 },
  { name: 'Chicken & Chips', price: 2000 },
  { name: 'Shawarma', price: 1800 },
  { name: 'Zobo Drink', price: 300 },
]

export default function VendorOrdersClient({ user }: VendorOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stalls, setStalls] = useState<{ id: number; shop_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    location: '',
    notes: '',
    stall_id: 0,
    orderItems: [] as { name: string; quantity: number; price: number }[],
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/vendor/food-orders').then((r) => (r.ok ? r.json() : { orders: [] })),
      fetch('/api/vendor/shops').then((r) => (r.ok ? r.json() : { food_stalls: [] })),
    ]).then(([ordRes, shopRes]) => {
      const raw = ordRes.orders ?? []
      setOrders(raw.map(dbToOrder))
      const fs = shopRes.food_stalls ?? []
      setStalls(fs.map((s: { id: number; shop_name: string }) => ({ id: s.id, shop_name: s.shop_name })))
      if (fs.length > 0) setNewOrder((p) => ({ ...p, stall_id: p.stall_id || fs[0].id }))
    }).finally(() => setLoading(false))
  }, [])

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
    if (newOrder.orderItems.length === 0 || !newOrder.customer.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/vendor/food-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_stall_id: newOrder.stall_id || stalls[0]?.id,
          customer_name: newOrder.customer,
          customer_phone: newOrder.phone,
          items: newOrder.orderItems,
          total_amount: totalAmount,
          address: newOrder.location,
        }),
      })
      const data = await res.json().catch(() => null)
      if (data?.id) {
        const mapped = dbToOrder({ ...data, created_at: new Date().toISOString() })
        setOrders((prev) => [mapped, ...prev])
        setNewOrder({ customer: '', phone: '', location: '', notes: '', stall_id: newOrder.stall_id || stalls[0]?.id, orderItems: [] })
        setShowCreateModal(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    const numId = id.replace('#ORD-', '')
    const res = await fetch(`/api/vendor/food-orders/${numId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    setExpandedOrder(null)
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                <input required value={newOrder.location} onChange={(e) => setNewOrder((p) => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Block 12, Hostel A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Items</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SAMPLE_ITEMS.map((item) => (
                    <button key={item.name} type="button" onClick={() => addOrderItem(item)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                      {item.name} (+RS {item.price})
                    </button>
                  ))}
                </div>
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
    </DashboardLayout>
  )
}

function OrderItem({
  order,
  isExpanded,
  onToggle,
  onStatusUpdate,
}: {
  order: Order
  isExpanded: boolean
  onToggle: () => void
  onStatusUpdate: (id: string, status: Order['status']) => void
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
              <button onClick={() => onStatusUpdate(order.id, 'completed')} className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
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
