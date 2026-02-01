"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  Bell,
  ShoppingBag,
  Briefcase,
  UtensilsCrossed,
  Car,
  Plane,
  Shirt,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Home,
  FileText,
  MessageSquare,
  Store,
  Truck,
  Package,
  DollarSign,
  Star,
  MapPin,
} from 'lucide-react';
import { Modal } from '@/components';
import { allStudents, shopOwners, deliveryRiders, allOrders, allRideBookings, allLaundryOrders, adminAnalytics } from '@/mock-data';

// Admin Stats Data
const adminStats = [
  { label: 'Total Students', value: '12,847', change: '+12%', trend: 'up', icon: GraduationCap, color: 'bg-blue-500' },
  { label: 'Active Shops', value: '24', change: '+3', trend: 'up', icon: Store, color: 'bg-green-500' },
  { label: 'Delivery Riders', value: '18', change: '+5', trend: 'up', icon: Truck, color: 'bg-purple-500' },
  { label: 'Total Revenue', value: 'Rs. 12.4M', change: '+18%', trend: 'up', icon: DollarSign, color: 'bg-amber-500' },
];

// Order Status Colors
const orderStatusColors: { [key: string]: string } = {
  'Pending': 'bg-amber-100 text-amber-700',
  'Preparing': 'bg-blue-100 text-blue-700',
  'Out for Delivery': 'bg-purple-100 text-purple-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'In Progress': 'bg-indigo-100 text-indigo-700',
  'Confirmed': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-blue-100 text-blue-700',
  'Ready for Pickup': 'bg-purple-100 text-purple-700',
  'Picked Up': 'bg-indigo-100 text-indigo-700',
};

// Recent Activities
const recentActivities = [
  { id: 1, action: 'New student registered', user: 'John Doe', time: '2 mins ago', type: 'user' },
  { id: 2, action: 'Course updated', user: 'Dr. Sarah', time: '15 mins ago', type: 'course' },
  { id: 3, action: 'New announcement posted', user: 'Admin', time: '1 hour ago', type: 'announcement' },
  { id: 4, action: 'Job listing approved', user: 'HR Team', time: '2 hours ago', type: 'job' },
  { id: 5, action: 'Food vendor added', user: 'Cafeteria', time: '3 hours ago', type: 'food' },
];

// Sample Users for Management
const sampleUsers = [
  { id: 1, name: 'Alex Johnson', email: 'alex@university.edu', role: 'Student', status: 'Active', joined: '2025-09-01' },
  { id: 2, name: 'Dr. Sarah Chen', email: 'sarah.chen@university.edu', role: 'Professor', status: 'Active', joined: '2023-01-15' },
  { id: 3, name: 'Mike Wilson', email: 'mike.w@university.edu', role: 'Student', status: 'Inactive', joined: '2024-09-01' },
  { id: 4, name: 'Emily Brown', email: 'emily.b@university.edu', role: 'Staff', status: 'Active', joined: '2024-03-20' },
  { id: 5, name: 'Prof. David Lee', email: 'david.lee@university.edu', role: 'Professor', status: 'Active', joined: '2022-08-10' },
];

// Sample Courses
const sampleCourses = [
  { id: 1, name: 'Data Structures & Algorithms', code: 'CS201', students: 245, professor: 'Dr. Sarah Chen', status: 'Active' },
  { id: 2, name: 'Database Management', code: 'CS301', students: 189, professor: 'Prof. David Lee', status: 'Active' },
  { id: 3, name: 'Web Development', code: 'CS401', students: 312, professor: 'Dr. Emily Rodriguez', status: 'Active' },
  { id: 4, name: 'Machine Learning', code: 'CS501', students: 156, professor: 'Dr. John Smith', status: 'Pending' },
];

