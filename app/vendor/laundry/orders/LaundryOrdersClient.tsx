'use client'

import { useState } from 'react'
import {
    Truck,
    MapPin,
    Phone,
    Calendar,
    Weight as WeightIcon,
    CheckCircle2,
    Clock,
    ChevronDown,
    MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

interface LaundryOrder {
    id: string
    customer: string
    phone: string
    address: string
    pickupDate: string
    weight: number
    serviceType: string
    status: 'pending' | 'accepted' | 'processing' | 'ready' | 'completed'
    time: string
    amount: number
}

const mockLaundryOrders: LaundryOrder[] = [
    {
        id: 'LND-5521',
        customer: 'Alex Perera',
        phone: '+94 77 123 4567',
        address: 'Faculty of Engineering, Block B, Room 302',
        pickupDate: '2026-02-28',
        weight: 5,
        serviceType: 'Wash & Fold',
        status: 'pending',
        time: '10 mins ago',
        amount: 1100
    },
    {
        id: 'LND-5520',
        customer: 'Showmika U.',
        phone: '+94 77 987 6543',
        address: 'Student Hostel 4, Wing A, Room 10',
        pickupDate: '2026-02-27',
        weight: 3,
        serviceType: 'Wash & Iron',
        status: 'accepted',
        time: '1 hour ago',
        amount: 840
    },
    {
        id: 'LND-5519',
        customer: 'Janith D.',
        phone: '+94 71 456 7890',
        address: 'Library Plaza, Near Cafeteria',
        pickupDate: '2026-02-27',
        weight: 10,
        serviceType: 'Wash & Fold',
        status: 'processing',
        time: '3 hours ago',
        amount: 2200
    }
]

export default function LaundryOrdersClient({ user }: { user: UserProfile }) {
    const [orders, setOrders] = useState<LaundryOrder[]>(mockLaundryOrders)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [filter, setFilter] = useState('all')

    const updateStatus = (id: string, newStatus: LaundryOrder['status']) => {
        setOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status: newStatus } : order
        ))
    }

    const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter)

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Laundry <span className="text-blue-600">Pickups</span></h1>
                    <p className="text-gray-500 font-medium">Manage student pickup requests and track laundry status.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start">
                    {['all', 'pending', 'accepted', 'processing'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === s
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="New Requests" value={orders.filter(o => o.status === 'pending').length} color="blue" />
                <StatBox label="To Pick Up" value={orders.filter(o => o.status === 'accepted').length} color="amber" />
                <StatBox label="In Wash" value={orders.filter(o => o.status === 'processing').length} color="indigo" />
                <StatBox label="Ready Today" value={orders.filter(o => o.status === 'ready').length} color="emerald" />
            </div>

            {/* Order List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <LaundryOrderCard
                            key={order.id}
                            order={order}
                            isExpanded={expandedOrder === order.id}
                            onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            onStatusUpdate={updateStatus}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
                        <p className="text-gray-500">When students request a pickup, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
    return (
        <div className={`p-6 rounded-[2rem] border ${colors[color]} bg-white shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    )
}

function LaundryOrderCard({ order, isExpanded, onToggle, onStatusUpdate }: {
    order: LaundryOrder,
    isExpanded: boolean,
    onToggle: () => void,
    onStatusUpdate: (id: string, s: LaundryOrder['status']) => void
}) {
    const statusColors = {
        pending: 'bg-blue-50 text-blue-600 border-blue-100',
        accepted: 'bg-amber-50 text-amber-600 border-amber-100',
        processing: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        ready: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        completed: 'bg-gray-50 text-gray-500 border-gray-100'
    }

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:border-blue-100 group">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">
                        {order.status === 'pending' ? '🔔' : '🧺'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-gray-900">{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[order.status]}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-600">{order.customer}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pickup Date</p>
                        <p className="text-sm font-black text-gray-700">{order.pickupDate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Est. Amount</p>
                        <p className="text-lg font-black text-blue-600">Rs. {order.amount}</p>
                    </div>
                    <button
                        onClick={onToggle}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                        <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-50 bg-gray-50/50"
                    >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Order Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Details</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <WeightIcon size={16} className="text-gray-400" />
                                        <p className="text-sm text-gray-700 font-bold">Estimated <span className="text-blue-600">{order.weight} kg</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-gray-400" />
                                        <p className="text-sm text-gray-700 font-bold">{order.serviceType}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-gray-400" />
                                        <p className="text-sm text-gray-400">{order.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Address */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Student Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} className="text-emerald-500" />
                                        <p className="text-sm text-gray-700 font-black">{order.phone}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{order.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 justify-center">
                                {order.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'accepted')}
                                            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Accept Pickup
                                        </button>
                                        <button className="w-full py-3 text-gray-400 font-bold hover:text-red-500 transition-colors">
                                            Reject Request
                                        </button>
                                    </>
                                )}
                                {order.status === 'accepted' && (
                                    <button
                                        onClick={() => onStatusUpdate(order.id, 'processing')}
                                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                                    >
                                        Mark as Processing
                                    </button>
                                )}
                                {order.status === 'processing' && (
                                    <button
                                        onClick={() => onStatusUpdate(order.id, 'ready')}
                                        className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                                    >
                                        Ready for Delivery
                                    </button>
                                )}
                                {order.status === 'ready' && (
                                    <button
                                        onClick={() => onStatusUpdate(order.id, 'completed')}
                                        className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-lg transition-all"
                                    >
                                        Complete Order
                                    </button>
                                )}
                                {order.status !== 'pending' && (
                                    <button className="flex items-center justify-center gap-2 py-3 text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl transition-all">
                                        <MessageSquare size={16} /> Contact Student
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
