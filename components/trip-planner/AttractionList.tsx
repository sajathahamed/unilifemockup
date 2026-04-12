'use client'

import { Loader2, Plus, Star } from 'lucide-react'
import { useState } from 'react'

export interface Place {
  id: string | null
  name: string
  rating: number | null
  latitude: number | null
  longitude: number | null
  address: string | null
  description: string | null
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
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 size={24} className="animate-spin mr-2" />
        Finding attractions…
      </div>
    )
  }

  if (places.length === 0) {
    return <p className="text-sm text-gray-500 py-6 text-center">No attractions found near this location.</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {places.map((place, idx) => (
        <AttractionCard 
          key={place.id ?? `${place.name}-${idx}`} 
          place={place} 
          added={addedIds.has(place.id)} 
          onAdd={() => onAdd(place)} 
        />
      ))}
    </div>
  )
}

function AttractionCard({ place, added, onAdd }: { place: Place; added: boolean; onAdd: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 hover:border-indigo-200 transition-colors">
      {place.imageUrl && (
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-20 w-20 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{place.name}</p>
        
        {place.rating != null && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            {place.rating.toFixed(1)}
          </p>
        )}
        
        {place.description && (
          <div 
            className="mt-1 cursor-pointer group" 
            onClick={() => setExpanded(!expanded)}
          >
            <p
              className="text-xs text-gray-600 leading-relaxed transition-all"
              style={expanded ? {} : {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {place.description}
            </p>
            {!expanded && place.description.length > 80 && (
              <span className="text-[10px] text-primary/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Read more</span>
            )}
          </div>
        )}
        
        {!place.description && place.address && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>
        )}
      </div>
      
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className={`shrink-0 self-center p-2 rounded-lg transition-colors ${
          added
            ? 'bg-emerald-100 text-emerald-600 cursor-default'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
        title={added ? 'Added' : 'Add to itinerary'}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
