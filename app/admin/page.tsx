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
} from 'lucide-react';
import { Modal } from '@/components';

// Admin Stats Data
const adminStats = [
  { label: 'Total Students', value: '12,847', change: '+12%', trend: 'up', icon: Users, color: 'bg-blue-500' },
  { label: 'Active Courses', value: '486', change: '+8%', trend: 'up', icon: BookOpen, color: 'bg-green-500' },
  { label: 'Assignments', value: '2,341', change: '+24%', trend: 'up', icon: FileText, color: 'bg-purple-500' },
  { label: 'Events Today', value: '18', change: '-2', trend: 'down', icon: Calendar, color: 'bg-amber-500' },
];

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
  { name: 'Users', icon: Users, href: '#users' },
  { name: 'Courses', icon: BookOpen, href: '#courses' },
  { name: 'Timetable', icon: Calendar, href: '#timetable' },
  { name: 'Announcements', icon: Bell, href: '#announcements' },
  { name: 'Marketplace', icon: ShoppingBag, href: '#marketplace' },
  { name: 'Jobs', icon: Briefcase, href: '#jobs' },
  { name: 'Food Services', icon: UtensilsCrossed, href: '#food' },
  { name: 'Laundry', icon: Shirt, href: '#laundry' },
  { name: 'Rides', icon: Car, href: '#rides' },
  { name: 'Trip Planner', icon: Plane, href: '#trips' },
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

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button onClick={() => openAddModal('user')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Joined</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sampleUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Professor' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Staff' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 text-sm ${
                          user.status === 'Active' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {user.status === 'Active' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.joined}</td>
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
        {!['dashboard', 'users', 'courses'].includes(activeSection) && (
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
