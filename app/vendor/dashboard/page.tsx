import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  Package, 
  DollarSign, 
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function VendorDashboard() {
  const user = await requireRole('vendor')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome, {user.name.split(' ')[0]}! 🏪</h1>
          <p className="mt-1 text-green-100">Manage your store and track orders in real-time.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Today's Orders" value="24" color="bg-blue-500" />
          <StatCard icon={Clock} label="Pending" value="8" color="bg-yellow-500" />
          <StatCard icon={DollarSign} label="Today's Revenue" value="RS 45,200" color="bg-green-500" />
          <StatCard icon={TrendingUp} label="This Week" value="RS 312,500" color="bg-purple-500" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
              <Link href="/vendor/orders" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              <OrderCard
                id="#ORD-2451"
                items="Jollof Rice, Chicken, Moin Moin"
                customer="John D."
                time="5 mins ago"
                status="new"
              />
              <OrderCard
                id="#ORD-2450"
                items="Fried Rice, Fish, Salad"
                customer="Sarah M."
                time="12 mins ago"
                status="preparing"
              />
              <OrderCard
                id="#ORD-2449"
                items="Beans & Plantain"
                customer="Mike O."
                time="20 mins ago"
                status="ready"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <ActionButton href="/vendor/menu/add" label="Add Menu Item" icon={Plus} />
                <ActionButton href="/vendor/menu" label="Manage Menu" icon={Package} />
                <ActionButton href="/vendor/analytics" label="View Analytics" icon={TrendingUp} />
              </div>
            </div>

            {/* Store Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Status</h2>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700">Store is Open</span>
                </div>
                <button className="text-xs text-green-700 hover:underline">Change</button>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Operating hours: 8:00 AM - 8:00 PM
              </div>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Items Today</h2>
            <Link href="/vendor/menu" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              Manage menu <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PopularItem name="Jollof Rice" orders={15} price="RS 1,200" />
            <PopularItem name="Fried Rice" orders={12} price="RS 1,500" />
            <PopularItem name="Chicken & Chips" orders={10} price="RS 2,000" />
            <PopularItem name="Shawarma" orders={8} price="RS 1,800" />
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

function OrderCard({ id, items, customer, time, status }: {
  id: string; items: string; customer: string; time: string;
  status: 'new' | 'preparing' | 'ready';
}) {
  const statusConfig = {
    new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
    preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing' },
    ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready' },
  }
  const config = statusConfig[status]

  return (
    <div className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900">{id}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{items}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{customer}</span>
        <span className="text-gray-400">{time}</span>
      </div>
      {status === 'new' && (
        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
            <CheckCircle size={14} /> Accept
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
            <XCircle size={14} />
          </button>
        </div>
      )}
      {status === 'preparing' && (
        <button className="w-full mt-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">
          Mark as Ready
        </button>
      )}
    </div>
  )
}

function ActionButton({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <Icon size={18} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}

function PopularItem({ name, orders, price }: { name: string; orders: number; price: string }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 text-center">
      <p className="font-medium text-gray-900">{name}</p>
      <p className="text-sm text-gray-500 mt-1">{orders} orders</p>
      <p className="text-sm font-semibold text-green-600 mt-1">{price}</p>
    </div>
  )
}
