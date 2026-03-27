import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getStudentDashboardData } from '@/lib/student/dashboard.server'
import {
  Clock,
  Utensils,
  Truck,
  MapPin,
  ArrowRight,
  Bell,
} from 'lucide-react'
import Link from 'next/link'

function formatTime(t: string): string {
  const s = String(t).trim()
  const part = s.includes('T') ? s.split('T')[1] : s
  const [h, m] = (part || s).split(':')
  const hour = parseInt(h, 10)
  const min = m ? parseInt(m, 10) : 0
  if (Number.isNaN(hour)) return t
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`
}

function getStatus(startTime: string, endTime: string): 'upcoming' | 'in-progress' | 'later' {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = String(startTime).split(':').map(Number)
  const [endH, endM] = String(endTime).split(':').map(Number)
  const startMinutes = (startH || 0) * 60 + (startM || 0)
  const endMinutes = (endH || 0) * 60 + (endM || 0)
  if (currentMinutes < startMinutes) return 'upcoming'
  if (currentMinutes >= endMinutes) return 'later'
  return 'in-progress'
}

export default async function StudentDashboard() {
  const user = await requireRole('student')
  const { foodStallsCount, laundryShopsCount, tripsCount, timetableToday, announcements } = await getStudentDashboardData()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="mt-1 text-indigo-100">Here&apos;s your campus services snapshot for today.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Clock} label="Classes today" value={String(timetableToday.length)} color="bg-orange-500" />
          <StatCard icon={Utensils} label="Food Stalls" value={String(foodStallsCount)} color="bg-green-500" />
          <StatCard icon={Truck} label="Laundry Shops" value={String(laundryShopsCount)} color="bg-blue-500" />
          <StatCard icon={MapPin} label="Trips" value={String(tripsCount)} color="bg-purple-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
              <Link
                href="/student/timetable"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {timetableToday.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No classes scheduled for today.</p>
              ) : (
                timetableToday.map((entry) => {
                  const status = getStatus(entry.start_time, entry.end_time)
                  const title = entry.course_name ? `${entry.course_code || ''} - ${entry.course_name}`.trim() : `Course #${entry.course_id}`
                  return (
                    <ScheduleItem
                      key={entry.id}
                      time={`${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}`}
                      title={title}
                      location={entry.location || '—'}
                      status={status}
                    />
                  )
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
              <Bell size={18} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-sm">No announcements available.</p>
              ) : (
                announcements.slice(0, 4).map((a, i) => (
                  <AnnouncementItem key={a.id} title={a.title} time={a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Latest'} isNew={i === 0} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/student/timetable" icon="📅" label="Timetable" />
            <QuickAction href="/student/food-order" icon="🍕" label="Order Food" />
            <QuickAction href="/student/laundry" icon="🧺" label="Laundry" />
            <QuickAction href="/student/trips" icon="🧭" label="Trips" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
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

function ScheduleItem({
  time,
  title,
  location,
  status,
}: {
  time: string
  title: string
  location: string
  status: 'upcoming' | 'in-progress' | 'later'
}) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    'in-progress': 'bg-green-100 text-green-700 border-green-200',
    later: 'bg-gray-100 text-gray-600 border-gray-200',
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

function AnnouncementItem({
  title,
  time,
  isNew,
}: {
  title: string
  time: string
  isNew?: boolean
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
