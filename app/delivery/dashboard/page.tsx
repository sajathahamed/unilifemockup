import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
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
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Delivery overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            {firstName}, assign riders and track food and laundry deliveries from one place.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Truck} label="Today's deliveries" value="8" color="bg-primary" />
          <StatCard icon={Clock} label="Avg. time" value="18 mins" color="bg-secondary" />
          <StatCard icon={DollarSign} label="Today's earnings" value="Rs 4,200" color="bg-slate-600" />
          <StatCard icon={MapPin} label="Distance" value="12.5 km" color="bg-slate-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-card p-6 shadow-card border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sample active deliveries</h2>
              <Link href="/delivery/orders" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
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
            <div className="bg-card rounded-card p-6 shadow-card border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your status</h2>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-secondary rounded-full" aria-hidden />
                  <div>
                    <p className="font-medium text-emerald-800">Online</p>
                    <p className="text-xs text-emerald-700">Accepting assignments</p>
                  </div>
                </div>
                <button type="button" className="text-sm text-emerald-800 font-medium hover:underline">
                  Go offline
                </button>
              </div>
            </div>

            <div className="bg-card rounded-card p-6 shadow-card border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
              <div className="space-y-3">
                <SummaryItem label="Completed" value="8 deliveries" />
                <SummaryItem label="Total earnings" value="Rs 4,200" highlight />
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/delivery/laundry"
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
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

        <div className="bg-card rounded-card p-6 shadow-card border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent deliveries</h2>
            <Link href="/delivery/orders" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
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

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <div className="bg-card rounded-card p-4 shadow-card border border-gray-200">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function DeliveryCard({ id, pickup, dropoff, customer, distance, earnings, status }: {
  id: string; pickup: string; dropoff: string; customer: string; distance: string; earnings: string;
  status: 'waiting' | 'pickup' | 'in-transit';
}) {
  const statusConfig = {
    waiting: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Waiting' },
    pickup: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pick up' },
    'in-transit': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'In transit' },
  }
  const config = statusConfig[status]

  return (
    <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900">{id}</span>
        <span className={`text-xs px-2 py-1 rounded-md ${config.bg} ${config.text}`}>
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

      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-500">{customer}</span>
        <span className="text-gray-500">{distance}</span>
        <span className="font-medium text-emerald-700">{earnings}</span>
      </div>

      {status === 'pickup' && (
        <button type="button" className="w-full py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Navigation size={14} /> Navigate to pickup
        </button>
      )}
      {status === 'in-transit' && (
        <button type="button" className="w-full py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
          <CheckCircle size={14} /> Mark delivered
        </button>
      )}
      {status === 'waiting' && (
        <button type="button" className="w-full py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
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
