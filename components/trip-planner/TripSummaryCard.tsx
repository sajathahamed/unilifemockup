'use client'

import { MapPin, Calendar, Users, Wallet } from 'lucide-react'

interface TripSummaryCardProps {
  startLocation: string
  destination: string
  days: number
  travelers: number
  totalBudget: number | null
  placeCount: number
  onSave?: () => void
  saving?: boolean
  saved?: boolean
}

export default function TripSummaryCard({
  startLocation,
  destination,
  days,
  travelers,
  totalBudget,
  placeCount,
  onSave,
  saving,
  saved,
}: TripSummaryCardProps) {
  const formatNum = (n: number) =>
    Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'

  return (
    <div className="bg-gradient-to-br from-primary/10 to-emerald-50 rounded-2xl border border-primary/20 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Trip Summary</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
          <div>
            <dt className="text-gray-500">From</dt>
            <dd className="font-medium text-gray-900">{startLocation || '—'}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
          <div>
            <dt className="text-gray-500">To</dt>
            <dd className="font-medium text-gray-900">{destination || '—'}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary shrink-0" />
          <span>{days} day(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary shrink-0" />
          <span>{travelers} traveler(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-primary shrink-0" />
          <span>Est. total: ₹ {formatNum(totalBudget ?? 0)}</span>
        </div>
        <div className="text-gray-500">
          {placeCount} place(s) in itinerary
        </div>
      </dl>
      {onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving || saved}
          className="mt-4 w-full py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Trip'}
        </button>
      )}
    </div>
  )
}
