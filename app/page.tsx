"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  ShoppingBag,
  Utensils,
  Car,
  Plane,
  Bell,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
  Play,
  ChevronDown,
  Menu,
  X,
  Shirt,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Globe,
} from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Smart Timetable', desc: 'AI-powered scheduling that adapts to your lifestyle', color: 'from-blue-500 to-cyan-500' },
  { icon: BookOpen, title: 'Course Hub', desc: 'All your courses, notes, and materials in one place', color: 'from-purple-500 to-pink-500' },
  { icon: Users, title: 'Study Groups', desc: 'Find peers, collaborate, and ace together', color: 'from-green-500 to-emerald-500' },
  { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy, sell, and trade with fellow students', color: 'from-amber-500 to-orange-500' },
  { icon: Utensils, title: 'Food Order', desc: 'Order from campus cafeterias with ease', color: 'from-red-500 to-rose-500' },
  { icon: Car, title: 'Campus Rides', desc: 'Share rides and split costs with classmates', color: 'from-indigo-500 to-violet-500' },
  { icon: Plane, title: 'Trip Planner', desc: 'Plan Sri Lanka adventures with your crew', color: 'from-teal-500 to-cyan-500' },
  { icon: Shirt, title: 'Laundry', desc: 'Schedule pickups, track your laundry', color: 'from-sky-500 to-blue-500' },
];

const stats = [
  { value: '50K+', label: 'Active Students' },
  { value: '200+', label: 'Universities' },
  { value: '1M+', label: 'Tasks Completed' },
  { value: '4.9', label: 'App Rating' },
];

const testimonials = [
  { name: 'Kavindi Perera', role: 'Computer Science, Year 3', avatar: '👩‍💻', text: 'UniLife transformed how I manage my university life. The timetable feature alone saved me hours every week!' },
  { name: 'Tharindu Silva', role: 'Engineering, Year 2', avatar: '👨‍🎓', text: 'The study groups feature helped me connect with amazing peers. We aced our finals together!' },
  { name: 'Nimasha Fernando', role: 'Medicine, Year 4', avatar: '👩‍⚕️', text: 'From food orders to laundry - everything is so seamless. Best campus app ever!' },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${scrolled ? 'bg-primary' : 'bg-white/20 backdrop-blur'} rounded-xl flex items-center justify-center`}>
                <GraduationCap className={`w-6 h-6 ${scrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>UniLife</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Features</a>
              <a href="#how-it-works" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>How it Works</a>
              <a href="#testimonials" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Testimonials</a>
              <Link href="/login" className="btn btn-primary px-6">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
              {isMenuOpen ? <X className={scrolled ? 'text-gray-900' : 'text-white'} /> : <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-fadeIn">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-gray-900">Testimonials</a>
              <Link href="/login" className="btn btn-primary w-full">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-indigo-700">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-8 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            The #1 Campus Companion App in Sri Lanka
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Your Campus Life,<br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 text-transparent bg-clip-text">
              Supercharged.
            </span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            From smart timetables to food orders, study groups to trip planning — manage your entire university experience in one beautiful app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link href="/login" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg gap-2 group shadow-xl shadow-black/20">
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 px-8 py-4 text-lg gap-2 border border-white/20">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need,<br />In One Place
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              UniLife brings together all essential campus services into a seamless, beautiful experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover group">
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Simple & Easy
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Use your university email to create your account instantly', icon: GraduationCap },
              { step: '02', title: 'Set Up Profile', desc: 'Add your courses, preferences, and customize your experience', icon: Users },
              { step: '03', title: 'Start Living', desc: 'Access all campus services from your personalized dashboard', icon: Sparkles },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <span className="absolute top-0 right-1/4 text-8xl font-bold text-gray-100 -z-10">{item.step}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-primary/5 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Loved by Students
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Students Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Join 50,000+ Students Across Sri Lanka
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Campus Life?
          </h2>
          <p className="text-xl text-white/70 mb-10">
            Join thousands of students who are already living smarter with UniLife.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg gap-2 group shadow-xl">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/admin" className="btn bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 px-8 py-4 text-lg gap-2 shadow-xl">
              <Shield className="w-5 h-5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">UniLife</span>
              </div>
              <p className="text-gray-400 text-sm">
                The all-in-one campus companion app for Sri Lankan university students.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Universities</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2026 UniLife. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Made with ❤️ for Sri Lankan Students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
