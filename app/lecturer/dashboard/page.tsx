import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getLecturerDashboardData } from '@/lib/lecturer/dashboard.server'
import {
  BookOpen,
  Users,
  FileText,
  Award,
  AlertCircle,
  Clock,
  CheckCircle,
  Zap,
  BarChart3,
  MessageSquare,
  MapPin,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatTimeForDisplay(t: string): string {
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

function getClassStatus(startTime: string, endTime: string): 'completed' | 'in-progress' | 'upcoming' {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = String(startTime).split(':').map(Number)
  const [endH, endM] = String(endTime).split(':').map(Number)
  const startMinutes = (startH || 0) * 60 + (startM || 0)
  const endMinutes = (endH || 0) * 60 + (endM || 0)
  if (currentMinutes < startMinutes) return 'upcoming'
  if (currentMinutes >= endMinutes) return 'completed'
  return 'in-progress'
}

interface StatCardProps {
  icon: any
  label: string
  value: string
  color: string
  trend?: number
  subtitle?: string
}

interface ClassItemProps {
  time: string
  course: string
  room: string
  students: number
  status: 'completed' | 'in-progress' | 'upcoming'
  attended?: number
}

interface TaskItemProps {
  title: string
  course: string
  dueIn: string
  urgent?: boolean
}

interface ActionCardProps {
  icon: any
  title: string
  desc: string
  color: string
}

interface MetricBarProps {
  label: string
  value: number
  maxValue?: number
  color?: string
}

interface SubmissionRowProps {
  student: string
  assignment: string
  course: string
  submitted: string
  status: 'pending' | 'graded'
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  trend,
  subtitle
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

function ClassItem({ 
  time, 
  course, 
  room, 
  students, 
  status, 
  attended 
}: ClassItemProps) {
  const statusConfig = {
    'completed': { 
      bg: 'bg-gradient-to-r from-gray-50 to-gray-100', 
      border: 'border-gray-200', 
      icon: CheckCircle, 
      badge: 'bg-gray-600' 
    },
    'in-progress': { 
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50', 
      border: 'border-green-200', 
      icon: Zap, 
      badge: 'bg-green-600' 
    },
    'upcoming': { 
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50', 
      border: 'border-blue-200', 
      icon: Clock, 
      badge: 'bg-blue-600' 
    },
  }
  
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const attendeeCount = attended || 0

  return (
    <div className={`p-5 rounded-xl border ${config.bg} ${config.border} hover:shadow-sm transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon size={18} className={status === 'completed' ? 'text-gray-600' : status === 'in-progress' ? 'text-green-600' : 'text-blue-600'} />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{time}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{course}</h3>
        </div>
        <span className={`text-xs text-white px-3 py-1 rounded-full ${config.badge} whitespace-nowrap`}>
          {status === 'in-progress' ? 'Live Now' : status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 gap-4 pt-3 border-t border-gray-200/50">
        <span className="flex items-center gap-1.5"><MapPin size={14} /> {room}</span>
        <span className="flex items-center gap-1.5"><Users size={14} /> {attendeeCount} / {students}</span>
      </div>
    </div>
  )
}

function TaskItem({ 
  title, 
  course, 
  dueIn, 
  urgent 
}: TaskItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${urgent ? 'bg-red-500' : 'bg-blue-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{course}</span>
          <span className={urgent ? 'text-red-600 font-semibold' : ''}>{dueIn}</span>
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  color
}: ActionCardProps) {
  return (
    <div className={`w-full ${color} text-white rounded-xl p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer`}>
      <Icon size={28} className="mb-3 opacity-90" />
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs opacity-80">{desc}</p>
    </div>
  )
}

function MetricBar({
  label,
  value,
  maxValue,
  color
}: MetricBarProps) {
  const maxVal = maxValue || 100
  const col = color || 'bg-blue-500'
  const percentage = (value / maxVal) * 100
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-sm font-semibold text-gray-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${col} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function SubmissionRow({ 
  student, 
  assignment, 
  course, 
  submitted, 
  status 
}: SubmissionRowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">{student}</td>
      <td className="px-6 py-4 text-gray-700">{assignment}</td>
      <td className="px-6 py-4 text-gray-700 text-sm">{course}</td>
      <td className="px-6 py-4 text-gray-600 text-sm">{submitted}</td>
      <td className="px-6 py-4">
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
          status === 'pending' ? 'bg-yellow-100/80 text-yellow-700' : 'bg-green-100/80 text-green-700'
        }`}>
          {status === 'pending' ? '⏳ Pending' : '✓ Graded'}
        </span>
      </td>
    </tr>
  )
}

export default async function LecturerDashboard() {
  const user = await requireRole('lecturer')
  const { courses, students, schedule } = await getLecturerDashboardData()

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  const today = new Date()
  const todayDayName = DAY_NAMES[today.getDay()]
  const todaySchedule = schedule
    .filter((s) => s.day_of_week === todayDayName)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))

  const courseCount = courses.length
  const studentCount = students.length
  const todayClassesCount = todaySchedule.length

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-400/10 rounded-full -ml-30 -mb-30 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {greeting}, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/90 text-lg">Welcome back to your teaching dashboard</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-xl px-4 py-3">
                <Clock size={20} />
                <div>
                  <p className="text-sm font-medium text-white/80">Classes Today</p>
                  <p className="text-2xl font-bold text-white">{todayClassesCount}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/80">
              <span>📊 {studentCount} student{studentCount !== 1 ? 's' : ''} enrolled</span>
              <span>•</span>
              <span>📚 {courseCount} course{courseCount !== 1 ? 's' : ''} running</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Active Courses"
            value={String(courseCount)}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle={`${courseCount} course${courseCount !== 1 ? 's' : ''} running`}
          />
          <StatCard
            icon={Users}
            label="Total Students"
            value={String(studentCount)}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="across all courses"
          />
          <StatCard
            icon={FileText}
            label="Pending Grades"
            value="—"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle="Assignments module coming soon"
          />
          <StatCard
            icon={Award}
            label="Schedule Entries"
            value={String(schedule.length)}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="timetable slots"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Classes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Clock size={20} /> Today&apos;s Classes
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {todayDayName}, {today.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Link
                    href="/lecturer/schedule"
                    className="text-white hover:text-blue-100 flex items-center gap-1 text-sm font-medium"
                  >
                    View schedule <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {todaySchedule.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No classes scheduled for today</p>
                    <Link href="/lecturer/schedule" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1 inline-block">
                      Add to schedule →
                    </Link>
                  </div>
                ) : (
                  todaySchedule.map((entry) => {
                    const status = getClassStatus(entry.start_time, entry.end_time)
                    const courseLabel = entry.course_name
                      ? `${entry.course_code || ''} - ${entry.course_name}`.trim()
                      : `Course #${entry.course_id}`
                    return (
                      <ClassItem
                        key={entry.id}
                        time={`${formatTimeForDisplay(entry.start_time)} - ${formatTimeForDisplay(entry.end_time)}`}
                        course={courseLabel}
                        room={entry.location || '—'}
                        students={studentCount}
                        status={status}
                        attended={undefined}
                      />
                    )
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/lecturer/assignments" className="block">
                <ActionCard
                  icon={MessageSquare}
                  title="Post Announcement"
                  desc="Create a new class announcement"
                  color="bg-gradient-to-br from-cyan-500 to-blue-500"
                />
              </Link>
              <Link href="/lecturer/assignments" className="block">
                <ActionCard
                  icon={FileText}
                  title="Grade Assignment"
                  desc="Start grading pending submissions"
                  color="bg-gradient-to-br from-orange-500 to-red-500"
                />
              </Link>
            </div>
          </div>

          {/* Pending Tasks Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertCircle size={20} /> Pending Tasks
              </h2>
              <p className="text-amber-100 text-sm mt-1">Manage assignments & deadlines</p>
            </div>
            <div className="divide-y divide-gray-100 flex-1">
              <TaskItem title="Review schedule" course="Schedule" dueIn="Ongoing" urgent={false} />
              <TaskItem title="Grade submissions" course="Assignments" dueIn="When ready" urgent={false} />
              <TaskItem title="Update course materials" course="Courses" dueIn="As needed" urgent={false} />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <Link
                href="/lecturer/assignments"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View assignments <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Submissions & Analytics */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CheckCircle size={20} /> Recent Submissions
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">Latest from your students</p>
                </div>
                <Link
                  href="/lecturer/assignments"
                  className="text-white hover:text-emerald-100 flex items-center gap-1 text-sm font-medium"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Assignment</th>
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium">Submitted</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No submissions yet. When students submit assignments, they will appear here.</p>
                      <Link href="/lecturer/assignments" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                        Go to Assignments →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Performance - real course names */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 size={20} /> Courses
              </h2>
              <p className="text-indigo-100 text-sm mt-1">{courses.length} active courses</p>
            </div>
            <div className="p-6 space-y-4">
              {courses.length === 0 ? (
                <p className="text-sm text-gray-500">No courses yet. Add courses from the admin to see them here.</p>
              ) : (
                courses.slice(0, 6).map((c, i) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500']
                  const scheduleCount = schedule.filter((s) => s.course_id === c.id).length
                  const maxSlots = Math.max(...courses.map((co) => schedule.filter((s) => s.course_id === co.id).length), 1)
                  const pct = maxSlots > 0 ? Math.round((scheduleCount / maxSlots) * 100) : 0
                  return (
                    <MetricBar
                      key={c.id}
                      label={`${c.course_code} – ${c.course_name}`}
                      value={pct}
                      maxValue={100}
                      color={colors[i % colors.length]}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
