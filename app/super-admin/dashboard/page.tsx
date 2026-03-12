import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  Users, 
  Shield, 
  Activity,
  Server,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Database,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const user = await requireRole('super_admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Super Admin Dashboard 🔐</h1>
          <p className="mt-1 text-red-100">Full system control and monitoring.</p>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <HealthCard icon={Server} label="Server Status" status="healthy" value="99.9%" />
          <HealthCard icon={Database} label="Database" status="healthy" value="Normal" />
          <HealthCard icon={Activity} label="API Latency" status="warning" value="245ms" />
          <HealthCard icon={Shield} label="Security" status="healthy" value="Secure" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
              <Link href="/super-admin/analytics" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                Full analytics <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MetricCard label="Total Users" value="2,456" change="+156 this week" positive />
              <MetricCard label="Active Sessions" value="847" change="Peak: 1.2k" />
              <MetricCard label="API Requests" value="1.2M" change="+23% vs last week" positive />
              <MetricCard label="Error Rate" value="0.02%" change="-0.01%" positive />
            </div>

            {/* Recent System Events */}
            <h3 className="font-medium text-gray-900 mb-3">Recent System Events</h3>
            <div className="space-y-3">
              <SystemEvent
                type="success"
                message="Automatic backup completed successfully"
                time="5 mins ago"
              />
              <SystemEvent
                type="warning"
                message="High API latency detected - investigating"
                time="15 mins ago"
              />
              <SystemEvent
                type="success"
                message="Security patch applied - v2.3.1"
                time="1 hour ago"
              />
              <SystemEvent
                type="info"
                message="New user role 'moderator' created"
                time="2 hours ago"
              />
            </div>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* Critical Alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
              <div className="space-y-3">
                <AlertItem
                  type="warning"
                  message="3 failed login attempts from IP 192.168.1.xxx"
                  action="Block IP"
                />
                <AlertItem
                  type="info"
                  message="5 pending vendor verifications"
                  action="Review"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <ActionButton href="/super-admin/users" label="Manage All Users" icon={Users} />
                <ActionButton href="/super-admin/roles" label="Roles & Permissions" icon={Shield} />
                <ActionButton href="/super-admin/settings" label="System Settings" icon={Settings} />
                <ActionButton href="/super-admin/logs" label="View System Logs" icon={Activity} />
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution by Role */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <RoleStatCard role="Students" count={1850} percentage={75} color="bg-blue-500" />
            <RoleStatCard role="Lecturers" count={245} percentage={10} color="bg-purple-500" />
            <RoleStatCard role="Admins" count={16} percentage={1} color="bg-orange-500" />
            <RoleStatCard role="Vendors" count={56} percentage={2} color="bg-green-500" />
            <RoleStatCard role="Delivery" count={89} percentage={4} color="bg-yellow-500" />
            <RoleStatCard role="Super Admins" count={3} percentage={0.1} color="bg-red-500" />
          </div>
        </div>

        {/* Database & Storage */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Usage</h2>
            <div className="space-y-4">
              <StorageBar label="Users Table" used={2.4} total={10} unit="GB" />
              <StorageBar label="Orders Table" used={5.8} total={20} unit="GB" />
              <StorageBar label="Messages" used={1.2} total={5} unit="GB" />
              <StorageBar label="Media Files" used={45} total={100} unit="GB" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Actions</h2>
            <div className="space-y-3">
              <AdminAction
                admin="You"
                action="Updated system settings"
                time="10 mins ago"
              />
              <AdminAction
                admin="Admin Jane"
                action="Approved vendor 'Campus Café'"
                time="1 hour ago"
              />
              <AdminAction
                admin="You"
                action="Banned user for policy violation"
                time="3 hours ago"
              />
              <AdminAction
                admin="Admin Mike"
                action="Created new announcement"
                time="5 hours ago"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function HealthCard({ icon: Icon, label, status, value }: {
  icon: any; label: string; status: 'healthy' | 'warning' | 'critical'; value: string;
}) {
  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <Icon size={20} className="text-gray-400" />
        <span className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function MetricCard({ label, value, change, positive }: {
  label: string; value: string; change: string; positive?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-gray-500'}`}>{change}</p>
    </div>
  )
}

function SystemEvent({ type, message, time }: {
  type: 'success' | 'warning' | 'info'; message: string; time: string;
}) {
  const icons = {
    success: <CheckCircle size={16} className="text-green-500" />,
    warning: <AlertTriangle size={16} className="text-yellow-500" />,
    info: <Activity size={16} className="text-blue-500" />,
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm text-gray-700">{message}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
}

function AlertItem({ type, message, action }: {
  type: 'warning' | 'info'; message: string; action: string;
}) {
  const colors = {
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div className={`p-3 rounded-lg border ${colors[type]}`}>
      <p className="text-sm text-gray-700 mb-2">{message}</p>
      <button className="text-xs font-medium text-primary hover:underline">{action}</button>
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

function RoleStatCard({ role, count, percentage, color }: {
  role: string; count: number; percentage: number; color: string;
}) {
  return (
    <div className="text-center p-4 rounded-xl bg-gray-50">
      <div className={`w-4 h-4 ${color} rounded-full mx-auto mb-2`} />
      <p className="text-xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-500">{role}</p>
      <p className="text-xs text-gray-400">{percentage}%</p>
    </div>
  )
}

function StorageBar({ label, used, total, unit }: {
  label: string; used: number; total: number; unit: string;
}) {
  const percentage = (used / total) * 100

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-500">{used} / {total} {unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function AdminAction({ admin, action, time }: { admin: string; action: string; time: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
        {admin[0]}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium text-gray-900">{admin}</span>
          <span className="text-gray-600"> {action}</span>
        </p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
}
