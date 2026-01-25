"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { userProfile, notifications } from '@/mock-data';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, assignments..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-primary' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100">
                  <button className="text-sm text-primary font-medium hover:underline">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                <p className="text-xs text-gray-500">{userProfile.department}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{userProfile.name}</p>
                  <p className="text-sm text-gray-500">{userProfile.email}</p>
                </div>
                <div className="p-2">
                  <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                  <Link href="/profile?tab=settings" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <Link href="/login" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger rounded-lg hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
