'use client'

import { useState, useEffect, useRef } from 'react'
import { apiErrorMessage } from '@/lib/admin/form-feedback'
import {
  digitsOnlyPhone,
  isValidEmail,
  minLen10IfPresent,
  requireMinLen10,
  validatePhone10Required,
  validatePositiveNumber,
} from '@/lib/admin/validation'
import { Truck, Loader2, Save, Plus, Trash2, MapPin, Edit2 } from 'lucide-react'

const SECTION_STYLE = 'border-b border-gray-200 pb-6 last:border-0'
const LABEL_STYLE = 'block text-sm font-medium text-gray-700 mb-1.5'
const INPUT_STYLE = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900 placeholder:text-gray-400'
const SELECT_STYLE = `${INPUT_STYLE} bg-white cursor-pointer`

const feedbackBoxClass = (type: 'success' | 'error') =>
  type === 'success'
    ? 'bg-green-50 text-green-900 border border-green-200'
    : 'bg-red-50 text-red-900 border border-red-200'

const SERVICE_OPTIONS = ['Wash', 'Dry Clean', 'Iron', 'Express Service']

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

type PriceItem = { service: string; price: string }
type LaundryRow = { id: number; shop_name: string; owner_name: string; owner_email: string; phone?: string; address?: string }
type VendorAccount = { id: number; name: string; email: string }

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
  services: [] as string[],
  pickup_delivery: true,
  delivery_radius: '',
  opening_time: '',
  closing_time: '',
})

