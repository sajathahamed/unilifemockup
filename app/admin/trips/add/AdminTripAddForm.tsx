'use client'

import { useState, useEffect } from 'react'
import {
  digitsOnlyPhone,
  isValidEmail,
  localTodayISODate,
  minLen10IfPresent,
  requireMinLen10,
  validateDateNotPast,
  validatePhone10Required,
  validatePositiveInt,
  validatePositiveNumber,
  validateReturnOnOrAfterDeparture,
} from '@/lib/admin/validation'
import { MapPin, Loader2, Save, Plus, Trash2, Calendar, Route, Edit2 } from 'lucide-react'

const SECTION_STYLE = 'border-b border-gray-200 pb-6 last:border-0'
const LABEL_STYLE = 'block text-sm font-medium text-gray-700 mb-1.5'
const INPUT_STYLE = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900 placeholder:text-gray-400'

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
    const dest = form.destination.trim()
    const orgName = form.organizer_name.trim()
    const orgEmail = form.organizer_email.trim()
    const phone = digitsOnlyPhone(form.phone, 10)
    const whatsapp = digitsOnlyPhone(form.whatsapp, 10)

    const errDest = requireMinLen10(dest, 'Destination')
    if (errDest) return setMessage({ type: 'error', text: errDest })
    const errOrg = requireMinLen10(orgName, 'Organizer name')
    if (errOrg) return setMessage({ type: 'error', text: errOrg })
    if (!orgEmail) return setMessage({ type: 'error', text: 'Organizer email is required.' })
    if (!isValidEmail(orgEmail)) return setMessage({ type: 'error', text: 'Organizer email is invalid.' })
    const errPh = validatePhone10Required(phone, 'Phone number')
    if (errPh) return setMessage({ type: 'error', text: errPh })
    const errWa = validatePhone10Required(whatsapp, 'WhatsApp number')
    if (errWa) return setMessage({ type: 'error', text: errWa })
    const errDesc = requireMinLen10(form.description, 'Description')
    if (errDesc) return setMessage({ type: 'error', text: errDesc })
    const errInc = requireMinLen10(form.inclusions, 'Inclusions')
    if (errInc) return setMessage({ type: 'error', text: errInc })
    const errAddr = requireMinLen10(form.address, 'Address')
    if (errAddr) return setMessage({ type: 'error', text: errAddr })
    const errCity = minLen10IfPresent(form.city, 'City')
    if (errCity) return setMessage({ type: 'error', text: errCity })
    const errArea = minLen10IfPresent(form.area, 'Area / region')
    if (errArea) return setMessage({ type: 'error', text: errArea })
    const errDays = validatePositiveInt(form.days, 'Number of days', true)
    if (errDays) return setMessage({ type: 'error', text: errDays })
    const errBudget = validatePositiveNumber(form.estimated_budget, 'Estimated budget (LKR)', true)
    if (errBudget) return setMessage({ type: 'error', text: errBudget })
    const errMax = validatePositiveInt(form.max_participants, 'Max participants', true)
    if (errMax) return setMessage({ type: 'error', text: errMax })
    if (!form.departure_date.trim()) return setMessage({ type: 'error', text: 'Departure date is required.' })
    if (!form.return_date.trim()) return setMessage({ type: 'error', text: 'Return date is required.' })
    const errDep = validateDateNotPast(form.departure_date, 'Departure date')
    if (errDep) return setMessage({ type: 'error', text: errDep })
    const errRet = validateDateNotPast(form.return_date, 'Return date')
    if (errRet) return setMessage({ type: 'error', text: errRet })
    const errOrder = validateReturnOnOrAfterDeparture(form.departure_date, form.return_date)
    if (errOrder) return setMessage({ type: 'error', text: errOrder })

    const filledItinerary = itinerary.filter((d) => d.activity.trim())
    if (filledItinerary.length === 0) {
      return setMessage({ type: 'error', text: 'Add at least one itinerary day with an activity (min 10 characters).' })
    }
    for (let i = 0; i < filledItinerary.length; i++) {
      const d = filledItinerary[i]
      const dn = validatePositiveInt(String(d.day_number), `Itinerary day #${i + 1} number`, true)
      if (dn) return setMessage({ type: 'error', text: dn })
      const act = requireMinLen10(d.activity, `Itinerary day #${i + 1} activity`)
      if (act) return setMessage({ type: 'error', text: act })
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        phone,
        whatsapp,
        days: form.days ? parseInt(form.days, 10) : null,
        estimated_budget: form.estimated_budget ? parseFloat(form.estimated_budget) : null,
        max_participants: form.max_participants ? parseInt(form.max_participants, 10) : null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/90">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trip location registration</h2>
            <p className="text-sm text-gray-500">Budget, participants, and days must be above 0. Dates cannot be in the past.</p>
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
              <label className={LABEL_STYLE}>Destination * (min 10 characters)</label>
              <input type="text" value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} placeholder="e.g. Ella, Galle Fort" required className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Organizer name * (min 10 characters)</label>
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
              <label className={LABEL_STYLE}>Phone * (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
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
              <label className={LABEL_STYLE}>Description * (min 10 characters)</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="About this trip destination..." className={INPUT_STYLE} />
            </div>
            <div>
              <label className={LABEL_STYLE}>Inclusions * (min 10 characters)</label>
              <textarea rows={3} value={form.inclusions} onChange={(e) => setForm((p) => ({ ...p, inclusions: e.target.value }))} placeholder="Transport, meals, hotel..." className={INPUT_STYLE} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_STYLE}>Number of days * (&gt; 0)</label>
                <input type="number" min="1" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} placeholder="3" className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Estimated budget (LKR) * (&gt; 0)</label>
                <input type="number" step="0.01" min="0.01" value={form.estimated_budget} onChange={(e) => setForm((p) => ({ ...p, estimated_budget: e.target.value }))} placeholder="15000" className={INPUT_STYLE} />
              </div>
            </div>
            <div>
              <label className={LABEL_STYLE}>Max participants * (&gt; 0)</label>
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
              <label className={LABEL_STYLE}>Address * (min 10 characters)</label>
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
              <label className={LABEL_STYLE}>Departure date *</label>
              <input
                type="date"
                min={localTodayISODate()}
                value={form.departure_date}
                onChange={(e) => setForm((p) => ({ ...p, departure_date: e.target.value }))}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Return date *</label>
              <input
                type="date"
                min={form.departure_date || localTodayISODate()}
                value={form.return_date}
                onChange={(e) => setForm((p) => ({ ...p, return_date: e.target.value }))}
                className={INPUT_STYLE}
              />
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
