'use client'

import { useState, useEffect } from 'react'
import {
    User,
    Mail,
    Truck,
    CheckCircle2,
    Clock,
    Loader2,
    Search,
    Users,
    Plus,
    Pencil,
    Trash2,
    X,
    Phone,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/lib/auth'

interface Rider {
    id: number
    name: string
    email: string
    phone: string
    photo_url: string | null
    active_deliveries: number
    is_available: boolean
}

export default function DeliveryRidersClient({ user }: { user: UserProfile }) {
    const [riders, setRiders] = useState<Rider[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Create modal
    const [showCreate, setShowCreate] = useState(false)
    const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '' })
    const [creating, setCreating] = useState(false)

    // Edit modal
    const [editingRider, setEditingRider] = useState<Rider | null>(null)
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
    const [saving, setSaving] = useState(false)

    // Delete confirm
    const [deletingRider, setDeletingRider] = useState<Rider | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchRiders = async () => {
        try {
            const res = await fetch('/api/delivery/riders')
            const data = await res.json()
            setRiders(data.riders ?? [])
        } catch (err) {
            console.error('Failed to fetch riders:', err)
        }
    }

    useEffect(() => {
        fetchRiders().finally(() => setLoading(false))
    }, [])

    // ── Create Rider ──
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        const name = createForm.name.trim()
        const email = createForm.email.trim()
        const phone = createForm.phone.trim()

        if (name.length < 2) { setMessage({ type: 'error', text: 'Name must be at least 2 characters' }); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage({ type: 'error', text: 'Enter a valid email' }); return }

        setCreating(true)
        try {
            const res = await fetch('/api/delivery/riders/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Rider created!' })
                setShowCreate(false)
                setCreateForm({ name: '', email: '', phone: '' })
                await fetchRiders()
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to create rider' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setCreating(false)
        }
    }

    // ── Edit Rider ──
    const openEdit = (rider: Rider) => {
        setEditingRider(rider)
        setEditForm({ name: rider.name, email: rider.email, phone: rider.phone })
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingRider) return
        setMessage(null)
        setSaving(true)
        try {
            const res = await fetch('/api/delivery/riders/manage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rider_id: editingRider.id,
                    name: editForm.name.trim() || undefined,
                    email: editForm.email.trim() || undefined,
                    phone: editForm.phone.trim() || undefined,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Rider updated!' })
                setEditingRider(null)
                await fetchRiders()
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update rider' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setSaving(false)
        }
    }

    // ── Delete Rider ──
    const handleDelete = async () => {
        if (!deletingRider) return
        setMessage(null)
        setDeleting(true)
        try {
            const res = await fetch('/api/delivery/riders/manage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rider_id: deletingRider.id }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Rider deleted!' })
                setDeletingRider(null)
                await fetchRiders()
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to delete rider' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setDeleting(false)
        }
    }

    const filtered = riders.filter(r => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    })

    const available = riders.filter(r => r.is_available).length
    const busy = riders.filter(r => !r.is_available).length

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading riders...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🚴</div>
                            <h1 className="text-3xl font-bold">Delivery Riders</h1>
                        </div>
                        <p className="text-purple-100 max-w-lg">
                            Manage your delivery riders — create, edit, and track their workload.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowCreate(true); setMessage(null) }}
                        className="flex items-center gap-2 px-5 py-3 bg-white text-purple-700 rounded-2xl font-bold shadow-lg hover:bg-purple-50 transition-all"
                    >
                        <Plus size={18} /> Add Rider
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center mb-3">
                        <Users size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{riders.length}</p>
                    <p className="text-sm text-gray-500">Total Riders</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                        <CheckCircle2 size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{available}</p>
                    <p className="text-sm text-gray-500">Available</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                        <Clock size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{busy}</p>
                    <p className="text-sm text-gray-500">Busy</p>
                </div>
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

            {/* Search */}
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search riders by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 text-sm transition-all"
                />
            </div>

            {/* Rider Grid */}
            <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(rider => (
                            <motion.div
                                key={rider.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
                                        rider.is_available
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {rider.photo_url ? (
                                            <img src={rider.photo_url} alt={rider.name} className="w-14 h-14 rounded-2xl object-cover" />
                                        ) : (
                                            rider.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg truncate">{rider.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                                            <Mail size={12} /> {rider.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            <strong>{rider.active_deliveries}</strong> active
                                        </span>
                                    </div>
                                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                                        rider.is_available
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {rider.is_available ? '● Available' : '● Busy'}
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openEdit(rider)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => { setDeletingRider(rider); setMessage(null) }}
                                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                        <Users className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-500 font-semibold">No riders found</p>
                        <p className="text-gray-400 text-sm mt-1">Click "Add Rider" to create your first delivery rider</p>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Create Rider Modal ── */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Rider</h3>
                                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            required
                                            value={createForm.name}
                                            onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="Kavinda Perera"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            required
                                            type="email"
                                            value={createForm.email}
                                            onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="rider@unilife.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            value={createForm.phone}
                                            onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="+94 77 123 4567"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-all">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                        Create Rider
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Edit Rider Modal ── */}
            <AnimatePresence>
                {editingRider && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit Rider</h3>
                                <button onClick={() => setEditingRider(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        value={editForm.name}
                                        onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                    <input
                                        value={editForm.phone}
                                        onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="+94 77 123 4567"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingRider(null)} className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-all">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation Modal ── */}
            <AnimatePresence>
                {deletingRider && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Rider?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete <strong>{deletingRider.name}</strong>? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingRider(null)}
                                    className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
