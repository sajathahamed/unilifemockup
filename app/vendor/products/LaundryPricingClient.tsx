'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Loader2, Save } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface Props {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

type PricingState = {
  wash_only_per_kg: number
  wash_iron_per_kg: number
  normal_dress_wash_only: number
  normal_dress_wash_iron: number
  shirt_per_item: number
  trouser_per_item: number
  frock_per_item: number
  saree_per_item: number
  coat_per_item: number
  suit_per_item: number
  bedsheet_per_item: number
  blanket_per_item: number
  curtain_per_item: number
  pickup_available: boolean
}

const DEFAULT_PRICING: PricingState = {
  wash_only_per_kg: 200,
  wash_iron_per_kg: 250,
  normal_dress_wash_only: 220,
  normal_dress_wash_iron: 280,
  shirt_per_item: 120,
  trouser_per_item: 140,
  frock_per_item: 220,
  saree_per_item: 300,
  coat_per_item: 300,
  suit_per_item: 450,
  bedsheet_per_item: 250,
  blanket_per_item: 450,
  curtain_per_item: 220,
  pickup_available: true,
}

export default function LaundryPricingClient({ user }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shopName, setShopName] = useState('Laundry Shop')
  const [pricing, setPricing] = useState<PricingState>(DEFAULT_PRICING)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/vendor/laundry-pricing')
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => null), status: r.status }))
      .then(({ ok, data, status }) => {
        if (!ok) throw new Error(data?.message || `Failed to load pricing (HTTP ${status})`)
        setShopName(data?.shop_name || 'Laundry Shop')
        setPricing({
          wash_only_per_kg: Number(data?.pricing?.wash_only_per_kg ?? DEFAULT_PRICING.wash_only_per_kg),
          wash_iron_per_kg: Number(data?.pricing?.wash_iron_per_kg ?? DEFAULT_PRICING.wash_iron_per_kg),
          normal_dress_wash_only: Number(data?.pricing?.normal_dress_wash_only ?? DEFAULT_PRICING.normal_dress_wash_only),
          normal_dress_wash_iron: Number(data?.pricing?.normal_dress_wash_iron ?? DEFAULT_PRICING.normal_dress_wash_iron),
          shirt_per_item: Number(data?.pricing?.shirt_per_item ?? DEFAULT_PRICING.shirt_per_item),
          trouser_per_item: Number(data?.pricing?.trouser_per_item ?? DEFAULT_PRICING.trouser_per_item),
          frock_per_item: Number(data?.pricing?.frock_per_item ?? DEFAULT_PRICING.frock_per_item),
          saree_per_item: Number(data?.pricing?.saree_per_item ?? DEFAULT_PRICING.saree_per_item),
          coat_per_item: Number(data?.pricing?.coat_per_item ?? DEFAULT_PRICING.coat_per_item),
          suit_per_item: Number(data?.pricing?.suit_per_item ?? DEFAULT_PRICING.suit_per_item),
          bedsheet_per_item: Number(data?.pricing?.bedsheet_per_item ?? DEFAULT_PRICING.bedsheet_per_item),
          blanket_per_item: Number(data?.pricing?.blanket_per_item ?? DEFAULT_PRICING.blanket_per_item),
          curtain_per_item: Number(data?.pricing?.curtain_per_item ?? DEFAULT_PRICING.curtain_per_item),
          pickup_available: Boolean(data?.pricing?.pickup_available ?? DEFAULT_PRICING.pickup_available),
        })
      })
      .catch((e) => setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to load pricing.' }))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/vendor/laundry-pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || `Failed to save (HTTP ${res.status})`)
      setMessage({ type: 'success', text: 'Pricing updated successfully.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to save pricing.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laundry Products & Pricing</h1>
          <p className="text-gray-500 mt-1">Set professional service prices for {shopName}.</p>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Per Kg Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Wash only (1kg) - RS" value={pricing.wash_only_per_kg} onChange={(v) => setPricing((p) => ({ ...p, wash_only_per_kg: v }))} />
            <Field label="Wash & iron (1kg) - RS" value={pricing.wash_iron_per_kg} onChange={(v) => setPricing((p) => ({ ...p, wash_iron_per_kg: v }))} />
            <Field label="Normal dress wash only - RS" value={pricing.normal_dress_wash_only} onChange={(v) => setPricing((p) => ({ ...p, normal_dress_wash_only: v }))} />
            <Field label="Normal dress wash + iron - RS" value={pricing.normal_dress_wash_iron} onChange={(v) => setPricing((p) => ({ ...p, normal_dress_wash_iron: v }))} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">Most Demanded Garments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Gents shirt (per item) - RS" value={pricing.shirt_per_item} onChange={(v) => setPricing((p) => ({ ...p, shirt_per_item: v }))} />
            <Field label="Gents trouser (per item) - RS" value={pricing.trouser_per_item} onChange={(v) => setPricing((p) => ({ ...p, trouser_per_item: v }))} />
            <Field label="Ladies frock (per item) - RS" value={pricing.frock_per_item} onChange={(v) => setPricing((p) => ({ ...p, frock_per_item: v }))} />
            <Field label="Saree (per item) - RS" value={pricing.saree_per_item} onChange={(v) => setPricing((p) => ({ ...p, saree_per_item: v }))} />
            <Field label="Coat (per item) - RS" value={pricing.coat_per_item} onChange={(v) => setPricing((p) => ({ ...p, coat_per_item: v }))} />
            <Field label="Suit / professional wear (per item) - RS" value={pricing.suit_per_item} onChange={(v) => setPricing((p) => ({ ...p, suit_per_item: v }))} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">Household Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Bedsheet (per item) - RS" value={pricing.bedsheet_per_item} onChange={(v) => setPricing((p) => ({ ...p, bedsheet_per_item: v }))} />
            <Field label="Blanket (per item) - RS" value={pricing.blanket_per_item} onChange={(v) => setPricing((p) => ({ ...p, blanket_per_item: v }))} />
            <Field label="Curtain (per item) - RS" value={pricing.curtain_per_item} onChange={(v) => setPricing((p) => ({ ...p, curtain_per_item: v }))} />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={pricing.pickup_available}
                onChange={(e) => setPricing((p) => ({ ...p, pickup_available: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Pickup & delivery available
            </label>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Pricing
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

