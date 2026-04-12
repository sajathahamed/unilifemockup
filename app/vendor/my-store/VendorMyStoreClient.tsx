'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Store, MapPin, Phone, Clock, Edit2, Image, X, CheckCircle, XCircle } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface VendorMyStoreClientProps {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

interface StoreData {
  id: number
  name: string
  owner_name: string
  owner_email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  area: string
  description: string
  opening_time: string
  closing_time: string
  logo: string
  banner: string
  is_open: boolean
}

export default function VendorMyStoreClient({ user }: VendorMyStoreClientProps) {
  const [store, setStore] = useState<StoreData | null>(null)
  const [shopType, setShopType] = useState<'food' | 'laundry' | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [form, setForm] = useState<Partial<StoreData>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/vendor/my-store', { cache: 'no-store', headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } })
        const data = await res.json()
        if (data.store) {
          setStore(data.store)
          setShopType(data.shopType)
          setForm(data.store)
        }
      } catch (e) {
        setError('Failed to load store')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store || !shopType) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/vendor/my-store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: store.id,
          shopType,
          name: form.name ?? store.name,
          owner_name: form.owner_name ?? store.owner_name,
          phone: form.phone ?? store.phone,
          whatsapp: form.whatsapp ?? store.whatsapp,
          address: form.address ?? store.address,
          city: form.city ?? store.city,
          area: form.area ?? store.area,
          description: form.description ?? store.description,
          opening_time: form.opening_time ?? store.opening_time,
          closing_time: form.closing_time ?? store.closing_time,
          logo: form.logo ?? store.logo,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to save')
        return
      }
      setStore({ ...store, ...form } as StoreData)
      setForm({ ...store, ...form } as StoreData)
      setShowEditModal(false)
    } catch (e) {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = () => {
    if (store) setForm({ ...store })
    setShowEditModal(true)
  }

  const handleToggleOpen = async () => {
    if (!store || !shopType) return
    setToggleError(null)
    const newState = !store.is_open
    setStore((s) => (s ? { ...s, is_open: newState } : s))
    setToggling(true)
    try {
      const res = await fetch('/api/vendor/my-store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: store.id, shopType, is_open: newState }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStore((s) => (s ? { ...s, is_open: store.is_open } : s))
        setToggleError(data.message || 'Failed to update')
        return
      }
      setStore((s) => (s ? { ...s, is_open: data.is_open ?? newState } : s))
    } catch (e) {
      setStore((s) => (s ? { ...s, is_open: store.is_open } : s))
      setToggleError('Network error — try again')
    } finally {
      setToggling(false)
    }
  }

  const hoursDisplay =
    store?.opening_time && store?.closing_time ? `${store.opening_time} - ${store.closing_time}` : 'Not set'

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading store...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!store || !shopType) {
    return (
      <DashboardLayout user={user}>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
          <p className="text-gray-500">No store assigned to your account. Contact admin to get a store assigned.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
          <p className="text-gray-500 mt-1">Manage your store profile and settings (type cannot be changed)</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <div className="p-6 -mt-12 relative">
                <div className="w-24 h-24 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  {store.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={store.logo} alt={store.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <Store className="w-12 h-12 text-emerald-600" />
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          store.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {store.is_open ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {store.is_open ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-gray-500">{shopType === 'food' ? 'Food Stall' : 'Laundry Shop'}</p>
                  </div>
                  <button
                    onClick={openEdit}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>
                {store.description && <p className="mt-3 text-gray-600 text-sm">{store.description}</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Store Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{store.address || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{store.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Store size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Owner Email (Login)</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Opening Hours</p>
                    <p className="font-medium text-gray-900">{hoursDisplay}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Shop Status</h3>
              {toggleError && (
                <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded-lg">{toggleError}</p>
              )}
              <button
                onClick={handleToggleOpen}
                disabled={toggling}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-colors ${
                  store.is_open
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-60`}
              >
                {store.is_open ? <CheckCircle size={22} /> : <XCircle size={22} />}
                <span>{toggling ? 'Updating...' : store.is_open ? 'Shop Open' : 'Shop Closed'}</span>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {store.is_open ? 'Active — accepting orders' : 'Away — not accepting orders'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Store Type</h3>
              <p className="text-gray-600 text-sm">
                {shopType === 'food' ? 'Food Stall' : 'Laundry Shop'} — assigned by admin and cannot be changed.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Store Image</h3>
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logo} alt={store.name} className="aspect-video w-full rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center text-gray-400">
                    <Image size={40} className="mx-auto mb-2" />
                    <p className="text-sm">No store image</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">You can set one store image from Edit Store.</p>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Store</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  required
                  value={form.name ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input
                  value={form.owner_name ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, owner_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <input
                  readOnly
                  value={shopType === 'food' ? 'Food Stall' : 'Laundry Shop'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-400 mt-0.5">Only super admin can change store type</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  value={form.address ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={form.phone ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  value={form.whatsapp ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={form.opening_time ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, opening_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={form.closing_time ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, closing_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Image URL</label>
                <input
                  value={form.logo ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="https://example.com/store-image.jpg"
                />
              </div>
              {shopType === 'food' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
