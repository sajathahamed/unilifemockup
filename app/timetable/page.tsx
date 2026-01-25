"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { weeklySchedule } from '@/mock-data';
import { Clock, MapPin, User, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
            <p className="text-gray-500">Your weekly class schedule</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg">
              Week View
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              Month View
            </button>
          </div>
        </div>

        {/* Mobile Day Selector */}
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              className="p-2 rounded-lg hover:bg-gray-100"
              disabled={selectedDay === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{days[selectedDay]}</p>
              <p className="text-sm text-gray-500">
                {weeklySchedule[selectedDay]?.classes.length || 0} classes
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(Math.min(4, selectedDay + 1))}
              className="p-2 rounded-lg hover:bg-gray-100"
              disabled={selectedDay === 4}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Classes */}
          <div className="mt-4 space-y-3">
            {weeklySchedule[selectedDay]?.classes.map((cls, index) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 h-full min-h-[60px] rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-500">{cls.code}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {cls.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {cls.room}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {weeklySchedule[selectedDay]?.classes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No classes scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Week View */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-5 border-b border-gray-100">
            {days.map((day, index) => (
              <div
                key={day}
                className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${
                  new Date().getDay() - 1 === index ? 'bg-primary/5' : ''
                }`}
              >
                <p className="font-semibold text-gray-900">{day}</p>
                <p className="text-sm text-gray-500">
                  {weeklySchedule[index]?.classes.length || 0} classes
                </p>
              </div>
            ))}
          </div>

          {/* Timetable Grid */}
          <div className="grid grid-cols-5 min-h-[500px]">
            {weeklySchedule.map((daySchedule, dayIndex) => (
              <div
                key={daySchedule.day}
                className={`border-r border-gray-100 last:border-r-0 p-3 space-y-2 ${
                  new Date().getDay() - 1 === dayIndex ? 'bg-primary/5' : ''
                }`}
              >
                {daySchedule.classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass({ ...cls, day: daySchedule.day })}
                    className="w-full text-left p-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-md"
                    style={{ backgroundColor: `${cls.color}15` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mb-2"
                      style={{ backgroundColor: cls.color }}
                    />
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {cls.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{cls.code}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cls.time}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cls.room}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Course Colors</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { name: 'Data Structures', color: '#4F46E5' },
              { name: 'Database Systems', color: '#22C55E' },
              { name: 'Web Development', color: '#F59E0B' },
              { name: 'Computer Networks', color: '#EF4444' },
              { name: 'Software Engineering', color: '#8B5CF6' },
            ].map((course) => (
              <div key={course.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <span className="text-sm text-gray-600">{course.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      <Modal
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Class Details"
        size="md"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div
              className="h-2 rounded-full"
              style={{ backgroundColor: selectedClass.color }}
            />
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedClass.name}</h3>
              <p className="text-gray-500">{selectedClass.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Time</span>
                </div>
                <p className="font-medium text-gray-900">{selectedClass.time}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Room</span>
                </div>
                <p className="font-medium text-gray-900">{selectedClass.room}</p>
              </div>
            </div>

            {selectedClass.day && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Day</span>
                </div>
                <p className="font-medium text-gray-900">{selectedClass.day}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button className="flex-1 btn btn-secondary">
                View Course
              </button>
              <button className="flex-1 btn btn-primary">
                Set Reminder
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
