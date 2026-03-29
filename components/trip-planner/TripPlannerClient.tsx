'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Search, Loader2, Wallet, ChevronRight, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import AttractionList, { type Place } from './AttractionList'
import ItineraryList, { type ItineraryPlace } from './ItineraryList'
import LocationAutocompleteInput from './LocationAutocompleteInput'
import TripPlanDisplay from './TripPlanDisplay'
import SavedTripsSection from './SavedTripsSection'
import { isTripPlan, type TripPlan } from './types'

type Step = 'search' | 'attractions' | 'budget' | 'plan'

export default function TripPlannerClient({ editTripId }: { editTripId?: number } = {}) {
  const [step, setStep] = useState<Step>('search')
  const [startLocation, setStartLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [days, setDays] = useState(1)
  const [daysInput, setDaysInput] = useState('1')
  const [travelers, setTravelers] = useState(1)
  const [travelersInput, setTravelersInput] = useState('1')
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryPlace[]>([])
  const [totalBudget, setTotalBudget] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrating, setHydrating] = useState(!!editTripId)
  const [resolvedTripId, setResolvedTripId] = useState<number | null>(() =>
    editTripId != null ? editTripId : null
  )
  const [origin, setOrigin] = useState('')

  const addedIds = new Set<string | null>(itinerary.map(p => p.id ?? p._key ?? null))

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])

  useEffect(() => {
    if (editTripId != null) setResolvedTripId(editTripId)
  }, [editTripId])

  useEffect(() => {
    if (!editTripId) return
    let cancelled = false
    ;(async () => {
      setHydrating(true)
      setError(null)
      try {
        const res = await fetch(`/api/trip/${editTripId}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Could not load trip')
        if (cancelled) return
        setStartLocation(String(data.start_location ?? ''))
        setDestination(String(data.destination ?? ''))
        const d = Math.max(1, Number(data.days) || 1)
        setDays(d)
        setDaysInput(String(d))
        const tr = Math.max(1, Number(data.travelers) || 1)
        setTravelers(tr)
        setTravelersInput(String(tr))
        setDistanceKm(data.distance_km != null ? Number(data.distance_km) : null)
        const rawPlaces = Array.isArray(data.trip_places) ? data.trip_places : []
        setItinerary(
          rawPlaces.map(
            (p: {
              id?: number
              place_name?: string
              rating?: number | null
              latitude?: number | null
              longitude?: number | null
              place_id?: string | null
              image_url?: string | null
            }) => ({
              id: p.place_id != null ? String(p.place_id) : null,
              name: String(p.place_name ?? ''),
              rating: p.rating != null ? Number(p.rating) : null,
              latitude: p.latitude != null ? Number(p.latitude) : null,
              longitude: p.longitude != null ? Number(p.longitude) : null,
              address: null,
              imageUrl: p.image_url != null ? String(p.image_url) : null,
              _key: `db-${p.id ?? p.place_name}`,
            })
          )
        )
        const tot = Number(data.total_budget ?? data.budget ?? 0)
        setTotalBudget(tot > 0 ? String(Math.round(tot)) : '')
        setSaved(false)
        if (isTripPlan(data.plan_json)) {
          setTripPlan(data.plan_json)
          setStep('plan')
        } else {
          setTripPlan(null)
          setStep(tot > 0 ? 'budget' : 'search')
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load trip')
      } finally {
        if (!cancelled) setHydrating(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [editTripId])

  const fetchDistanceAndPlaces = useCallback(async () => {
    if (!destination.trim()) { setError('Enter a destination'); return }
    setError(null)
    setPlacesLoading(true)
    setDistanceLoading(true)
    try {
      const [geoRes, distRes] = await Promise.all([
        fetch(`/api/trip/geocode?address=${encodeURIComponent(destination.trim())}`),
        startLocation.trim()
          ? fetch(`/api/trip/distance?origins=${encodeURIComponent(startLocation.trim())}&destinations=${encodeURIComponent(destination.trim())}`)
          : Promise.resolve(null),
      ])
      if (!geoRes.ok) throw new Error('Could not find destination')
      const { lat, lng } = await geoRes.json()
      const placesRes = await fetch(`/api/trip/places?location=${lat},${lng}`)
      const data = await placesRes.json()
      setPlaces(Array.isArray(data) ? data : [])
      if (distRes && distRes.ok) {
        const d = await distRes.json()
        setDistanceKm(d.distanceKm ?? null)
      }
      setStep('attractions')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to search')
    } finally {
      setPlacesLoading(false)
      setDistanceLoading(false)
    }
  }, [destination, startLocation])

  const addToItinerary = useCallback((place: Place) => {
    setItinerary(prev => [...prev, { ...place, _key: place.id || `${place.name}-${Date.now()}` }])
  }, [])
  const removeFromItinerary = useCallback((place: ItineraryPlace) => {
    setItinerary(prev => prev.filter(p => (p._key ?? p.id) !== (place._key ?? place.id)))
  }, [])

  const generatePlan = useCallback(async () => {
    const budget = Number(totalBudget)
    if (!budget || budget <= 0) { setError('Enter a valid budget amount'); return }
    setError(null)
    setPlanLoading(true)
    try {
      const res = await fetch('/api/trip/ai-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'plan',
          destination: destination.trim(),
          travelers,
          totalBudget: budget,
          days,
          distanceKm: distanceKm ?? 0,
          places: itinerary.map(p => p.name),
        }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Plan generation failed') }
      const plan = await res.json()
      setTripPlan(plan)
      setStep('plan')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate plan')
    } finally {
      setPlanLoading(false)
    }
  }, [totalBudget, destination, travelers, days, distanceKm, itinerary])

  const saveTrip = useCallback(async () => {
    if (!tripPlan) return
    setSaveLoading(true)
    setError(null)
    try {
      const payload = {
        start_location: startLocation.trim() || 'Not specified',
        destination: destination.trim(),
        days,
        travelers,
        hotel_budget_per_night: Math.round(tripPlan.breakdown.stay / days),
        food_budget_per_day: Math.round(tripPlan.breakdown.food / days),
        transport_cost_per_km: distanceKm ? Math.round(tripPlan.breakdown.travel / distanceKm) : 0,
        total_budget: tripPlan.totalBudget,
        distance_km: distanceKm,
        plan_json: tripPlan,
        places: itinerary.map((p) => ({
          place_name: p.name,
          rating: p.rating,
          latitude: p.latitude,
          longitude: p.longitude,
          place_id: p.id,
          image_url: p.imageUrl,
        })),
      }
      const url = editTripId ? `/api/trip/${editTripId}` : '/api/trip'
      const method = editTripId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        setError('Sign in to save your trip')
        return
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.message || 'Failed to save')
      }
      const data = (await res.json().catch(() => ({}))) as { id?: unknown }
      const newId = Number(data.id)
      if (Number.isFinite(newId)) setResolvedTripId(newId)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save trip')
    } finally {
      setSaveLoading(false)
    }
  }, [tripPlan, startLocation, destination, days, travelers, distanceKm, itinerary, editTripId])

  if (editTripId && hydrating) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-4 py-16 text-gray-600">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-sm font-medium">Loading your trip…</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {editTripId && (
        <div className="surface-card-sm !py-4 flex flex-wrap items-center justify-between gap-3 border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/50">
          <p className="text-sm text-indigo-950 font-medium pl-1">
            Editing trip <span className="tabular-nums">#{editTripId}</span> — save to update your plan and budget.
          </p>
          <Link href="/trip-planner" className="btn-secondary !py-2 text-xs sm:text-sm shrink-0">
            New trip instead
          </Link>
        </div>
      )}

      {/* Step indicator */}
      <div className="surface-card-sm !py-4 !px-3 sm:!px-5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-min sm:gap-2">
          {(['search', 'attractions', 'budget', 'plan'] as Step[]).map((s, i) => {
            const labels = ['Search', 'Attractions', 'Budget', 'Trip plan']
            const active = s === step
            const done =
              ['search', 'attractions', 'budget', 'plan'].indexOf(s) <
              ['search', 'attractions', 'budget', 'plan'].indexOf(step)
            return (
              <div key={s} className="flex items-center gap-1 sm:gap-2 shrink-0">
                {i > 0 && <ChevronRight size={14} className="text-gray-300 hidden sm:inline" />}
                <div
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-primary text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-200/50'
                      : done
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                        : 'bg-gray-100 text-gray-500 border border-transparent'
                  }`}
                >
                  {done && <CheckCircle2 size={14} className="text-emerald-600" />}
                  {labels[i]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200/80 bg-red-50 text-sm text-red-800">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* ── STEP 1: SEARCH ── */}
      {step === 'search' && (
        <div className="surface-card space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-primary">
              <MapPin size={20} strokeWidth={2.25} />
            </span>
            Plan your trip
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <LocationAutocompleteInput label="Start location" value={startLocation} onChange={setStartLocation} placeholder="e.g. Colombo" />
            <LocationAutocompleteInput label="Destination" value={destination} onChange={setDestination} placeholder="e.g. Kandy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Days counter */}
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Days</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button type="button" onClick={() => { const v = Math.max(1, days - 1); setDays(v); setDaysInput(String(v)) }}
                  className="px-4 py-2.5 text-xl font-bold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors select-none">−</button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={daysInput}
                  onChange={e => setDaysInput(e.target.value)}
                  onBlur={() => { const v = Math.max(1, parseInt(daysInput) || 1); setDays(v); setDaysInput(String(v)) }}
                  className="flex-1 text-center font-semibold text-gray-900 text-base py-2.5 border-x border-gray-200 focus:outline-none focus:bg-primary/5 w-0"
                />
                <button type="button" onClick={() => { const v = days + 1; setDays(v); setDaysInput(String(v)) }}
                  className="px-4 py-2.5 text-xl font-bold text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors select-none">+</button>
              </div>
            </div>
            {/* Travelers counter */}
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Travelers</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button type="button" onClick={() => { const v = Math.max(1, travelers - 1); setTravelers(v); setTravelersInput(String(v)) }}
                  className="px-4 py-2.5 text-xl font-bold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors select-none">−</button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={travelersInput}
                  onChange={e => setTravelersInput(e.target.value)}
                  onBlur={() => { const v = Math.max(1, parseInt(travelersInput) || 1); setTravelers(v); setTravelersInput(String(v)) }}
                  className="flex-1 text-center font-semibold text-gray-900 text-base py-2.5 border-x border-gray-200 focus:outline-none focus:bg-primary/5 w-0"
                />
                <button type="button" onClick={() => { const v = travelers + 1; setTravelers(v); setTravelersInput(String(v)) }}
                  className="px-4 py-2.5 text-xl font-bold text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors select-none">+</button>
              </div>
            </div>
          </div>


          <button
            type="button"
            onClick={fetchDistanceAndPlaces}
            disabled={placesLoading || distanceLoading}
            className="btn-primary-lg w-full"
          >
            {placesLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            Find attractions & continue
          </button>
        </div>
      )}

      {/* ── STEP 2: ATTRACTIONS & ITINERARY ── */}
      {step === 'attractions' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Attractions near {destination}</h2>
              {distanceKm && <p className="text-sm text-gray-500">Distance: <strong>{distanceKm} km</strong></p>}
            </div>
            <button type="button" onClick={() => setStep('search')} className="btn-ghost text-sm">
              ← Change destination
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 surface-card-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Nearby Attractions</h3>
              <AttractionList places={places} loading={placesLoading} onAdd={addToItinerary} addedIds={addedIds} />
            </div>
            <div className="space-y-4">
              <div className="surface-card-sm">
                <h3 className="font-semibold text-gray-900 mb-3">My itinerary ({itinerary.length})</h3>
                <ItineraryList places={itinerary} onRemove={removeFromItinerary} />
              </div>
              <button type="button" onClick={() => setStep('budget')} className="btn-primary-lg w-full">
                <Wallet size={18} /> Set budget →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: BUDGET INPUT ── */}
      {step === 'budget' && (
        <div className="max-w-lg mx-auto space-y-5">
          <div className="surface-card">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">What&apos;s your total budget?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Enter your total budget for the trip to {destination} ({days} day{days > 1 ? 's' : ''}, {travelers} traveler{travelers > 1 ? 's' : ''}).
              Our AI will break it down into stay, travel, food, and activities.
            </p>

            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">Rs</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={totalBudget}
                onChange={e => setTotalBudget(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary font-semibold"
              />
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[20000, 50000, 100000, 200000].map(amt => (
                <button key={amt} onClick={() => setTotalBudget(String(amt))}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${totalBudget === String(amt) ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>
                  Rs {amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('attractions')} className="btn-secondary flex-1">
                ← Back
              </button>
              <button
                type="button"
                onClick={generatePlan}
                disabled={planLoading || !totalBudget}
                className="btn-primary flex-[1.4] min-w-0"
              >
                {planLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Generate plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: FULL TRIP PLAN ── */}
      {step === 'plan' && tripPlan && (
        <div className="space-y-5">
          <TripPlanDisplay
            tripPlan={tripPlan}
            shareUrl={
              origin && resolvedTripId != null ? `${origin}/trip-planner/${resolvedTripId}` : null
            }
            actions={
              <button type="button" onClick={() => setStep('budget')} className="btn-secondary !py-2 shrink-0 text-xs sm:text-sm">
                ← Edit budget
              </button>
            }
          />

          <button
            type="button"
            onClick={saveTrip}
            disabled={saveLoading || saved}
            className={`btn-primary-lg w-full ${saved ? '!bg-emerald-600 hover:!bg-emerald-600 shadow-emerald-500/25' : ''}`}
          >
            {saveLoading && <Loader2 size={20} className="animate-spin" />}
            {saveLoading
              ? 'Saving...'
              : saved
                ? editTripId
                  ? '✓ Trip updated!'
                  : '✓ Trip Saved!'
                : editTripId
                  ? 'Save changes'
                  : 'Save This Trip Plan'}
          </button>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </div>
      )}

      {!editTripId && <SavedTripsSection />}
    </div>
  )
}
