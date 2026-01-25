"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import {
  todayClasses,
  upcomingDeadlines,
  userProfile,
} from '@/mock-data';
import {
  Clock,
  MapPin,
  User,
  Plus,
  Briefcase,
  UtensilsCrossed,
  Shirt,
  Car,
  Map,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  const quickActions = [
    { name: 'Add Assignment', icon: Plus, href: '#', color: 'bg-primary', onClick: () => setShowAddAssignment(true) },
    { name: 'Part-time Work', icon: Briefcase, href: '/part-time-jobs', color: 'bg-amber-500' },
    { name: 'Order Food', icon: UtensilsCrossed, href: '/food-order', color: 'bg-rose-500' },
    { name: 'Laundry', icon: Shirt, href: '/laundry', color: 'bg-cyan-500' },
    { name: 'Book Ride', icon: Car, href: '/rides', color: 'bg-violet-500' },
    { name: 'Plan Trip', icon: Map, href: '/trip-planner', color: 'bg-emerald-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-secondary/10 text-secondary';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {userProfile.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-white/80">Here's what's happening with your campus life today.</p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <p className="text-xs text-white/70">Today's Classes</p>
              <p className="text-xl font-bold">{todayClasses.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <p className="text-xs text-white/70">Pending Tasks</p>
              <p className="text-xl font-bold">{upcomingDeadlines.filter(d => d.status !== 'completed').length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <p className="text-xs text-white/70">GPA</p>
              <p className="text-xl font-bold">{userProfile.gpa}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              action.onClick ? (
                <button
                  key={action.name}
                  onClick={action.onClick}
                  className="bg-white rounded-xl p-4 text-center card-hover border border-gray-100"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{action.name}</p>
                </button>
              ) : (
                <Link
                  key={action.name}
                  href={action.href}
                  className="bg-white rounded-xl p-4 text-center card-hover border border-gray-100"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{action.name}</p>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Classes */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-gray-900">Today's Classes</h2>
              </div>
              <Link href="/timetable" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {todayClasses.map((cls, index) => (
                <div
                  key={cls.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className="w-1 h-full min-h-[60px] rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{cls.name}</h3>
                    <p className="text-sm text-gray-500">{cls.code}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {cls.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {cls.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {cls.professor}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-danger" />
                <h2 className="font-semibold text-gray-900">Upcoming Deadlines</h2>
              </div>
              <Link href="/assignments" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {upcomingDeadlines.slice(0, 4).map((deadline, index) => (
                <div
                  key={deadline.id}
                  className="p-3 rounded-xl hover:bg-gray-50 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{deadline.title}</h3>
                      <p className="text-sm text-gray-500">{deadline.course}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                      {getStatusIcon(deadline.status)}
                      {deadline.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">
                        Due: {formatDate(deadline.dueDate)} at {deadline.dueTime}
                      </span>
                      <span className="font-medium text-gray-700">{deadline.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full progress-bar"
                        style={{ width: `${deadline.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs text-gray-500">Active Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">Completed Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{userProfile.credits}</p>
                <p className="text-xs text-gray-500">Credits Earned</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">70%</p>
                <p className="text-xs text-gray-500">Semester Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={showAddAssignment}
        onClose={() => setShowAddAssignment(false)}
        title="Add New Assignment"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
            <input type="text" className="input" placeholder="Enter assignment title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="input">
              <option value="">Select a course</option>
              <option value="CS201">CS201 - Data Structures</option>
              <option value="CS301">CS301 - Database Systems</option>
              <option value="CS401">CS401 - Web Development</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
              <input type="time" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input min-h-[100px]" placeholder="Enter assignment details..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              <button type="button" className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:border-primary hover:text-primary transition-colors">
                Low
              </button>
              <button type="button" className="flex-1 py-2 px-4 rounded-xl border border-primary bg-primary/10 text-primary text-sm font-medium">
                Medium
              </button>
              <button type="button" className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:border-primary hover:text-primary transition-colors">
                High
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddAssignment(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setShowAddAssignment(false);
              }}
              className="flex-1 btn btn-primary"
            >
              Add Assignment
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
