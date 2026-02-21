'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  Filter,
  Search
} from 'lucide-react'

interface Order {
  id: string
  customer: string
  phone: string
  items: { name: string; quantity: number; price: number }[]
  totalAmount: number
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  time: string
  location: string
  deliveryTime?: string
  notes?: string
}

const mockOrders: Order[] = [
  {
    id: '#ORD-2451',
    customer: 'John D.',
    phone: '+234 901 234 5678',
    items: [
      { name: 'Jollof Rice', quantity: 2, price: 1200 },
      { name: 'Chicken', quantity: 1, price: 2000 },
      { name: 'Moin Moin', quantity: 1, price: 800 },
    ],
    totalAmount: 5200,
    status: 'new',
    time: '5 mins ago',
    location: 'Block 12, Room 204, Hostel A',
    notes: 'No spice please'
  },
  {
    id: '#ORD-2450',
    customer: 'Sarah M.',
    phone: '+234 902 345 6789',
    items: [
      { name: 'Fried Rice', quantity: 1, price: 1500 },
      { name: 'Fish', quantity: 1, price: 2500 },
      { name: 'Salad', quantity: 1, price: 600 },
    ],
    totalAmount: 4600,
    status: 'preparing',
    time: '12 mins ago',
    location: 'Department of Engineering, Room 105',
    deliveryTime: '5 mins'
  },
  {
    id: '#ORD-2449',
    customer: 'Mike O.',
    phone: '+234 903 456 7890',
    items: [
      { name: 'Beans & Plantain', quantity: 1, price: 1000 },
    ],
    totalAmount: 1000,
    status: 'ready',
    time: '20 mins ago',
    location: 'Library, 3rd Floor',
    deliveryTime: '2 mins'
  },
  {
    id: '#ORD-2448',
    customer: 'Emma W.',
    phone: '+234 904 567 8901',
    items: [
      { name: 'Shawarma', quantity: 2, price: 1800 },
      { name: 'Zobo Drink', quantity: 2, price: 300 },
    ],
    totalAmount: 4200,
    status: 'completed',
    time: '45 mins ago',
    location: 'Student Center',
    deliveryTime: 'Delivered'
  },
  {
    id: '#ORD-2447',
    customer: 'Alex K.',
    phone: '+234 905 678 9012',
    items: [
      { name: 'Chicken & Chips', quantity: 1, price: 2000 },
    ],
    totalAmount: 2000,
    status: 'cancelled',
    time: '1 hour ago',
    location: 'Lecture Theater 5',
  },
]

const statusConfig = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New', color: 'text-blue-600' },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing', color: 'text-yellow-600' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready', color: 'text-green-600' },
  completed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed', color: 'text-purple-600' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', color: 'text-red-600' },
}

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = mockOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  return (
    <DashboardLayout user={{ name: 'Showmika Uthayakumaran', role: 'vendor' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-1">Manage and track all your orders</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, order ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Filter size={18} className="absolute left-3 top-3 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Orders</option>
                <option value="new">New</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Count */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredOrders.length}</span> order(s)
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggle={() => 
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function OrderItem({ 
  order, 
  isExpanded, 
  onToggle 
}: { 
  order: Order
  isExpanded: boolean
  onToggle: () => void
}) {
  const config = statusConfig[order.status]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header / Summary */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          {/* Order ID and Status */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold text-gray-900">{order.id}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">{order.customer} • {order.time}</p>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">RS {order.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown 
          size={20} 
          className={`text-gray-400 ml-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">RS {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Delivery Location</p>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900">{order.location}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Customer Phone</p>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900">{order.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Time / Notes */}
          <div className="grid grid-cols-2 gap-3">
            {order.deliveryTime && (
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Estimated Delivery</p>
                <div className="flex items-start gap-2">
                  <Clock size={16} className={`${config.color} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm font-medium text-gray-900">{order.deliveryTime}</p>
                </div>
              </div>
            )}

            {order.notes && (
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Special Notes</p>
                <p className="text-sm font-medium text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Total Amount</span>
              </div>
              <span className="text-lg font-bold text-gray-900">RS {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {order.status === 'new' && (
              <>
                <button className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Accept Order
                </button>
                <button className="flex-1 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}

            {order.status === 'preparing' && (
              <button className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">
                Mark as Ready
              </button>
            )}

            {order.status === 'ready' && (
              <button className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Confirm Delivery
              </button>
            )}

            {(order.status === 'completed' || order.status === 'cancelled') && (
              <button className="w-full py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed">
                {order.status === 'completed' ? 'Order Completed' : 'Order Cancelled'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
