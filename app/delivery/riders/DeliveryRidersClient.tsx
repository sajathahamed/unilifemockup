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

    const [showCreate, setShowCreate] = useState(false)
    const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '' })
    const [creating, setCreating] = useState(false)

    const [editingRider, setEditingRider] = useState<Rider | null>(null)
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
    const [saving, setSaving] = useState(false)

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
                setMessage({ type: 'success', text: data.message || 'Rider created.' })
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
                setMessage({ type: 'success', text: data.message || 'Rider updated.' })
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
                setMessage({ type: 'success', text: data.message || 'Rider removed.' })
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
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-gray-600">Loading riders…</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Riders</h1>
                    <p className="mt-1 text-sm text-gray-600 max-w-xl">
                        Add and edit delivery riders. Availability reflects active assignments.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowCreate(true); setMessage(null) }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 shrink-0"
                >
                    <Plus size={18} /> Add rider
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-card p-4 border border-gray-200 shadow-card">
                    <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-3">
                        <Users size={20} />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{riders.length}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="bg-card rounded-card p-4 border border-gray-200 shadow-card">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
                        <CheckCircle2 size={20} />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{available}</p>
                    <p className="text-sm text-gray-500">Available</p>
                </div>
                <div className="bg-card rounded-card p-4 border border-gray-200 shadow-card">
                    <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mb-3">
                        <Clock size={20} />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{busy}</p>
                    <p className="text-sm text-gray-500">Busy</p>
                </div>
            </div>

            {message && (
                <div
                    className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between border ${
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

            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-gray-200 rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(rider => (
                        <div
                            key={rider.id}
                            className="bg-card rounded-card border border-gray-200 shadow-card p-5 hover:shadow-card-hover transition-shadow"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold shrink-0 ${
                                        rider.is_available
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                    {rider.photo_url ? (
                                        <img src={rider.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                        rider.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{rider.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                                        <Mail size={12} className="shrink-0" /> {rider.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Truck size={16} className="text-gray-400" />
                                    <span>
                                        <span className="font-medium text-gray-900">{rider.active_deliveries}</span> active
                                    </span>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-md font-medium ${
                                        rider.is_available
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                    {rider.is_available ? 'Available' : 'Busy'}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => openEdit(rider)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 border border-gray-200"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDeletingRider(rider); setMessage(null) }}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-card p-12 text-center border border-dashed border-gray-200">
                    <Users className="mx-auto text-gray-300 mb-4" size={40} />
                    <p className="text-gray-700 font-medium">No riders found</p>
                    <p className="text-gray-500 text-sm mt-1">Add a rider or adjust search.</p>
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div
                        className="bg-card rounded-card p-6 max-w-md w-full shadow-card border border-gray-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Add rider</h3>
                            <button type="button" onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        required
                                        value={createForm.name}
                                        onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="Name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        required
                                        type="email"
                                        value={createForm.email}
                                        onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="rider@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        value={createForm.phone}
                                        onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="+94 77 123 4567"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingRider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div
                        className="bg-card rounded-card p-6 max-w-md w-full shadow-card border border-gray-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit rider</h3>
                            <button type="button" onClick={() => setEditingRider(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                                <input
                                    value={editForm.name}
                                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    value={editForm.phone}
                                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder="+94 77 123 4567"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingRider(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingRider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div
                        className="bg-card rounded-card p-6 max-w-sm w-full shadow-card border border-gray-200 text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete rider?</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Remove <strong>{deletingRider.name}</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingRider(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
