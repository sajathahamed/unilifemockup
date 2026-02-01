"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Home,
  ShoppingBag,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  Truck,
  ChefHat,
  BarChart3,
} from 'lucide-react';
import { Modal } from '@/components';
import { shopOwnerData } from '@/mock-data';

// Sidebar Items for Shop Owner
const sidebarItems = [
  { name: 'Dashboard', icon: Home, id: 'dashboard' },
  { name: 'Orders', icon: ClipboardList, id: 'orders' },
  { name: 'Menu Items', icon: UtensilsCrossed, id: 'menu' },
  { name: 'Marketplace', icon: ShoppingBag, id: 'marketplace' },
  { name: 'Analytics', icon: BarChart3, id: 'analytics' },
  { name: 'Settings', icon: Settings, id: 'settings' },
];

const orderStatusColors: { [key: string]: string } = {
  'Pending': 'bg-amber-100 text-amber-700',
  'Preparing': 'bg-blue-100 text-blue-700',
  'Ready': 'bg-purple-100 text-purple-700',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

export default function ShopOwnerAdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { shopInfo, stats, recentOrders, menuItems, marketplaceItems } = shopOwnerData;

  const openModal = (type: string, data?: any) => {
    setModalType(type);
    if (data) setSelectedOrder(data);
    setShowModal(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // Mock status update - in real app would call API
    console.log(`Order ${orderId} status changed to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-emerald-900 to-teal-800 text-white fixed h-full overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">UniLife</span>
              <span className="text-xs text-emerald-300 block">Shop Owner</span>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="p-4 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
              🍕
            </div>
            <div>
              <h3 className="font-semibold text-sm">{shopInfo.name}</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-300">
                <Star className="w-3 h-3 fill-current text-amber-400" />
                {shopInfo.rating} ({shopInfo.totalReviews} reviews)
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-emerald-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {item.id === 'orders' && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700">
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeSection === 'dashboard' ? 'Shop Dashboard' : 
               activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <p className="text-gray-500">Welcome back, {shopInfo.owner}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none w-64"
              />
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
              MG
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Today's Orders", value: stats.todayOrders, icon: ClipboardList, color: 'bg-blue-500', change: '+12%', trend: 'up' },
                { label: "Today's Revenue", value: `Rs. ${stats.todayRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', change: '+8%', trend: 'up' },
                { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-500', change: '-2', trend: 'down' },
                { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'bg-purple-500', change: '+0.1', trend: 'up' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-amber-500'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <button 
                    onClick={() => setActiveSection('orders')}
                    className="text-sm text-emerald-600 font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{order.customer}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-md">{order.items}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-medium text-gray-900">Rs. {order.total}</span>
                          <span className="text-xs text-gray-400">{order.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'Pending' && (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'Preparing')}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'Ready')}
                            className="px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        <button 
                          onClick={() => openModal('order-details', order)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Add Menu Item', icon: Plus, color: 'bg-emerald-500', action: () => openModal('add-menu') },
                    { label: 'View Analytics', icon: BarChart3, color: 'bg-blue-500', action: () => setActiveSection('analytics') },
                    { label: 'Manage Stock', icon: Package, color: 'bg-amber-500', action: () => setActiveSection('menu') },
                    { label: 'Shop Settings', icon: Settings, color: 'bg-gray-500', action: () => setActiveSection('settings') },
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Weekly Summary */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">This Week</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Orders</span>
                      <span className="text-sm font-medium text-gray-900">{stats.weeklyOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Revenue</span>
                      <span className="text-sm font-medium text-green-600">Rs. {stats.weeklyRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {activeSection === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Order Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    status === 'All' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status}
                  {status === 'Pending' && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.pendingOrders}</span>}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Items</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Time</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{order.items}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">Rs. {order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{order.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Items Section */}
        {activeSection === 'menu' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button onClick={() => openModal('add-menu')} className="btn bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Menu Item
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-gray-900">Rs. {item.price}</span>
                      {item.originalPrice && (
                        <span className="ml-2 text-sm text-gray-400 line-through">Rs. {item.originalPrice}</span>
                      )}
                    </div>
                    {item.popular && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`flex items-center gap-1 text-sm ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                      {item.available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Section */}
        {activeSection === 'marketplace' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <p className="text-gray-500">Manage items you're selling in the student marketplace</p>
              <button onClick={() => openModal('add-product')} className="btn bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-3xl">
                      {item.image}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">Rs. {item.price}</span>
                    <span className="text-sm text-gray-500">Stock: {item.stock}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{item.sales} sold</span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Overview */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">This Month</p>
                      <p className="text-2xl font-bold text-green-600">Rs. {stats.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">This Week</p>
                      <p className="text-lg font-bold text-gray-900">Rs. {stats.weeklyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Today</p>
                      <p className="text-lg font-bold text-gray-900">Rs. {stats.todayRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Overview */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">Total Orders This Month</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.monthlyOrders}</p>
                    </div>
                    <ClipboardList className="w-10 h-10 text-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">This Week</p>
                      <p className="text-lg font-bold text-gray-900">{stats.weeklyOrders}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">Today</p>
                      <p className="text-lg font-bold text-gray-900">{stats.todayOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
              <div className="space-y-3">
                {menuItems.filter(i => i.popular).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Rs. {item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">156 orders</p>
                      <p className="text-sm text-green-600">+12% this week</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shop Settings</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                    <input type="text" defaultValue={shopInfo.name} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                    <input type="text" defaultValue={shopInfo.owner} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" defaultValue={shopInfo.email} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" defaultValue={shopInfo.phone} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
                    <input type="text" defaultValue={shopInfo.openingHours} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius</label>
                    <input type="text" defaultValue={shopInfo.deliveryRadius} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea defaultValue={shopInfo.description} className="input min-h-[100px]" />
                </div>
                <div className="flex justify-end gap-3">
                  <button className="btn btn-secondary">Cancel</button>
                  <button className="btn bg-emerald-500 hover:bg-emerald-600 text-white">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedOrder(null); }}
        title={
          modalType === 'add-menu' ? 'Add Menu Item' :
          modalType === 'add-product' ? 'Add Marketplace Product' :
          modalType === 'order-details' ? 'Order Details' : 'Modal'
        }
      >
        <div className="space-y-4">
          {modalType === 'add-menu' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input type="text" placeholder="e.g., Margherita Pizza" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                  <input type="number" placeholder="1200" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="input">
                    <option>Pizza</option>
                    <option>Sides</option>
                    <option>Drinks</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea placeholder="Describe your item..." className="input min-h-[80px]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="available" className="rounded" defaultChecked />
                <label htmlFor="available" className="text-sm text-gray-700">Available for order</label>
              </div>
            </>
          )}
          {modalType === 'add-product' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input type="text" placeholder="e.g., Chef Apron Set" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                  <input type="number" placeholder="1800" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input type="number" placeholder="10" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="input">
                  <option>Equipment</option>
                  <option>Accessories</option>
                  <option>Books</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea placeholder="Describe your product..." className="input min-h-[80px]" />
              </div>
            </>
          )}
          {modalType === 'order-details' && selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer}</p>
                <p className="text-sm text-gray-500">{selectedOrder.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Items</p>
                <p className="font-medium text-gray-900">{selectedOrder.items}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-500">Total</span>
                <span className="text-xl font-bold text-gray-900">Rs. {selectedOrder.total}</span>
              </div>
              {selectedOrder.status === 'Pending' && (
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 btn bg-red-500 hover:bg-red-600 text-white">Reject</button>
                  <button className="flex-1 btn bg-emerald-500 hover:bg-emerald-600 text-white">Accept Order</button>
                </div>
              )}
            </div>
          )}
          {!['order-details'].includes(modalType) && (
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 btn btn-secondary">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 btn bg-emerald-500 hover:bg-emerald-600 text-white">
                {modalType === 'add-menu' ? 'Add Item' : 'Add Product'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
