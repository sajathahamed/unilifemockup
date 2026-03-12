import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  Calendar,
  Bell
} from 'lucide-react'
import Link from 'next/link'

export default async function StudentDashboard() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="mt-1 text-indigo-100">Here's what's happening with your courses today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Enrolled Courses"
            value="6"
            color="bg-blue-500"
          />
          <StatCard
            icon={Clock}
            label="Pending Tasks"
            value="12"
            color="bg-orange-500"
          />
          <StatCard
            icon={Users}
            label="Study Groups"
            value="3"
            color="bg-green-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value="24"
            color="bg-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <Link 
                href="/student/timetable" 
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              <ScheduleItem
                time="09:00 AM"
                title="Introduction to Computer Science"
                location="Room 101, Science Building"
                status="upcoming"
              />
              <ScheduleItem
                time="11:00 AM"
                title="Data Structures & Algorithms"
                location="Room 203, Engineering Block"
                status="in-progress"
              />
              <ScheduleItem
                time="02:00 PM"
                title="Database Management Systems"
                location="Lab 3, IT Center"
                status="later"
              />
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
              <Bell size={18} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <AnnouncementItem
                title="Mid-semester exams schedule"
                time="2 hours ago"
                isNew
              />
              <AnnouncementItem
                title="Library hours extended"
                time="Yesterday"
              />
              <AnnouncementItem
                title="Campus WiFi maintenance"
                time="2 days ago"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/student/food-order" icon="🍕" label="Order Food" />
            <QuickAction href="/student/rides" icon="🚗" label="Book Ride" />
            <QuickAction href="/student/marketplace" icon="📚" label="Marketplace" />
            <QuickAction href="/student/study-groups" icon="👥" label="Study Groups" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Component helpers
function StatCard({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function ScheduleItem({ time, title, location, status }: {
  time: string;
  title: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'later';
}) {
  const statusColors = {
    'upcoming': 'bg-blue-100 text-blue-700 border-blue-200',
    'in-progress': 'bg-green-100 text-green-700 border-green-200',
    'later': 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <div className={`p-4 rounded-xl border ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{time}</span>
        {status === 'in-progress' && (
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Live</span>
        )}
      </div>
      <h3 className="font-medium mt-1">{title}</h3>
      <p className="text-sm opacity-75 mt-0.5">{location}</p>
    </div>
  )
}

function AnnouncementItem({ title, time, isNew }: {
  title: string;
  time: string;
  isNew?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {isNew && <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />}
      <div className={isNew ? '' : 'ml-5'}>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}
