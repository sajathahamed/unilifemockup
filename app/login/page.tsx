"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowRight, Sparkles, BookOpen, Users, Calendar, Shield, Store, Truck } from 'lucide-react';

type UserRole = 'student' | 'super-admin' | 'shop-owner' | 'delivery-rider';

const roleConfig = {
  'student': {
    label: 'Student',
    icon: GraduationCap,
    color: 'bg-primary',
    hoverColor: 'hover:bg-primary/90',
    route: '/dashboard',
    description: 'Access courses, assignments & campus services',
  },
  'super-admin': {
    label: 'Super Admin',
    icon: Shield,
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
    hoverColor: 'hover:from-amber-600 hover:to-orange-600',
    route: '/admin',
    description: 'Manage all platform users & services',
  },
  'shop-owner': {
    label: 'Shop Owner',
    icon: Store,
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    hoverColor: 'hover:from-emerald-600 hover:to-teal-600',
    route: '/admin/shop-owner',
    description: 'Manage products, menus & orders',
  },
  'delivery-rider': {
    label: 'Delivery Rider',
    icon: Truck,
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    hoverColor: 'hover:from-blue-600 hover:to-indigo-600',
    route: '/admin/rider',
    description: 'View & manage assigned deliveries',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login based on selected role
    setTimeout(() => {
      router.push(roleConfig[selectedRole].route);
    }, 1000);
  };

  const handleRoleLogin = (role: UserRole) => {
    setLoadingRole(role);
    setTimeout(() => {
      router.push(roleConfig[role].route);
    }, 800);
  };

  const features = [
    { icon: Calendar, title: 'Smart Timetable', desc: 'Never miss a class' },
    { icon: BookOpen, title: 'Course Hub', desc: 'Notes & study groups' },
    { icon: Users, title: 'Campus Connect', desc: 'Jobs, food & more' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">UniLife</span>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Your Campus,<br />
            <span className="text-white/80">Simplified.</span>
          </h1>

          <p className="text-lg text-white/70 max-w-md">
            Manage classes, assignments, study groups, and campus life - all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © 2026 UniLife. Built for students, by students.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">UniLife</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Welcome to UniLife
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
              <p className="text-gray-500">Use your university email to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@university.edu"
                    className="input pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-3.5 text-base gap-2 group disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue as Student
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or sign in as</span>
              </div>
            </div>

            {/* Role Selection Buttons */}
            <div className="space-y-3">
              {(['super-admin', 'shop-owner', 'delivery-rider'] as UserRole[]).map((role) => {
                const config = roleConfig[role];
                const IconComponent = config.icon;
                const isLoading = loadingRole === role;
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleLogin(role)}
                    disabled={loadingRole !== null}
                    className={`w-full btn py-3.5 text-base gap-2 group ${config.color} text-white ${config.hoverColor} transition-all duration-300 shadow-lg disabled:opacity-70`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <IconComponent className="w-5 h-5" />
                        <span className="flex-1 text-left">{config.label}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role descriptions */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 text-center">
                <strong>Demo Mode:</strong> Click any role button above to explore different admin dashboards
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to UniLife's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
