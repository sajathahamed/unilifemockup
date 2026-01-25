"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import {
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  Calendar,
  Hash,
  Edit,
  Camera,
  Award,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Trophy,
  Target,
  BarChart3,
  Plus,
} from 'lucide-react';

// User Profile Data
const userProfile = {
  name: "Kavindi Perera",
  email: "kavindi.perera@uom.lk",
  phone: "+94 77 123 4567",
  studentId: "2022/CS/045",
  university: "University of Moratuwa",
  faculty: "Faculty of Computing",
  department: "Computer Science & Engineering",
  currentYear: "3rd Year",
  currentSemester: "Semester 1",
  enrolledDate: "October 2022",
  avatar: "👩‍💻",
};

// Semester Results
const semesterResults = [
  {
    semester: "Year 1 - Semester 1",
    year: "2022/2023",
    gpa: 3.72,
    credits: 18,
    status: "Completed",
    courses: [
      { code: "CS1012", name: "Programming Fundamentals", grade: "A", credits: 4, points: 4.0 },
      { code: "CS1022", name: "Discrete Mathematics", grade: "A-", credits: 3, points: 3.7 },
      { code: "CS1032", name: "Computer Systems", grade: "B+", credits: 3, points: 3.3 },
      { code: "EN1012", name: "English I", grade: "A", credits: 2, points: 4.0 },
      { code: "MA1012", name: "Mathematics I", grade: "A-", credits: 4, points: 3.7 },
      { code: "PH1012", name: "Physics I", grade: "B+", credits: 2, points: 3.3 },
    ],
  },
  {
    semester: "Year 1 - Semester 2",
    year: "2022/2023",
    gpa: 3.85,
    credits: 19,
    status: "Completed",
    courses: [
      { code: "CS1212", name: "Object-Oriented Programming", grade: "A", credits: 4, points: 4.0 },
      { code: "CS1222", name: "Data Structures", grade: "A", credits: 4, points: 4.0 },
      { code: "CS1232", name: "Database Systems", grade: "A-", credits: 3, points: 3.7 },
      { code: "EN1212", name: "English II", grade: "A", credits: 2, points: 4.0 },
      { code: "MA1212", name: "Mathematics II", grade: "B+", credits: 4, points: 3.3 },
      { code: "ST1012", name: "Statistics", grade: "A-", credits: 2, points: 3.7 },
    ],
  },
  {
    semester: "Year 2 - Semester 1",
    year: "2023/2024",
    gpa: 3.78,
    credits: 20,
    status: "Completed",
    courses: [
      { code: "CS2012", name: "Algorithms", grade: "A-", credits: 4, points: 3.7 },
      { code: "CS2022", name: "Operating Systems", grade: "A", credits: 4, points: 4.0 },
      { code: "CS2032", name: "Computer Networks", grade: "B+", credits: 3, points: 3.3 },
      { code: "CS2042", name: "Software Engineering", grade: "A", credits: 4, points: 4.0 },
      { code: "CS2052", name: "Web Development", grade: "A-", credits: 3, points: 3.7 },
      { code: "MA2012", name: "Linear Algebra", grade: "B+", credits: 2, points: 3.3 },
    ],
  },
  {
    semester: "Year 2 - Semester 2",
    year: "2023/2024",
    gpa: 3.92,
    credits: 21,
    status: "Completed",
    courses: [
      { code: "CS2212", name: "Machine Learning", grade: "A", credits: 4, points: 4.0 },
      { code: "CS2222", name: "Computer Graphics", grade: "A", credits: 3, points: 4.0 },
      { code: "CS2232", name: "Mobile Development", grade: "A-", credits: 4, points: 3.7 },
      { code: "CS2242", name: "System Design", grade: "A", credits: 4, points: 4.0 },
      { code: "CS2252", name: "Information Security", grade: "A-", credits: 4, points: 3.7 },
      { code: "EN2012", name: "Technical Writing", grade: "A", credits: 2, points: 4.0 },
    ],
  },
  {
    semester: "Year 3 - Semester 1",
    year: "2024/2025",
    gpa: null,
    credits: 22,
    status: "In Progress",
    courses: [
      { code: "CS3012", name: "Artificial Intelligence", grade: "-", credits: 4, points: null },
      { code: "CS3022", name: "Cloud Computing", grade: "-", credits: 4, points: null },
      { code: "CS3032", name: "Data Science", grade: "-", credits: 4, points: null },
      { code: "CS3042", name: "Distributed Systems", grade: "-", credits: 4, points: null },
      { code: "CS3052", name: "Research Methodology", grade: "-", credits: 3, points: null },
      { code: "CS3062", name: "Industry Project", grade: "-", credits: 3, points: null },
    ],
  },
];

