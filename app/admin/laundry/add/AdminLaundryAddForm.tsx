'use client'

import { useState } from 'react'
import { Truck, Loader2, Save, Plus, Trash2, MapPin } from 'lucide-react'

const SECTION_STYLE = 'border-b border-gray-200 pb-6 last:border-0'
const LABEL_STYLE = 'block text-sm font-medium text-gray-700 mb-1'
const INPUT_STYLE = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'

const SERVICE_OPTIONS = ['Wash', 'Dry Clean', 'Iron', 'Express Service']

type PriceItem = { service: string; price: string }

export default function AdminLaundryAddForm() {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({
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
    services: [] as string[],
    pickup_delivery: true,
    delivery_radius: '',
    opening_time: '',
    closing_time: '',
    logo: '',
    banner: '',
    gallery: [] as string[],
  })
  const [priceItems, setPriceItems] = useState<PriceItem[]>([{ service: 'Wash', price: '' }])

  const toggleService = (s: string) => {
    setForm((p) => ({
      ...p,
      services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s],
    }))
  }

  const addPriceItem = () => setPriceItems((p) => [...p, { service: 'Wash', price: '' }])
  const updatePriceItem = (i: number, k: keyof PriceItem, v: string) => {
    setPriceItems((p) => p.map((x, ix) => (ix === i ? { ...x, [k]: v } : x)))
  }
  const removePriceItem = (i: number) => setPriceItems((p) => p.filter((_, ix) => ix !== i))

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
      const priceList: Record<string, number> = {}
      priceItems.forEach((p) => {
        if (p.service.trim() && p.price !== '') {
          const val = parseFloat(p.price)
          if (!isNaN(val)) priceList[p.service.trim()] = val
        }
      })
      const res = await fetch('/api/admin/laundry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          delivery_radius: form.delivery_radius ? parseFloat(form.delivery_radius) : null,
          price_list: Object.keys(priceList).length ? priceList : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: 'Laundry shop registered successfully.' })
        setForm({ shop_name: '', owner_name: '', owner_email: '', phone: '', whatsapp: '', address: '', city: '', area: '', lat: '', lng: '', services: [], pickup_delivery: true, delivery_radius: '', opening_time: '', closing_time: '', logo: '', banner: '', gallery: [] })
        setPriceItems([{ service: 'Wash', price: '' }])
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to register' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Truck size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Laundry Shop Registration</h2>
            <p className="text-blue-100 text-sm">Complete business information. Owner email links to vendor login.</p>
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
              <label className={LABEL_STYLE}>Laundry Shop Name *</label>
              <input type="text" value={form.shop_name} onChange={(e) => setForm((p) => ({ ...p, shop_name: e.target.value }))} placeholder="e.g. Fresh Laundry Hub" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Owner Name *</label>
              <input type="text" value={form.owner_name} onChange={(e) => setForm((p) => ({ ...p, owner_name: e.target.value }))} placeholder="Full name" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Owner Email *</label>
              <input type="email" value={form.owner_email} onChange={(e) => setForm((p) => ({ ...p, owner_email: e.target.value }))} placeholder="vendor@example.com (links to login)" required className={INPUT_STYLE} />
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
              <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Street, building" className={INPUT_STYLE} />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Services Offered</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SERVICE_OPTIONS.map((s) => (
                  <label key={s} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)} className="rounded text-primary" />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={LABEL_STYLE}>Price List</label>
              <div className="space-y-3 mt-2">
                {priceItems.map((p, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <select value={p.service} onChange={(e) => updatePriceItem(i, 'service', e.target.value)} className={`${INPUT_STYLE} max-w-[180px]`}>
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input type="number" step="0.01" min="0" value={p.price} onChange={(e) => updatePriceItem(i, 'price', e.target.value)} placeholder="Price (LKR)" className={`${INPUT_STYLE} max-w-[120px]`} />
                    <button type="button" onClick={() => removePriceItem(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button type="button" onClick={addPriceItem} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
                  <Plus size={14} /> Add price
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="pickup" checked={form.pickup_delivery} onChange={(e) => setForm((p) => ({ ...p, pickup_delivery: e.target.checked }))} className="rounded text-primary" />
                <label htmlFor="pickup" className="text-sm font-medium text-gray-700 cursor-pointer">Pickup & Delivery</label>
              </div>
              <div>
                <label className={LABEL_STYLE}>Delivery Radius (km)</label>
                <input type="number" step="0.1" min="0" value={form.delivery_radius} onChange={(e) => setForm((p) => ({ ...p, delivery_radius: e.target.value }))} placeholder="5" className={INPUT_STYLE} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_STYLE}>Opening Time</label>
                <input type="time" value={form.opening_time} onChange={(e) => setForm((p) => ({ ...p, opening_time: e.target.value }))} className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Closing Time</label>
                <input type="time" value={form.closing_time} onChange={(e) => setForm((p) => ({ ...p, closing_time: e.target.value }))} className={INPUT_STYLE} />
              </div>
            </div>
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

        <div className="pt-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Register Laundry Shop
          </button>
        </div>
      </div>
    </form>
  )
}
