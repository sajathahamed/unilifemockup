import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/trip/ai-budget
 * Two modes:
 *  1. mode="estimate" – smart LKR estimator for hotel/food based on destination
 *  2. mode="plan"    – given total budget, split into stay/travel/eat + full plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { mode = 'estimate', destination, travelers = 1, totalBudget, days = 1, distanceKm = 0, places = [] } = body

    if (!destination) {
      return NextResponse.json({ message: 'Destination is required' }, { status: 400 })
    }

    if (mode === 'plan') {
      if (!totalBudget || Number(totalBudget) <= 0) {
        return NextResponse.json({ message: 'Total budget is required' }, { status: 400 })
      }
      const plan = generateTripPlan({
        destination: String(destination),
        travelers: Number(travelers),
        totalBudget: Number(totalBudget),
        days: Number(days),
        distanceKm: Number(distanceKm),
        places: places as string[],
      })
      return NextResponse.json(plan, { status: 200 })
    }

    // Default: estimate mode
    const estimate = estimateSriLankaTrip(String(destination), Number(travelers))
    return NextResponse.json(estimate, { status: 200 })

  } catch (e) {
    console.error('AI Budget error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Budget estimation failed' },
      { status: 500 }
    )
  }
}


const TIERS = {
  premium: { hotel: [15000, 35000] as [number, number], food: [5000, 10000] as [number, number], transport: [35, 60] as [number, number], label: 'Premium' },
  midrange: { hotel: [7000, 15000] as [number, number], food: [2500, 5000] as [number, number], transport: [20, 35] as [number, number], label: 'Mid-range' },
  budget: { hotel: [3000, 7000] as [number, number], food: [1500, 2500] as [number, number], transport: [10, 20] as [number, number], label: 'Budget' },
}

const PREMIUM_PLACES = [
  'colombo', 'galle', 'mirissa', 'unawatuna', 'sigiriya', 'dambulla',
  'yala', 'bentota', 'tangalle', 'arugam', 'weligama', 'udawalawe',
  'nuwara eliya', 'ella', 'kandy', 'hikkaduwa', 'negombo',
]
const BUDGET_PLACES = [
  'vavuniya', 'anuradhapura', 'trincomalee', 'batticaloa', 'jaffna',
  'mannar', 'polonnaruwa', 'monaragala', 'ampara', 'mullativu',
]

function getTier(destination: string): 'premium' | 'midrange' | 'budget' {
  const d = destination.toLowerCase()
  if (PREMIUM_PLACES.some(k => d.includes(k))) return 'premium'
  if (BUDGET_PLACES.some(k => d.includes(k))) return 'budget'
  return 'midrange'
}

function mid(range: [number, number]): number {
  return Math.round((range[0] + range[1]) / 2)
}

function estimateSriLankaTrip(destination: string, travelers: number) {
  const tier = getTier(destination)
  const prices = TIERS[tier]
  const hotelScale = travelers === 1 ? 1 : 1 + (travelers - 1) * 0.4
  return {
    hotelBudgetPerNight: Math.round(mid(prices.hotel) * hotelScale),
    foodBudgetPerDay: Math.round(mid(prices.food) * travelers),
    tier: prices.label,
    note: `Smart estimate for ${destination} — ${prices.label} zone, ${travelers} traveler${travelers > 1 ? 's' : ''}, in LKR`,
  }
}

// ─────────────────────────────────────────────
// PLAN MODE: split total budget into a full trip plan
// ─────────────────────────────────────────────
interface PlanInput {
  destination: string
  travelers: number
  totalBudget: number
  days: number
  distanceKm: number
  places: string[]
}

interface DayActivity {
  day: number
  morning: string
  afternoon: string
  evening: string
  meals: string
}

interface TripPlan {
  destination: string
  days: number
  travelers: number
  totalBudget: number
  tier: string
  breakdown: {
    stay: number
    travel: number
    food: number
    activities: number
    emergency: number
  }
  perPersonBudget: number
  hotelReco: string
  travelReco: string
  foodReco: string
  dailyPlan: DayActivity[]
  tips: string[]
  warning: string | null
}

