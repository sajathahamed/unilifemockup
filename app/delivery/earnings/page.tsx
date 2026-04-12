import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import EarningsTable from '@/components/delivery/EarningsTable'
import type { FC } from 'react'
import { CircleDollarSign, Calendar, Wallet, TrendingUp } from 'lucide-react'

type EarningRow = {
  id: string
  date: string
  kind: 'Food' | 'Laundry'
  trips: number
  amount: string
  status: 'Settled' | 'Pending'
}

const mockRows: EarningRow[] = [
  { id: 'ERN-2401', date: 'Apr 05, 2026', kind: 'Food', trips: 12, amount: 'Rs 5,200', status: 'Settled' },
  { id: 'ERN-2402', date: 'Apr 04, 2026', kind: 'Laundry', trips: 7, amount: 'Rs 3,100', status: 'Settled' },
  { id: 'ERN-2403', date: 'Apr 03, 2026', kind: 'Food', trips: 9, amount: 'Rs 4,050', status: 'Pending' },
]

export default async function DeliveryEarningsPage() {
  const user = await requireRole('delivery')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-7 pb-10">
        <div className="border-b border-stone-200 pb-6">
          <h1 className="font-display text-[1.9rem] font-semibold tracking-[-0.016em] text-gray-900">Earnings</h1>
          <p className="mt-1.5 text-[0.95rem] leading-6 text-gray-600">
            Track payout rhythm, delivery mix, and pending settlements.
          </p>
        </div>

        <div className="flex flex-wrap gap-5">
          <MetricCard
            icon={CircleDollarSign}
            label="Today"
            value="Rs 4,200"
            iconClass="bg-[#e8ebfb] text-[#4a5497]"
            radius="rounded-2xl"
            minWidth="min-w-[190px]"
          />
          <MetricCard
            icon={Wallet}
            label="This week"
            value="Rs 21,850"
            iconClass="bg-emerald-50 text-emerald-700"
            radius="rounded-xl"
            minWidth="min-w-[220px]"
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg / delivery"
            value="Rs 405"
            iconClass="bg-sky-50 text-sky-700"
            radius="rounded-lg"
            minWidth="min-w-[180px]"
          />
          <MetricCard
            icon={Calendar}
            label="Pending payout"
            value="Rs 4,050"
            iconClass="bg-amber-50 text-amber-700"
            radius="rounded-2xl"
            minWidth="min-w-[200px]"
          />
        </div>

        <EarningsTable rows={mockRows} />
      </div>
    </DashboardLayout>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  iconClass,
  radius,
  minWidth,
}: {
  icon: any
  label: string
  value: string
  iconClass: string
  radius: string
  minWidth: string
}) {
  return (
    <article
      className={`flex-1 ${minWidth} ${radius} bg-white border border-stone-200 p-5 shadow-[0_2px_12px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition`}
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl leading-none font-semibold tracking-[-0.02em] text-gray-900">{value}</p>
      <p className="mt-1.5 text-sm text-gray-500">{label}</p>
    </article>
  )
}
