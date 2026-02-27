'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { ArrowLeft, Plus, Minus, ShoppingBag, Bike, Store, Trash2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

interface CartItem { id: string; name: string; price: number; emoji: string; qty: number }

const DEFAULT_CART: CartItem[] = []
const DELIVERY_FEE = 150.0 // Rs

const DELIVERY_OPTIONS = [
    { id: 'delivery', label: 'Delivery', icon: Bike, eta: '15–25 min' },
    { id: 'pickup', label: 'Pick Up', icon: Store, eta: '10 min' },
]

function CartItemRow({ item, onInc, onDec, onRemove }: { item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, height: 0 }}
            className="flex items-center gap-3 py-4 border-b border-gray-50 last:border-0"
        >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{item.emoji}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-sm font-bold text-orange-500 mt-0.5">Rs {(item.price * item.qty).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onDec} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                <button onClick={onInc} className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <Plus size={14} />
                </button>
                <button onClick={onRemove} className="w-8 h-8 ml-1 rounded-full text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    )
}

function SuccessModal({ shopName, onClose }: { shopName: string; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Order Placed! 🎉</h2>
                <p className="text-gray-500 text-sm mt-2">
                    Your order from <span className="font-semibold text-gray-700">{shopName}</span> has been received. You'll get a confirmation shortly.
                </p>
                <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    📍 Estimated arrival: <strong>15–20 min</strong>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                    Done
                </button>
            </motion.div>
        </motion.div>
    )
}

export default function OrderClient({ user, shopId }: { user: UserProfile; shopId: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const shopName = searchParams.get('name') ?? 'Food Shop'
    const shopPhoto = searchParams.get('photo') ?? ''

    const [cart, setCart] = useState<CartItem[]>(DEFAULT_CART)
    const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery')
    const [notes, setNotes] = useState('')
    const [placing, setPlacing] = useState(false)
    const [success, setSuccess] = useState(false)

    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0)
    const fee = deliveryMode === 'delivery' ? DELIVERY_FEE : 0
    const total = subtotal + fee

    const inc = (id: string) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
    const dec = (id: string) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0))
    const remove = (id: string) => setCart((c) => c.filter((i) => i.id !== id))

    const placeOrder = async () => {
        if (cart.length === 0) return
        setPlacing(true)
        await new Promise((r) => setTimeout(r, 1500))
        setPlacing(false)
        setSuccess(true)
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-lg mx-auto pb-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
                    <ArrowLeft size={16} /> Back to Shop
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    {shopPhoto && (
                        <img src={shopPhoto} alt={shopName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Your Order</h1>
                        <p className="text-sm text-gray-500">{shopName}</p>
                    </div>
                </div>

                {/* Delivery toggle */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">How do you want it?</p>
                    <div className="grid grid-cols-2 gap-3">
                        {DELIVERY_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setDeliveryMode(opt.id as 'delivery' | 'pickup')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${deliveryMode === opt.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'
                                    }`}
                            >
                                <opt.icon size={24} className={deliveryMode === opt.id ? 'text-orange-500' : 'text-gray-400'} />
                                <div className="text-center">
                                    <p className={`text-sm font-semibold ${deliveryMode === opt.id ? 'text-orange-600' : 'text-gray-700'}`}>{opt.label}</p>
                                    <p className="text-xs text-gray-400">{opt.eta}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <h2 className="font-semibold text-gray-900">Cart</h2>
                        <span className="text-xs text-gray-400">{cart.length} item(s)</span>
                    </div>
                    <div className="px-4">
                        {cart.length === 0 ? (
                            <div className="py-12 text-center">
                                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Your cart is empty</p>
                                <button onClick={() => router.back()} className="mt-3 text-sm text-orange-500 hover:underline">
                                    Add items from menu
                                </button>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {cart.map((item) => (
                                    <CartItemRow key={item.id} item={item} onInc={() => inc(item.id)} onDec={() => dec(item.id)} onRemove={() => remove(item.id)} />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Special Instructions (optional)</label>
                    <textarea
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Less spicy, no onions…" rows={3}
                        className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    />
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Delivery fee</span><span>{fee === 0 ? 'Free' : `Rs ${fee.toFixed(2)}`}</span></div>
                        <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
                            <span>Total</span>
                            <span className="text-orange-500">Rs {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Place Order */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={placeOrder}
                    disabled={placing || cart.length === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-white text-base shadow-md transition-all ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
                        }`}
                >
                    {placing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Placing Order…
                        </span>
                    ) : (
                        `Place Order · Rs ${total.toFixed(2)}`
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {success && <SuccessModal shopName={shopName} onClose={() => router.push('/student/food-order')} />}
            </AnimatePresence>
        </DashboardLayout>
    )
}