function generateTripPlan(input: PlanInput): TripPlan {
  const { destination, travelers, totalBudget, days, distanceKm, places } = input
  const tier = getTier(destination)
  const prices = TIERS[tier]

  // 1. Dynamic Transport Calculation based on distance & tier
  // Prices per KM: Premium (45-60), Mid (30-45), Budget (20-30)
  const transportPerKm = tier === 'premium' ? 50 : tier === 'midrange' ? 35 : 20
  const estimatedMinTransport = Math.round((distanceKm || 0) * transportPerKm)
  
  // Default split: stay 35%, travel 25%, food 28%, activities 7%, emergency 5%
  let split = { stay: 35, travel: 25, food: 28, activities: 7, emergency: 5 }
  
  // Calculate base travel budget
  const baseTravel = Math.round(totalBudget * (split.travel / 100))
  
  // If actual distance requirement is higher than 25%, we steal from Stay/Food (but keep mins)
  let finalTravel = baseTravel
  if (estimatedMinTransport > baseTravel) {
     // Cap travel at 45% of total budget to avoid starving the user
     finalTravel = Math.min(estimatedMinTransport, Math.round(totalBudget * 0.45))
     
     // Re-calculate percentages for everything else
     const remaining = 100 - Math.round((finalTravel / totalBudget) * 100)
     const factor = remaining / (split.stay + split.food + split.activities + split.emergency)
     
     split.stay = Math.round(split.stay * factor)
     split.food = Math.round(split.food * factor)
     split.activities = Math.round(split.activities * factor)
     split.emergency = Math.round(split.emergency * factor)
  }

  const stay       = Math.round(totalBudget * (split.stay / 100))
  const travel     = finalTravel
  const food       = Math.round(totalBudget * (split.food / 100))
  const activities = Math.round(totalBudget * (split.activities / 100))
  const emergency  = Math.round(totalBudget * (split.emergency / 100))

  const hotelPerNight = Math.round(stay / Math.max(days, 1))
  const foodPerDay    = Math.round(food / Math.max(days, 1))

  // Tier-based recommendations
  const tierPrices = TIERS[tier]
  const minHotel = tierPrices.hotel[0] * (travelers === 1 ? 1 : 1 + (travelers - 1) * 0.4)
  const minFood  = tierPrices.food[0] * travelers
  const isUnderbudget = hotelPerNight < minHotel || foodPerDay < minFood

  // Hotel recommendation
  let hotelReco = ''
  if (tier === 'premium') {
    hotelReco = hotelPerNight > 20000 ? 'Boutique resort or 4–5 star hotel' : hotelPerNight > 10000 ? '3–4 star hotel with good amenities' : 'Budget guesthouse or homestay'
  } else if (tier === 'midrange') {
    hotelReco = hotelPerNight > 10000 ? '3-star hotel or villa' : hotelPerNight > 5000 ? 'Guesthouse or modern hostel' : 'Budget hostel or local homestay'
  } else {
    hotelReco = hotelPerNight > 5000 ? 'Local guesthouse' : 'Hostel dorm or local homestay'
  }

  // Improved Travel recommendation based on distance and budget adequacy
  let travelReco = ''
  const transportAdequacy = travel / Math.max(estimatedMinTransport, 1)
  
  if (distanceKm > 0) {
    if (transportAdequacy > 1.2) {
      travelReco = `Private transport route (~${distanceKm} km). Excellent budget — private taxi (AC) or dedicated driver recommended.`
    } else if (transportAdequacy > 0.8) {
      travelReco = `Moderate route (~${distanceKm} km). Balanced budget — consider private hire one-way and local tuk-tuks for sightseeing.`
    } else {
      travelReco = `Long route (~${distanceKm} km). Tight transport budget — prioritizing trains (1st/2nd class) and intercity buses to save money.`
    }
  } else {
    travelReco = `Local transport focus. Budget Rs ${Math.round(travel/days).toLocaleString()}/day — ideal for local tuk-tuks and buses.`
  }

  // Food recommendation
  let foodReco = ''
  if (foodPerDay > 3000 * travelers) {
    foodReco = 'Mix of restaurant dining and local eateries. Comfortable budget for meals.'
  } else if (foodPerDay > 1500 * travelers) {
    foodReco = 'Local restaurants and street food. Sri Lankan rice & curry meals are affordable and delicious.'
  } else {
    foodReco = 'Very tight food budget. Stick to local street food and market meals.'
  }

  // Generate daily plan
  const topPlaces = places.slice(0, Math.min(places.length, days * 2))
  const dailyPlan: DayActivity[] = []
  for (let d = 1; d <= days; d++) {
    const placeSlot = topPlaces.slice((d - 1) * 2, d * 2)
    const morning = placeSlot[0] ? `Visit ${placeSlot[0]}` : `Explore ${destination} city center`
    const afternoon = placeSlot[1] ? `Visit ${placeSlot[1]}` : d === days ? 'Pack and head to departure point' : 'Free time / local market visit'
    const evening = d === days
      ? 'Departure / farewells'
      : d === 1
        ? `Arrive, check-in at hotel, dinner in ${destination}`
        : 'Sunset viewing, dinner at local restaurant'
    dailyPlan.push({
      day: d,
      morning,
      afternoon,
      evening,
      meals: `Rs ${foodPerDay.toLocaleString()} for all meals`,
    })
  }

  // Tips
  const tips = [
    `Book hotels in advance — aim for Rs ${hotelPerNight.toLocaleString()}/night accommodation.`,
    'Download the "PickMe" app for affordable tuk-tuk rides in Sri Lanka.',
    'Local rice & curry meals are just Rs 200–400 — great for saving food budget.',
    'Use LKB (Lanka Bus) or trains for long distances to save travel budget.',
    `Keep Rs ${emergency.toLocaleString()} as emergency fund — don't spend it unless needed.`,
    tier === 'premium' ? 'Pre-book safaris or cultural experiences — they sell out fast.' : 'Bargain at local markets respectfully.',
  ]

  return {
    destination,
    days,
    travelers,
    totalBudget,
    tier: TIERS[tier].label,
    breakdown: { stay, travel, food, activities, emergency },
    perPersonBudget: Math.round(totalBudget / travelers),
    hotelReco,
    travelReco,
    foodReco,
    dailyPlan,
    tips,
    warning: isUnderbudget
      ? `⚠️ Budget may be tight for ${TIERS[tier].label} destination. Consider increasing by Rs ${Math.round(minHotel * days + minFood * days - stay - food).toLocaleString()}.`
      : null,
  }
}
