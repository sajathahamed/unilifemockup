'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, Save, Plus, Trash2, Calendar, Route, Edit2 } from 'lucide-react'

const SECTION_STYLE = 'border-b border-gray-200 pb-6 last:border-0'
const LABEL_STYLE = 'block text-sm font-medium text-gray-700 mb-1'
const INPUT_STYLE = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'

type ItineraryItem = { day_number: number; activity: string }
type TripRow = { id: number; destination: string; organizer_name: string; organizer_email: string; address?: string; trip_type?: string }

type TripStatus = 'draft' | 'published' | 'archived'

const emptyForm = (): Record<string, string> & { status: TripStatus } => ({
  destination: '',
  organizer_name: '',
  organizer_email: '',
  phone: '',
  whatsapp: '',
  description: '',
  trip_type: '',
  transport_type: '',
  inclusions: '',
  address: '',
  city: '',
  area: '',
  lat: '',
  lng: '',
  days: '',
  estimated_budget: '',
  departure_date: '',
  return_date: '',
  max_participants: '',
  logo_url: '',
  banner_url: '',
  gallery_urls: '',
  status: 'draft',
})

export default function AdminTripAddForm() {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [list, setList] = useState<TripRow[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
  ...emptyForm(),
  })
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([{ day_number: 1, activity: '' }])

  const fetchList = () => {
    setLoadingList(true)
    fetch('/api/admin/trips')
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
    setItinerary([{ day_number: 1, activity: '' }])
    setEditingId(null)
  }

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/trips/${id}`)
      if (!res.ok) throw new Error('Failed to load')
      const trip = await res.json()
      const gallery = trip.gallery_urls
      setForm({
        destination: trip.destination || '',
        organizer_name: trip.organizer_name || '',
        organizer_email: trip.organizer_email || '',
        phone: trip.phone || '',
        whatsapp: trip.whatsapp || '',
        description: trip.description || '',
        trip_type: trip.trip_type || '',
        transport_type: trip.transport_type || '',
        inclusions: trip.inclusions || '',
        address: trip.address || '',
        city: trip.city || '',
        area: trip.area || '',
        lat: trip.lat != null ? String(trip.lat) : '',
        lng: trip.lng != null ? String(trip.lng) : '',
        days: trip.days != null ? String(trip.days) : '',
        estimated_budget: trip.estimated_budget != null ? String(trip.estimated_budget) : '',
        departure_date: trip.departure_date ? String(trip.departure_date).slice(0, 10) : '',
        return_date: trip.return_date ? String(trip.return_date).slice(0, 10) : '',
        max_participants: trip.max_participants != null ? String(trip.max_participants) : '',
        logo_url: trip.logo_url || '',
        banner_url: trip.banner_url || '',
        gallery_urls: Array.isArray(gallery) ? gallery.join('\n') : '',
        status: ((trip.status || 'draft') as TripStatus),
      })
      const items = trip.itinerary ?? []
      setItinerary(items.length > 0 ? items.map((d: { day_number: number; activity: string }) => ({ day_number: d.day_number, activity: d.activity || '' })) : [{ day_number: 1, activity: '' }])
      setEditingId(id)
      setMessage(null)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load trip' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this trip? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/trips/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Trip deleted.' })
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

  const addDay = () => setItinerary((p) => [...p, { day_number: p.length + 1, activity: '' }])
  const updateDay = (i: number, k: keyof ItineraryItem, v: number | string) => {
    setItinerary((p) => p.map((d, ix) => (ix === i ? { ...d, [k]: v } : d)))
  }
  const removeDay = (i: number) => setItinerary((p) => p.filter((_, ix) => ix !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.destination.trim()) {
      setMessage({ type: 'error', text: 'Destination is required' })
      return
    }
    if (!form.organizer_name.trim()) {
      setMessage({ type: 'error', text: 'Organizer name is required' })
      return
    }
    if (!form.organizer_email.trim()) {
      setMessage({ type: 'error', text: 'Organizer email is required' })
      return
    }
    setSaving(true)
    try {
      const gallery = form.gallery_urls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)
      const payload = {
        ...form,
        days: form.days ? parseInt(form.days, 10) : null,
        estimated_budget: form.estimated_budget ? parseFloat(form.estimated_budget) : null,
        max_participants: form.max_participants ? parseInt(form.max_participants, 10) : null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        gallery_urls: gallery,
        itinerary: itinerary.filter((d) => d.activity.trim()),
      }
      const url = editingId ? `/api/admin/trips/${editingId}` : '/api/admin/trips'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: editingId ? 'Trip updated.' : 'Trip location added successfully.' })
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
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <MapPin size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Trip Location Registration</h2>
            <p className="text-emerald-100 text-sm">Add trip destinations with itinerary and details.</p>
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
              <label className={LABEL_STYLE}>Destination *</label>
              <input type="text" value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} placeholder="e.g. Ella, Galle Fort" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Organizer Name *</label>
              <input type="text" value={form.organizer_name} onChange={(e) => setForm((p) => ({ ...p, organizer_name: e.target.value }))} placeholder="Trip organizer name" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Organizer Email *</label>
              <input
                type="email"
                value={form.organizer_email}
                onChange={(e) => setForm((p) => ({ ...p, organizer_email: e.target.value }))}
                placeholder="owner@example.com"
                required
                className={INPUT_STYLE}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+94..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>WhatsApp Number</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="+94..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Trip Type</label>
              <select value={form.trip_type} onChange={(e) => setForm((p) => ({ ...p, trip_type: e.target.value }))} className={INPUT_STYLE}>
                <option value="">Select type</option>
                <option value="Adventure">Adventure</option>
                <option value="Leisure">Leisure</option>
                <option value="Educational">Educational</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>
            <div>
              <label className={LABEL_STYLE}>Transport Type</label>
              <select value={form.transport_type} onChange={(e) => setForm((p) => ({ ...p, transport_type: e.target.value }))} className={INPUT_STYLE}>
                <option value="">Select transport</option>
                <option value="Bus">Bus</option>
                <option value="Van">Van</option>
                <option value="Train">Train</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div>
              <label className={LABEL_STYLE}>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="About this trip destination..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Inclusions</label>
              <textarea rows={3} value={form.inclusions} onChange={(e) => setForm((p) => ({ ...p, inclusions: e.target.value }))} placeholder="Transport, meals, hotel..." className={INPUT_STYLE} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_STYLE}>Number of Days</label>
                <input type="number" min="1" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} placeholder="3" className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Estimated Budget (LKR)</label>
                <input type="number" step="0.01" min="0" value={form.estimated_budget} onChange={(e) => setForm((p) => ({ ...p, estimated_budget: e.target.value }))} placeholder="15000" className={INPUT_STYLE} />
              </div>
            </div>
            <div>
              <label className={LABEL_STYLE}>Max Participants</label>
              <input type="number" min="1" value={form.max_participants} onChange={(e) => setForm((p) => ({ ...p, max_participants: e.target.value }))} placeholder="20" className={INPUT_STYLE} />
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
              <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Street, area" className={INPUT_STYLE} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_STYLE}>City</label>
                <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Area / Region</label>
                <input type="text" value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} placeholder="e.g. Southern Province" className={INPUT_STYLE} />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} /> Schedule
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_STYLE}>Departure Date</label>
              <input type="date" value={form.departure_date} onChange={(e) => setForm((p) => ({ ...p, departure_date: e.target.value }))} className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Return Date</label>
              <input type="date" value={form.return_date} onChange={(e) => setForm((p) => ({ ...p, return_date: e.target.value }))} className={INPUT_STYLE} />
            </div>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Route size={18} /> Day-by-Day Itinerary
          </h3>
          <div className="space-y-4">
            {itinerary.map((d, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-20 flex-shrink-0">
                  <label className={LABEL_STYLE}>Day</label>
                  <input type="number" min="1" value={d.day_number} onChange={(e) => updateDay(i, 'day_number', parseInt(e.target.value, 10) || 1)} className={INPUT_STYLE} />
                </div>
                <div className="flex-1">
                  <label className={LABEL_STYLE}>Activity</label>
                  <input type="text" value={d.activity} onChange={(e) => updateDay(i, 'activity', e.target.value)} placeholder="e.g. Arrival, sightseeing, lunch..." className={INPUT_STYLE} />
                </div>
                <button type="button" onClick={() => removeDay(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg mt-6" title="Remove">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addDay} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
              <Plus size={18} /> Add Day
            </button>
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Media URLs</h3>
          <p className="text-sm text-gray-500 mb-3">Upload images to storage first, then paste URLs here.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_STYLE}>Logo URL</label>
              <input type="url" value={form.logo_url} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} placeholder="https://..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Banner URL</label>
              <input type="url" value={form.banner_url} onChange={(e) => setForm((p) => ({ ...p, banner_url: e.target.value }))} placeholder="https://..." className={INPUT_STYLE} />
            </div>
          </div>
          <div className="mt-4">
            <label className={LABEL_STYLE}>Gallery URLs (one per line)</label>
            <textarea rows={4} value={form.gallery_urls} onChange={(e) => setForm((p) => ({ ...p, gallery_urls: e.target.value }))} placeholder={'https://...\nhttps://...'} className={INPUT_STYLE} />
          </div>
        </section>

        <section className={SECTION_STYLE}>
          <div>
            <label className={LABEL_STYLE}>Status</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TripStatus }))} className={INPUT_STYLE}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </section>

        <div className="pt-4 flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {editingId ? 'Update Trip' : 'Register Trip'}
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
        <h2 className="text-lg font-semibold text-gray-900">Uploaded Trip Locations (ID below)</h2>
        <p className="text-sm text-gray-500">Edit or delete existing trips. IDs are shown for reference.</p>
      </div>
      {loadingList ? (
        <div className="p-8 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : list.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No trips yet. Create one above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Destination</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Organizer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{row.id}</td>
                  <td className="py-3 px-4 font-medium">{row.destination}</td>
                  <td className="py-3 px-4">{row.organizer_name}</td>
                  <td className="py-3 px-4 text-sm">{row.organizer_email}</td>
                  <td className="py-3 px-4 text-sm">{row.trip_type || '—'}</td>
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
