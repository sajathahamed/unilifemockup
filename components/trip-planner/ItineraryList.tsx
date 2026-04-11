'use client'

import { X } from 'lucide-react'
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
    return <p className="text-sm text-gray-400 text-center py-4">No places added yet. Pick from nearby attractions.</p>
  }

  return (
    <ul className="space-y-2">
      {places.map((place) => (
        <li
          key={place._key ?? place.id ?? place.name}
          className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2"
        >
          <span className="text-sm font-medium text-gray-800 truncate">{place.name}</span>
          <button
            type="button"
            onClick={() => onRemove(place)}
            className="p-1 rounded-md hover:bg-red-100 text-red-500 shrink-0"
            aria-label={`Remove ${place.name}`}
          >
            <X size={14} />
          </button>
        </li>
      ))}
    </ul>
  )
}
