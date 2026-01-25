"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components';
import { tripDestinations, tripPlans } from '@/mock-data';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  DollarSign,
  ChevronRight,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Car,
  Sparkles,
} from 'lucide-react';

export default function TripPlannerPage() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [travelers, setTravelers] = useState(1);
  const [showPlan, setShowPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const handleGeneratePlan = () => {
    // Get plan based on destination or use Sigiriya as default
    const plan = tripPlans[destination as keyof typeof tripPlans] || tripPlans['Sigiriya'];
    setGeneratedPlan(plan);
    setShowPlan(true);
  };

  const calculateTotalBudget = () => {
    if (!generatedPlan) return 0;
    const { transport, food, stay, activities } = generatedPlan.budget;
    return (transport + food + stay + activities) * travelers;
  };

  const getBudgetIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return <Car className="w-5 h-5" />;
      case 'food':
        return <Utensils className="w-5 h-5" />;
      case 'stay':
        return <Hotel className="w-5 h-5" />;
      case 'activities':
        return <Camera className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Planner</h1>
          <p className="text-gray-500">Plan your perfect getaway with detailed itineraries</p>
        </div>

        {!showPlan ? (
          <>
            {/* Planning Form */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Plan Your Trip</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="input"
                  >
                    <option value="">Select destination</option>
                    {tripDestinations.map((dest) => (
                      <option key={dest.id} value={dest.name}>
                        {dest.image} {dest.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
                  <select
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                    className="input"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Day' : 'Days'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value))}
                    className="input"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={!destination}
                className="w-full mt-6 btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Trip Plan
              </button>
            </div>

            {/* Popular Destinations */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-4">Popular Destinations</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tripDestinations.map((dest, index) => (
                  <button
                    key={dest.id}
                    onClick={() => setDestination(dest.name)}
                    className={`bg-white rounded-xl p-4 border-2 text-left card-hover animate-fadeIn ${
                      destination === dest.name ? 'border-primary' : 'border-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl mb-3">
                      {dest.image}
                    </div>
                    <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                    {dest.popular && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => setShowPlan(false)}
              className="text-primary font-medium hover:underline"
            >
              ← Plan Another Trip
            </button>

            {/* Trip Overview */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-6 h-6" />
                  <span className="text-white/80">Your Trip to</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{destination || 'Goa'}</h2>
                <div className="flex flex-wrap gap-4 text-white/90">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {startDate || 'Feb 10, 2026'} • {numberOfDays} Days
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Estimated Budget
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {generatedPlan && Object.entries(generatedPlan.budget).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      {getBudgetIcon(key)}
                      <span className="text-sm capitalize">{key}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      Rs. {(Number(value) * travelers).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Estimated Budget</span>
                <span className="text-2xl font-bold text-primary">Rs. {calculateTotalBudget().toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                * Budget is per person. Total shown for {travelers} traveler(s).
              </p>
            </div>

            {/* Day-by-Day Itinerary */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Day-by-Day Itinerary
              </h3>
              <div className="space-y-4">
                {generatedPlan?.days.slice(0, numberOfDays).map((day: any, dayIndex: number) => (
                  <div
                    key={dayIndex}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-fadeIn"
                    style={{ animationDelay: `${dayIndex * 100}ms` }}
                  >
                    <div className="bg-primary/5 px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-primary font-medium">Day {day.day}</span>
                          <h4 className="font-semibold text-gray-900">{day.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">Day Total</span>
                          <p className="font-bold text-primary">
                            Rs. {day.activities.reduce((sum: number, a: any) => sum + a.cost, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="relative pl-6 space-y-4">
                        {day.activities.map((activity: any, actIndex: number) => (
                          <div key={actIndex} className="relative">
                            <div className="absolute -left-6 w-4 h-4 bg-primary rounded-full border-4 border-white shadow" />
                            {actIndex < day.activities.length - 1 && (
                              <div className="absolute -left-[14px] top-4 w-0.5 h-full bg-gray-200" />
                            )}
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-sm text-primary font-medium">{activity.time}</span>
                                <p className="font-medium text-gray-900">{activity.activity}</p>
                              </div>
                              {activity.cost > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                                  Rs. {activity.cost.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-900 mb-3">💡 Travel Tips</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• Book accommodations in advance for better rates</li>
                <li>• Carry cash for local markets and street food</li>
                <li>• Keep important documents in a waterproof bag</li>
                <li>• Check weather forecast before packing</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 btn btn-secondary">
                Save Trip
              </button>
              <button className="flex-1 btn btn-primary">
                Share with Friends
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
