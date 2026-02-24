import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Users, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Button, UserList } from '@/components'
import { fetchAllUsers } from '@/lib/supabase/admin'

export default async function AdminUsersPage() {
    const userProfile = await requireRole('admin')
    const users = await fetchAllUsers()

    // Calculate stats
    const stats = {
        students: users.filter(u => u.role === 'student').length,
        lecturers: users.filter(u => u.role === 'lecturer').length,
        vendors: users.filter(u => u.role === 'vendor').length,
        delivery: users.filter(u => u.role === 'delivery').length,
    }

    return (
        <DashboardLayout user={userProfile}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-500">Manage students, lecturers, and service providers.</p>
                    </div>
                    <Link href="/admin/users/new">
                        <Button className="flex items-center gap-2">
                            <UserPlus size={18} />
                            Add New User
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatMini label="Total Students" value={stats.students.toString()} color="bg-blue-500" />
                    <StatMini label="Lecturers" value={stats.lecturers.toString()} color="bg-purple-500" />
                    <StatMini label="Vendors" value={stats.vendors.toString()} color="bg-green-500" />
                    <StatMini label="Delivery" value={stats.delivery.toString()} color="bg-yellow-500" />
                </div>

                {/* User Table */}
                <UserList users={users} title="Campus User Directory" />
            </div>
        </DashboardLayout>
    )
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
    )
}
