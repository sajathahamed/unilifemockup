import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import { 
  Clock, 
  Users, 
  User,
  ArrowRight,
  Bell,
  Calendar,
  Compass,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
  const supabase = await createClient()

  // 1. Fetch Today's Classes
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[new Date().getDay()]
  const now = new Date()
  const isoToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const { data: timetableRows } = await supabase
    .from('student_timetable_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  const timetableEntries = (timetableRows || []).filter((row) => {
    if (row.entry_type === 'exam' && row.exam_date) {
      return String(row.exam_date).slice(0, 10) === isoToday
    }
    return row.day_of_week === today
  })

  // 2. Fetch Trips - total count and recent 3
  const { count: totalTripsCount } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: recentTrips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // 3. Fetch Notifications
  const { data: notifications } = await supabase
    .from('timetable_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('notify_at', { ascending: false })
    .limit(5)

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <p className="mt-1 text-emerald-100 italic">Your uni-life, simplified.</p>
          </div>
          <Compass className="absolute -right-6 -bottom-6 text-white/10 w-48 h-48 rotate-12" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Today's Classes"
            value={timetableEntries?.length ? `${timetableEntries.length} Classes` : 'No Classes'}
            color="bg-emerald-500"
            href="/student/timetable"
          />
          <StatCard
            icon={User}
            label="Profile"
            value="Phone & SMS"
            color="bg-slate-600"
            href="/student/profile"
          />
          <StatCard
            icon={MapPin}
            label="Saved Trips"
            value={`${totalTripsCount || 0} Trips`}
            color="bg-blue-500"
            href="/trip-planner"
          />
          <StatCard
            icon={Users}
            label="Study Groups"
            value="Active"
            color="bg-green-500"
            href="/student/study-groups"
          />
        </div>

        {/* Main Content Grid */}
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
              {timetableEntries.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No classes scheduled for today.</p>
              ) : (
                timetableEntries.map((entry) => {
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
              {notifications && notifications.length > 0 ? (
                notifications.map((n) => (
                  <AnnouncementItem
                    key={n.id}
                    title={n.message || 'New reminder'}
                    time={new Date(n.notify_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    isNew={String(n.status).toLowerCase() === 'scheduled'}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 italic">No recent notifications.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/student/assignments" icon="📝" label="Assignments" />
            <QuickAction href="/student/courses" icon="📚" label="Courses" />
            <QuickAction href="/student/timetable" icon="📅" label="Timetable" />
            <QuickAction href="/student/study-groups" icon="👥" label="Study Groups" />
            <QuickAction href="/student/food-order" icon="🍕" label="Order Food" />
            <QuickAction href="/student/rides" icon="🚗" label="Book Ride" />
            <QuickAction href="/student/marketplace" icon="🛒" label="Marketplace" />
          </div>
          {recentTrips && recentTrips.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-primary/20 transition-all flex flex-col gap-2"
                >
                  <p className="font-bold text-gray-900 truncate">{trip.destination}</p>
                  <p className="text-xs text-gray-500">{trip.days} Days · {trip.travelers} Travelers</p>
                  <p className="text-xs font-semibold text-primary">
                    Budget: Rs {Math.round(trip.total_budget || trip.budget).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    <Link
                      href={`/trip-planner/${trip.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View
                    </Link>
                    <span className="text-gray-300">·</span>
                    <Link
                      href={`/trip-planner/${trip.id}/edit`}
                      className="text-xs font-semibold text-gray-600 hover:text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-500 text-sm">No saved trips yet.</p>
            </div>
          )}
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
