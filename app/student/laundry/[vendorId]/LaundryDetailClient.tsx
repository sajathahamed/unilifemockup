'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import {
    ArrowLeft,
    Phone,
    MapPin,
    Calendar,
    Weight,
    CheckCircle2,
    Info,
    Plus,
    Minus,
    Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

interface LaundryDetailClientProps {
    user: UserProfile
    vendorId: string
}

export default function LaundryDetailClient({ user, vendorId }: LaundryDetailClientProps) {
    const router = useRouter()
    const [vendor, setVendor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [weight, setWeight] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const [formData, setFormData] = useState({
        customerName: user.name,
        contact: '',
        pickupAddress: '',
        pickupDate: '',
        serviceType: 'wash_fold'
    })

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                // Fetch specifically by ID to avoid regional search issues
                const res = await fetch(`/api/laundry?id=${vendorId}`)
                const data = await res.json()
                const found = data.result
                if (found) {
                    setVendor({
                        ...found,
                        services: [
                            { id: 'wash_fold', type: 'Wash & Fold', price: found.pricePerKg || 250 },
                            { id: 'wash_iron', type: 'Wash & Iron', price: (found.pricePerKg || 250) + 50 }
                        ]
                    })
                }
            } catch (err) {
                console.error('Failed to fetch vendor details:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchVendor()
    }, [vendorId])

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSubmitting(false)
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            router.push('/student/laundry')
        }, 3000)
    }

    if (loading) return (
        <DashboardLayout user={user}>
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-gray-400">
                <Loader2 className="animate-spin" size={40} />
                <p>Loading vendor details...</p>
            </div>
        </DashboardLayout>
    )

    if (!vendor) return (
        <DashboardLayout user={user}>
            <div className="text-center py-40">
                <h2 className="text-xl font-bold">Vendor not found</h2>
                <button onClick={() => router.back()} className="text-blue-600 mt-4">Go back</button>
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout user={user}>
            <div className="max-w-4xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Vendors</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Vendor Info & Prices */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
                            <div className="h-48 w-full relative group">
                                <img
                                    src={vendor.image}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.unsplash.com/photo-1545173168-9f1947eeba01?w=800&q=80';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="p-8 relative z-10">
                                <h1 className="text-2xl font-black text-gray-900 mb-4">{vendor.name}</h1>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <Phone size={16} />
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Contact</p>
                                            <p className="text-gray-700 font-semibold">{vendor.contact}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Address</p>
                                            <p className="text-gray-700 font-semibold">{vendor.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Price Table</h2>
                            <div className="space-y-3">
                                {vendor.services.map((s: any) => (
                                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all group">
                                        <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{s.type}</span>
                                        <span className="font-black text-gray-900">Rs. {s.price}<span className="text-xs text-gray-400 font-normal"> / kg</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleOrder} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Request Pickup</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Name</label>
                                    <input
                                        type="text"
                                        value={formData.customerName}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Number</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+94 7X XXX XXXX"
                                        value={formData.contact}
                                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <textarea
                                        required
                                        rows={2}
                                        placeholder="Specific room/hall or apartment details..."
                                        value={formData.pickupAddress}
                                        onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            required
                                            value={formData.pickupDate}
                                            onChange={e => setFormData({ ...formData, pickupDate: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Weight (kg)</label>
                                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setWeight(Math.max(1, weight - 1))}
                                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-600 shadow-sm border border-gray-100 transition-all active:scale-95"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <div className="flex-1 text-center font-black text-gray-700">
                                            {weight} kg
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setWeight(weight + 1)}
                                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-600 shadow-sm border border-gray-100 transition-all active:scale-95"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {vendor.services.map((s: any) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, serviceType: s.id })}
                                            className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.serviceType === s.id
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
                                                }`}
                                        >
                                            {s.type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>Order Now</>
                                )}
                            </motion.button>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Info size={16} className="text-blue-500 flex-shrink-0" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                                    Payment will be collected by the vendor upon pickup or delivery. Please ensure clothes are separated if needed.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Success Popup */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Your laundry order has been sent successfully to <span className="text-blue-600 font-bold">{vendor.name}</span>.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
