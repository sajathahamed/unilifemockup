import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import { 
  Clock, 
  Users, 
  ArrowRight,
  Calendar,
  Bell,
  MapPin,
  Compass,
  User,
} from 'lucide-react'
import Link from 'next/link'

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

  // 2. Fetch Recent Trips
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
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <p className="mt-1 text-indigo-100 italic">Your uni-life, simplified.</p>
          </div>
          <Compass className="absolute -right-6 -bottom-6 text-white/10 w-48 h-48 rotate-12" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Today's Classes"
            value={timetableEntries?.length ? `${timetableEntries.length} Classes` : 'No Classes'}
            color="bg-violet-500"
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
            value={recentTrips?.length ? `${recentTrips.length} Saved` : 'Plan a Trip'}
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
          {/* Timetable Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-primary" /> Today's Schedule ({today})
              </h2>
              <Link 
                href="/student/timetable" 
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              {timetableEntries && timetableEntries.length > 0 ? (
                timetableEntries.map((entry) => (
                  <ScheduleItem
                    key={entry.id}
                    time={entry.start_time.slice(0, 5)}
                    title={entry.subject}
                    location={entry.location || 'No location set'}
                    startTime={entry.start_time}
                  />
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No classes scheduled for today.</p>
                  <Link href="/student/timetable" className="text-primary text-xs font-semibold mt-2 inline-block">Upload Timetable →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-primary" /> Notifications
              </h2>
            </div>
            
            <div className="space-y-4">
              {notifications && notifications.length > 0 ? (
                notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    title={n.message || 'New reminder'}
                    time={new Date(n.notify_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    status={n.status}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 italic">No recent notifications.</p>
              )}
            </div>
          </div>
        </div>

        {/* Saved Trips Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Compass size={18} className="text-primary" /> Recent Trips
            </h2>
            <Link href="/trip-planner" className="text-sm text-primary hover:text-primary/80 font-medium">Plan new trip →</Link>
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
  const content = (
    <>
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </>
  )
  if (href) {
    return (
      <Link href={href} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 block hover:border-primary/30 hover:shadow-md transition-all active:scale-95">
        {content}
      </Link>
    )
  }
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {content}
    </div>
  )
}

function ScheduleItem({ time, title, location, startTime }: {
  time: string;
  title: string;
  location: string;
  startTime: string;
}) {
  const now = new Date()
  const [h, m] = startTime.split(':').map(Number)
  const classDate = new Date()
  classDate.setHours(h, m, 0)
  
  const isPast = now > classDate
  const status = isPast ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-primary/5 text-primary border-primary/10'

  return (
    <div className={`p-4 rounded-xl border ${status} transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">{time}</span>
        {isPast && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded uppercase">Past</span>}
      </div>
      <h3 className="font-semibold mt-1 truncate">{title}</h3>
      <p className="text-xs opacity-80 mt-0.5 flex items-center gap-1">
        <MapPin size={10} /> {location}
      </p>
    </div>
  )
}

function NotificationItem({ title, time, status }: {
  title: string;
  time: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${status === 'sent' ? 'bg-green-500' : 'bg-primary animate-pulse'}`} />
      <div>
        <p className="text-sm font-medium text-gray-900 leading-tight">{title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{time} · <span className="capitalize">{status}</span></p>
      </div>
    </div>
  )
}
