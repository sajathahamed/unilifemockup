'use client'

import { useState, useEffect } from 'react'
import { Utensils, Loader2, Save, Plus, Trash2, MapPin, Edit2 } from 'lucide-react'

type FoodStallRow = { id: number; shop_name: string; owner_name: string; owner_email: string; phone?: string; address?: string }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CATEGORIES = ['Street Food', 'Fast Food', 'Snacks', 'Beverages', 'Bakery', 'Restaurant', 'Café', 'Other']

const SECTION_STYLE = 'border-b border-gray-200 pb-6 last:border-0'
const LABEL_STYLE = 'block text-sm font-medium text-gray-700 mb-1'
const INPUT_STYLE = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'

type MenuItem = { name: string; price: string; food_category: string; image_url: string }

const emptyForm = () => ({
  shop_name: '',
  owner_name: '',
  owner_email: '',
  phone: '',
  whatsapp: '',
  address: '',
  city: '',
  area: '',
  lat: '',
  lng: '',
  description: '',
  opening_time: '',
  closing_time: '',
  days_open: [] as string[],
  category: '',
  logo: '',
  banner: '',
  gallery: [] as string[],
})

export default function AdminFoodStallAddForm() {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [list, setList] = useState<FoodStallRow[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [menuItems, setMenuItems] = useState<MenuItem[]>([{ name: '', price: '', food_category: '', image_url: '' }])

  const fetchList = () => {
    setLoadingList(true)
    fetch('/api/admin/food-stalls')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoadingList(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const resetForm = () => {
    setForm(emptyForm())
    setMenuItems([{ name: '', price: '', food_category: '', image_url: '' }])
    setEditingId(null)
  }

  const toggleDay = (day: string) => {
    setForm((p) => ({
      ...p,
      days_open: p.days_open.includes(day) ? p.days_open.filter((d) => d !== day) : [...p.days_open, day],
    }))
  }

  const addMenuItem = () => setMenuItems((p) => [...p, { name: '', price: '', food_category: '', image_url: '' }])
  const updateMenuItem = (i: number, k: keyof MenuItem, v: string) => {
    setMenuItems((p) => p.map((m, ix) => (ix === i ? { ...m, [k]: v } : m)))
  }
  const removeMenuItem = (i: number) => setMenuItems((p) => p.filter((_, ix) => ix !== i))

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/food-stalls/${id}`)
      if (!res.ok) throw new Error('Failed to load')
      const stall = await res.json()
      const ot = stall.opening_time
      const ct = stall.closing_time
      setForm({
        shop_name: stall.shop_name || '',
        owner_name: stall.owner_name || '',
        owner_email: stall.owner_email || '',
        phone: stall.phone || '',
        whatsapp: stall.whatsapp || '',
        address: stall.address || '',
        city: stall.city || '',
        area: stall.area || '',
        lat: stall.lat != null ? String(stall.lat) : '',
        lng: stall.lng != null ? String(stall.lng) : '',
        description: stall.description || '',
        opening_time: ot ? (typeof ot === 'string' ? ot.slice(0, 5) : '') : '',
        closing_time: ct ? (typeof ct === 'string' ? ct.slice(0, 5) : '') : '',
        days_open: Array.isArray(stall.days_open) ? stall.days_open : [],
        category: stall.category || '',
        logo: stall.logo || '',
        banner: stall.banner || '',
        gallery: Array.isArray(stall.gallery) ? stall.gallery : [],
      })
      const items = stall.menu_items ?? []
      setMenuItems(items.length > 0 ? items.map((m: { name: string; price: number; food_category?: string; image_url?: string }) => ({ name: m.name || '', price: String(m.price ?? ''), food_category: m.food_category || '', image_url: m.image_url || '' })) : [{ name: '', price: '', food_category: '', image_url: '' }])
      setEditingId(id)
      setMessage(null)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load stall' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this food stall? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/food-stalls/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Food stall deleted.' })
        resetForm()
        fetchList()
      } else {
        const data = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: data?.message || 'Delete failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.shop_name.trim()) {
      setMessage({ type: 'error', text: 'Shop name is required' })
      return
    }
    if (!form.owner_name.trim()) {
      setMessage({ type: 'error', text: 'Owner name is required' })
      return
    }
    if (!form.owner_email.trim()) {
      setMessage({ type: 'error', text: 'Owner email is required (links to vendor login)' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        menu_items: menuItems.filter((m) => m.name.trim()).map((m) => ({
          name: m.name.trim(),
          price: m.price ? parseFloat(m.price) : 0,
          food_category: m.food_category.trim() || null,
          image_url: m.image_url.trim() || null,
        })),
      }
      const url = editingId ? `/api/admin/food-stalls/${editingId}` : '/api/admin/food-stalls'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: editingId ? 'Food stall updated.' : 'Food stall registered successfully.' })
        resetForm()
        fetchList()
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Utensils size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Food Stall Registration</h2>
            <p className="text-amber-100 text-sm">Complete business information. Owner email links to vendor login.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_STYLE}>Shop Name *</label>
              <input type="text" value={form.shop_name} onChange={(e) => setForm((p) => ({ ...p, shop_name: e.target.value }))} placeholder="e.g. Campus Grill" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Owner Name *</label>
              <input type="text" value={form.owner_name} onChange={(e) => setForm((p) => ({ ...p, owner_name: e.target.value }))} placeholder="Full name" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Owner Email *</label>
              <input type="email" value={form.owner_email} onChange={(e) => setForm((p) => ({ ...p, owner_email: e.target.value }))} placeholder="vendor@example.com (links to login)" required className={INPUT_STYLE} suppressHydrationWarning />
            </div>
            <div>
              <label className={LABEL_STYLE}>Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+94..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>WhatsApp Number</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="+94..." className={INPUT_STYLE} />
            </div>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} /> Location Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Street, building, floor" className={INPUT_STYLE} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_STYLE}>City</label>
                <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Area</label>
                <input type="text" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} placeholder="Campus area / zone" className={INPUT_STYLE} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_STYLE}>Latitude (Google Maps)</label>
                <input type="text" value={form.lat} onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))} placeholder="6.9271" className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Longitude (Google Maps)</label>
                <input type="text" value={form.lng} onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))} placeholder="79.8612" className={INPUT_STYLE} />
              </div>
            </div>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Shop Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="About your food stall..." className={INPUT_STYLE} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_STYLE}>Opening Time</label>
                <input type="time" value={form.opening_time} onChange={(e) => setForm((p) => ({ ...p, opening_time: e.target.value }))} className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Closing Time</label>
                <input type="time" value={form.closing_time} onChange={(e) => setForm((p) => ({ ...p, closing_time: e.target.value }))} className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={INPUT_STYLE}>
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_STYLE}>Days Open</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map((d) => (
                  <label key={d} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={form.days_open.includes(d)} onChange={() => toggleDay(d)} className="rounded text-primary" />
                    <span className="text-sm">{d.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Information</h3>
          <div className="space-y-4">
            {menuItems.map((m, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[120px]">
                  <label className={LABEL_STYLE}>Item Name</label>
                  <input type="text" value={m.name} onChange={(e) => updateMenuItem(i, 'name', e.target.value)} placeholder="e.g. Rice & Curry" className={INPUT_STYLE} />
                </div>
                <div className="w-24">
                  <label className={LABEL_STYLE}>Price</label>
                  <input type="number" step="0.01" min="0" value={m.price} onChange={(e) => updateMenuItem(i, 'price', e.target.value)} placeholder="0" className={INPUT_STYLE} />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className={LABEL_STYLE}>Category</label>
                  <input type="text" value={m.food_category} onChange={(e) => updateMenuItem(i, 'food_category', e.target.value)} placeholder="Main, Snacks, Drinks" className={INPUT_STYLE} />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className={LABEL_STYLE}>Image URL</label>
                  <input type="url" value={m.image_url} onChange={(e) => updateMenuItem(i, 'image_url', e.target.value)} placeholder="https://..." className={INPUT_STYLE} />
                </div>
                <button type="button" onClick={() => removeMenuItem(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Remove"><Trash2 size={18} /></button>
              </div>
            ))}
            <button type="button" onClick={addMenuItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
              <Plus size={18} /> Add Menu Item
            </button>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Media URLs</h3>
          <p className="text-sm text-gray-500 mb-3">Enter image URLs (upload to your storage first).</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_STYLE}>Shop Logo URL</label>
              <input type="url" value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="https://..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Shop Banner URL</label>
              <input type="url" value={form.banner} onChange={(e) => setForm((p) => ({ ...p, banner: e.target.value }))} placeholder="https://..." className={INPUT_STYLE} />
            </div>
          </div>
        </section>

        <div className="pt-4 flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {editingId ? 'Update Food Stall' : 'Register Food Stall'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
              Create New
            </button>
          )}
        </div>
      </div>
    </form>

    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900">Assigned Food Stalls (ID below)</h2>
        <p className="text-sm text-gray-500">Edit or delete existing stalls. IDs are shown for reference.</p>
      </div>
      {loadingList ? (
        <div className="p-8 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : list.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No food stalls yet. Create one above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Shop Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Owner</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{row.id}</td>
                  <td className="py-3 px-4 font-medium">{row.shop_name}</td>
                  <td className="py-3 px-4">{row.owner_name}</td>
                  <td className="py-3 px-4 text-sm">{row.owner_email}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-[180px]">{row.address || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(row.id)} className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Edit"><Edit2 size={16} /></button>
                      <button type="button" onClick={() => handleDelete(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  )
}
