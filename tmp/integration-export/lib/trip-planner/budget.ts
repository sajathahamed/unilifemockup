/**
 * Trip Planner – budget estimation
 * Travel Cost = distance × transport cost per km
 * Hotel Cost = hotel per night × number of nights (days)
 * Food Cost = food per day × travelers × days
 * Total = Travel + Hotel + Food
 */

export interface BudgetInput {
  distanceKm: number
  days: number
  travelers: number
  hotelBudgetPerNight: number
  foodBudgetPerDay: number
  transportCostPerKm: number
}

export interface BudgetResult {
  travelCost: number
  hotelCost: number
  foodCost: number
  totalBudget: number
  breakdown: {
    travel: number
    hotel: number
    food: number
  }
}

export function calculateTripBudget(input: BudgetInput): BudgetResult {
  const {
    distanceKm,
    days,
    travelers,
    hotelBudgetPerNight,
    foodBudgetPerDay,
    transportCostPerKm,
  } = input

  const travelCost = Math.max(0, distanceKm * transportCostPerKm)
  const nights = Math.max(0, days - 0) // nights = days (same day return = 0 nights if you want; here we use days as nights for multi-day)
  const hotelCost = Math.max(0, hotelBudgetPerNight * days) // hotel per night × number of nights (using days as nights)
  const foodCost = Math.max(0, foodBudgetPerDay * travelers * days)

  const totalBudget = travelCost + hotelCost + foodCost

  return {
    travelCost,
    hotelCost,
    foodCost,
    totalBudget,
    breakdown: {
      travel: travelCost,
      hotel: hotelCost,
      food: foodCost,
    },
  }
}
