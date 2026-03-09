'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Package, CheckCircle, Clock, Search, MapPin } from 'lucide-react'
import { UserRole } from '@/lib/auth'

type FulfillmentStatus = 'pending' | 'picking' | 'packed' | 'shipped' | 'delivered'

interface FulfillmentOrder {
  id: string
  customer: string
  items: number
  status: FulfillmentStatus
  address: string
  placedAt: string
}

const mockFulfillments: FulfillmentOrder[] = [
  { id: '#ORD-2451', customer: 'John D.', items: 3, status: 'picking', address: 'Block 12, Hostel A', placedAt: '5 mins ago' },
  { id: '#ORD-2450', customer: 'Sarah M.', items: 3, status: 'packed', address: 'Dept of Engineering', placedAt: '12 mins ago' },
  { id: '#ORD-2449', customer: 'Mike O.', items: 1, status: 'shipped', address: 'Library, 3rd Floor', placedAt: '20 mins ago' },
  { id: '#ORD-2448', customer: 'Emma W.', items: 2, status: 'delivered', address: 'Student Center', placedAt: '45 mins ago' },
  { id: '#ORD-2446', customer: 'Alex K.', items: 2, status: 'pending', address: 'Lecture Theater 5', placedAt: '1 hour ago' },
]

const statusConfig: Record<FulfillmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100' },
  picking: { label: 'Picking', color: 'text-blue-600', bg: 'bg-blue-100' },
  packed: { label: 'Packed', color: 'text-amber-600', bg: 'bg-amber-100' },
  shipped: { label: 'Shipped', color: 'text-purple-600', bg: 'bg-purple-100' },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-100' },
}

interface VendorFulfillmentClientProps {
  user: { id: number; auth_id: string; name: string; email: string; role: UserRole; avatar_url?: string }
}

export default function VendorFulfillmentClient({ user }: VendorFulfillmentClientProps) {
  const [fulfillments, setFulfillments] = useState<FulfillmentOrder[]>(mockFulfillments)
  const [filter, setFilter] = useState<FulfillmentStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const handleStatusUpdate = (id: string, nextStatus: FulfillmentStatus) => {
    setFulfillments((prev) => prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o)))
  }

  const filtered = fulfillments.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Fulfillment</h1>
          <p className="text-gray-500 mt-1">Track and manage order pick, pack, and ship</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-gray-900">{fulfillments.filter((o) => o.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-gray-900">{fulfillments.filter((o) => ['picking', 'packed', 'shipped'].includes(o.status)).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-xl font-bold text-gray-900">{fulfillments.filter((o) => o.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FulfillmentStatus | 'all')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Placed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const cfg = statusConfig[o.status]
                  return (
                    <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{o.id}</td>
                      <td className="py-3 px-4">{o.customer}</td>
                      <td className="py-3 px-4">{o.items}</td>
                      <td className="py-3 px-4 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm truncate max-w-[120px]">{o.address}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{o.placedAt}</td>
                      <td className="py-3 px-4">
                        {o.status === 'pending' && (
                          <button onClick={() => handleStatusUpdate(o.id, 'picking')} className="text-sm text-primary font-medium hover:underline">Start Picking</button>
                        )}
                        {o.status === 'picking' && (
                          <button onClick={() => handleStatusUpdate(o.id, 'packed')} className="text-sm text-primary font-medium hover:underline">Mark Packed</button>
                        )}
                        {o.status === 'packed' && (
                          <button onClick={() => handleStatusUpdate(o.id, 'shipped')} className="text-sm text-primary font-medium hover:underline">Mark Shipped</button>
                        )}
                        {o.status === 'shipped' && (
                          <button onClick={() => handleStatusUpdate(o.id, 'delivered')} className="text-sm text-primary font-medium hover:underline">Confirm Delivery</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500">No orders match your filters</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
