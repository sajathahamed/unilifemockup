'use client'

import { useState, useEffect } from 'react'
import {
    Package,
    Truck,
    Search,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    User,
    X,
    ArrowRight,
    Filter,
    Utensils,
    ShoppingBag,
    WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UserProfile } from '@/lib/auth'
import InlineSpinner from '@/components/ui/InlineSpinner'

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

const deliveryStatusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string; accent: string }> = {
    unassigned: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: 'Unassigned',
        accent: 'border-l-rose-300',
    },
    assigned: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Assigned',
        accent: 'border-l-blue-300',
    },
    picked_up: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Picked up',
        accent: 'border-l-amber-300',
    },
    delivered: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Delivered',
        accent: 'border-l-emerald-300',
    },
}

type TabFilter = 'all' | 'unassigned' | 'assigned' | 'picked_up' | 'delivered'
type TypeFilter = 'all' | 'food' | 'laundry'

export default function DeliveryOrdersClient({ user }: { user: UserProfile }) {
    const [orders, setOrders] = useState<DeliveryOrder[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, unassigned: 0, assigned: 0, picked_up: 0, delivered: 0 })
    const [riders, setRiders] = useState<Rider[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tabFilter, setTabFilter] = useState<TabFilter>('all')
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
    const [isAdminOnline, setIsAdminOnline] = useState<boolean | null>(null)

    const [assigningOrder, setAssigningOrder] = useState<DeliveryOrder | null>(null)
    const [selectedRider, setSelectedRider] = useState<number>(0)
    const [assigning, setAssigning] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
        // Load admin online/offline status
        fetch('/api/delivery/status')
            .then(r => r.json())
            .then(d => setIsAdminOnline(typeof d.is_online === 'boolean' ? d.is_online : true))
            .catch(() => setIsAdminOnline(true))
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
                setMessage({ type: 'success', text: data.message || 'Order assigned.' })
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
                setMessage({ type: 'success', text: data.message || 'Status updated.' })
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
        { key: 'picked_up', label: 'Picked up', count: stats.picked_up },
        { key: 'delivered', label: 'Delivered', count: stats.delivered },
    ]

    const typeLabels: Record<TypeFilter, string> = { all: 'All', food: 'Food', laundry: 'Laundry' }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <InlineSpinner size={40} className="text-primary" />
                <p className="text-sm text-gray-600">Loading orders…</p>
            </div>
        )
    }

    return (
        <div className="space-y-7 pb-10">
            <div className="border-b border-stone-200 pb-6">
                <h1 className="font-display text-[1.9rem] font-semibold tracking-[-0.016em] text-gray-900">Manage orders</h1>
                <p className="mt-1.5 text-[0.95rem] leading-6 text-gray-600 max-w-2xl">
                    Food and laundry orders: assign riders and update delivery status.
                </p>
            </div>

            <div className="flex flex-wrap gap-5">
                <StatCard icon={Package} label="Total" value={stats.total} color="bg-stone-100 text-stone-700" minWidth="min-w-[170px]" radius="rounded-xl" />
                <StatCard icon={Clock} label="Unassigned" value={stats.unassigned} color="bg-rose-50 text-rose-700" minWidth="min-w-[170px]" radius="rounded-2xl" />
                <StatCard icon={User} label="Assigned" value={stats.assigned} color="bg-blue-50 text-blue-700" minWidth="min-w-[170px]" radius="rounded-lg" />
                <StatCard icon={Truck} label="Picked up" value={stats.picked_up} color="bg-amber-50 text-amber-700" minWidth="min-w-[170px]" radius="rounded-xl" />
                <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} color="bg-emerald-50 text-emerald-700" minWidth="min-w-[180px]" radius="rounded-2xl" />
            </div>

            {message && (
                <div
                    className={`px-5 py-3 rounded-2xl text-sm font-medium flex items-center justify-between border shadow-[0_1px_8px_rgba(25,40,75,0.06)] ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                >
                    <span>{message.text}</span>
                    <button type="button" onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg">
                        <X size={14} />
                    </button>
                </div>
            )}

            {isAdminOnline === false && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-800">
                    <WifiOff size={18} className="shrink-0 text-red-600" />
                    <div>
                        <p className="font-semibold text-sm">You are currently offline</p>
                        <p className="text-xs text-red-700 mt-0.5">
                            No new delivery assignments can be made while you're offline. Go online from your dashboard to resume.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search customer, order ref, address, rider…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={16} className="text-gray-400 shrink-0" />
                    {(['all', 'food', 'laundry'] as TypeFilter[]).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTypeFilter(t)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                                typeFilter === t
                                    ? 'bg-[#5f6db8] text-white border-[#5f6db8]'
                                    : 'bg-card text-gray-600 border-stone-200 hover:border-stone-300'
                            }`}
                        >
                            {typeLabels[t]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setTabFilter(tab.key)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                            tabFilter === tab.key
                                ? 'bg-[#5f6db8] text-white border-[#5f6db8]'
                                : 'bg-card text-gray-600 border-stone-200 hover:border-stone-300'
                        }`}
                    >
                        {tab.label}
                        <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${
                                tabFilter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <OrderCard
                            key={`${order.order_type}-${order.id}`}
                            order={order}
                            onAssign={() => {
                                setAssigningOrder(order)
                                setSelectedRider(0)
                            }}
                            onStatusUpdate={handleStatusUpdate}
                            isUpdating={updatingId === order.id}
                            isAdminOnline={isAdminOnline !== false}
                        />
                    ))
                ) : (
                    <div className="bg-card rounded-2xl p-12 text-center border border-dashed border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.05)]">
                        <Package className="mx-auto text-gray-300 mb-4" size={40} />
                        <p className="text-gray-700 font-medium">No orders match</p>
                        <p className="text-gray-500 text-sm mt-1">Change filters or search.</p>
                    </div>
                )}
            </div>

            {assigningOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="assign-modal-title"
                >
                    <div
                        className="bg-card rounded-2xl p-6 max-w-lg w-full shadow-[0_8px_30px_rgba(15,23,42,0.16)] border border-stone-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 id="assign-modal-title" className="text-lg font-semibold text-gray-900">
                                Assign rider
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAssigningOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div
                            className={`p-4 rounded-lg border mb-4 ${
                                assigningOrder.order_type === 'food'
                                    ? 'bg-emerald-50 border-emerald-100'
                                    : 'bg-blue-50 border-blue-100'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {assigningOrder.order_type === 'food' ? (
                                    <Utensils size={18} className="text-emerald-700" />
                                ) : (
                                    <ShoppingBag size={18} className="text-blue-700" />
                                )}
                                <span className="font-semibold text-gray-900">{assigningOrder.order_ref}</span>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                                        assigningOrder.order_type === 'food'
                                            ? 'bg-emerald-200 text-emerald-900'
                                            : 'bg-blue-200 text-blue-900'
                                    }`}
                                >
                                    {assigningOrder.order_type}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">{assigningOrder.customer_name}</span>
                                {' · '}Rs {assigningOrder.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin size={12} /> {assigningOrder.delivery_address || 'No address'}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rider</label>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {riders.filter(r => r.is_available).length > 0 ? (
                                    riders
                                        .filter(r => r.is_available)
                                        .map(rider => (
                                        <button
                                            key={rider.id}
                                            type="button"
                                            onClick={() => setSelectedRider(rider.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                                                selectedRider === rider.id
                                                    ? 'border-[#5f6db8] bg-[#eef0fb] ring-2 ring-[#d5daf5]'
                                                    : 'border-stone-200 hover:border-stone-300 bg-card'
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-emerald-100 text-emerald-800">
                                                {rider.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{rider.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{rider.email}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-md font-medium shrink-0 bg-emerald-100 text-emerald-800">
                                                {rider.active_deliveries} active
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                                        <WifiOff size={28} className="text-gray-300" />
                                        <p className="text-sm font-medium text-gray-600">No active riders available</p>
                                        <p className="text-xs text-gray-400">All riders are currently inactive or offline.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setAssigningOrder(null)}
                                className="flex-1 py-2.5 border border-stone-200 rounded-lg text-gray-700 font-medium hover:bg-stone-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAssign}
                                disabled={!selectedRider || assigning}
                                className="flex-1 py-2.5 bg-[#5f6db8] text-white rounded-xl font-medium hover:bg-[#4e5ba0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {assigning ? <InlineSpinner size={18} /> : <ArrowRight size={18} />}
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    minWidth,
    radius,
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    color: string;
    minWidth: string;
    radius: string;
}) {
    return (
        <div className={`flex-1 ${minWidth} ${radius} bg-card p-5 border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition`}>
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} />
            </div>
            <p className="text-2xl leading-none font-semibold tracking-[-0.02em] text-gray-900">{value}</p>
            <p className="mt-1.5 text-sm text-gray-500">{label}</p>
        </div>
    )
}

function OrderCard({
    order,
    onAssign,
    onStatusUpdate,
    isUpdating,
    isAdminOnline,
}: {
    order: DeliveryOrder
    onAssign: () => void
    onStatusUpdate: (order: DeliveryOrder, status: string) => void
    isUpdating: boolean
    isAdminOnline: boolean
}) {
    const statusKey = order.is_assigned ? (order.delivery_status ?? 'assigned') : 'unassigned'
    const statusCfg = deliveryStatusConfig[statusKey] ?? deliveryStatusConfig.unassigned
    const isFood = order.order_type === 'food'
    const timeAgo = getTimeAgo(order.created_at)
    const TypeIcon = isFood ? Utensils : ShoppingBag

    return (
        <div className={`bg-card rounded-2xl border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition border-l-4 ${statusCfg.accent}`}>
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isFood ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            <TypeIcon size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{order.order_ref}</span>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                        isFood ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                >
                                    {isFood ? 'Food' : 'Laundry'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                        <User size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Customer</p>
                            <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                            {order.customer_phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Phone size={10} /> {order.customer_phone}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Delivery to</p>
                            <p className="text-sm text-gray-700">{order.delivery_address || 'No address'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <ShoppingBag size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Items</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{order.items_summary}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">Rs {order.total.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {order.is_assigned && order.rider_name && (
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4">
                        <div className="w-8 h-8 bg-[#e8ebfb] text-[#4a5497] rounded-full flex items-center justify-center text-xs font-semibold">
                            {order.rider_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">Rider: {order.rider_name}</p>
                            <p className="text-xs text-gray-500 truncate">{order.rider_email}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {!order.is_assigned && (
                        isAdminOnline ? (
                            <button
                                type="button"
                                onClick={onAssign}
                                className="inline-flex min-w-[170px] px-4 py-2.5 bg-[#5f6db8] text-white rounded-lg font-medium text-sm hover:bg-[#4e5ba0] flex items-center gap-2"
                            >
                                <Truck size={16} /> Assign rider
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed min-w-[170px]">
                                <WifiOff size={16} /> No delivery available
                            </span>
                        )
                    )}
                    {order.delivery_status === 'assigned' && (
                        <button
                            type="button"
                            onClick={() => onStatusUpdate(order, 'picked_up')}
                            disabled={isUpdating}
                            className="inline-flex min-w-[170px] px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating ? <InlineSpinner size={16} /> : <Package size={16} />}
                            Mark picked up
                        </button>
                    )}
                    {order.delivery_status === 'picked_up' && (
                        <button
                            type="button"
                            onClick={() => onStatusUpdate(order, 'delivered')}
                            disabled={isUpdating}
                            className="inline-flex min-w-[170px] px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating ? <InlineSpinner size={16} /> : <CheckCircle2 size={16} />}
                            Mark delivered
                        </button>
                    )}
                    {order.delivery_status === 'delivered' && (
                        <span className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-2 border border-emerald-200">
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
