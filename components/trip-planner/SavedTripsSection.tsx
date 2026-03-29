'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Loader2, MapPin } from 'lucide-react'

type TripRow = {
  id: number
  destination: string
  days: number
  travelers: number
  total_budget?: number
  budget?: number
}

export default function SavedTripsSection() {
  const [trips, setTrips] = useState<TripRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/trip', { credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) setTrips([])
          return
        }
        const data = await res.json()
        if (!cancelled) setTrips(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setTrips([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="surface-card-sm flex items-center gap-3 text-sm text-gray-600">
        <Loader2 size={18} className="animate-spin text-primary" />
        Loading your trips…
      </div>
    )
  }

  if (!trips || trips.length === 0) return null

  return (
    <div className="surface-card space-y-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-primary">
          <MapPin size={20} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">My saved trips</h2>
          <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
            Open a full plan and budget, or edit and update your trip.
          </p>
        </div>
      </div>
      <ul className="space-y-3">
        {trips.map((t) => {
          const total = Number(t.total_budget ?? t.budget ?? 0)
          return (
            <li
              key={t.id}
              className="group flex flex-col gap-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white p-4 transition-all hover:border-indigo-200/80 hover:shadow-md hover:shadow-indigo-500/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                  {t.destination}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.days} day{t.days !== 1 ? 's' : ''} · {t.travelers} traveler{t.travelers !== 1 ? 's' : ''}
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-medium text-gray-700">Rs {Math.round(total).toLocaleString('en-LK')}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/trip-planner/${t.id}`} className="btn-secondary !py-2 !px-3 text-xs sm:text-sm">
                  <Eye size={16} />
                  View
                </Link>
                <Link href={`/trip-planner/${t.id}/edit`} className="btn-primary !py-2 !px-3 text-xs sm:text-sm">
                  <Pencil size={16} />
                  Edit
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
