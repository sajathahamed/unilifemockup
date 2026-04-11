'use client'

import { useState, useEffect } from 'react'
import {
    User,
    Mail,
    Truck,
    CheckCircle2,
    Clock,
    Search,
    Users,
    Plus,
    Pencil,
    Trash2,
    X,
    Phone,
} from 'lucide-react'
import { UserProfile } from '@/lib/auth'
import InlineSpinner from '@/components/ui/InlineSpinner'
import Swal from 'sweetalert2'

interface Rider {
    id: number
    name: string
    email: string
    phone: string
    photo_url: string | null
    active_deliveries: number
    is_available: boolean
}

const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/
const GMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@gmail\.com$/i
const PHONE_PATTERN = /^\d{10}$/

function validateRiderInput(name: string, email: string, phone: string): string | null {
    if (!USERNAME_PATTERN.test(name)) {
        return 'Username must start with a letter and contain only letters or numbers'
    }
    if (!GMAIL_PATTERN.test(email)) {
        return 'Email must be a valid Gmail address (example@gmail.com)'
    }
    if (!PHONE_PATTERN.test(phone)) {
        return 'Phone number must be exactly 10 digits'
    }
    return null
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

    const showErrorAlert = (text: string) => {
        void Swal.fire({
            icon: 'error',
            title: 'Validation error',
            text,
            confirmButtonText: 'OK',
            confirmButtonColor: '#5f6db8',
        })
    }

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

        const inputError = validateRiderInput(name, email, phone)
        if (inputError) {
            showErrorAlert(inputError)
            return
        }

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
                showErrorAlert(data.message || 'Failed to create rider')
            }
        } catch {
            showErrorAlert('Network error')
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
        const name = editForm.name.trim()
        const email = editForm.email.trim()
        const phone = editForm.phone.trim()
        const inputError = validateRiderInput(name, email, phone)
        if (inputError) {
            showErrorAlert(inputError)
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/delivery/riders/manage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rider_id: editingRider.id,
                    name,
                    email,
                    phone,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Rider updated.' })
                setEditingRider(null)
                await fetchRiders()
            } else {
                showErrorAlert(data.message || 'Failed to update rider')
            }
        } catch {
            showErrorAlert('Network error')
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
                showErrorAlert(data.message || 'Failed to delete rider')
            }
        } catch {
            showErrorAlert('Network error')
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
                <InlineSpinner size={40} className="text-primary" />
                <p className="text-sm text-gray-600">Loading riders…</p>
            </div>
        )
    }

    return (
        <div className="space-y-7 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                    <h1 className="font-display text-[1.9rem] font-semibold tracking-[-0.016em] text-gray-900">Riders</h1>
                    <p className="mt-1.5 text-[0.95rem] leading-6 text-gray-600 max-w-xl">
                        Add and edit delivery riders. Availability reflects active assignments.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowCreate(true); setMessage(null) }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5f6db8] text-white rounded-xl font-medium text-sm hover:bg-[#4e5ba0] shrink-0 shadow-[0_2px_10px_rgba(95,109,184,0.25)]"
                >
                    <Plus size={18} /> Add rider
                </button>
            </div>

            <div className="flex flex-wrap gap-5">
                <div className="flex-1 min-w-[170px] bg-card rounded-xl p-4 border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition">
                    <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-3">
                        <Users size={20} />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{riders.length}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)]">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
                        <CheckCircle2 size={20} />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{available}</p>
                    <p className="text-sm text-gray-500">Available</p>
                </div>
                <div className="flex-1 min-w-[170px] bg-card rounded-lg p-4 border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition">
                    <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                />
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(rider => (
                        <div
                            key={rider.id}
                            className="bg-card rounded-2xl border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] p-5 hover:-translate-y-0.5 hover:shadow-md transition"
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
                                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
                                        rider.is_available
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${rider.is_available ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {rider.is_available ? 'Available' : 'Busy'}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => openEdit(rider)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-stone-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-stone-100 border border-stone-200"
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
                <div className="bg-card rounded-2xl p-12 text-center border border-dashed border-stone-200">
                    <Users className="mx-auto text-gray-300 mb-4" size={40} />
                    <p className="text-gray-700 font-medium">No riders found</p>
                    <p className="text-gray-500 text-sm mt-1">Add a rider or adjust search.</p>
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div
                        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-[0_2px_12px_rgba(30,41,59,0.07)] border border-stone-200"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        required
                                        value={createForm.name}
                                        onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                        placeholder="Username (e.g. Rider01)"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Start with a letter, then letters/numbers only.</p>
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
                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                        placeholder="rider@gmail.com"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Only Gmail addresses are allowed.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        required
                                        value={createForm.phone}
                                        onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                                        inputMode="numeric"
                                        maxLength={10}
                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                        placeholder="0771234567"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Enter exactly 10 digits (example: 0771234567).</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 py-2.5 border border-stone-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-2.5 bg-[#5f6db8] text-white rounded-xl font-medium hover:bg-[#4e5ba0] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? <InlineSpinner size={18} /> : <Plus size={18} />}
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
                        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-[0_2px_12px_rgba(30,41,59,0.07)] border border-stone-200"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    value={editForm.name}
                                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                    placeholder="Username (e.g. Rider01)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                    placeholder="rider@gmail.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    value={editForm.phone}
                                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                    inputMode="numeric"
                                    maxLength={10}
                                    className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6db8]/30 focus:border-[#5f6db8]"
                                    placeholder="0771234567"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingRider(null)}
                                    className="flex-1 py-2.5 border border-stone-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-[#5f6db8] text-white rounded-xl font-medium hover:bg-[#4e5ba0] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <InlineSpinner size={18} /> : <CheckCircle2 size={18} />}
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
                        className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-[0_2px_12px_rgba(30,41,59,0.07)] border border-stone-200 text-center"
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
                                className="flex-1 py-2.5 border border-stone-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                    {deleting ? <InlineSpinner size={18} /> : <Trash2 size={18} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

