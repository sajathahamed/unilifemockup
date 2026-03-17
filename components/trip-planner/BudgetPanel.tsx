'use client'

import { Calculator, Car, Hotel, Utensils, Wallet } from 'lucide-react'

export interface BudgetInputs {
  travelers: number
  days: number
  hotelBudgetPerNight: number
  foodBudgetPerDay: number
  transportCostPerKm: number
}

export interface BudgetResult {
  travelCost: number
  hotelCost: number
  foodCost: number
  totalBudget: number
  breakdown: { travel: number; hotel: number; food: number }
}

interface BudgetPanelProps {
  inputs: BudgetInputs
  onInputsChange: (inputs: BudgetInputs) => void
  result: BudgetResult | null
  distanceKm: number | null
  onCalculate: () => void
  calculating: boolean
}

export default function BudgetPanel({
  inputs,
  onInputsChange,
  result,
  distanceKm,
  onCalculate,
  calculating,
}: BudgetPanelProps) {
  const formatNum = (n: number) =>
    Number.isFinite(n)
      ? n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : '0'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <Calculator size={20} className="text-primary" />
        Budget Estimation
      </h3>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Travelers</span>
          <input
            type="number"
            min={1}
            value={inputs.travelers}
            onChange={(e) => onInputsChange({ ...inputs, travelers: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Days</span>
          <input
            type="number"
            min={1}
            value={inputs.days}
            onChange={(e) => onInputsChange({ ...inputs, days: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Hotel budget per night (₹)</span>
          <input
            type="number"
            min={0}
            step={50}
            value={inputs.hotelBudgetPerNight || ''}
            onChange={(e) => onInputsChange({ ...inputs, hotelBudgetPerNight: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Food budget per day (₹)</span>
          <input
            type="number"
            min={0}
            step={50}
            value={inputs.foodBudgetPerDay || ''}
            onChange={(e) => onInputsChange({ ...inputs, foodBudgetPerDay: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Transport cost per km (₹)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={inputs.transportCostPerKm || ''}
            onChange={(e) => onInputsChange({ ...inputs, transportCostPerKm: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </label>
      </div>

      {distanceKm != null && (
        <p className="text-sm text-gray-500 mt-2">
          Distance: <strong>{distanceKm} km</strong>
        </p>
      )}

      <button
        type="button"
        onClick={onCalculate}
        disabled={calculating}
        className="mt-4 w-full py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {calculating ? (
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Calculator size={18} />
        )}
        Calculate Budget
      </button>

      {result && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><Car size={14} /> Travel</span>
            <span>Rs. {formatNum(result.travelCost)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><Hotel size={14} /> Hotel</span>
            <span>Rs. {formatNum(result.hotelCost)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><Utensils size={14} /> Food</span>
            <span>Rs. {formatNum(result.foodCost)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-gray-900 pt-2">
            <span className="flex items-center gap-1.5"><Wallet size={16} /> Total</span>
            <span>Rs. {formatNum(result.totalBudget)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
