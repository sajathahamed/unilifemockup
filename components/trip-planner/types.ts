export interface TripPlan {
  destination: string
  days: number
  travelers: number
  totalBudget: number
  tier: string
  breakdown: { stay: number; travel: number; food: number; activities: number; emergency: number }
  perPersonBudget: number
  hotelReco: string
  travelReco: string
  foodReco: string
  dailyPlan: { day: number; morning: string; afternoon: string; evening: string; meals: string }[]
  tips: string[]
  warning: string | null
}

export function isTripPlan(x: unknown): x is TripPlan {
  return normalizeTripPlan(x) != null
}

/** Coerce JSON/DB `plan_json` (strings, partial shapes) into a displayable plan. */
export function normalizeTripPlan(x: unknown): TripPlan | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  const destination = o.destination != null ? String(o.destination).trim() : ''
  if (!destination) return null

  const days = Math.max(1, Math.round(Number(o.days) || 1))
  const travelers = Math.max(1, Math.round(Number(o.travelers) || 1))
  const totalBudget = Number(o.totalBudget)
  if (!Number.isFinite(totalBudget)) return null

  const bdRaw = o.breakdown
  if (!bdRaw || typeof bdRaw !== 'object') return null
  const bd = bdRaw as Record<string, unknown>
  const breakdown = {
    stay: Number(bd.stay) || 0,
    travel: Number(bd.travel) || 0,
    food: Number(bd.food) || 0,
    activities: Number(bd.activities) || 0,
    emergency: Number(bd.emergency) || 0,
  }

  const tier = o.tier != null ? String(o.tier) : 'Trip'
  const perPerson = Number(o.perPersonBudget)
  const perPersonBudget = Number.isFinite(perPerson)
    ? perPerson
    : travelers > 0
      ? Math.round(totalBudget / travelers)
      : totalBudget

  const dailyRaw = o.dailyPlan
  if (!Array.isArray(dailyRaw) || dailyRaw.length === 0) return null
  const dailyPlan = dailyRaw.map((row, idx) => {
    const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
    return {
      day: Math.max(1, Math.round(Number(r.day) || idx + 1)),
      morning: r.morning != null ? String(r.morning) : '',
      afternoon: r.afternoon != null ? String(r.afternoon) : '',
      evening: r.evening != null ? String(r.evening) : '',
      meals: r.meals != null ? String(r.meals) : '',
    }
  })

  const tipsRaw = o.tips
  const tips = Array.isArray(tipsRaw) ? tipsRaw.map((t) => String(t)) : []

  return {
    destination,
    days,
    travelers,
    totalBudget,
    tier,
    breakdown,
    perPersonBudget,
    hotelReco: o.hotelReco != null ? String(o.hotelReco) : '',
    travelReco: o.travelReco != null ? String(o.travelReco) : '',
    foodReco: o.foodReco != null ? String(o.foodReco) : '',
    dailyPlan,
    tips,
    warning: o.warning != null && o.warning !== '' ? String(o.warning) : null,
  }
}

export type TripBudgetFields = {
  destination: string
  start_location: string
  days: number
  travelers: number
  hotel_budget_per_night?: number
  food_budget_per_day?: number
  transport_cost_per_km?: number
  total_budget?: number
  budget?: number
  distance_km?: number | null
}

/** When `plan_json` is missing, build a readable plan from DB budget + places. */
export function buildFallbackTripPlan(
  trip: TripBudgetFields,
  placeRows: { place_name: string }[]
): TripPlan {
  const days = Math.max(1, Math.round(Number(trip.days) || 1))
  const travelers = Math.max(1, Math.round(Number(trip.travelers) || 1))
  const total = Number(trip.total_budget ?? trip.budget ?? 0)
  const stay = Number(trip.hotel_budget_per_night || 0) * days
  const food = Number(trip.food_budget_per_day || 0) * days
  const dist = Number(trip.distance_km || 0)
  const travel = Number(trip.transport_cost_per_km || 0) * dist
  const remainder = Math.max(0, total - stay - food - travel)
  const act = Math.round(remainder / 2)
  const breakdown = {
    stay,
    travel,
    food,
    activities: act,
    emergency: remainder - act,
  }
  const names = placeRows.map((p) => p.place_name).filter(Boolean)
  const dailyPlan = Array.from({ length: days }, (_, i) => {
    const slice = names.slice(i * 2, i * 2 + 3)
    const placeHint = slice.length ? slice.join(', ') : 'local highlights'
    return {
      day: i + 1,
      morning:
        i === 0
          ? `Start from ${trip.start_location || 'your origin'}. Suggested focus: ${placeHint}.`
          : `Day ${i + 1}: explore ${trip.destination} — ${placeHint}.`,
      afternoon: names[i] ? `Consider visiting ${names[i]}.` : 'Sightseeing, shopping, or rest.',
      evening: 'Dinner and overnight stay within your saved budget.',
      meals: 'Use your per-day food budget for local meals.',
    }
  })

  const effectiveTotal = total > 0 ? total : stay + food + travel

  return {
    destination: trip.destination,
    days,
    travelers,
    totalBudget: effectiveTotal > 0 ? effectiveTotal : 0,
    tier: 'Saved summary',
    breakdown,
    perPersonBudget: travelers > 0 ? Math.round(effectiveTotal / travelers) : effectiveTotal,
    hotelReco: 'Estimated from your saved per-night accommodation amount.',
    travelReco:
      dist > 0
        ? `About ${dist} km; travel line uses your saved per-km estimate.`
        : 'Travel portion from your saved trip totals.',
    foodReco: 'Based on your saved per-day food budget.',
    dailyPlan,
    tips: [
      'This outline was rebuilt from your saved numbers and places.',
      'Use Edit → Generate My Plan for a fresh AI breakdown anytime.',
    ],
    warning:
      effectiveTotal <= 0
        ? 'No total budget on file — amounts below are estimates from per-day fields only.'
        : null,
  }
}
