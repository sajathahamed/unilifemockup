import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Hey, {user.name.split(' ')[0]}! 🚴</h1>
          <p className="mt-1 text-yellow-100">Ready to deliver? You have 3 pending orders.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Truck} label="Today's Deliveries" value="8" color="bg-blue-500" />
          <StatCard icon={Clock} label="Avg. Time" value="18 mins" color="bg-green-500" />
          <StatCard icon={DollarSign} label="Today's Earnings" value="₦4,200" color="bg-yellow-500" />
          <StatCard icon={MapPin} label="Distance" value="12.5 km" color="bg-purple-500" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Deliveries */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Deliveries</h2>
              <Link href="/delivery/active" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              <DeliveryCard
                id="#DEL-1234"
                pickup="Campus Café"
                dropoff="Block A, Room 205"
                customer="Stunden"
                distance="0.8 km"
                earnings="₦300"
                status="pickup"
              />
              <DeliveryCard
                id="#DEL-1235"
                pickup="Mama's Kitchen"
                dropoff="Engineering Block"
                customer="Sarah M."
                distance="1.2 km"
                earnings="₦400"
                status="in-transit"
              />
              <DeliveryCard
                id="#DEL-1236"
                pickup="Quick Bites"
                dropoff="Library Entrance"
                customer="Mike O."
                distance="0.5 km"
                earnings="₦250"
                status="waiting"
              />
            </div>
          </div>

          {/* Status & Earnings */}
          <div className="space-y-6">
            {/* Online Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Status</h2>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-green-700">Online</p>
                    <p className="text-xs text-green-600">Accepting orders</p>
                  </div>
                </div>
                <button className="text-sm text-green-700 font-medium hover:underline">
                  Go Offline
                </button>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
              <div className="space-y-3">
                <SummaryItem label="Completed" value="8 deliveries" />
                <SummaryItem label="Total Distance" value="12.5 km" />
                <SummaryItem label="Total Earnings" value="₦4,200" highlight />
                <SummaryItem label="Avg. Rating" value="4.8 ⭐" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
            <Link href="/delivery/history" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View history <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Earnings</th>
                  <th className="pb-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <HistoryRow id="#DEL-1230" route="Café → Block B" time="25 mins ago" earnings="₦350" rating={5} />
                <HistoryRow id="#DEL-1229" route="Kitchen → Hostel C" time="1 hour ago" earnings="₦450" rating={5} />
                <HistoryRow id="#DEL-1228" route="Bites → Library" time="2 hours ago" earnings="₦300" rating={4} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
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
    pickup: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pick up' },
    'in-transit': { bg: 'bg-green-100', text: 'text-green-700', label: 'In Transit' },
  }
  const config = statusConfig[status]

  return (
    <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900">{id}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Package size={14} className="text-blue-500" />
          <span className="text-gray-600">Pick up: <strong>{pickup}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-green-500" />
          <span className="text-gray-600">Drop off: <strong>{dropoff}</strong></span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-500">{customer}</span>
        <span className="text-gray-500">{distance}</span>
        <span className="font-semibold text-green-600">{earnings}</span>
      </div>
      
      {status === 'pickup' && (
        <button className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Navigation size={14} /> Navigate to Pickup
        </button>
      )}
      {status === 'in-transit' && (
        <button className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
          <CheckCircle size={14} /> Mark as Delivered
        </button>
      )}
      {status === 'waiting' && (
        <button className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
          Accept Order
        </button>
      )}
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}

function HistoryRow({ id, route, time, earnings, rating }: {
  id: string; route: string; time: string; earnings: string; rating: number;
}) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3 font-medium text-gray-900">{id}</td>
      <td className="py-3 text-gray-600">{route}</td>
      <td className="py-3 text-gray-500">{time}</td>
      <td className="py-3 font-medium text-green-600">{earnings}</td>
      <td className="py-3">
        <span className="text-yellow-500">{'★'.repeat(rating)}{'☆'.repeat(5-rating)}</span>
      </td>
    </tr>
  )
}