// Admin Sidebar Items
const sidebarItems = [
  { name: 'Dashboard', icon: Home, href: '#dashboard', active: true },
  { name: 'Students', icon: GraduationCap, href: '#students' },
  { name: 'Shop Owners', icon: Store, href: '#shops' },
  { name: 'Delivery Riders', icon: Truck, href: '#riders' },
  { name: 'All Orders', icon: Package, href: '#orders' },
  { name: 'Ride Bookings', icon: Car, href: '#rides' },
  { name: 'Laundry Orders', icon: Shirt, href: '#laundry' },
  { name: 'Courses', icon: BookOpen, href: '#courses' },
  { name: 'Announcements', icon: Bell, href: '#announcements' },
  { name: 'Marketplace', icon: ShoppingBag, href: '#marketplace' },
  { name: 'Reports', icon: BarChart3, href: '#reports' },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const openAddModal = (type: string) => {
    setModalType(type);
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed h-full overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">UniLife</span>
              <span className="text-xs text-gray-400 block">Super Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.name.toLowerCase())}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeSection === item.name.toLowerCase()
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 space-y-1">
          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeSection === 'settings'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
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
              {activeSection === 'dashboard' ? 'Admin Dashboard' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <p className="text-gray-500">Manage and monitor UniLife platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-64"
              />
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium">
              SA
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
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

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Add User', icon: Users, color: 'bg-blue-500', type: 'user' },
                  { label: 'Add Course', icon: BookOpen, color: 'bg-green-500', type: 'course' },
                  { label: 'Post Announcement', icon: Bell, color: 'bg-purple-500', type: 'announcement' },
                  { label: 'Create Event', icon: Calendar, color: 'bg-amber-500', type: 'event' },
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => openAddModal(action.type)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity & System Status */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <button className="text-sm text-primary font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {activity.type === 'user' && <Users className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'course' && <BookOpen className="w-5 h-5 text-green-500" />}
                        {activity.type === 'announcement' && <Bell className="w-5 h-5 text-purple-500" />}
                        {activity.type === 'job' && <Briefcase className="w-5 h-5 text-amber-500" />}
                        {activity.type === 'food' && <UtensilsCrossed className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Server Status', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                    { name: 'Database', status: 'Healthy', icon: CheckCircle2, color: 'text-green-500' },
                    { name: 'API Services', status: 'Running', icon: CheckCircle2, color: 'text-green-500' },
                    { name: 'Email Service', status: 'Operational', icon: CheckCircle2, color: 'text-green-500' },
                    { name: 'Storage', status: '78% Used', icon: Clock, color: 'text-amber-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className={`flex items-center gap-2 text-sm font-medium ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Section */}
        {activeSection === 'students' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button onClick={() => openAddModal('student')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Student</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Year</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">GPA</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{student.department}</td>
                      <td className="px-6 py-4 text-gray-600">{student.year}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${student.gpa >= 3.5 ? 'text-green-600' : student.gpa >= 3.0 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {student.gpa}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.status === 'Active' ? 'bg-green-100 text-green-700' :
                          student.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {/* Shop Owners Section */}
        {activeSection === 'shops' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button onClick={() => openAddModal('shop')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add Shop
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopOwners.map((shop) => (
                <div key={shop.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Store className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                        <p className="text-sm text-gray-500">{shop.owner}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shop.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {shop.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-gray-900">{shop.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Orders</span>
                      <span className="font-medium text-gray-900">{shop.totalOrders.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium text-green-600">Rs. {shop.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{shop.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
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

        {/* Delivery Riders Section */}
        {activeSection === 'riders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button onClick={() => openAddModal('rider')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add Rider
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Rider</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Vehicle</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Deliveries</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Earnings</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Rating</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deliveryRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                            {rider.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rider.name}</p>
                            <p className="text-xs text-gray-500">{rider.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{rider.vehicle}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{rider.totalDeliveries}</td>
                      <td className="px-6 py-4 font-medium text-green-600">Rs. {rider.earnings.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{rider.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rider.status === 'Active' ? 'bg-green-100 text-green-700' :
                          rider.status === 'On Delivery' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {rider.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {/* All Orders Section */}
        {activeSection === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    status === 'All' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Shop</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Items</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Rider</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                      <td className="px-6 py-4 text-gray-600">{order.shop}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{order.items}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">Rs. {order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{order.rider || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-500" />
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

        {/* Ride Bookings Section */}
        {activeSection === 'rides' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    status === 'All' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Ride ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Passenger</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Route</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Vehicle</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Fare</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Rider</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allRideBookings.map((ride) => (
                    <tr key={ride.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{ride.id}</td>
                      <td className="px-6 py-4 text-gray-600">{ride.passenger}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{ride.pickup}</p>
                          <p className="text-gray-500">→ {ride.dropoff}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{ride.vehicle}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">Rs. {ride.fare}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[ride.status] || 'bg-gray-100 text-gray-700'}`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{ride.rider || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-500" />
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

        {/* Laundry Orders Section */}
        {activeSection === 'laundry' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    status === 'All' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Service</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Items</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Rider</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allLaundryOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                      <td className="px-6 py-4 text-gray-600">{order.service}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{order.items}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">Rs. {order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{order.rider || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-500" />
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

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Revenue Overview */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-white/80" />
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Total Revenue</span>
                </div>
                <p className="text-3xl font-bold">Rs. {adminAnalytics.platformStats.totalRevenue.toLocaleString()}</p>
                <p className="text-white/70 text-sm">{adminAnalytics.platformStats.totalOrders.toLocaleString()} total orders</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-10 h-10 text-blue-500" />
                  <span className="text-sm text-gray-500">Active Users</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{adminAnalytics.platformStats.activeToday.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Online today</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-10 h-10 text-purple-500" />
                  <span className="text-sm text-gray-500">Orders Today</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{adminAnalytics.ordersByStatus.pending + adminAnalytics.ordersByStatus.preparing}</p>
                <p className="text-gray-500 text-sm">Pending & preparing</p>
              </div>
            </div>

            {/* Revenue Breakdown & Top Performers */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Food Orders', value: adminAnalytics.revenueByCategory.food, color: 'bg-orange-500' },
                    { label: 'Marketplace', value: adminAnalytics.revenueByCategory.marketplace, color: 'bg-blue-500' },
                    { label: 'Rides', value: adminAnalytics.revenueByCategory.rides, color: 'bg-purple-500' },
                    { label: 'Laundry', value: adminAnalytics.revenueByCategory.laundry, color: 'bg-cyan-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-sm font-bold text-gray-900">Rs. {(item.value / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.value / adminAnalytics.platformStats.totalRevenue) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Shops</h2>
                <div className="space-y-4">
                  {adminAnalytics.topShops.map((shop, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{shop.name}</p>
                        <p className="text-sm text-gray-500">{shop.orders} orders</p>
                      </div>
                      <p className="font-bold text-green-600">Rs. {shop.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Riders */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Delivery Riders</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {adminAnalytics.topRiders.map((rider, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{rider.name}</p>
                      <p className="text-sm text-gray-500">{rider.deliveries} deliveries</p>
                    </div>
                    <p className="font-bold text-green-600">Rs. {rider.earnings.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses Section */}
        {activeSection === 'courses' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button onClick={() => openAddModal('course')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sampleCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{course.code}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">{course.name}</h3>
                      <p className="text-sm text-gray-500">{course.professor}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{course.students} Students</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Sections Placeholder */}
        {!['dashboard', 'students', 'shops', 'riders', 'orders', 'rides', 'laundry', 'courses', 'reports', 'announcements', 'marketplace'].includes(activeSection) && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management
            </h2>
            <p className="text-gray-500 mb-6">
              Manage {activeSection} settings, configurations, and data from this section.
            </p>
            <button onClick={() => openAddModal(activeSection)} className="btn btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Add New {activeSection.slice(0, -1)}
            </button>
          </div>
        )}
      </main>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add New ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
      >
        <div className="space-y-4">
          {modalType === 'user' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" placeholder="Enter full name" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" placeholder="Enter email address" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="input">
                  <option>Student</option>
                  <option>Professor</option>
                  <option>Staff</option>
                  <option>Admin</option>
                </select>
              </div>
            </>
          )}
          {modalType === 'course' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input type="text" placeholder="Enter course name" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                <input type="text" placeholder="e.g., CS201" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Professor</label>
                <select className="input">
                  <option>Dr. Sarah Chen</option>
                  <option>Prof. David Lee</option>
                  <option>Dr. Emily Rodriguez</option>
                </select>
              </div>
            </>
          )}
          {modalType === 'announcement' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" placeholder="Announcement title" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea placeholder="Write your announcement..." className="input min-h-[100px]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select className="input">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </>
          )}
          {modalType === 'event' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                <input type="text" placeholder="Enter event name" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input type="datetime-local" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" placeholder="Event location" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea placeholder="Event description..." className="input min-h-[80px]" />
              </div>
            </>
          )}
          {!['user', 'course', 'announcement', 'event'].includes(modalType) && (
            <div className="text-center py-8 text-gray-500">
              <p>Configure {modalType} settings here.</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowAddModal(false)} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button onClick={() => setShowAddModal(false)} className="flex-1 btn btn-primary">
              Create {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
