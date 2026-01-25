"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components';
import { courses } from '@/mock-data';
import { BookOpen, Users, TrendingUp, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const tabs = [
    { name: 'Notes', href: '/notes', icon: BookOpen },
    { name: 'Study Groups', href: '/study-groups', icon: Users },
    { name: 'Marketplace', href: '/marketplace', icon: Star },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500">Manage your enrolled courses and resources</p>
        </div>

        {/* Course Hub Tabs */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Course Hub</h2>
          <div className="grid grid-cols-3 gap-3">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <tab.icon className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{tab.name}</p>
                  <p className="text-xs text-gray-500">View all</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Your Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="h-3"
                  style={{ backgroundColor: course.color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
                      {course.grade}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{course.professor}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.credits} Credits</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Course Progress</span>
                      <span className="font-medium text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full progress-bar"
                        style={{
                          width: `${course.progress}%`,
                          backgroundColor: course.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/notes?course=${course.code}`}
                      className="flex-1 text-center py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      Notes
                    </Link>
                    <Link
                      href={`/study-groups?course=${course.code}`}
                      className="flex-1 text-center py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      Groups
                    </Link>
                    <Link
                      href={`/assignments?course=${course.code}`}
                      className="flex-1 text-center py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      Tasks
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Semester Progress</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="12"
                    strokeDasharray={`${70 * 3.52} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">70%</p>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>
                </div>
              </div>
              <p className="font-medium text-gray-900">Overall Progress</p>
            </div>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="12"
                    strokeDasharray={`${85 * 3.52} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                </div>
              </div>
              <p className="font-medium text-gray-900">Attendance Rate</p>
            </div>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    strokeDasharray={`${92 * 3.52} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3.72</p>
                    <p className="text-xs text-gray-500">GPA</p>
                  </div>
                </div>
              </div>
              <p className="font-medium text-gray-900">Current GPA</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
