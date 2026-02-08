import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  Users, 
  BookOpen, 
  Building2,
  TrendingUp,
  ArrowRight,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Admin Dashboard 🛠️</h1>
          <p className="mt-1 text-orange-100">Manage users, courses, and campus operations.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value="2,456" change="+12%" color="bg-blue-500" />
          <StatCard icon={BookOpen} label="Active Courses" value="128" change="+5%" color="bg-green-500" />
          <StatCard icon={Building2} label="Departments" value="12" color="bg-purple-500" />
          <StatCard icon={TrendingUp} label="This Month" value="156" change="+23%" color="bg-orange-500" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <Link href="/admin/activities" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              <ActivityItem
                icon={UserPlus}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                title="New user registered"
                description="user created a student account"
                time="5 mins ago"
              />
              <ActivityItem
                icon={BookOpen}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                title="Course created"
                description="Dr. Smith added 'Advanced Mathematics'"
                time="1 hour ago"
              />
              <ActivityItem
                icon={AlertCircle}
                iconBg="bg-yellow-100"
                iconColor="text-yellow-600"
                title="System alert"
                description="Database backup completed successfully"
                time="2 hours ago"
              />
              <ActivityItem
                icon={CheckCircle}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                title="Verification completed"
                description="5 vendor accounts verified"
                time="3 hours ago"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <ActionButton href="/admin/users/new" label="Add New User" icon={UserPlus} />
              <ActionButton href="/admin/courses/new" label="Create Course" icon={BookOpen} />
              <ActionButton href="/admin/announcements/new" label="Post Announcement" icon={AlertCircle} />
              <ActionButton href="/admin/reports" label="Generate Report" icon={TrendingUp} />
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <RoleCard role="Students" count={1850} color="bg-blue-500" />
            <RoleCard role="Lecturers" count={245} color="bg-purple-500" />
            <RoleCard role="Vendors" count={56} color="bg-green-500" />
            <RoleCard role="Delivery" count={89} color="bg-yellow-500" />
            <RoleCard role="Admins" count={16} color="bg-red-500" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">8 pending</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <ApprovalRow name="Campus Café" type="Vendor Registration" submitted="2 hours ago" />
                <ApprovalRow name="Quick Rides" type="Delivery Registration" submitted="5 hours ago" />
                <ApprovalRow name="Book Exchange" type="Marketplace Listing" submitted="1 day ago" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, label, value, change, color }: { 
  icon: any; label: string; value: string; change?: string; color: string 
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {change && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function ActivityItem({ icon: Icon, iconBg, iconColor, title, description, time }: {
  icon: any; iconBg: string; iconColor: string; title: string; description: string; time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
    </div>
  )
}

function ActionButton({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <Icon size={18} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}

function RoleCard({ role, count, color }: { role: string; count: number; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-gray-50">
      <div className={`w-3 h-3 ${color} rounded-full mx-auto mb-2`} />
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  )
}

function ApprovalRow({ name, type, submitted }: { name: string; type: string; submitted: string }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3 font-medium text-gray-900">{name}</td>
      <td className="py-3 text-gray-600">{type}</td>
      <td className="py-3 text-gray-500">{submitted}</td>
      <td className="py-3">
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
            Approve
          </button>
          <button className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors">
            Reject
          </button>
        </div>
      </td>
    </tr>
  )
}
