import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DeliveryStatusCard from '@/components/delivery/DeliveryStatusCard'
import type { LucideIcon } from 'lucide-react'
import {
  Truck,
  DollarSign,
  Clock,
  MapPin,
  ArrowRight,
  Navigation,
  CheckCircle,
  Package
} from 'lucide-react'
import Link from 'next/link'

export default async function DeliveryDashboard() {
  const user = await requireRole('delivery')
  const firstName = user.name.split(' ')[0]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-7">
        <div className="border-b border-stone-200 pb-6">
          <h1 className="font-display text-[1.95rem] font-semibold tracking-[-0.018em] text-gray-900">Delivery overview</h1>
          <p className="mt-1.5 text-[0.95rem] leading-6 text-gray-600">
            {firstName}, assign riders and track food and laundry deliveries from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-5">
          <StatCard icon={Truck} label="Today's deliveries" value="8" color="bg-[#e8ebfb] text-[#4a5497]" minWidth="min-w-[180px]" radius="rounded-2xl" />
          <StatCard icon={Clock} label="Avg. time" value="18 mins" color="bg-emerald-50 text-emerald-700" minWidth="min-w-[170px]" radius="rounded-xl" />
          <StatCard icon={DollarSign} label="Today's earnings" value="Rs 4,200" color="bg-sky-50 text-sky-700" minWidth="min-w-[220px]" radius="rounded-2xl" />
          <StatCard icon={MapPin} label="Distance" value="12.5 km" color="bg-stone-100 text-stone-700" minWidth="min-w-[160px]" radius="rounded-lg" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(36,45,72,0.08)] border border-stone-200 hover:-translate-y-0.5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-[1.08rem] font-semibold tracking-[-0.01em] text-gray-900">Sample active deliveries</h2>
              <Link href="/delivery/orders" className="text-sm text-[#4a5497] hover:text-[#3e4678] flex items-center gap-1.5 font-medium">
                Open orders <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              <DeliveryCard
                id="#DEL-1234"
                pickup="Campus Café"
                dropoff="Block A, Room 205"
                customer="Stunden"
                distance="0.8 km"
                earnings="Rs 300"
                status="pickup"
              />
              <DeliveryCard
                id="#DEL-1235"
                pickup="Mama's Kitchen"
                dropoff="Engineering Block"
                customer="Sarah M."
                distance="1.2 km"
                earnings="Rs 400"
                status="in-transit"
              />
              <DeliveryCard
                id="#DEL-1236"
                pickup="Quick Bites"
                dropoff="Library Entrance"
                customer="Mike O."
                distance="0.5 km"
                earnings="Rs 250"
                status="waiting"
              />
            </div>
          </div>

          <div className="space-y-6">
            <DeliveryStatusCard />

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(36,45,72,0.08)] border border-stone-200 hover:-translate-y-0.5 hover:shadow-md transition">
              <h2 className="font-display text-[1.04rem] font-semibold tracking-[-0.01em] text-gray-900 mb-4">Today</h2>
              <div className="space-y-3">
                <SummaryItem label="Completed" value="8 deliveries" />
                <SummaryItem label="Total earnings" value="Rs 4,200" highlight />
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/delivery/laundry"
                    className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Laundry jobs</span>
                    </div>
                    <ArrowRight size={14} className="text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(24,34,56,0.07)] border border-stone-200 hover:-translate-y-0.5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[1.02rem] font-semibold tracking-[-0.012em] text-gray-900">Recent deliveries</h2>
            <Link href="/delivery/orders" className="text-sm text-[#4a5497] hover:text-[#3e4678] flex items-center gap-1.5 font-medium">
              View in orders <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Earnings</th>
                  <th className="pb-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <HistoryRow id="#DEL-1230" route="Café → Block B" time="25 mins ago" earnings="Rs 350" rating={5} />
                <HistoryRow id="#DEL-1229" route="Kitchen → Hostel C" time="1 hour ago" earnings="Rs 450" rating={5} />
                <HistoryRow id="#DEL-1228" route="Bites → Library" time="2 hours ago" earnings="Rs 300" rating={4} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, label, value, color, minWidth, radius }: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  minWidth: string;
  radius: string;
}) {
  return (
    <div className={`flex-1 ${minWidth} ${radius} bg-white p-5 border border-stone-200 shadow-[0_2px_12px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition`}>
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl leading-none font-semibold tracking-[-0.02em] text-gray-900">{value}</p>
      <p className="mt-1.5 text-sm leading-5 text-gray-500">{label}</p>
    </div>
  )
}

function DeliveryCard({ id, pickup, dropoff, customer, distance, earnings, status }: {
  id: string; pickup: string; dropoff: string; customer: string; distance: string; earnings: string;
  status: 'waiting' | 'pickup' | 'in-transit';
}) {
  const statusConfig = {
    waiting: {
      bg: 'bg-stone-50',
      text: 'text-stone-700',
      border: 'border-stone-200',
      dot: 'bg-stone-500',
      label: 'Waiting',
      accent: 'border-l-stone-300',
    },
    pickup: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Pick up',
      accent: 'border-l-amber-300',
    },
    'in-transit': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      label: 'In transit',
      accent: 'border-l-blue-300',
    },
  }
  const config = statusConfig[status]

  return (
    <div className={`p-5 rounded-xl border border-stone-200 border-l-4 ${config.accent} shadow-[0_2px_10px_rgba(30,41,59,0.07)] hover:-translate-y-0.5 hover:shadow-md transition`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900 tracking-[-0.01em]">{id}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Package size={14} className="text-gray-400 shrink-0" />
          <span className="text-gray-600">Pick up: <span className="font-medium text-gray-900">{pickup}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <span className="text-gray-600">Drop off: <span className="font-medium text-gray-900">{dropoff}</span></span>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate">{customer}</p>
          <p className="text-xs text-gray-500 mt-0.5">Distance {distance}</p>
        </div>
        <span className="font-medium text-emerald-700">{earnings}</span>
      </div>

      {status === 'pickup' && (
        <button type="button" className="inline-flex min-w-[190px] py-2.5 px-4 bg-[#5f6db8] text-white text-sm font-medium rounded-lg hover:bg-[#4e5ba0] transition-colors items-center justify-center gap-2">
          <Navigation size={14} /> Navigate to pickup
        </button>
      )}
      {status === 'in-transit' && (
        <button type="button" className="inline-flex min-w-[170px] py-2.5 px-4 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors items-center justify-center gap-2">
          <CheckCircle size={14} /> Mark delivered
        </button>
      )}
      {status === 'waiting' && (
        <button type="button" className="inline-flex min-w-[150px] py-2.5 px-4 bg-stone-100 text-gray-800 text-sm font-medium rounded-lg hover:bg-stone-200 transition-colors">
          Accept order
        </button>
      )}
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}

function HistoryRow({ id, route, time, earnings, rating }: {
  id: string; route: string; time: string; earnings: string; rating: number;
}) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 font-medium text-gray-900">{id}</td>
      <td className="py-3 text-gray-600">{route}</td>
      <td className="py-3 text-gray-500">{time}</td>
      <td className="py-3 font-medium text-emerald-700">{earnings}</td>
      <td className="py-3">
        <span className="text-amber-600">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
      </td>
    </tr>
  )
}
