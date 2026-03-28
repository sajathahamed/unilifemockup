'use client'

import { useState, useEffect } from 'react'
import {
    Package,
    Truck,
    Search,
    ChevronDown,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    User,
    Loader2,
    X,
    ArrowRight,
    Filter,
    Utensils,
    ShoppingBag,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

// ─── Types ───────────────────────────────────────────────────────────────────
interface DeliveryOrder {
    id: string
    order_ref: string
    order_type: 'food' | 'laundry'
    customer_name: string
    customer_phone: string
    customer_email: string
    items_summary: string
    total: number
    order_status: string
    delivery_address: string
    notes: string
    created_at: string
    is_assigned: boolean
    delivery_id: string | null
    delivery_status: string | null
    rider_id: string | null
    rider_name: string | null
    rider_email: string | null
}

interface Rider {
    id: number
    name: string
    email: string
    photo_url: string | null
    active_deliveries: number
    is_available: boolean
}

interface Stats {
    total: number
    unassigned: number
    assigned: number
    picked_up: number
    delivered: number
}

// ─── Status Config ───────────────────────────────────────────────────────────
const deliveryStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
    unassigned:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Unassigned' },
    assigned:    { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Assigned' },
    picked_up:   { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Picked Up' },
    delivered:   { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Delivered' },
}

type TabFilter = 'all' | 'unassigned' | 'assigned' | 'picked_up' | 'delivered'
type TypeFilter = 'all' | 'food' | 'laundry'

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DeliveryOrdersClient({ user }: { user: UserProfile }) {
    const [orders, setOrders] = useState<DeliveryOrder[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, unassigned: 0, assigned: 0, picked_up: 0, delivered: 0 })
    const [riders, setRiders] = useState<Rider[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tabFilter, setTabFilter] = useState<TabFilter>('all')
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

    // Assign modal
    const [assigningOrder, setAssigningOrder] = useState<DeliveryOrder | null>(null)
    const [selectedRider, setSelectedRider] = useState<number>(0)
    const [assigning, setAssigning] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Status update
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams()
            if (tabFilter !== 'all') params.set('status', tabFilter)
            if (typeFilter !== 'all') params.set('type', typeFilter)
            const res = await fetch(`/api/delivery/orders?${params}`)
            const data = await res.json()
            if (res.ok) {
                setOrders(data.orders ?? [])
                setStats(data.stats ?? { total: 0, unassigned: 0, assigned: 0, picked_up: 0, delivered: 0 })
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err)
        }
    }

    const fetchRiders = async () => {
        try {
            const res = await fetch('/api/delivery/riders')
            const data = await res.json()
            if (res.ok) setRiders(data.riders ?? [])
        } catch (err) {
            console.error('Failed to fetch riders:', err)
        }
    }

    useEffect(() => {
        Promise.all([fetchOrders(), fetchRiders()]).finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabFilter, typeFilter])

    const handleAssign = async () => {
        if (!assigningOrder || !selectedRider) return
        setAssigning(true)
        setMessage(null)
        try {
            const res = await fetch('/api/delivery/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: assigningOrder.id,
                    order_type: assigningOrder.order_type,
                    rider_id: selectedRider,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Order assigned successfully!' })
                setAssigningOrder(null)
                setSelectedRider(0)
                await Promise.all([fetchOrders(), fetchRiders()])
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to assign order.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error while assigning order.' })
        } finally {
            setAssigning(false)
        }
    }

    const handleStatusUpdate = async (order: DeliveryOrder, newStatus: string) => {
        if (!order.delivery_id) return
        setUpdatingId(order.id)
        setMessage(null)
        try {
            const res = await fetch('/api/delivery/assign', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    delivery_id: order.delivery_id,
                    status: newStatus,
                    order_id: order.id,
                    order_type: order.order_type,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Status updated!' })
                await Promise.all([fetchOrders(), fetchRiders()])
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update status.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error.' })
        } finally {
            setUpdatingId(null)
        }
    }

    // Client-side search
    const filteredOrders = orders.filter(o => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            o.customer_name.toLowerCase().includes(q) ||
            o.order_ref.toLowerCase().includes(q) ||
            o.delivery_address.toLowerCase().includes(q) ||
            o.items_summary.toLowerCase().includes(q) ||
            (o.rider_name?.toLowerCase().includes(q) ?? false)
        )
    })

    const tabs: { key: TabFilter; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'unassigned', label: 'Unassigned', count: stats.unassigned },
        { key: 'assigned', label: 'Assigned', count: stats.assigned },
        { key: 'picked_up', label: 'Picked Up', count: stats.picked_up },
        { key: 'delivered', label: 'Delivered', count: stats.delivered },
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading delivery orders...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📦</div>
                        <h1 className="text-3xl font-bold">Manage Orders</h1>
                    </div>
                    <p className="text-yellow-100 max-w-lg">
                        View all incoming food & laundry orders. Assign riders and track delivery progress.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={Package} label="Total" value={stats.total} color="bg-gray-100 text-gray-600" />
                <StatCard icon={Clock} label="Unassigned" value={stats.unassigned} color="bg-red-100 text-red-600" />
                <StatCard icon={User} label="Assigned" value={stats.assigned} color="bg-blue-100 text-blue-600" />
                <StatCard icon={Truck} label="Picked Up" value={stats.picked_up} color="bg-amber-100 text-amber-600" />
                <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} color="bg-emerald-100 text-emerald-600" />
            </div>

            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${
                            message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer, order ref, address, rider..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 text-sm transition-all"
                    />
                </div>
                {/* Type filter */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    {(['all', 'food', 'laundry'] as TypeFilter[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                typeFilter === t
                                    ? 'bg-yellow-500 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-400'
                            }`}
                        >
                            {t === 'all' ? '🍽️ All' : t === 'food' ? '🍕 Food' : '🧺 Laundry'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setTabFilter(tab.key)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            tabFilter === tab.key
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        {tab.label}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                            tabFilter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.map(order => (
                            <motion.div
                                key={`${order.order_type}-${order.id}`}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                <OrderCard
                                    order={order}
                                    onAssign={() => {
                                        setAssigningOrder(order)
                                        setSelectedRider(0)
                                    }}
                                    onStatusUpdate={handleStatusUpdate}
                                    isUpdating={updatingId === order.id}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                        <Package className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-500 font-semibold">No orders found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search</p>
                    </div>
                )}
            </div>

            {/* ── Assign Modal ── */}
            <AnimatePresence>
                {assigningOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Assign Rider</h3>
                                <button onClick={() => setAssigningOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Order Preview */}
                            <div className={`p-4 rounded-2xl border mb-6 ${
                                assigningOrder.order_type === 'food'
                                    ? 'bg-orange-50 border-orange-100'
                                    : 'bg-blue-50 border-blue-100'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">
                                        {assigningOrder.order_type === 'food' ? '🍕' : '🧺'}
                                    </span>
                                    <span className="font-bold text-gray-900">{assigningOrder.order_ref}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        assigningOrder.order_type === 'food'
                                            ? 'bg-orange-200 text-orange-800'
                                            : 'bg-blue-200 text-blue-800'
                                    }`}>
                                        {assigningOrder.order_type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <strong>{assigningOrder.customer_name}</strong> · RS {assigningOrder.total.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPin size={10} /> {assigningOrder.delivery_address || 'No address'}
                                </p>
                            </div>

                            {/* Rider Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Delivery Rider</label>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {riders.length > 0 ? (
                                        riders.map(rider => (
                                            <button
                                                key={rider.id}
                                                onClick={() => setSelectedRider(rider.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                                                    selectedRider === rider.id
                                                        ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-400/30'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    rider.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {rider.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm">{rider.name}</p>
                                                    <p className="text-xs text-gray-500">{rider.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                        rider.is_available
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {rider.active_deliveries} active
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No riders available</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAssigningOrder(null)}
                                    className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedRider || assigning}
                                    className="flex-1 py-3.5 bg-yellow-500 text-white rounded-2xl font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {assigning ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                    Assign Rider
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    )
}

function OrderCard({
    order,
    onAssign,
    onStatusUpdate,
    isUpdating,
}: {
    order: DeliveryOrder
    onAssign: () => void
    onStatusUpdate: (order: DeliveryOrder, status: string) => void
    isUpdating: boolean
}) {
    const statusKey = order.is_assigned ? (order.delivery_status ?? 'assigned') : 'unassigned'
    const statusCfg = deliveryStatusConfig[statusKey] ?? deliveryStatusConfig.unassigned
    const isFood = order.order_type === 'food'
    const timeAgo = getTimeAgo(order.created_at)

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            {/* Top bar */}
            <div className={`h-1.5 ${isFood ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-blue-400 to-indigo-400'}`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{isFood ? '🍕' : '🧺'}</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{order.order_ref}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    isFood ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {isFood ? 'Food' : 'Laundry'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
                        </div>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                        {statusCfg.label}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                        <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Customer</p>
                            <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                            {order.customer_phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Phone size={10} /> {order.customer_phone}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Delivery To</p>
                            <p className="text-sm text-gray-700">{order.delivery_address || 'No address provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <ShoppingBag size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Items</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{order.items_summary}</p>
                            <p className="text-sm font-bold text-gray-900 mt-0.5">RS {order.total.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Rider info if assigned */}
                {order.is_assigned && order.rider_name && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
                        <div className="w-8 h-8 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                            {order.rider_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">
                                Rider: {order.rider_name}
                            </p>
                            <p className="text-xs text-blue-600">{order.rider_email}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {!order.is_assigned && (
                        <button
                            onClick={onAssign}
                            className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-yellow-600 transition-all flex items-center gap-2"
                        >
                            <Truck size={16} /> Assign Rider
                        </button>
                    )}
                    {order.delivery_status === 'assigned' && (
                        <button
                            onClick={() => onStatusUpdate(order, 'picked_up')}
                            disabled={isUpdating}
                            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                            Mark Picked Up
                        </button>
                    )}
                    {order.delivery_status === 'picked_up' && (
                        <button
                            onClick={() => onStatusUpdate(order, 'delivered')}
                            disabled={isUpdating}
                            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Mark Delivered
                        </button>
                    )}
                    {order.delivery_status === 'delivered' && (
                        <span className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 size={16} /> Completed
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

function getTimeAgo(dateStr: string): string {
    const d = new Date(dateStr).getTime()
    const diff = Math.floor((Date.now() - d) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff} min${diff !== 1 ? 's' : ''} ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hr${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`
    return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) !== 1 ? 's' : ''} ago`
}
