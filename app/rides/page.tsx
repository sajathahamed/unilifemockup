"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { rideOptions, popularLocations } from '@/mock-data';
import {
  MapPin,
  Clock,
  Users,
  Navigation,
  CheckCircle2,
  Star,
  Phone,
  MessageCircle,
} from 'lucide-react';

export default function RidesPage() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [distance] = useState(5.2); // Mock distance in km

  const calculatePrice = (ride: any) => {
    return (ride.basePrice + (ride.pricePerKm * distance)).toFixed(2);
  };

  const handleBookRide = () => {
    setShowBookingModal(false);
    setShowDriverModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book a Ride</h1>
          <p className="text-gray-500">Quick and affordable campus transportation</p>
        </div>

        {/* Location Input */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-secondary rounded-full" />
              </div>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup location"
                className="input pl-10"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-danger rounded-full" />
              </div>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Drop-off location"
                className="input pl-10"
              />
            </div>
          </div>

          {/* Popular Locations */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Popular Locations</p>
            <div className="flex flex-wrap gap-2">
              {popularLocations.slice(0, 6).map((location) => (
                <button
                  key={location.id}
                  onClick={() => !pickup ? setPickup(location.name) : setDropoff(location.name)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ride Options */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Choose Your Ride</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {rideOptions.map((ride, index) => (
              <button
                key={ride.id}
                onClick={() => {
                  setSelectedRide(ride);
                  setShowBookingModal(true);
                }}
                className={`bg-white rounded-xl p-5 border-2 text-left card-hover animate-fadeIn transition-all ${
                  selectedRide?.id === ride.id ? 'border-primary' : 'border-gray-100'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                    {ride.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ride.type}</h3>
                        <p className="text-sm text-gray-500">{ride.description}</p>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        Rs. {calculatePrice(ride)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {ride.eta}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {ride.capacity} seats
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Map View</p>
            <p className="text-sm text-gray-400">Route visualization would appear here</p>
          </div>
        </div>

        {/* Recent Rides */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Rides</h2>
          <div className="space-y-3">
            {[
              { from: 'Student Hostel A', to: 'Library Building', date: 'Jan 24', price: 280 },
              { from: 'Main Gate', to: 'City Mall', date: 'Jan 22', price: 650 },
              { from: 'Sports Complex', to: 'Student Hostel A', date: 'Jan 20', price: 320 },
            ].map((ride, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{ride.from} → {ride.to}</p>
                    <p className="text-xs text-gray-500">{ride.date}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">Rs. {ride.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Booking"
        size="md"
      >
        {selectedRide && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                  {selectedRide.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedRide.type}</h4>
                  <p className="text-sm text-gray-500">{selectedRide.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-3 h-3 bg-secondary rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="font-medium text-gray-900">{pickup || 'Student Hostel A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-3 h-3 bg-danger rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Drop-off</p>
                  <p className="font-medium text-gray-900">{dropoff || 'Library Building'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{selectedRide.eta}</p>
                <p className="text-xs text-gray-500">ETA</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{distance} km</p>
                <p className="text-xs text-gray-500">Distance</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{selectedRide.capacity}</p>
                <p className="text-xs text-gray-500">Seats</p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Base fare</span>
                <span className="font-medium">Rs. {selectedRide.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Distance ({distance} km × Rs. {selectedRide.pricePerKm})</span>
                <span className="font-medium">Rs. {(selectedRide.pricePerKm * distance)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/10">
                <span>Total</span>
                <span className="text-primary">Rs. {calculatePrice(selectedRide)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBookRide}
                className="flex-1 btn btn-primary"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Driver Assigned Modal */}
      <Modal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        title="Ride Booked!"
        size="md"
      >
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900">Driver on the way!</h3>
            <p className="text-gray-500">Your driver will arrive shortly</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <img
                src="https://ui-avatars.com/api/?name=Raj+Kumar&background=4F46E5&color=fff"
                alt="Driver"
                className="w-14 h-14 rounded-full"
              />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Raj Kumar</h4>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>4.9</span>
                  <span className="text-gray-400">(234 rides)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium text-gray-900">KA-01-AB-1234</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              Arriving in 5 mins
            </span>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 btn btn-secondary">
              <Phone className="w-5 h-5 mr-2" />
              Call
            </button>
            <button className="flex-1 btn btn-secondary">
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </button>
          </div>

          <button
            onClick={() => setShowDriverModal(false)}
            className="w-full btn btn-primary"
          >
            Track Ride
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
