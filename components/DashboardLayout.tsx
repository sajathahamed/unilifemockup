"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        setIsMobileOpen={setIsMobileMenuOpen} 
      />
      
      <div className="lg:ml-64 min-h-screen">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