export default function AdminLaundryAddForm() {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [list, setList] = useState<LaundryRow[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    ...emptyForm(),
  })
  const [priceItems, setPriceItems] = useState<PriceItem[]>([{ service: 'Wash', price: '' }])
  const [vendors, setVendors] = useState<VendorAccount[]>([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message) return
    const id = requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    return () => cancelAnimationFrame(id)
  }, [message])

  const fetchList = () => {
    setLoadingList(true)
    fetch('/api/admin/laundry')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoadingList(false))
  }

  const fetchVendors = () => {
    setLoadingVendors(true)
    fetch('/api/admin/vendor-accounts')
      .then((r) => (r.ok ? r.json() : { accounts: [] }))
      .then((data) => setVendors(Array.isArray(data?.accounts) ? data.accounts : []))
      .catch(() => setVendors([]))
      .finally(() => setLoadingVendors(false))
  }

  useEffect(() => {
    fetchList()
    fetchVendors()
  }, [])

  const ownerEmailInVendorList = (email: string) =>
    vendors.some((v) => v.email.toLowerCase() === email.trim().toLowerCase())

  const onOwnerEmailSelect = (email: string) => {
    const match = vendors.find((v) => v.email.toLowerCase() === email.toLowerCase())
    setForm((p) => ({
      ...p,
      owner_email: email,
      owner_name: match?.name ?? p.owner_name,
    }))
  }

  const resetForm = () => {
    setForm(emptyForm())
    setPriceItems([{ service: 'Wash', price: '' }])
    setEditingId(null)
  }

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/laundry/${id}`)
      if (!res.ok) throw new Error('Failed to load')
      const shop = await res.json()
      const ot = shop.opening_time
      const ct = shop.closing_time
      setForm({
        shop_name: shop.shop_name || '',
        owner_name: shop.owner_name || '',
        owner_email: shop.owner_email || '',
        phone: shop.phone || '',
        whatsapp: shop.whatsapp || '',
        address: shop.address || '',
        city: shop.city || '',
        area: shop.area || '',
        lat: shop.lat != null ? String(shop.lat) : '',
        lng: shop.lng != null ? String(shop.lng) : '',
        services: Array.isArray(shop.services) ? shop.services : [],
        pickup_delivery: shop.pickup_delivery !== false,
        delivery_radius: shop.delivery_radius != null ? String(shop.delivery_radius) : '',
        opening_time: ot ? (typeof ot === 'string' ? ot.slice(0, 5) : '') : '',
        closing_time: ct ? (typeof ct === 'string' ? ct.slice(0, 5) : '') : '',
        logo: shop.logo || '',
        banner: shop.banner || '',
        gallery: Array.isArray(shop.gallery) ? shop.gallery : [],
      })
      const pl = shop.price_list
      if (pl && typeof pl === 'object' && Object.keys(pl).length > 0) {
        setPriceItems(Object.entries(pl).map(([service, price]) => ({ service, price: String(price ?? '') })))
      } else {
        setPriceItems([{ service: 'Wash', price: '' }])
      }
      setEditingId(id)
      setMessage(null)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load laundry shop' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this laundry shop? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/laundry/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Laundry shop deleted.' })
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
    const shopName = form.shop_name.trim()
    const ownerName = form.owner_name.trim()
    const ownerEmail = form.owner_email.trim().toLowerCase()
    const phone = form.phone.trim()
    const whatsapp = form.whatsapp.trim()
    const latStr = form.lat.trim()
    const lngStr = form.lng.trim()
    const deliveryRadius = form.delivery_radius.trim()
    const opening = form.opening_time.trim()
    const closing = form.closing_time.trim()

    const errShop = requireMinLen10(shopName, 'Laundry shop name')
    if (errShop) return setMessage({ type: 'error', text: errShop })
    const errOwner = requireMinLen10(ownerName, 'Owner name')
    if (errOwner) return setMessage({ type: 'error', text: errOwner })
    if (!ownerEmail) return setMessage({ type: 'error', text: 'Select a laundry vendor account from the list.' })
    if (!isValidEmail(ownerEmail)) return setMessage({ type: 'error', text: 'Owner email format is invalid.' })
    const errPh = validatePhone10Required(phone, 'Phone number')
    if (errPh) return setMessage({ type: 'error', text: errPh })
    const errWa = validatePhone10Required(whatsapp, 'WhatsApp number')
    if (errWa) return setMessage({ type: 'error', text: errWa })
    const errAddr = requireMinLen10(form.address, 'Address')
    if (errAddr) return setMessage({ type: 'error', text: errAddr })
    const errCity = minLen10IfPresent(form.city, 'City')
    if (errCity) return setMessage({ type: 'error', text: errCity })
    const errArea = minLen10IfPresent(form.area, 'Area')
    if (errArea) return setMessage({ type: 'error', text: errArea })
    if ((latStr && !lngStr) || (!latStr && lngStr)) return setMessage({ type: 'error', text: 'Provide both latitude and longitude together.' })
    if (latStr) {
      const latNum = Number(latStr)
      const lngNum = Number(lngStr)
      if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) return setMessage({ type: 'error', text: 'Latitude must be between -90 and 90.' })
      if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) return setMessage({ type: 'error', text: 'Longitude must be between -180 and 180.' })
    }
    if ((opening && !closing) || (!opening && closing)) return setMessage({ type: 'error', text: 'Provide both opening and closing time together.' })
    if (opening && closing && opening >= closing) return setMessage({ type: 'error', text: 'Closing time must be after opening time.' })
    if (deliveryRadius) {
      const er = validatePositiveNumber(deliveryRadius, 'Delivery radius (km)', false)
      if (er) return setMessage({ type: 'error', text: er })
    }
    for (const [i, p] of priceItems.entries()) {
      const hasAny = p.service.trim() || p.price.trim()
      if (!hasAny) continue
      if (!p.service.trim()) return setMessage({ type: 'error', text: `Price row #${i + 1}: service is required.` })
      if (p.price.trim() === '' || Number.isNaN(Number(p.price)) || Number(p.price) <= 0) {
        return setMessage({ type: 'error', text: `Price row #${i + 1}: price must be greater than 0.` })
      }
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
      const payload = {
        ...form,
        shop_name: shopName,
        owner_name: ownerName,
        owner_email: ownerEmail,
        phone: digitsOnlyPhone(phone, 10),
        whatsapp: digitsOnlyPhone(whatsapp, 10),
        lat: latStr ? parseFloat(latStr) : null,
        lng: lngStr ? parseFloat(lngStr) : null,
        delivery_radius: deliveryRadius ? parseFloat(deliveryRadius) : null,
        price_list: Object.keys(priceList).length ? priceList : null,
      }
      const url = editingId ? `/api/admin/laundry/${editingId}` : '/api/admin/laundry'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: editingId ? 'Laundry shop updated.' : 'Laundry shop registered successfully.' })
        resetForm()
        fetchList()
      } else {
        setMessage({ type: 'error', text: apiErrorMessage(data, res) })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <form noValidate onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/90">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Truck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Laundry shop registration</h2>
            <p className="text-sm text-gray-500">Owner: pick a laundry vendor account from Super Admin. Phone fields are 10 digits only.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div
            role="alert"
            aria-live="polite"
            className={`px-4 py-3 rounded-xl text-sm font-medium ${feedbackBoxClass(message.type)}`}
          >
            {message.text}
          </div>
        )}

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_STYLE}>Laundry shop name * (min 10 characters)</label>
              <input type="text" value={form.shop_name} onChange={(e) => setForm((p) => ({ ...p, shop_name: e.target.value }))} placeholder="e.g. Fresh Laundry Hub" className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Owner name * (min 10 characters)</label>
              <input type="text" value={form.owner_name} onChange={(e) => setForm((p) => ({ ...p, owner_name: e.target.value }))} placeholder="Full name" className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Owner (vendor account) *</label>
              <select
                value={form.owner_email}
                onChange={(e) => onOwnerEmailSelect(e.target.value)}
                disabled={loadingVendors}
                className={SELECT_STYLE}
              >
                <option value="">{loadingVendors ? 'Loading vendor accounts…' : 'Select laundry vendor account'}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.email}>
                    {v.name} — {v.email}
                  </option>
                ))}
                {form.owner_email && !ownerEmailInVendorList(form.owner_email) && (
                  <option value={form.owner_email}>
                    {form.owner_email} (current — not in vendor list)
                  </option>
                )}
              </select>
              {!loadingVendors && vendors.length === 0 && (
                <p className="mt-1 text-sm text-sky-800">No laundry vendor accounts yet. Create users with role &quot;Laundry Vendor&quot; in Super Admin first.</p>
              )}
            </div>
            <div>
              <label className={LABEL_STYLE}>Phone number * (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: digitsOnlyPhone(e.target.value) }))}
                placeholder="0771234567"
                maxLength={10}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>WhatsApp * (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.whatsapp}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: digitsOnlyPhone(e.target.value) }))}
                placeholder="0771234567"
                maxLength={10}
                className={INPUT_STYLE}
              />
            </div>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} /> Location Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Address * (min 10 characters)</label>
              <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Street, building, area…" className={INPUT_STYLE} />
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

        {message && (
          <div
            ref={feedbackRef}
            role="alert"
            aria-live="polite"
            className={`px-4 py-3 rounded-xl text-sm font-medium ${feedbackBoxClass(message.type)}`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {editingId ? 'Update Laundry Shop' : 'Register Laundry Shop'}
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
        <h2 className="text-lg font-semibold text-gray-900">Assigned Laundry Shops (ID below)</h2>
        <p className="text-sm text-gray-500">Edit or delete existing shops. IDs are shown for reference.</p>
      </div>
      {loadingList ? (
        <div className="p-8 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : list.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No laundry shops yet. Create one above.</div>
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
