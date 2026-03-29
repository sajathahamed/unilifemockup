'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'

type Suggestion = {
  placeId: string
  description: string
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

export default function LocationAutocompleteInput(props: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const { label, value, onChange, placeholder } = props

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const debouncedQuery = useDebouncedValue(value, 250)
  const listId = useMemo(
    () => `loc-autocomplete-${label.toLowerCase().replace(/\s+/g, '-')}`,
    [label]
  )

  const abortRef = useRef<AbortController | null>(null)
  const blurCloseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const q = debouncedQuery.trim()
    if (q.length < 2) {
      setSuggestions([])
      setLoading(false)
      setActiveIndex(-1)
      return
    }

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    fetch(`/api/trip/autocomplete?input=${encodeURIComponent(q)}`, { signal: ac.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => [])
        if (!r.ok) throw new Error(body?.message || 'Failed to fetch suggestions')
        return body as Suggestion[]
      })
      .then((items) => {
        setSuggestions(Array.isArray(items) ? items : [])
        setActiveIndex(-1)
        setOpen(true)
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return
        setSuggestions([])
      })
      .finally(() => setLoading(false))

    return () => ac.abort()
  }, [debouncedQuery])

  const select = (s: Suggestion) => {
    onChange(s.description)
    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
  }

  const scheduleClose = () => {
    if (blurCloseTimerRef.current) window.clearTimeout(blurCloseTimerRef.current)
    blurCloseTimerRef.current = window.setTimeout(() => setOpen(false), 150)
  }

  const cancelScheduledClose = () => {
    if (blurCloseTimerRef.current) window.clearTimeout(blurCloseTimerRef.current)
    blurCloseTimerRef.current = null
  }

  return (
    <label className="block relative">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={scheduleClose}
          onKeyDown={(e) => {
            if (!open) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                e.preventDefault()
                select(suggestions[activeIndex])
              }
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
          onMouseDown={cancelScheduledClose}
        >
          <ul id={listId} role="listbox" className="max-h-64 overflow-auto">
            {suggestions.map((s, idx) => (
              <li
                key={s.placeId}
                role="option"
                aria-selected={idx === activeIndex}
                className={[
                  'px-3 py-2 text-sm cursor-pointer',
                  idx === activeIndex ? 'bg-primary/10 text-gray-900' : 'hover:bg-gray-50',
                ].join(' ')}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(s)}
              >
                {s.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </label>
  )
}

