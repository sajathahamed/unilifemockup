'use client'

import { MapPin, Star, Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { Place } from './AttractionList'

export interface ItineraryPlace extends Place {
  _key?: string
}

interface ItineraryListProps {
  places: ItineraryPlace[]
  onRemove: (place: ItineraryPlace) => void
}

export default function ItineraryList({ places, onRemove }: ItineraryListProps) {
  if (places.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>No places added yet.</p>
        <p className="mt-1">Add attractions from the list on the left.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {places.map((p, index) => {
        const key = p._key ?? p.id ?? `${p.name}-${index}`
        return (
          <li
            key={key}
            className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-2 pr-3"
          >
            <div className="w-12 h-12 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
              {p.rating != null && (
                <p className="flex items-center gap-0.5 text-xs text-amber-600">
                  <Star size={12} fill="currentColor" /> {p.rating}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(p)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove from itinerary"
            >
              <Trash2 size={16} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
