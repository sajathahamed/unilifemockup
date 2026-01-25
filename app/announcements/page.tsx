"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { announcements, events } from '@/mock-data';
import {
  Bell,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Star,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>(
    events.filter(e => e.isRegistered).map(e => e.id)
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return '📚';
      case 'facility':
        return '🏢';
      case 'technical':
        return '💻';
      case 'festival':
        return '🎉';
      case 'career':
        return '💼';
      case 'workshop':
        return '🛠️';
      case 'sports':
        return '⚽';
      case 'cultural':
        return '🎭';
      default:
        return '📢';
    }
  };

  const handleRegister = (eventId: number) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
    } else {
      setRegisteredEvents([...registeredEvents, eventId]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements & Events</h1>
          <p className="text-gray-500">Stay updated with campus news and upcoming events</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 border border-gray-200 inline-flex">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Events
          </button>
        </div>

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl p-5 border border-gray-100 card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {getTypeIcon(announcement.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                          {announcement.isOfficial && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Official
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(announcement.date)}
                      </span>
                      <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {announcement.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((event, index) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="text-6xl">{event.image}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    {registeredEvents.includes(event.id) && (
                      <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Registered
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {event.attendees} {event.maxAttendees && `/ ${event.maxAttendees}`}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
              <span className="text-7xl">{selectedEvent.image}</span>
            </div>

            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg capitalize">
                  {selectedEvent.type}
                </span>
              </div>
              <p className="text-gray-600">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date</span>
                </div>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedEvent.date)}
                  {selectedEvent.endDate && ` - ${formatDate(selectedEvent.endDate)}`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Time</span>
                </div>
                <p className="font-medium text-gray-900">{selectedEvent.time}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="font-medium text-gray-900">{selectedEvent.location}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Attendees</span>
                </div>
                <p className="font-medium text-gray-900">
                  {selectedEvent.attendees}
                  {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees}`}
                </p>
              </div>
            </div>

            {selectedEvent.registrationDeadline && (
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Registration closes: {formatDate(selectedEvent.registrationDeadline)}
                  </span>
                </div>
              </div>
            )}

            {selectedEvent.maxAttendees && selectedEvent.attendees >= selectedEvent.maxAttendees && !registeredEvents.includes(selectedEvent.id) ? (
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-gray-500 font-medium">This event is full</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleRegister(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className={`w-full btn py-3 ${
                  registeredEvents.includes(selectedEvent.id)
                    ? 'btn-secondary'
                    : 'btn-primary'
                }`}
              >
                {registeredEvents.includes(selectedEvent.id) ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Cancel Registration
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    RSVP - I'm Going!
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
