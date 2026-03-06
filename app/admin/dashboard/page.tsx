import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import { Bell, MapPin, Truck, TrendingUp, Users, Utensils, UserPlus, FileText } from 'lucide-react'
import Link from 'next/link'

type Role = 'student' | 'lecturer' | 'admin' | 'vendor' | 'delivery' | 'super_admin'

export default async function AdminDashboard() {
  const user = await requireRole('admin')
  const client = await createClient()

  const safeCount = async (table: string) => {
    try {
      const { count, error } = await client.from(table).select('*', { count: 'exact', head: true })
      if (error) return 0
      return count ?? 0
    } catch {
      return 0
    }
  }

  const [usersCount, foodStallsCount, laundryShopsCount, tripsCount, announcementsCount, timetableCount] =
    await Promise.all([
      safeCount('users'),
      safeCount('food_stalls'),
      safeCount('laundry_shops'),
      safeCount('trips'),
      safeCount('announcements'),
      safeCount('timetable'),
    ])

  let byRole: Record<string, number> = {}
  try {
    const { data } = await client.from('users').select('role')
    const rows = (data || []) as { role: Role }[]
    byRole = rows.reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  } catch {
    byRole = {}
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-orange-100">Live stats from the database.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={usersCount.toString()} color="bg-blue-500" />
          <StatCard icon={Utensils} label="Food Stalls" value={foodStallsCount.toString()} color="bg-amber-500" />
          <StatCard icon={Truck} label="Laundry Shops" value={laundryShopsCount.toString()} color="bg-cyan-500" />
          <StatCard icon={Bell} label="Announcements" value={announcementsCount.toString()} color="bg-purple-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MiniStat label="Trips" value={tripsCount} />
              <MiniStat label="Timetable Entries" value={timetableCount} />
              <MiniStat label="Reports" value={1} />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              If any number shows 0 unexpectedly, run `run_all.sql` and ensure your RLS policies allow reads.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <ActionButton href="/admin/users/new" label="Add New User" icon={UserPlus} />
              <ActionButton href="/admin/food-stalls/add" label="Register Food Stall" icon={Utensils} />
              <ActionButton href="/admin/laundry/add" label="Register Laundry Shop" icon={Truck} />
              <ActionButton href="/admin/trips/add" label="Add Trip Location" icon={MapPin} />
              <ActionButton href="/admin/announcements" label="Announcements" icon={Bell} />
              <ActionButton href="/admin/reports" label="Reports" icon={FileText} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Distribution by Role</h2>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">Manage users</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <RoleCard role="Students" count={byRole.student || 0} color="bg-blue-500" />
            <RoleCard role="Lecturers" count={byRole.lecturer || 0} color="bg-purple-500" />
            <RoleCard role="Vendors" count={byRole.vendor || 0} color="bg-green-500" />
            <RoleCard role="Delivery" count={byRole.delivery || 0} color="bg-yellow-500" />
            <RoleCard role="Admins" count={byRole.admin || 0} color="bg-red-500" />
            <RoleCard role="Super Admin" count={byRole.super_admin || 0} color="bg-gray-700" />
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
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
