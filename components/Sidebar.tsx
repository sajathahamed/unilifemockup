"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BookOpen,
  FileText,
  Users,
  ShoppingBag,
  Briefcase,
  UtensilsCrossed,
  Shirt,
  Car,
  Map,
  Bell,
  Menu,
  X,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Timetable', href: '/timetable', icon: Calendar },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Study Groups', href: '/study-groups', icon: Users },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Part-time Jobs', href: '/part-time-jobs', icon: Briefcase },
  { name: 'Food Order', href: '/food-order', icon: UtensilsCrossed },
  { name: 'Laundry', href: '/laundry', icon: Shirt },
  { name: 'Rides', href: '/rides', icon: Car },
  { name: 'Trip Planner', href: '/trip-planner', icon: Map },
  { name: 'Announcements', href: '/announcements', icon: Bell },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-primary">UniLife</span>
            )}
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse Button - Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/30' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
