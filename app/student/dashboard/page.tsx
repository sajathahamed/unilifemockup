import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getStudentDashboardData } from '@/lib/student/dashboard.server'
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Bell,
  LucideIcon,
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
  const { coursesCount, timetableToday, assignmentsCount } = await getStudentDashboardData()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="mt-1 text-indigo-100">Here&apos;s what&apos;s happening with your courses today.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Courses" value={String(coursesCount)} color="bg-blue-500" />
          <StatCard icon={Clock} label="Classes today" value={String(timetableToday.length)} color="bg-orange-500" />
          <StatCard icon={CheckCircle} label="Assignments" value={String(assignmentsCount)} color="bg-green-500" />
          <StatCard icon={Users} label="Study Groups" value="—" color="bg-purple-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Today&apos;s Schedule</h2>
              <Link href="/student/timetable" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {timetableToday.length === 0 ? (
                <p className="text-text-muted text-sm py-4">No classes scheduled for today.</p>
              ) : (
                timetableToday.map((entry) => {
                  const status = getStatus(entry.start_time, entry.end_time)
                  const title = entry.course_name ? `${entry.course_code || ''} - ${entry.course_name}`.trim() : `Course #${entry.course_id}`
                  return (
                    <ScheduleItem key={entry.id} time={`${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}`} title={title} location={entry.location || '—'} status={status} />
                  )
                })
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Announcements</h2>
              <Bell size={18} className="text-text-muted" />
            </div>
            <div className="space-y-4">
              <AnnouncementItem title="Check your timetable for updates" time="Today" isNew />
              <AnnouncementItem title="Submit assignments before due date" time="Reminder" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/student/assignments" icon="📝" label="Assignments" />
            <QuickAction href="/student/courses" icon="📚" label="Courses" />
            <QuickAction href="/student/timetable" icon="📅" label="Timetable" />
            <QuickAction href="/student/study-groups" icon="👥" label="Study Groups" />
            <QuickAction href="/student/food-order" icon="🍕" label="Order Food" />
            <QuickAction href="/student/rides" icon="🚗" label="Book Ride" />
            <QuickAction href="/student/marketplace" icon="🛒" label="Marketplace" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
}

function ScheduleItem({ time, title, location, status }: { time: string; title: string; location: string; status: 'upcoming' | 'in-progress' | 'later' }) {
  const statusColors = {
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-green-500/20 text-green-400 border-green-500/30',
    later: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-glass hover:bg-glassBorder transition-colors">
      <div className="w-20 text-sm font-medium text-text-secondary">{time}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-muted">{location}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
        {status === 'in-progress' ? 'Now' : status === 'upcoming' ? 'Upcoming' : 'Later'}
      </span>
    </div>
  )
}

function AnnouncementItem({ title, time, isNew }: { title: string; time: string; isNew?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-glass transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${isNew ? 'bg-primary' : 'bg-gray-500'}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-muted">{time}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-glass hover:bg-glassBorder transition-all hover-lift">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </Link>
  )
}