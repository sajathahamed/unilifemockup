'use client'

import { useState, useCallback } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import AttractionList, { type Place } from './AttractionList'
import ItineraryList, { type ItineraryPlace } from './ItineraryList'
import BudgetPanel, { type BudgetInputs, type BudgetResult } from './BudgetPanel'
import TripSummaryCard from './TripSummaryCard'
import LocationAutocompleteInput from './LocationAutocompleteInput'

const defaultBudgetInputs: BudgetInputs = {
  travelers: 1,
  days: 1,
  hotelBudgetPerNight: 0,
  foodBudgetPerDay: 0,
  transportCostPerKm: 0,
}

export default function TripPlannerClient() {
  const [startLocation, setStartLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryPlace[]>([])
  const [budgetInputs, setBudgetInputs] = useState<BudgetInputs>(defaultBudgetInputs)
  const [budgetResult, setBudgetResult] = useState<BudgetResult | null>(null)
  const [budgetCalculating, setBudgetCalculating] = useState(false)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addedIds = new Set<string | null>(
    itinerary.map((p) => p.id ?? (p as ItineraryPlace & { _key?: string })._key ?? null)
  )

  const fetchPlaces = useCallback(async () => {
    if (!destination.trim()) {
      setError('Enter a destination first')
      return
    }
    setError(null)
    setPlacesLoading(true)
    try {
      const geoRes = await fetch(
        `/api/trip/geocode?address=${encodeURIComponent(destination.trim())}`
      )
      if (!geoRes.ok) {
        const err = await geoRes.json().catch(() => ({}))
        throw new Error(err.message || 'Could not find destination')
      }
      const { lat, lng } = await geoRes.json()
      const res = await fetch(`/api/trip/places?location=${lat},${lng}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch attractions')
      }
      const data = await res.json()
      setPlaces(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch places')
      setPlaces([])
    } finally {
      setPlacesLoading(false)
    }
  }, [destination])

  const fetchDistance = useCallback(async () => {
    if (!startLocation.trim() || !destination.trim()) {
      setError('Enter start location and destination')
      return
    }
    setError(null)
    setDistanceLoading(true)
    try {
      const res = await fetch(
        `/api/trip/distance?origins=${encodeURIComponent(startLocation.trim())}&destinations=${encodeURIComponent(destination.trim())}`
      )
      const errBody = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = errBody.message || 'Could not get distance'
        const hint = errBody.hint ? ` ${errBody.hint}` : ''
        throw new Error(msg + hint)
      }
      setDistanceKm(errBody.distanceKm ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get distance')
      setDistanceKm(null)
    } finally {
      setDistanceLoading(false)
    }
  }, [startLocation, destination])

  const addToItinerary = useCallback((place: Place) => {
    setItinerary((prev) => [
      ...prev,
      { ...place, _key: place.id || `${place.name}-${Date.now()}` },
    ])
  }, [])

  const removeFromItinerary = useCallback((place: ItineraryPlace) => {
    setItinerary((prev) => prev.filter((p) => (p._key ?? p.id) !== (place._key ?? place.id)))
  }, [])

  const calculateBudget = useCallback(async () => {
    setBudgetCalculating(true)
    setError(null)
    try {
      const res = await fetch('/api/trip/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distanceKm: distanceKm ?? 0,
          days: budgetInputs.days,
          travelers: budgetInputs.travelers,
          hotelBudgetPerNight: budgetInputs.hotelBudgetPerNight,
          foodBudgetPerDay: budgetInputs.foodBudgetPerDay,
          transportCostPerKm: budgetInputs.transportCostPerKm,
        }),
      })
      if (!res.ok) throw new Error('Budget calculation failed')
      const data = await res.json()
      setBudgetResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Budget calculation failed')
    } finally {
      setBudgetCalculating(false)
    }
  }, [distanceKm, budgetInputs])

  const saveTrip = useCallback(async () => {
    setSaveLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_location: startLocation.trim(),
          destination: destination.trim(),
          days: budgetInputs.days,
          travelers: budgetInputs.travelers,
          hotel_budget_per_night: budgetInputs.hotelBudgetPerNight,
          food_budget_per_day: budgetInputs.foodBudgetPerDay,
          transport_cost_per_km: budgetInputs.transportCostPerKm,
          total_budget: budgetResult?.totalBudget ?? 0,
          distance_km: distanceKm,
          places: itinerary.map((p) => ({
            place_name: p.name,
            rating: p.rating,
            latitude: p.latitude,
            longitude: p.longitude,
            place_id: p.id,
            image_url: p.imageUrl,
          })),
        }),
      })
      if (res.status === 401) {
        setError('Sign in to save your trip')
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to save trip')
      }
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save trip')
    } finally {
      setSaveLoading(false)
    }
  }, [
    startLocation,
    destination,
    budgetInputs,
    budgetResult,
    distanceKm,
    itinerary,
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Start & Destination
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LocationAutocompleteInput
            label="Start location"
            value={startLocation}
            onChange={setStartLocation}
            placeholder="e.g. Chennai Central"
          />
          <LocationAutocompleteInput
            label="Destination"
            value={destination}
            onChange={setDestination}
            placeholder="e.g. Ooty, Tamil Nadu"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={fetchDistance}
            disabled={distanceLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium disabled:opacity-50"
          >
            {distanceLoading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            Get distance
          </button>
          <button
            type="button"
            onClick={fetchPlaces}
            disabled={placesLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium disabled:opacity-50"
          >
            {placesLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Find attractions
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Attractions near destination</h3>
            <AttractionList
              places={places}
              loading={placesLoading}
              onAdd={addToItinerary}
              addedIds={addedIds}
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your itinerary</h3>
            <ItineraryList places={itinerary} onRemove={removeFromItinerary} />
          </div>
        </div>
        <div className="space-y-6">
          <BudgetPanel
            inputs={budgetInputs}
            onInputsChange={setBudgetInputs}
            result={budgetResult}
            distanceKm={distanceKm}
            onCalculate={calculateBudget}
            calculating={budgetCalculating}
          />
          <TripSummaryCard
            startLocation={startLocation}
            destination={destination}
            days={budgetInputs.days}
            travelers={budgetInputs.travelers}
            totalBudget={budgetResult?.totalBudget ?? null}
            placeCount={itinerary.length}
            onSave={saveTrip}
            saving={saveLoading}
            saved={saved}
          />
        </div>
      </div>
    </div>
  )
}
