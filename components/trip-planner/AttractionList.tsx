'use client'

import { MapPin, Star, Plus } from 'lucide-react'
import Image from 'next/image'

export interface Place {
  id: string | null
  name: string
  rating: number | null
  latitude: number | null
  longitude: number | null
  address: string | null
  imageUrl: string | null
}

interface AttractionListProps {
  places: Place[]
  loading: boolean
  onAdd: (place: Place) => void
  addedIds: Set<string | null>
}

export default function AttractionList({ places, loading, onAdd, addedIds }: AttractionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No attractions found near this destination.</p>
        <p className="text-sm mt-1">Try a different location or check GOOGLE_MAPS_API_KEY.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {places.map((p) => {
        const key = p.id || p.name + String(p.latitude)
        const added = p.id ? addedIds.has(p.id) : addedIds.has(key)
        return (
          <li
            key={key}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-4"
          >
            <div className="w-24 h-24 shrink-0 bg-gray-100 relative">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin size={28} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 py-3 pr-3">
              <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
              {p.rating != null && (
                <p className="flex items-center gap-1 text-sm text-amber-600 mt-0.5">
                  <Star size={14} fill="currentColor" /> {p.rating}
                </p>
              )}
              {p.address && (
                <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                  <MapPin size={12} /> {p.address}
                </p>
              )}
            </div>
            <div className="flex items-center pr-3">
              <button
                type="button"
                onClick={() => onAdd(p)}
                disabled={added}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  added
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                <Plus size={16} /> {added ? 'Added' : 'Add to Trip'}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
