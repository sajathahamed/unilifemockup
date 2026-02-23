'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import {
    Search,
    MapPin,
    Star,
    Filter,
    ChevronRight,
    Loader2,
    Wifi,
    WifiOff,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Shop {
    place_id: string
    name: string
    vicinity: string
    rating: number
    user_ratings_total: number
    price_level: number
    types: string[]
    opening_hours?: { open_now: boolean }
    photo_url: string
    distance: string | null
    tags: string[]
}

const CATEGORIES = [
    { id: 'all', label: 'All', emoji: '🍽️' },
    { id: 'canteen', label: 'Canteen', emoji: '🏫' },
    { id: 'cafe', label: 'Cafe', emoji: '☕' },
    { id: 'fast_food', label: 'Fast Food', emoji: '🍔' },
    { id: 'restaurant', label: 'Restaurant', emoji: '🍜' },
    { id: 'dessert', label: 'Desserts', emoji: '🍨' },
]

const PRICE_LABELS: Record<number, string> = { 0: 'Free', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

function PriceIndicator({ level }: { level: number }) {
    return (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {PRICE_LABELS[level] ?? '$'}
        </span>
    )
}

function RatingStars({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <Star size={14} className="fill-amber-400 stroke-amber-400" />
            {rating?.toFixed(1)}
        </span>
    )
}

function ShopCard({ shop, onClick }: { shop: Shop; onClick: () => void }) {
    const isOpen = shop.opening_hours?.open_now ?? true
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="relative h-44 overflow-hidden bg-gray-100">
                <img
                    src={shop.photo_url}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        ; (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80'
                    }}
                />
                <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'
                        }`}
                >
                    {isOpen ? '● Open' : '● Closed'}
                </span>
                {shop.distance && (
                    <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin size={10} /> {shop.distance}
                    </span>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1">
                        {shop.name}
                    </h3>
                    <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1 flex items-center gap-1">
                    <MapPin size={10} className="flex-shrink-0" /> {shop.vicinity}
                </p>
                <div className="flex items-center gap-3 mt-3">
                    <RatingStars rating={shop.rating} />
                    <span className="text-xs text-gray-400">({shop.user_ratings_total})</span>
                    <PriceIndicator level={shop.price_level ?? 1} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {shop.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export default function FoodOrderClient({ user }: { user: UserProfile }) {
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [filtered, setFiltered] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [budgetOnly, setBudgetOnly] = useState(false)
    const [dataSource, setDataSource] = useState<'google' | 'mock'>('mock')
    const [locationGranted, setLocationGranted] = useState<boolean | null>(null)

    const fetchShops = useCallback(async (lat?: number, lng?: number) => {
        setLoading(true)
        try {
            const url = lat && lng ? `/api/places?lat=${lat}&lng=${lng}` : '/api/places'
            const res = await fetch(url)
            const data = await res.json()
            setShops(data.results ?? [])
            setDataSource(data.source ?? 'mock')
        } catch {
            setShops([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocationGranted(true)
                    fetchShops(pos.coords.latitude, pos.coords.longitude)
                },
                () => {
                    setLocationGranted(false)
                    fetchShops()
                },
                { timeout: 5000 }
            )
        } else {
            fetchShops()
        }
    }, [fetchShops])

    useEffect(() => {
        let result = [...shops]
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.tags.some((t) => t.toLowerCase().includes(q)) ||
                    (s.vicinity?.toLowerCase().includes(q) ?? false)
            )
        }
        if (activeCategory !== 'all') {
            result = result.filter(
                (s) =>
                    s.types?.some((t) => t.includes(activeCategory)) ||
                    s.tags?.some((t) => t.toLowerCase().includes(activeCategory.replace('_', ' ')))
            )
        }
        if (budgetOnly) {
            result = result.filter((s) => (s.price_level ?? 1) <= 1)
        }
        setFiltered(result)
    }, [shops, search, activeCategory, budgetOnly])

    const goToShop = (shop: Shop) => {
        const q = new URLSearchParams({
            name: shop.name,
            photo: shop.photo_url,
            rating: String(shop.rating),
            price: String(shop.price_level ?? 1),
            address: shop.vicinity ?? '',
            open: String(shop.opening_hours?.open_now ?? true),
        })
        router.push(`/student/food-order/${encodeURIComponent(shop.place_id)}?${q}`)
    }

    return (
        <DashboardLayout user={user}>
            <div className="space-y-6 pb-10">
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl">🍕</span>
                        <h1 className="text-2xl font-bold">Food Near You</h1>
                    </div>
                    <p className="text-orange-100 text-sm">
                        Affordable eats for uni students · Sorted by price &amp; rating
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        {dataSource === 'google' ? (
                            <span className="flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                                <Wifi size={12} /> Live Google Places data
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                                <WifiOff size={12} /> Demo data · Add API key for live results
                            </span>
                        )}
                        {locationGranted === false && (
                            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                                📍 Location denied
                            </span>
                        )}
                    </div>
                </div>

                {/* Search + Budget filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search shops, cuisine, food…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setBudgetOnly((v) => !v)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${budgetOnly
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
                            }`}
                    >
                        <Filter size={16} /> Budget ($)
                    </button>
                </div>

                {/* Category chips */}
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-400'
                                }`}
                        >
                            <span>{cat.emoji}</span> {cat.label}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                        <p className="text-gray-500 text-sm">Finding food near you…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl">🍽️</span>
                        <p className="mt-4 text-gray-500 font-medium">No shops found</p>
                        <p className="text-sm text-gray-400">Try a different search or filter</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">
                            {filtered.length} place{filtered.length !== 1 ? 's' : ''} found
                        </p>
                        <AnimatePresence mode="popLayout">
                            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filtered.map((shop) => (
                                    <ShopCard key={shop.place_id} shop={shop} onClick={() => goToShop(shop)} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
