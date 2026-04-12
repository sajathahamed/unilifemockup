import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

/**
 * POST /api/trip/ai-budget
 * Two modes:
 *  1. mode="estimate" – smart LKR estimator for hotel/food based on destination
 *  2. mode="plan"    – given total budget, split into stay/travel/eat + full plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { mode = 'estimate', destination, travelers = 1, totalBudget, days = 1, distanceKm = 0, places = [], startLocation = 'Not specified' } = body

    if (!destination) {
      return NextResponse.json({ message: 'Destination is required' }, { status: 400 })
    }

    if (mode === 'plan') {
      if (!totalBudget || Number(totalBudget) <= 0) {
        return NextResponse.json({ message: 'Total budget is required' }, { status: 400 })
      }
      
      const planVars: PlanInput = {
        startLocation: String(startLocation),
        destination: String(destination),
        travelers: Number(travelers),
        totalBudget: Number(totalBudget),
        days: Number(days),
        distanceKm: Number(distanceKm),
        places: places as string[],
      }

      try {
        const aiPlan = await generateAITripPlan(planVars)
        return NextResponse.json(aiPlan, { status: 200 })
      } catch (aiError) {
        console.warn('AI plan generation failed, falling back to rule-based generation:', aiError)
        const plan = generateTripPlan(planVars)
        return NextResponse.json(plan, { status: 200 })
      }
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

// Zod Schema matching TripPlan interface
const tripPlanSchema = z.object({
  destination: z.string(),
  days: z.number(),
  travelers: z.number(),
  totalBudget: z.number(),
  tier: z.string(),
  breakdown: z.object({
    stay: z.number(),
    travel: z.number(),
    food: z.number(),
    activities: z.number(),
    emergency: z.number(),
  }),
  perPersonBudget: z.number(),
  hotelReco: z.string(),
  travelReco: z.string(),
  foodReco: z.string(),
  dailyPlan: z.array(z.object({
    day: z.number(),
    morning: z.string(),
    afternoon: z.string(),
    evening: z.string(),
    meals: z.string(),
    timeline: z.array(z.object({
      time: z.string().describe('Time in HH:MM AM/PM format'),
      title: z.string().describe('Short title of activity or location'),
      description: z.string().describe('Detailed description or tip'),
      type: z.string().describe('Categorize the activity (e.g. flight, transport, hotel, food, activity, coffee)'),
      lat: z.number().nullable().describe('Latitude of the location. MUST provide a valid GPS coordinate.'),
      lng: z.number().nullable().describe('Longitude of the location. MUST provide a valid GPS coordinate.'),
    })).min(3).describe('Strict chronological timeline of all full day activities'),
  })),
  tips: z.array(z.string()),
  warning: z.string().nullable(),
})

async function generateAITripPlan(input: PlanInput) {
  const { startLocation, destination, travelers, totalBudget, days, places, distanceKm } = input
  
  const tierInfo = getTier(destination)
  const tierStr = tierInfo === 'premium' ? 'Luxury' : tierInfo === 'midrange' ? 'Medium' : 'Low'

  const sysPrompt = `You are a professional travel planner specializing in local travel.
Create a highly accurate, time-planned detailed trip itinerary based on the following details:

Destination: ${destination}
Starting Location: ${startLocation || 'Unknown'}
Number of Days: ${days}
Number of People: ${travelers}
Total Budget: Rs ${totalBudget} LKR
Budget Type: ${tierStr}
Preferred Attractions (MUST include ALL of these in the timeline): ${places.join(', ')}

Requirements:
1. Generate an accurate full-day, day-by-day itinerary incorporating travel times and realistic durations.
2. Under "timeline", map out each activity strictly chronologically providing exact times (e.g. 08:30 AM, 10:00 AM) and categorize it under 'type'.
3. **CRITICAL**: Do NOT use generic names like "Find Lunch", "Local Restaurant", or "Arrive at Hotel". You must provide specific, well-rated names of actual restaurants and hotels in or near ${destination} that fit the ${tierStr} budget.
4. For lunch and dinner, suggest specific, existing food spots.
5. For the stay, suggest a specific, real hotel or guesthouse name that fits the Rs ${totalBudget} budget constraint.
6. Suggest nearby places to visit to optimize routes.
7. **CRITICAL**: Provide accurate \`lat\` and \`lng\` coordinates for every suggested location and activity to allow path drawing on maps.
8. Ensure the itinerary is complete from check-in/start on Day 1 until departure on the final day.
5. Provide a short description for each place or activity under the timeline.
6. Estimate total budget breakdown (must absolutely sum to exactly ${totalBudget}):
    - stay (Accommodation, calculate for exactly ${days > 1 ? days - 1 : 0} nights at ${tierStr} rates)
    - food
    - travel (Transport, distance is roughly ${distanceKm} km)
    - activities (Entry fees, tours)
    - emergency
7. Keep the plan realistic and suitable for the given budget in Sri Lankan Rupees (LKR).
8. Ensure perPersonBudget exactly equals Total Budget divided by travelers.
9. Make the recommendations (hotelReco, travelReco, foodReco) practical, descriptive, and fitting the budget.
10. **MANDATORY**: You must include EVERY SINGLE ONE of the 'Preferred Attractions' in the itinerary timeline. Spread them out across the days if necessary, but do NOT skip any of them.
11. **GEOGRAPHY**: Logically sequence all stops based on their physical map route (minimize travel time). Do not jump randomly between distant locations.
`

  const { object } = await generateObject({
    model: google('gemini-1.5-flash'),
    schema: tripPlanSchema,
    prompt: sysPrompt,
  })

  // Ensure strict overrides
  object.destination = destination
  object.days = days
  object.travelers = travelers
  object.totalBudget = totalBudget
  object.perPersonBudget = Math.round(totalBudget / Math.max(1, travelers))
  
  return object
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
  startLocation: string
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
  timeline?: { time: string; title: string; description: string; type: string }[]
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
  
  // 2. Dynamic Budget Split
  // User says 35% for stay on a 2-day trip is too much. 
  // Correct logic: stay should be proportional to (Days - 1) nights.
  const nightCount = Math.max(0, days - 1)
  
  // Base percentages for a standard 4-day trip
  const baseSplit = { stay: 35, travel: 25, food: 28, activities: 7, emergency: 5 }
  
  // Dynamic Stay Calculation: If 1 day trip, stay = 0. If 2 day, stay = 1/2 of base (~17.5%)
  // Scale stay based on actual nights vs expected days
  const stayFactor = days > 0 ? nightCount / days : 0
  const dynamicStayPerc = Math.round(baseSplit.stay * (days === 1 ? 0 : days === 2 ? 0.6 : 1))
  
  let split = { ...baseSplit, stay: dynamicStayPerc }
  
  // Re-balance remaining split to sum to 100
  const currentSum = split.stay + split.travel + split.food + split.activities + split.emergency
  const rebalanceFactor = (100 - split.stay) / (100 - baseSplit.stay)
  
  split.travel = Math.round(baseSplit.travel * rebalanceFactor)
  split.food = Math.round(baseSplit.food * rebalanceFactor)
  split.activities = Math.round(baseSplit.activities * rebalanceFactor)
  split.emergency = 100 - (split.stay + split.travel + split.food + split.activities)

  const stay       = Math.round(totalBudget * (split.stay / 100))
  const travel     = Math.max(estimatedMinTransport, Math.round(totalBudget * (split.travel / 100)))
  const food       = Math.round(totalBudget * (split.food / 100))
  const activities = Math.round(totalBudget * (split.activities / 100))
  const emergency  = totalBudget - (stay + travel + food + activities)

  const hotelPerNight = nightCount > 0 ? Math.round(stay / nightCount) : 0
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
  const dailyPlan: DayActivity[] = []
  const placesPerDay = Math.max(1, Math.ceil(places.length / days))

  for (let d = 1; d <= days; d++) {
    const placeSlot = places.slice((d - 1) * placesPerDay, d * placesPerDay)
    
    const timeline = []
    let hour = 9

    if (placeSlot.length === 0) {
      timeline.push({ time: '09:00 AM', title: `Explore ${destination}`, description: `Start the day exploring ${destination}.`, type: 'activity' })
      hour = 12
    } else {
      placeSlot.forEach((place, index) => {
        const timePrefix = hour < 12 ? 'AM' : 'PM'
        const displayHour = hour > 12 ? hour - 12 : hour
        const timeStr = `${displayHour < 10 ? '0' : ''}${displayHour}:00 ${timePrefix}`
        timeline.push({ 
          time: timeStr, 
          title: place, 
          description: `Enjoy visiting ${place}.`, 
          type: 'activity' 
        })
        hour += 2 // Give 2 hours per attraction
      })
    }

    if (hour <= 13) hour = 13
    timeline.push({ time: '01:30 PM', title: 'Lunch at popular local eatery', description: 'Enjoy authentic Sri Lankan cuisine at a well-rated local restaurant.', type: 'food' })
    hour = Math.max(hour, 15)

    timeline.push({ 
      time: '07:00 PM', 
      title: d === days ? 'Prepare for Departure' : 'Check-in at recommended stay', 
      description: d === days ? 'Final wraps and heading to exit point.' : 'Spend the night at a budget-friendly guesthouse or hotel.', 
      type: 'hotel' 
    })

    // Sort timeline chronologically to prevent 1:30 PM lunch dropping to the bottom
    timeline.sort((a, b) => {
      const parseTime = (t: string) => {
        const [time, period] = t.split(' ')
        const [h, m] = time.split(':').map(Number)
        let hours = h
        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
        return hours * 60 + m
      }
      return parseTime(a.time) - parseTime(b.time)
    })

    const morning = placeSlot[0] ? `Visit ${placeSlot[0]}` : `Explore ${destination} city center`
    const afternoon = placeSlot.length > 1 ? `Visit ${placeSlot[placeSlot.length - 1]}` : d === days ? 'Pack and head to departure point' : 'Free time / local market visit'
    const evening = d === days ? 'Departure / farewells' : d === 1 ? `Arrive, check-in at hotel, dinner in ${destination}` : 'Sunset viewing, dinner at local restaurant'

    dailyPlan.push({
      day: d,
      morning,
      afternoon,
      evening,
      meals: `Rs ${foodPerDay.toLocaleString()} for all meals`,
      timeline
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
