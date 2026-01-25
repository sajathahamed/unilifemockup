"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { foodVendors, menuItems } from '@/mock-data';
import {
  Search,
  Star,
  Clock,
  Truck,
  Plus,
  Minus,
  ShoppingCart,
  X,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export default function FoodOrderPage() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = foodVendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (itemId: number) => {
    setCart({ ...cart, [itemId]: (cart[itemId] || 0) + 1 });
  };

  const removeFromCart = (itemId: number) => {
    if (cart[itemId] > 1) {
      setCart({ ...cart, [itemId]: cart[itemId] - 1 });
    } else {
      const newCart = { ...cart };
      delete newCart[itemId];
      setCart(newCart);
    }
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(i => i.id === parseInt(itemId));
      return { ...item, quantity };
    });
  };

  const getCartTotal = () => {
    return getCartItems().reduce((total, item) => total + (item?.price || 0) * item.quantity, 0);
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const vendorMenuItems = selectedVendor
    ? menuItems.filter(item => item.vendorId === selectedVendor.id)
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Food Order</h1>
            <p className="text-gray-500">Order from campus canteens and nearby vendors</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="btn btn-primary relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="input pl-10"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {!selectedVendor && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor, index) => (
              <button
                key={vendor.id}
                onClick={() => vendor.isOpen && setSelectedVendor(vendor)}
                disabled={!vendor.isOpen}
                className={`bg-white rounded-xl p-5 border border-gray-100 text-left card-hover animate-fadeIn ${
                  !vendor.isOpen ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                    {vendor.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">{vendor.type}</p>
                      </div>
                      {!vendor.isOpen && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          Closed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{vendor.rating}</span>
                        <span className="text-gray-400">({vendor.reviews})</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        {vendor.deliveryTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {vendor.deliveryFee === 0 ? 'Free Delivery' : `$${vendor.deliveryFee} delivery`}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Vendor Menu */}
        {selectedVendor && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedVendor(null)}
              className="text-primary font-medium hover:underline"
            >
              ← Back to vendors
            </button>

            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center text-4xl">
                  {selectedVendor.image}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedVendor.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{selectedVendor.rating}</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {selectedVendor.deliveryTime}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Truck className="w-4 h-4" />
                      {selectedVendor.deliveryFee === 0 ? 'Free' : `$${selectedVendor.deliveryFee}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid md:grid-cols-2 gap-4">
              {vendorMenuItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 border border-gray-100 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                            {item.popular && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Popular
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">Rs. {item.price}</span>
                      </div>

                      <div className="flex items-center justify-end mt-3">
                        {cart[item.id] ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{cart[item.id]}</span>
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item.id)}
                            className="btn btn-primary py-2 px-4"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="Your Cart"
        size="md"
      >
        {cartItemCount === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-500">Add some delicious items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getCartItems().map((item) => (
              <div key={item?.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                  {item?.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item?.name}</h4>
                  <p className="text-sm text-primary font-medium">Rs. {item?.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => item?.id && removeFromCart(item.id)}
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-medium">{item?.quantity}</span>
                  <button
                    onClick={() => item?.id && addToCart(item.id)}
                    className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">Rs. {getCartTotal().toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium">Rs. 150</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">Rs. {(getCartTotal() + 150).toFixed(0)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Student Hostel A, Room 205</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCart(false);
                setShowOrderStatus(true);
                setCart({});
              }}
              className="w-full btn btn-primary py-3"
            >
              Place Order - Rs. {(getCartTotal() + 150).toFixed(0)}
            </button>
          </div>
        )}
      </Modal>

      {/* Order Status Modal */}
      <Modal
        isOpen={showOrderStatus}
        onClose={() => setShowOrderStatus(false)}
        title="Order Placed!"
        size="md"
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
          <p className="text-gray-500 mb-6">Your order #12345 has been placed successfully</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Order Status</h4>
            <div className="space-y-3">
              {[
                { status: 'Order Placed', time: 'Just now', done: true },
                { status: 'Preparing', time: 'Est. 5 min', done: false },
                { status: 'On the way', time: 'Est. 15 min', done: false },
                { status: 'Delivered', time: 'Est. 25 min', done: false },
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.status}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowOrderStatus(false)}
            className="btn btn-primary w-full"
          >
            Track Order
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
