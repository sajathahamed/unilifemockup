'use client'

import { Wallet, Hotel, Car, Utensils, ShieldCheck, Star, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { TripPlan } from './types'
import TripPlanExportBar from './TripPlanExportBar'

const formatLKR = (n: number) => `Rs ${Math.round(n).toLocaleString('en-LK')}`

export default function TripPlanDisplay({
  tripPlan,
  actions,
  shareUrl,
}: {
  tripPlan: TripPlan
  actions?: React.ReactNode
  /** Absolute URL to this trip (e.g. after save); enables copy link and richer sharing. */
  shareUrl?: string | null
}) {
  return (
    <div className="space-y-5">
      <div className="surface-card-sm !p-5 sm:!p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Your trip to {tripPlan.destination}
          </h2>
          <p className="text-gray-600 text-sm mt-1.5">
            {tripPlan.days} days · {tripPlan.travelers} traveler{tripPlan.travelers > 1 ? 's' : ''} ·{' '}
            {tripPlan.tier} zone · {formatLKR(tripPlan.perPersonBudget)}/person
          </p>
        </div>
        {actions}
      </div>

      <div className="surface-card-sm !p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-indigo-100/80 bg-gradient-to-r from-indigo-50/50 to-white">
        <p className="text-sm text-gray-700 font-medium">Download a PDF or share your plan.</p>
        <TripPlanExportBar tripPlan={tripPlan} shareUrl={shareUrl} />
      </div>

      {tripPlan.warning && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200/80 bg-amber-50/90 text-sm text-amber-950">
          <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" /> {tripPlan.warning}
        </div>
      )}

      <div className="surface-card-sm !p-5 sm:!p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-primary" /> Budget Breakdown — Total:{' '}
          {formatLKR(tripPlan.totalBudget)}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            [
              { label: 'Stay', icon: Hotel, amount: tripPlan.breakdown.stay, box: 'bg-blue-50', ic: 'text-blue-500', amt: 'text-blue-700' },
              { label: 'Travel', icon: Car, amount: tripPlan.breakdown.travel, box: 'bg-purple-50', ic: 'text-purple-500', amt: 'text-purple-700' },
              { label: 'Food', icon: Utensils, amount: tripPlan.breakdown.food, box: 'bg-orange-50', ic: 'text-orange-500', amt: 'text-orange-700' },
              { label: 'Activities', icon: Star, amount: tripPlan.breakdown.activities, box: 'bg-green-50', ic: 'text-green-500', amt: 'text-green-700' },
              { label: 'Emergency', icon: ShieldCheck, amount: tripPlan.breakdown.emergency, box: 'bg-red-50', ic: 'text-red-500', amt: 'text-red-700' },
            ] as const
          ).map(({ label, icon: Icon, amount, box, ic, amt }) => (
            <div key={label} className={`${box} rounded-xl p-3 text-center`}>
              <Icon size={20} className={`mx-auto ${ic} mb-1`} />
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`font-bold text-sm ${amt}`}>{formatLKR(amount)}</p>
              <p className="text-xs text-gray-400">
                {tripPlan.totalBudget > 0 ? Math.round((amount / tripPlan.totalBudget) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Hotel, title: 'Stay', desc: tripPlan.hotelReco, amount: tripPlan.breakdown.stay, days: tripPlan.days },
          { icon: Car, title: 'Travel', desc: tripPlan.travelReco, amount: tripPlan.breakdown.travel, days: null as number | null },
          { icon: Utensils, title: 'Food', desc: tripPlan.foodReco, amount: tripPlan.breakdown.food, days: tripPlan.days },
        ].map(({ icon: Icon, title, desc, amount, days: dayCount }) => (
          <div key={title} className="surface-card-sm !p-4 border-gray-100">
            <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 mb-2">
              <Icon size={16} className="text-primary" /> {title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">{desc}</p>
            <p className="text-xs text-primary font-medium">
              {formatLKR(amount)} total{' '}
              {dayCount ? `(${formatLKR(Math.round(amount / dayCount))}/day)` : ''}
            </p>
          </div>
        ))}
      </div>

      <div className="surface-card-sm !p-5 sm:!p-6">
        <h3 className="font-bold text-gray-900 mb-4 tracking-tight">📅 Day-by-day itinerary</h3>
        <div className="space-y-4">
          {tripPlan.dailyPlan.map((d) => (
            <div key={d.day} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 hover:bg-gray-50/60 transition-colors">
              <h4 className="font-semibold text-primary mb-2">Day {d.day}</h4>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-500 w-20 inline-block">🌅 Morning:</span> {d.morning}
                </p>
                <p>
                  <span className="font-medium text-gray-500 w-20 inline-block">☀️ Afternoon:</span>{' '}
                  {d.afternoon}
                </p>
                <p>
                  <span className="font-medium text-gray-500 w-20 inline-block">🌇 Evening:</span> {d.evening}
                </p>
                <p>
                  <span className="font-medium text-gray-500 w-20 inline-block">🍽️ Meals:</span> {d.meals}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-5 sm:p-6 shadow-sm ring-1 ring-indigo-100/40">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Smart Travel Tips</h3>
        <ul className="space-y-2">
          {tripPlan.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" /> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
