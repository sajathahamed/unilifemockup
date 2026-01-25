"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { marketplaceItems } from '@/mock-data';
import {
  Search,
  Plus,
  Filter,
  Star,
  MessageCircle,
  DollarSign,
  Tag,
  User,
  Calendar,
} from 'lucide-react';

export default function MarketplacePage() {
  const [showListModal, setShowListModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'Textbooks', 'Notes', 'Devices', 'Supplies'];

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-500">Buy and sell within the campus community</p>
          </div>
          <button
            onClick={() => setShowListModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            List Item
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketplace..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Items' : category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover cursor-pointer animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-6xl">
                {item.image}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg whitespace-nowrap">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-primary">Rs. {item.price.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">Rs. {item.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-gray-600">{item.seller}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{item.sellerRating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-sm text-gray-500">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* List Item Modal */}
      <Modal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        title="List an Item"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
            <input type="text" className="input" placeholder="What are you selling?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input">
                <option value="">Select category</option>
                <option value="Textbooks">Textbooks</option>
                <option value="Notes">Notes</option>
                <option value="Devices">Devices</option>
                <option value="Supplies">Supplies</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select className="input">
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
              <input type="number" className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Optional)</label>
              <input type="number" className="input" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input min-h-[100px]" placeholder="Describe your item..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <DollarSign className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowListModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setShowListModal(false);
              }}
              className="flex-1 btn btn-primary"
            >
              List Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Item Details"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-8xl">
              {selectedItem.image}
            </div>

            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{selectedItem.title}</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                  {selectedItem.category}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">Rs. {selectedItem.price.toLocaleString()}</span>
                {selectedItem.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">Rs. {selectedItem.originalPrice.toLocaleString()}</span>
                    <span className="px-2 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-lg">
                      {Math.round((1 - selectedItem.price / selectedItem.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-600">{selectedItem.description}</p>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedItem.seller}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-gray-600">{selectedItem.sellerRating}</span>
                    <span className="text-gray-400">({selectedItem.sellerReviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(selectedItem.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-semibold text-gray-900">{selectedItem.condition}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold text-gray-900">{selectedItem.category}</p>
              </div>
            </div>

            <button className="w-full btn btn-primary py-3">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Seller
            </button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
