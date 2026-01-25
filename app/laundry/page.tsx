"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { laundryServices, laundryPricing, laundryOrders } from '@/mock-data';
import {
  Star,
  Clock,
  Truck,
  Package,
  CheckCircle2,
  Calendar,
  MapPin,
  Plus,
  Minus,
} from 'lucide-react';

export default function LaundryPage() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState({
    weight: 2,
    type: 'Regular Wash',
    pickup: true,
    delivery: true,
    pickupDate: '',
    pickupTime: '',
  });

  const calculatePrice = () => {
    const pricing = laundryPricing.find(p => p.type === orderDetails.type);
    if (pricing?.pricePerKg) {
      return pricing.pricePerKg * orderDetails.weight;
    }
    return pricing?.pricePerItem || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-secondary/10 text-secondary';
      case 'processing':
        return 'bg-amber-100 text-amber-700';
      case 'picked':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laundry Service</h1>
          <p className="text-gray-500">Professional laundry and dry cleaning services</p>
        </div>

        {/* Active Orders */}
        {laundryOrders.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Active Orders</h2>
            <div className="space-y-3">
              {laundryOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowStatusModal(true);
                  }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.items}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Rs. {order.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Available Services</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {laundryServices.map((service, index) => (
              <div
                key={service.id}
                className="bg-white rounded-xl p-5 border border-gray-100 card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                    {service.image}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-gray-400">({service.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Price</span>
                    <span className="font-semibold text-primary">Rs. {service.pricePerKg}/kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Min Order</span>
                    <span className="text-gray-700">{service.minOrder} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-gray-700">{service.deliveryTime}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {service.hasPickup && (
                    <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-lg flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Pickup
                    </span>
                  )}
                  {service.hasDelivery && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Delivery
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowOrderModal(true);
                  }}
                  className="w-full btn btn-primary"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Pricing Guide</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Service Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Price</th>
                </tr>
              </thead>
              <tbody>
                {laundryPricing.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{item.type}</td>
                    <td className="py-3 px-4 text-right font-medium text-primary">
                      {item.pricePerKg ? `Rs. ${item.pricePerKg}/kg` : `Rs. ${item.pricePerItem}/item`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Book Laundry Service"
        size="md"
      >
        {selectedService && (
          <form className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                  {selectedService.image}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedService.name}</h4>
                  <p className="text-sm text-gray-500">Rs. {selectedService.pricePerKg}/kg</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                className="input"
                value={orderDetails.type}
                onChange={(e) => setOrderDetails({ ...orderDetails, type: e.target.value })}
              >
                {laundryPricing.map((p) => (
                  <option key={p.type} value={p.type}>{p.type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOrderDetails({ ...orderDetails, weight: Math.max(1, orderDetails.weight - 0.5) })}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-gray-900 w-20 text-center">{orderDetails.weight}</span>
                <button
                  type="button"
                  onClick={() => setOrderDetails({ ...orderDetails, weight: orderDetails.weight + 0.5 })}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                <input type="date" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                <select className="input">
                  <option>9:00 AM - 12:00 PM</option>
                  <option>12:00 PM - 3:00 PM</option>
                  <option>3:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderDetails.pickup}
                  onChange={(e) => setOrderDetails({ ...orderDetails, pickup: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
                <span className="text-sm text-gray-700">Pickup Service</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderDetails.delivery}
                  onChange={(e) => setOrderDetails({ ...orderDetails, delivery: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
                <span className="text-sm text-gray-700">Delivery Service</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Student Hostel A, Room 205</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Service ({orderDetails.weight} kg × Rs. {selectedService.pricePerKg})</span>
                <span className="font-medium">Rs. {(orderDetails.weight * selectedService.pricePerKg).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pickup & Delivery</span>
                <span className="font-medium">Rs. 150</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/10">
                <span>Total</span>
                <span className="text-primary">Rs. {(orderDetails.weight * selectedService.pricePerKg + 150).toFixed(0)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setShowOrderModal(false);
                }}
                className="flex-1 btn btn-primary"
              >
                Book Service
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Order Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Order Status"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Items</p>
              <p className="font-medium text-gray-900">{selectedOrder.items}</p>
              <p className="text-lg font-bold text-primary mt-2">Rs. {selectedOrder.total}</p>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-6">
              {[
                { status: 'Order Placed', time: 'Jan 24, 2:00 PM', done: true },
                { status: 'Picked Up', time: selectedOrder.pickupTime, done: selectedOrder.status !== 'pending' },
                { status: 'Processing', time: 'In progress', done: selectedOrder.status === 'processing' || selectedOrder.status === 'ready' },
                { status: 'Ready for Delivery', time: selectedOrder.deliveryTime, done: selectedOrder.status === 'ready' },
                { status: 'Delivered', time: '', done: false },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 ${
                    step.done ? 'bg-secondary border-secondary' : 'bg-white border-gray-300'
                  }`}>
                    {step.done && <CheckCircle2 className="w-3 h-3 text-white absolute top-0.5 left-0.5" />}
                  </div>
                  {index < 4 && (
                    <div className={`absolute -left-[18px] top-4 w-0.5 h-6 ${
                      step.done ? 'bg-secondary' : 'bg-gray-200'
                    }`} />
                  )}
                  <div>
                    <p className={`font-medium ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.status}
                    </p>
                    {step.time && (
                      <p className="text-sm text-gray-500">{step.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full btn btn-primary"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
