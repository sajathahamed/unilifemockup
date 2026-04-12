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

interface ConfirmedDetails {
    weight: number
    price: number
    days: number
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
    const [confirmedDetails, setConfirmedDetails] = useState<ConfirmedDetails | null>(null)

    const handleConfirm = () => {
        if (!selectedJob || !weight || !deliveryDate) return

        const actualWeight = parseFloat(weight)
        const totalPrice = actualWeight * selectedJob.pricePerKg
        const daysToDelivery = Math.ceil((new Date(deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        const details: ConfirmedDetails = {
            weight: actualWeight,
            price: totalPrice,
            days: daysToDelivery > 0 ? daysToDelivery : 1
        }

        setJobs(prev =>
            prev.map(job =>
                job.id === selectedJob.id
                    ? { ...job, status: 'confirmed' as const, actualWeight, deliveryDate, notes, totalPrice }
                    : job
            )
        )

        setConfirmedDetails(details)
        setShowSuccess(true)
        setSelectedJob(null)
        setWeight('')
        setDeliveryDate('')
        setNotes('')
    }

    const assigned = jobs.filter(j => j.status === 'assigned')
    const confirmed = jobs.filter(j => j.status === 'confirmed')

    return (
        <div className="space-y-7 pb-16">
            <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="font-display text-[1.9rem] font-semibold tracking-[-0.016em] text-gray-900">Laundry jobs</h1>
                    <p className="mt-1.5 text-[0.95rem] leading-6 text-gray-600">
                        Collect laundry, record weight, and confirm pickup details.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-[0_2px_10px_rgba(30,41,59,0.06)]">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" aria-hidden />
                    Coordinator view
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.01em] text-gray-900">Assigned</h2>
                    </div>

                    {assigned.length > 0 ? (
                        assigned.map(job => (
                            <JobCard key={job.id} job={job} onAction={() => setSelectedJob(job)} />
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-200">
                            <Truck className="mx-auto text-gray-300 mb-3" size={36} />
                            <p className="text-gray-600 text-sm">No assigned laundry jobs.</p>
                        </div>
                    )}

                    {confirmed.length > 0 && (
                        <div className="pt-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-gray-400" />
                                <h2 className="text-sm font-semibold tracking-[-0.008em] text-gray-500">Recently confirmed</h2>
                            </div>
                            {confirmed.map(job => (
                                <div
                                    key={job.id}
                                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-[0_2px_10px_rgba(30,41,59,0.06)] flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{job.customer}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {job.id} · Rs. {job.totalPrice} ({job.actualWeight} kg)
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Processing
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-24">
                        {selectedJob ? (
                            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.08)] hover:-translate-y-0.5 hover:shadow-md transition space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Confirm pickup</h3>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedJob(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Customer</p>
                                    <p className="font-medium text-gray-900">{selectedJob.customer}</p>
                                    <p className="text-sm text-gray-600 mt-1">{selectedJob.pickupAddress}</p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                                        <div className="relative">
                                            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={weight}
                                                onChange={e => setWeight(e.target.value)}
                                                placeholder="0.0"
                                                className="w-full border border-stone-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Return date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="date"
                                                value={deliveryDate}
                                                onChange={e => setDeliveryDate(e.target.value)}
                                                className="w-full border border-stone-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Optional instructions…"
                                            className="w-full border border-stone-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8] h-24 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Estimate</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            Rs. {weight ? (parseFloat(weight) * selectedJob.pricePerKg).toFixed(0) : '0'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={!weight || !deliveryDate}
                                        className="w-full bg-[#5f6db8] text-white rounded-xl py-2.5 font-medium text-sm hover:bg-[#4e5ba0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={18} /> Confirm pickup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-stone-50 rounded-xl p-8 text-center border border-dashed border-stone-200">
                                <AlertCircle className="mx-auto text-gray-300 mb-3" size={28} />
                                <p className="text-sm font-medium text-gray-600">Select a job</p>
                                <p className="text-gray-500 text-xs mt-1">Choose a row on the left to enter weight and date.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSuccess && confirmedDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-[0_8px_30px_rgba(15,23,42,0.16)] border border-stone-200">
                        <div className="text-center space-y-4">
                            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pickup confirmed</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Summary for the student and shop (mock): weight and price are recorded.
                                </p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-left text-sm text-emerald-900">
                                <div className="flex gap-2">
                                    <MessageSquare size={16} className="shrink-0 mt-0.5 text-emerald-700" />
                                    <p>
                                        Laundry order confirmed. Weight: {confirmedDetails.weight} kg. Total: Rs.{' '}
                                        {confirmedDetails.price}. Delivery in {confirmedDetails.days} day
                                        {confirmedDetails.days !== 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSuccess(false)}
                                className="w-full bg-[#5f6db8] text-white rounded-xl py-2.5 font-medium text-sm hover:bg-[#4e5ba0]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function JobCard({ job, onAction }: { job: LaundryJob; onAction: () => void }) {
    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] p-5 hover:-translate-y-0.5 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-[#e8ebfb] text-[#4a5497] rounded-xl flex items-center justify-center shrink-0">
                                <User size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-500">Customer</p>
                                <p className="font-semibold text-gray-900 truncate">{job.customer}</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Assigned
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Pickup</p>
                                <p className="text-gray-700">{job.pickupAddress}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Contact</p>
                                <p className="font-medium text-gray-900">{job.contact}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Truck size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Vendor</p>
                                <p className="text-gray-700">{job.vendorName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CreditCard size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Per kg</p>
                                <p className="font-medium text-gray-900">Rs. {job.pricePerKg}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-col justify-stretch gap-2 md:border-l md:border-gray-100 md:pl-5 pt-2 md:pt-0">
                    <button
                        type="button"
                        onClick={onAction}
                        className="inline-flex min-w-[170px] md:flex-none px-4 py-2.5 bg-[#5f6db8] text-white rounded-lg font-medium text-sm hover:bg-[#4e5ba0] items-center justify-center gap-2"
                    >
                        Update pickup
                    </button>
                    <a
                        href={`tel:${job.contact.replace(/\s/g, '')}`}
                        className="px-4 py-2.5 border border-stone-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-stone-50 flex items-center justify-center"
                    >
                        <Phone size={18} />
                    </a>
                </div>
            </div>
        </div>
    )
}

