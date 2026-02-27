'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { ArrowLeft, Star, MapPin, Clock, ShoppingCart, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { UserProfile } from '@/lib/auth'

// interfaces are now imported from @/lib/food-utils

import { getMenuForShop, getPriceLabel, MenuCategory, MenuItem } from '@/lib/food-utils'

const PRICE_MAP: Record<number, string> = { 0: 'Free', 1: 'Rs', 2: 'Rs', 3: 'Rs', 4: 'Rs' }

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (i: MenuItem) => void }) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                    {item.popular && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                            Popular
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">RM {item.price.toFixed(2)}</p>
            </div>
            <button
                onClick={() => onAdd(item)}
                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
            >
                <Plus size={18} />
            </button>
        </div>
    )
}

export default function ShopDetailClient({ user, shopId }: { user: UserProfile; shopId: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const name = searchParams.get('name') ?? 'Food Shop'
    const photo = searchParams.get('photo') ?? 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80'
    const rating = parseFloat(searchParams.get('rating') ?? '4.5')
    const price = parseInt(searchParams.get('price') ?? '1', 10)
    const address = searchParams.get('address') ?? 'Campus Area'
    const isOpen = searchParams.get('open') !== 'false'

    const [activeCategory, setActiveCategory] = useState('mains')
    const [cartCount, setCartCount] = useState(0)

    // Dynamic menu based on shop tags/name
    const tags = searchParams.get('tags')?.split(',') ?? []
    const menu = getMenuForShop(name, tags)
    const activeMenu = menu.find((c) => c.id === activeCategory)

    const orderUrl = `/student/food-order/${encodeURIComponent(shopId)}/order?${new URLSearchParams({ name, photo })}`

    return (
        <DashboardLayout user={user}>
            <div className="max-w-3xl mx-auto pb-32">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Food
                </button>

                {/* Hero */}
                <div className="relative rounded-2xl overflow-hidden h-56 bg-gray-100 mb-6">
                    <img
                        src={photo} alt={name} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-2xl font-bold text-white">{name}</h1>
                        <p className="text-sm text-white/80 mt-0.5 flex items-center gap-1">
                            <MapPin size={12} /> {address}
                        </p>
                    </div>
                    <span className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-200'}`}>
                        {isOpen ? '● Open' : '● Closed'}
                    </span>
                </div>

                {/* Info row */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <Star size={18} className="text-amber-400 fill-amber-400" />
                        <div>
                            <p className="text-sm font-bold text-gray-900">{rating.toFixed(1)} / 5.0</p>
                            <p className="text-xs text-gray-400">Rating</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{PRICE_MAP[price] ?? '$'}</span>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                {price <= 1 ? 'Budget-friendly' : price === 2 ? 'Moderate' : 'Premium'}
                            </p>
                            <p className="text-xs text-gray-400">Price range</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        <div>
                            <p className="text-sm font-bold text-gray-900">7:00 AM – 9:00 PM</p>
                            <p className="text-xs text-gray-400">Hours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-gray-400" />
                        <div>
                            <p className="text-sm font-bold text-gray-900 max-w-[180px] line-clamp-1">{address}</p>
                            <p className="text-xs text-gray-400">Location</p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                    </div>
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-100" style={{ scrollbarWidth: 'none' }}>
                        {menu.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {cat.emoji} {cat.label}
                            </button>
                        ))}
                    </div>
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4"
                    >
                        {activeMenu?.items.map((item) => (
                            <MenuItemCard key={item.id} item={item} onAdd={() => setCartCount((c) => c + 1)} />
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Sticky Order bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 bg-white border-t border-gray-100 shadow-lg z-20">
                <Link
                    href={orderUrl}
                    className="flex items-center justify-between w-full max-w-3xl mx-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-md"
                >
                    <span className="flex items-center gap-2">
                        <ShoppingCart size={20} /> Order Now
                    </span>
                    {cartCount > 0 && (
                        <span className="bg-white text-orange-500 text-sm font-bold px-2.5 py-0.5 rounded-full">
                            {cartCount} added
                        </span>
                    )}
                    <span className="text-orange-100 text-sm">View full cart →</span>
                </Link>
            </div>
        </DashboardLayout>
    )
}
