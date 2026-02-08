import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  BookOpen, 
  Users, 
  FileText,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function LecturerDashboard() {
  const user = await requireRole('lecturer')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Good morning, {user.name.split(' ')[0]}! 📚</h1>
          <p className="mt-1 text-purple-100">You have 3 classes scheduled today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Active Courses" value="4" color="bg-purple-500" />
          <StatCard icon={Users} label="Total Students" value="156" color="bg-blue-500" />
          <StatCard icon={FileText} label="Pending Grades" value="23" color="bg-orange-500" />
          <StatCard icon={Calendar} label="Classes Today" value="3" color="bg-green-500" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Classes */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
              <Link href="/lecturer/schedule" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View schedule <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              <ClassItem
                time="09:00 - 10:30 AM"
                course="CS 101 - Intro to Programming"
                room="Room 101, Block A"
                students={45}
                status="completed"
              />
              <ClassItem
                time="11:00 AM - 12:30 PM"
                course="CS 201 - Data Structures"
                room="Room 203, Block B"
                students={38}
                status="in-progress"
              />
              <ClassItem
                time="02:00 - 03:30 PM"
                course="CS 301 - Algorithms"
                room="Lab 3, IT Building"
                students={32}
                status="upcoming"
              />
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              <TaskItem title="Grade Assignment 3" course="CS 101" dueIn="2 days" />
              <TaskItem title="Upload lecture notes" course="CS 201" dueIn="Today" urgent />
              <TaskItem title="Review project proposals" course="CS 301" dueIn="3 days" />
              <TaskItem title="Prepare quiz questions" course="CS 101" dueIn="5 days" />
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/lecturer/assignments" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Assignment</th>
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <SubmissionRow
                  student="Student"
                  assignment="Programming Assignment 3"
                  course="CS 101"
                  submitted="10 mins ago"
                  status="pending"
                />
                <SubmissionRow
                  student="Jane Smith"
                  assignment="Data Structures Lab 2"
                  course="CS 201"
                  submitted="1 hour ago"
                  status="pending"
                />
                <SubmissionRow
                  student="Mike Johnson"
                  assignment="Algorithm Analysis"
                  course="CS 301"
                  submitted="3 hours ago"
                  status="graded"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
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

function ClassItem({ time, course, room, students, status }: {
  time: string; course: string; room: string; students: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}) {
  const statusConfig = {
    'completed': { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-500' },
    'in-progress': { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500' },
    'upcoming': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500' },
  }
  const config = statusConfig[status]

  return (
    <div className={`p-4 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{time}</span>
        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${config.badge}`}>
          {status === 'in-progress' ? 'Live' : status}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900">{course}</h3>
      <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
        <span>{room}</span>
        <span className="flex items-center gap-1"><Users size={14} /> {students} students</span>
      </div>
    </div>
  )
}

function TaskItem({ title, course, dueIn, urgent }: {
  title: string; course: string; dueIn: string; urgent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${urgent ? 'bg-red-500' : 'bg-gray-300'}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span>{course}</span>
          <span>•</span>
          <span className={urgent ? 'text-red-500 font-medium' : ''}>{dueIn}</span>
        </div>
      </div>
    </div>
  )
}

function SubmissionRow({ student, assignment, course, submitted, status }: {
  student: string; assignment: string; course: string; submitted: string;
  status: 'pending' | 'graded';
}) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3 font-medium text-gray-900">{student}</td>
      <td className="py-3 text-gray-600">{assignment}</td>
      <td className="py-3 text-gray-600">{course}</td>
      <td className="py-3 text-gray-500">{submitted}</td>
      <td className="py-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  )
}
