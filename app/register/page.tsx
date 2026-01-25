"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Calendar,
  Building,
  Hash,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const universities = [
  "University of Colombo",
  "University of Peradeniya",
  "University of Sri Jayewardenepura",
  "University of Kelaniya",
  "University of Moratuwa",
  "University of Jaffna",
  "University of Ruhuna",
  "Eastern University, Sri Lanka",
  "South Eastern University of Sri Lanka",
  "Rajarata University of Sri Lanka",
  "Sabaragamuwa University of Sri Lanka",
  "Wayamba University of Sri Lanka",
  "Uva Wellassa University",
  "University of the Visual & Performing Arts",
  "Gampaha Wickramarachchi University",
  "University of Vavuniya",
  "SLIIT",
  "NSBM Green University",
  "IIT Sri Lanka",
  "APIIT Sri Lanka",
];

const faculties = [
  "Faculty of Science",
  "Faculty of Engineering",
  "Faculty of Medicine",
  "Faculty of Arts",
  "Faculty of Management",
  "Faculty of Law",
  "Faculty of Computing",
  "Faculty of Technology",
  "Faculty of Agriculture",
  "Faculty of Dental Sciences",
  "Faculty of Allied Health Sciences",
  "Faculty of Education",
];

const years = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year (Medical/Engineering)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    faculty: '',
    studentId: '',
    currentYear: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const isStep1Valid = formData.fullName && formData.email && formData.phone;
  const isStep2Valid = formData.university && formData.faculty;
  const isStep3Valid = formData.studentId && formData.currentYear;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">UniLife</span>
          </Link>

          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Join the<br />
            <span className="text-white/80">Community.</span>
          </h1>

          <p className="text-lg text-white/70 max-w-md">
            Create your account and start managing your campus life like never before.
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="relative z-10 space-y-4">
          {[
            { num: 1, title: 'Personal Info', desc: 'Your basic details' },
            { num: 2, title: 'University Details', desc: 'Where you study' },
            { num: 3, title: 'Academic Info', desc: 'Your current status' },
          ].map((item) => (
            <div key={item.num} className={`flex items-center gap-4 ${step >= item.num ? 'text-white' : 'text-white/40'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                step > item.num ? 'bg-secondary' : step === item.num ? 'bg-white/20 backdrop-blur' : 'bg-white/10'
              }`}>
                {step > item.num ? <CheckCircle2 className="w-5 h-5" /> : item.num}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm opacity-70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © 2026 UniLife. Built for students, by students.
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            {/* Mobile Step Indicator */}
            <div className="lg:hidden flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-secondary' : 'w-2 bg-gray-200'
                }`} />
              ))}
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Step {step} of 3
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 1 && "Personal Information"}
                {step === 2 && "University Details"}
                {step === 3 && "Academic Information"}
              </h2>
              <p className="text-gray-500">
                {step === 1 && "Let's start with your basic details"}
                {step === 2 && "Tell us about your university"}
                {step === 3 && "Almost there! Final details"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <>
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="yourname@university.edu"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 7X XXX XXXX"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: University Details */}
              {step === 2 && (
                <>
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        className="input pl-12 appearance-none"
                        required
                      >
                        <option value="">Select your university</option>
                        {universities.map((uni) => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleChange}
                        className="input pl-12 appearance-none"
                        required
                      >
                        <option value="">Select your faculty</option>
                        {faculties.map((fac) => (
                          <option key={fac} value={fac}>{fac}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Academic Info */}
              {step === 3 && (
                <>
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID / Registration Number</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="e.g., 2023/CS/001"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Year</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="currentYear"
                        value={formData.currentYear}
                        onChange={handleChange}
                        className="input pl-12 appearance-none"
                        required
                      >
                        <option value="">Select your current year</option>
                        {years.map((year) => (
                          <option key={year.value} value={year.value}>{year.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 btn btn-secondary py-3 gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                    className="flex-1 btn btn-primary py-3 gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !isStep3Valid}
                    className="flex-1 btn btn-primary py-3 gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By registering, you agree to UniLife's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
