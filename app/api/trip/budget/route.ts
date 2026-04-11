import { NextRequest, NextResponse } from 'next/server'
import { calculateTripBudget } from '@/lib/trip-planner/budget'

/**
 * POST /api/trip/budget
 * Calculate estimated trip budget from distance and user inputs.
 * Body: { distanceKm, days, travelers, hotelBudgetPerNight, foodBudgetPerDay, transportCostPerKm }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      distanceKm = 0,
      days = 1,
      travelers = 1,
      hotelBudgetPerNight = 0,
      foodBudgetPerDay = 0,
      transportCostPerKm = 0,
    } = body

    const result = calculateTripBudget({
      distanceKm: Number(distanceKm),
      days: Math.max(1, Number(days)),
      travelers: Math.max(1, Number(travelers)),
      hotelBudgetPerNight: Number(hotelBudgetPerNight),
      foodBudgetPerDay: Number(foodBudgetPerDay),
      transportCostPerKm: Number(transportCostPerKm),
    })

    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    console.error('Trip budget error:', e)
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Budget calculation failed' },
      { status: 500 }
    )
  }
}
