'use client'

import { useState } from 'react'
import {
    Truck,
    MapPin,
    Phone,
    User,
    Calendar,
    Weight,
    CheckCircle2,
    Clock,
    History,
    AlertCircle,
    X,
    CreditCard,
    MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

interface LaundryJob {
    id: string
    customer: string
    contact: string
    pickupAddress: string
    vendorName: string
    pickupDate: string
    pricePerKg: number
    status: 'pending' | 'assigned' | 'confirmed'
    actualWeight?: number
    deliveryDate?: string
    notes?: string
    totalPrice?: number
}

const mockJobs: LaundryJob[] = [
    {
        id: 'LND-JB-001',
        customer: 'Showmika U.',
        contact: '+94 77 987 6543',
        pickupAddress: 'Hostel 4, Wing A, Room 10',
        vendorName: 'Royal Laundry Services',
        pickupDate: '2026-02-27',
        pricePerKg: 240,
        status: 'assigned'
    },
    {
        id: 'LND-JB-002',
        customer: 'Alex Perera',
        contact: '+94 77 123 4567',
        pickupAddress: 'Faculty of Engineering, Block B',
        vendorName: 'Bubble Wash Jaffna',
        pickupDate: '2026-02-28',
        pricePerKg: 220,
        status: 'assigned'
    }
]

export default function DeliveryLaundryClient({ user }: { user: UserProfile }) {
    const [jobs, setJobs] = useState<LaundryJob[]>(mockJobs)
    const [selectedJob, setSelectedJob] = useState<LaundryJob | null>(null)
    const [weight, setWeight] = useState('')
    const [deliveryDate, setDeliveryDate] = useState('')
    const [notes, setNotes] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [confirmedDetails, setConfirmedDetails] = useState<any>(null)

    const handleConfirm = () => {
        if (!selectedJob || !weight || !deliveryDate) return

        const actualWeight = parseFloat(weight)
        const totalPrice = actualWeight * selectedJob.pricePerKg
        const daysToDelivery = Math.ceil((new Date(deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        const details = {
            weight: actualWeight,
            price: totalPrice,
            days: daysToDelivery > 0 ? daysToDelivery : 1
        }

        setOrders(prev => prev.map(job =>
            job.id === selectedJob.id
                ? { ...job, status: 'confirmed', actualWeight, deliveryDate, notes, totalPrice }
                : job
        ))

        setConfirmedDetails(details)
        setShowSuccess(true)
        setSelectedJob(null)
        setWeight('')
        setDeliveryDate('')
        setNotes('')
    }

    // Need to fix setOrders to setJobs
    const setOrders = setJobs

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Laundry <span className="text-blue-600">Jobs</span></h1>
                    <p className="text-gray-500 font-medium italic">Collect laundry from students and confirm weight to start processing.</p>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Active Duty</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Assigned Jobs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-blue-500" />
                        <h2 className="text-lg font-black text-gray-900">Your Assigned Tasks</h2>
                    </div>

                    {jobs.filter(j => j.status === 'assigned').length > 0 ? (
                        jobs.filter(j => j.status === 'assigned').map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onAction={() => setSelectedJob(job)}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                            <Truck className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-bold">No assigned laundry jobs at the moment.</p>
                        </div>
                    )}

                    {/* Recently Confirmed */}
                    {jobs.some(j => j.status === 'confirmed') && (
                        <div className="pt-8 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <History size={18} className="text-gray-400" />
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Recently Confirmed</h2>
                            </div>
                            {jobs.filter(j => j.status === 'confirmed').map((job) => (
                                <div key={job.id} className="bg-white/60 p-6 rounded-3xl border border-gray-100 flex items-center justify-between opacity-80">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 size={24} className="text-emerald-500" />
                                        <div>
                                            <p className="font-black text-gray-900 leading-none mb-1">{job.customer}</p>
                                            <p className="text-xs text-gray-400">{job.id} • Rs. {job.totalPrice} ({job.actualWeight}kg)</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                                        Processing
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Interaction Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        {selectedJob ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-2xl shadow-blue-500/5 space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-gray-900">Confirm Pickup</h3>
                                    <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Assignee</p>
                                    <p className="font-bold text-blue-900">{selectedJob.customer}</p>
                                    <p className="text-xs text-blue-600/70">{selectedJob.pickupAddress}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Actual Weight (kg)</label>
                                        <div className="relative">
                                            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                placeholder="0.0"
                                                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Target Delivery Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                type="date"
                                                value={deliveryDate}
                                                onChange={(e) => setDeliveryDate(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Notes to Shop/Student</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any special instructions..."
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 h-24 resize-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <p className="text-sm font-bold text-gray-400">Total Price Estimate</p>
                                        <p className="text-xl font-black text-gray-900">
                                            Rs. {weight ? (parseFloat(weight) * selectedJob.pricePerKg).toFixed(0) : '0'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!weight || !deliveryDate}
                                        className="w-full bg-blue-600 text-white rounded-[1.5rem] py-5 font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <CheckCircle2 size={20} /> Confirm Pickup
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-gray-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
                                <AlertCircle className="mx-auto text-gray-200 mb-4" size={32} />
                                <p className="text-gray-400 font-black text-sm uppercase tracking-widest">Select an order</p>
                                <p className="text-gray-400 text-xs mt-2">Pick an order from your list to confirm collection details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && confirmedDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            {/* Confetti-like bg elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full" />

                            <div className="relative text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 size={40} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-gray-900">Order Confirmed!</h3>
                                    <p className="text-gray-500 font-medium">Pickup information has been sent to the student and laundry shop.</p>
                                </div>

                                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-left space-y-4">
                                    <p className="text-xs font-black text-emerald-800 uppercase tracking-widest text-center border-b border-emerald-100 pb-2">Student Notification Sent</p>

                                    <div className="flex items-start gap-3">
                                        <MessageSquare size={16} className="text-emerald-500 mt-1" />
                                        <p className="text-sm font-bold text-emerald-900 italic">
                                            "✅ Your laundry order is confirmed. <br />
                                            Weight: {confirmedDetails.weight} kg <br />
                                            Total Price: Rs. {confirmedDetails.price} <br />
                                            Delivery in {confirmedDetails.days} days."
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full bg-gray-900 text-white rounded-2xl py-4 font-black hover:bg-black transition-all"
                                >
                                    Awesome
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function JobCard({ job, onAction }: { job: LaundryJob, onAction: () => void }) {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Info */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer</p>
                                <p className="text-lg font-black text-gray-900 leading-none">{job.customer}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100 tracking-widest">
                            Assigned
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pickup Address</p>
                                    <p className="text-sm text-gray-700 font-bold leading-relaxed">{job.pickupAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-emerald-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact Number</p>
                                    <p className="text-sm text-gray-900 font-black">{job.contact}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Truck size={18} className="text-indigo-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Vendor Shop</p>
                                    <p className="text-sm text-gray-700 font-bold leading-relaxed">{job.vendorName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className="text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rate per KG</p>
                                    <p className="text-sm text-gray-900 font-black">Rs. {job.pricePerKg}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right CTA */}
                <div className="flex flex-row md:flex-col justify-end gap-3 pt-6 md:pt-0 md:border-l md:border-gray-50 md:pl-8">
                    <button
                        onClick={onAction}
                        className="flex-1 md:flex-none px-8 py-4 bg-gray-900 group-hover:bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-gray-500/10 group-hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        Update Pickup
                    </button>
                    <button className="px-4 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center">
                        <Phone size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
