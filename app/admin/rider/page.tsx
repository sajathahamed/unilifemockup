"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Home,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Settings,
  LogOut,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Phone,
  MessageSquare,
  ChevronRight,
  Play,
  Pause,
  Check,
  XCircle,
  Bike,
  Car,
  BarChart3,
  Calendar,
  User,
  Shirt,
  UtensilsCrossed,
} from 'lucide-react';
import { Modal } from '@/components';
import { riderDashboardData } from '@/mock-data';

// Sidebar Items for Rider
const sidebarItems = [
  { name: 'Dashboard', icon: Home, id: 'dashboard' },
  { name: 'Active Deliveries', icon: Package, id: 'active' },
  { name: 'Ride Bookings', icon: Car, id: 'rides' },
  { name: 'Completed', icon: CheckCircle2, id: 'completed' },
  { name: 'Earnings', icon: DollarSign, id: 'earnings' },
  { name: 'Settings', icon: Settings, id: 'settings' },
];

const statusColors: { [key: string]: { bg: string; text: string; icon: any } } = {
  'Ready for Pickup': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  'Picked Up': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
  'In Progress': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Navigation },
  'Out for Delivery': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck },
  'Delivered': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  'Completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  'Confirmed': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Check },
  'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

const deliveryTypeIcons: { [key: string]: { icon: any; color: string } } = {
  'Food': { icon: UtensilsCrossed, color: 'text-orange-500 bg-orange-100' },
  'Laundry': { icon: Shirt, color: 'text-blue-500 bg-blue-100' },
  'Ride': { icon: Car, color: 'text-purple-500 bg-purple-100' },
};