// Calculate CGPA
const calculateCGPA = () => {
  let totalPoints = 0;
  let totalCredits = 0;
  
  semesterResults.forEach(sem => {
    if (sem.status === "Completed") {
      sem.courses.forEach(course => {
        if (course.points !== null) {
          totalPoints += course.points * course.credits;
          totalCredits += course.credits;
        }
      });
    }
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
};

const getGradeColor = (grade: string) => {
  if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-50';
  if (grade === 'A-') return 'text-emerald-600 bg-emerald-50';
  if (grade === 'B+' || grade === 'B') return 'text-blue-600 bg-blue-50';
  if (grade === 'B-') return 'text-cyan-600 bg-cyan-50';
  if (grade === 'C+' || grade === 'C') return 'text-amber-600 bg-amber-50';
  if (grade === '-') return 'text-gray-400 bg-gray-50';
  return 'text-gray-600 bg-gray-50';
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'settings'>('overview');
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  const cgpa = calculateCGPA();
  const completedCredits = semesterResults.reduce((acc, sem) => 
    sem.status === "Completed" ? acc + sem.credits : acc, 0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-6xl">
                {userProfile.avatar}
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-primary" />
              </button>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">{userProfile.name}</h1>
              <p className="text-white/80 mb-3">{userProfile.studentId} • {userProfile.currentYear}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                  {userProfile.university}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                  {userProfile.faculty}
                </span>
              </div>
            </div>

            {/* CGPA Badge */}
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold mb-1">{cgpa}</div>
              <div className="text-white/80 text-sm">Current CGPA</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-secondary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+0.15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CGPA', value: cgpa, icon: Trophy, color: 'bg-amber-500' },
            { label: 'Credits Earned', value: completedCredits, icon: Target, color: 'bg-green-500' },
            { label: 'Semesters', value: semesterResults.filter(s => s.status === "Completed").length, icon: Calendar, color: 'bg-blue-500' },
            { label: 'Current Year', value: userProfile.currentYear.split(' ')[0], icon: GraduationCap, color: 'bg-purple-500' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 card-hover">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 border border-gray-200 inline-flex">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'results', label: 'Semester Results', icon: BarChart3 },
            { id: 'settings', label: 'Edit Profile', icon: Edit },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: userProfile.name, icon: User },
                  { label: 'Email', value: userProfile.email, icon: Mail },
                  { label: 'Phone', value: userProfile.phone, icon: Phone },
                  { label: 'Student ID', value: userProfile.studentId, icon: Hash },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="font-medium text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Academic Information
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'University', value: userProfile.university, icon: Building },
                  { label: 'Faculty', value: userProfile.faculty, icon: BookOpen },
                  { label: 'Department', value: userProfile.department, icon: FileText },
                  { label: 'Current Year', value: `${userProfile.currentYear} - ${userProfile.currentSemester}`, icon: Calendar },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="font-medium text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GPA Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                GPA Progress
              </h2>
              <div className="flex items-end justify-between gap-4 h-48">
                {semesterResults.filter(s => s.status === "Completed").map((sem, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-indigo-400 rounded-t-lg transition-all hover:from-primary hover:to-primary"
                      style={{ height: `${(sem.gpa! / 4) * 100}%` }}
                    />
                    <div className="text-xs text-gray-500 text-center">{sem.semester.split(' - ')[0]}</div>
                    <div className="text-sm font-bold text-gray-900">{sem.gpa?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Semester Results</h2>
              <button 
                onClick={() => setShowAddResultModal(true)}
                className="btn btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Result
              </button>
            </div>

            {semesterResults.map((semester, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedSemester(expandedSemester === semester.semester ? null : semester.semester)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      semester.status === 'Completed' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      {semester.status === 'Completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{semester.semester}</h3>
                      <p className="text-sm text-gray-500">{semester.year} • {semester.credits} Credits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {semester.gpa && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{semester.gpa.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">GPA</div>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      semester.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {semester.status}
                    </span>
                  </div>
                </button>

                {expandedSemester === semester.semester && (
                  <div className="border-t border-gray-100 p-5 animate-fadeIn">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500">
                          <th className="pb-3 font-medium">Course Code</th>
                          <th className="pb-3 font-medium">Course Name</th>
                          <th className="pb-3 font-medium text-center">Credits</th>
                          <th className="pb-3 font-medium text-center">Grade</th>
                          <th className="pb-3 font-medium text-center">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {semester.courses.map((course, cIndex) => (
                          <tr key={cIndex} className="text-sm">
                            <td className="py-3 font-medium text-gray-900">{course.code}</td>
                            <td className="py-3 text-gray-600">{course.name}</td>
                            <td className="py-3 text-center text-gray-600">{course.credits}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getGradeColor(course.grade)}`}>
                                {course.grade}
                              </span>
                            </td>
                            <td className="py-3 text-center text-gray-600">
                              {course.points !== null ? course.points.toFixed(1) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" defaultValue={userProfile.name} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" defaultValue={userProfile.email} className="input" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" defaultValue={userProfile.phone} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input type="text" defaultValue={userProfile.studentId} className="input" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                  <input type="text" defaultValue={userProfile.university} className="input" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                  <input type="text" defaultValue={userProfile.faculty} className="input" disabled />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Result Modal */}
      <Modal
        isOpen={showAddResultModal}
        onClose={() => setShowAddResultModal(false)}
        title="Add Semester Result"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select className="input">
                <option>Year 1</option>
                <option>Year 2</option>
                <option>Year 3</option>
                <option>Year 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select className="input">
                <option>Semester 1</option>
                <option>Semester 2</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester GPA</label>
            <input type="number" step="0.01" min="0" max="4" placeholder="e.g., 3.75" className="input" />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Courses</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <input type="text" placeholder="Code" className="input text-sm" />
                <input type="text" placeholder="Course Name" className="input text-sm col-span-2" />
                <select className="input text-sm">
                  <option>A+</option>
                  <option>A</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B</option>
                  <option>B-</option>
                  <option>C+</option>
                  <option>C</option>
                  <option>C-</option>
                  <option>D</option>
                  <option>E</option>
                </select>
              </div>
              <button type="button" className="btn btn-secondary w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Another Course
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowAddResultModal(false)} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button onClick={() => setShowAddResultModal(false)} className="flex-1 btn btn-primary">
              Save Result
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