export default function RiderAdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  const { riderInfo, stats, activeDeliveries, pendingPickups, completedToday, upcomingRides, earningsBreakdown } = riderDashboardData;

  const openModal = (type: string, data?: any) => {
    setModalType(type);
    if (data) setSelectedDelivery(data);
    setShowModal(true);
  };

  const handleStatusUpdate = (deliveryId: string, newStatus: string) => {
    // Mock status update
    console.log(`Delivery ${deliveryId} status changed to ${newStatus}`);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-indigo-800 text-white fixed h-full overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">UniLife</span>
              <span className="text-xs text-blue-300 block">Delivery Rider</span>
            </div>
          </div>
        </div>

        {/* Online/Offline Toggle */}
        <div className="p-4 border-b border-blue-700">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <span className="text-xs">{isOnline ? 'Tap to go offline' : 'Tap to go online'}</span>
          </button>
        </div>

        {/* Rider Info */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-xl">
              🏍️
            </div>
            <div>
              <h3 className="font-semibold text-sm">{riderInfo.name}</h3>
              <div className="flex items-center gap-1 text-xs text-blue-300">
                <Star className="w-3 h-3 fill-current text-amber-400" />
                {riderInfo.rating} ({riderInfo.totalReviews} reviews)
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
                  : 'text-blue-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {item.id === 'active' && stats.activeDelivery > 0 && (
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {stats.activeDelivery}
                </span>
              )}
              {item.id === 'active' && stats.pendingPickups > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  +{stats.pendingPickups}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
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
              {activeSection === 'dashboard' ? 'Rider Dashboard' : 
               activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <p className="text-gray-500">
              {isOnline ? '🟢 You are online and accepting deliveries' : '🔴 You are currently offline'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Earnings</p>
              <p className="text-xl font-bold text-green-600">Rs. {stats.todayEarnings.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
              AK
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Today's Deliveries", value: stats.todayDeliveries, icon: Package, color: 'bg-blue-500', change: '+3', trend: 'up' },
                { label: "Today's Earnings", value: `Rs. ${stats.todayEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', change: '+Rs.800', trend: 'up' },
                { label: 'Active Delivery', value: stats.activeDelivery, icon: Navigation, color: 'bg-purple-500', change: 'In Progress', trend: 'neutral' },
                { label: 'Pending Pickups', value: stats.pendingPickups, icon: Clock, color: 'bg-amber-500', change: 'Waiting', trend: 'neutral' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Active Delivery Card */}
            {activeDeliveries.length > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Navigation className="w-5 h-5 animate-pulse" />
                    Active Delivery
                  </h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {activeDeliveries[0].type}
                  </span>
                </div>
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Order #{delivery.orderId}</p>
                        <p className="text-xl font-semibold">{delivery.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-sm">Amount</p>
                        <p className="text-xl font-bold">Rs. {delivery.amount}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                          <MapPin className="w-4 h-4" />
                          Pickup
                        </div>
                        <p className="font-medium">{delivery.pickup}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                          <Navigation className="w-4 h-4" />
                          Dropoff
                        </div>
                        <p className="font-medium">{delivery.dropoff}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          <Clock className="w-4 h-4 inline mr-1" />
                          ETA: {delivery.estimatedTime}
                        </span>
                        <span className="text-sm">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {delivery.distance}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openModal('update-status', delivery)}
                          className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-white/90 transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Pickups & Upcoming Rides */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Pickups */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Pickups</h2>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {pendingPickups.length} waiting
                  </span>
                </div>
                <div className="space-y-4">
                  {pendingPickups.map((pickup) => {
                    const typeConfig = deliveryTypeIcons[pickup.type];
                    return (
                      <div key={pickup.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                          <typeConfig.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{pickup.customer}</h3>
                            <span className="text-sm font-medium text-gray-900">Rs. {pickup.amount}</span>
                          </div>
                          <p className="text-sm text-gray-500">{pickup.pickup} → {pickup.dropoff}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span><Clock className="w-3 h-3 inline mr-1" />{pickup.scheduledTime}</span>
                            <span><MapPin className="w-3 h-3 inline mr-1" />{pickup.distance}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => openModal('accept-pickup', pickup)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Rides */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Ride Bookings</h2>
                  <button 
                    onClick={() => setActiveSection('rides')}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {upcomingRides.map((ride) => (
                    <div key={ride.id} className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">{ride.passenger}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">Rs. {ride.fare}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Navigation className="w-4 h-4 text-red-500" />
                          <span>{ride.dropoff}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span><Clock className="w-3 h-3 inline mr-1" />{ride.scheduledTime}</span>
                          <span><MapPin className="w-3 h-3 inline mr-1" />{ride.distance}</span>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          {ride.vehicle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed Today */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Completed Today</h2>
                <span className="text-sm text-gray-500">{completedToday.length} deliveries</span>
              </div>
              <div className="space-y-3">
                {completedToday.map((delivery) => {
                  const typeConfig = deliveryTypeIcons[delivery.type];
                  return (
                    <div key={delivery.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                        <typeConfig.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{delivery.customer}</h3>
                          <span className="font-medium text-green-600">+Rs. {delivery.amount}</span>
                        </div>
                        <p className="text-sm text-gray-500">{delivery.pickup} → {delivery.dropoff}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: delivery.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{delivery.completedAt}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active Deliveries Section */}
        {activeSection === 'active' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Active Delivery */}
            {activeDeliveries.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">In Progress</h2>
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg shadow-blue-100/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Navigation className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{delivery.customer}</h3>
                          <p className="text-sm text-gray-500">Order #{delivery.orderId}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg">
                        {delivery.status}
                      </span>
                    </div>

                    {/* Status Progress */}
                    <div className="flex items-center gap-2 mb-6">
                      {['Picked Up', 'In Transit', 'Delivered'].map((step, index) => (
                        <React.Fragment key={step}>
                          <div className={`flex items-center gap-2 ${
                            index === 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {index === 0 ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                            </div>
                            <span className="text-sm font-medium">{step}</span>
                          </div>
                          {index < 2 && <div className={`flex-1 h-1 rounded ${index === 0 ? 'bg-green-200' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
                        <p className="font-medium text-gray-900">{delivery.pickup}</p>
                        <p className="text-xs text-gray-400 mt-1">Picked at {delivery.pickupTime}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Delivery Location</p>
                        <p className="font-medium text-gray-900">{delivery.dropoff}</p>
                        <p className="text-xs text-gray-400 mt-1">ETA: {delivery.estimatedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span><DollarSign className="w-4 h-4 inline" />Rs. {delivery.amount}</span>
                        <span><MapPin className="w-4 h-4 inline" />{delivery.distance}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary gap-2">
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                        <button 
                          onClick={() => openModal('update-status', delivery)}
                          className="btn bg-green-500 hover:bg-green-600 text-white gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Deliveries</h2>
                <p className="text-gray-500">You don't have any deliveries in progress right now.</p>
              </div>
            )}

            {/* Pending Pickups */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Pickups ({pendingPickups.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pendingPickups.map((pickup) => {
                  const typeConfig = deliveryTypeIcons[pickup.type];
                  return (
                    <div key={pickup.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                          <typeConfig.icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{pickup.customer}</h3>
                            <span className="text-lg font-bold text-gray-900">Rs. {pickup.amount}</span>
                          </div>
                          <p className="text-sm text-gray-500">{pickup.type} Delivery</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{pickup.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Navigation className="w-4 h-4 text-red-500" />
                          <span>{pickup.dropoff}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {pickup.scheduledTime}
                        </div>
                        <button className="btn bg-blue-500 hover:bg-blue-600 text-white">
                          Accept Pickup
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Rides Section */}
        {activeSection === 'rides' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Ride Bookings</h2>
              <div className="space-y-4">
                {upcomingRides.map((ride) => (
                  <div key={ride.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Car className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ride.passenger}</h3>
                          <p className="text-sm text-gray-500">{ride.vehicle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">Rs. {ride.fare}</p>
                        <p className="text-sm text-gray-500">{ride.distance}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-red-500" />
                        <span className="text-gray-600">{ride.dropoff}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Scheduled: {ride.scheduledTime}
                      </span>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary">View Details</button>
                        <button className="btn bg-green-500 hover:bg-green-600 text-white">Start Ride</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Completed Section */}
        {activeSection === 'completed' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Deliveries Today</h2>
              <div className="space-y-4">
                {completedToday.map((delivery) => {
                  const typeConfig = deliveryTypeIcons[delivery.type];
                  return (
                    <div key={delivery.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                        <typeConfig.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{delivery.customer}</h3>
                          <span className="text-lg font-bold text-green-600">+Rs. {delivery.amount}</span>
                        </div>
                        <p className="text-sm text-gray-500">{delivery.pickup} → {delivery.dropoff}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-400">{delivery.type}</span>
                          <span className="text-xs text-gray-400">{delivery.distance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          {Array.from({ length: delivery.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{delivery.completedAt}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Earnings Section */}
        {activeSection === 'earnings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Earnings Overview */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-white/80" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">This Month</span>
                </div>
                <p className="text-3xl font-bold">Rs. {stats.monthlyEarnings.toLocaleString()}</p>
                <p className="text-white/70 text-sm">{stats.monthlyDeliveries} deliveries</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-blue-500" />
                  <span className="text-sm text-gray-500">This Week</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">Rs. {stats.weeklyEarnings.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{stats.weeklyDeliveries} deliveries</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-purple-500" />
                  <span className="text-sm text-gray-500">Today</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">Rs. {stats.todayEarnings.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">{stats.todayDeliveries} deliveries</p>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings Breakdown</h2>
              <div className="space-y-4">
                {[
                  { label: 'Food Deliveries', value: earningsBreakdown.foodDeliveries, icon: UtensilsCrossed, color: 'bg-orange-500' },
                  { label: 'Laundry Deliveries', value: earningsBreakdown.laundryDeliveries, icon: Shirt, color: 'bg-blue-500' },
                  { label: 'Ride Bookings', value: earningsBreakdown.rideBookings, icon: Car, color: 'bg-purple-500' },
                  { label: 'Tips', value: earningsBreakdown.tips, icon: Star, color: 'bg-amber-500' },
                  { label: 'Bonuses', value: earningsBreakdown.bonuses, icon: TrendingUp, color: 'bg-green-500' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.label}</p>
                    </div>
                    <p className="font-bold text-gray-900">Rs. {item.value.toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    Rs. {Object.values(earningsBreakdown).reduce((a, b) => a + b, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Rider Settings</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" defaultValue={riderInfo.name} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" defaultValue={riderInfo.email} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" defaultValue={riderInfo.phone} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                    <select className="input" defaultValue={riderInfo.vehicle}>
                      <option>Motorcycle</option>
                      <option>Bicycle</option>
                      <option>Car</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                    <input type="text" defaultValue={riderInfo.vehicleNumber} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
                    <input type="date" defaultValue={riderInfo.licenseExpiry} className="input" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button className="btn btn-secondary">Cancel</button>
                  <button className="btn bg-blue-500 hover:bg-blue-600 text-white">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedDelivery(null); }}
        title={
          modalType === 'update-status' ? 'Update Delivery Status' :
          modalType === 'accept-pickup' ? 'Accept Pickup' : 'Delivery Details'
        }
      >
        <div className="space-y-4">
          {modalType === 'update-status' && selectedDelivery && (
            <>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Order #{selectedDelivery.orderId}</span>
                  <span className="font-medium text-gray-900">Rs. {selectedDelivery.amount}</span>
                </div>
                <p className="font-medium text-gray-900">{selectedDelivery.customer}</p>
                <p className="text-sm text-gray-500">{selectedDelivery.dropoff}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="space-y-2">
                  {['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedDelivery.id, status)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        status === 'Delivered' 
                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-medium">{status}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {modalType === 'accept-pickup' && selectedDelivery && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">New Pickup Request</span>
                </div>
                <p className="text-sm text-blue-700">
                  Accept this pickup to add it to your active deliveries.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium text-gray-900">{selectedDelivery.customer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{selectedDelivery.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-medium text-gray-900">{selectedDelivery.pickup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Dropoff</span>
                  <span className="font-medium text-gray-900">{selectedDelivery.dropoff}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-lg font-bold text-gray-900">Rs. {selectedDelivery.amount}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 btn btn-secondary">
                  Decline
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 btn bg-green-500 hover:bg-green-600 text-white">
                  Accept Pickup
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
