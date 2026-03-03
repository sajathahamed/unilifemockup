import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { CreateUserForm, UserList } from '@/components'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { fetchAllUsers } from '@/lib/supabase/admin'

export default async function SuperAdminUsersPage() {
    const userProfile = await requireRole('super_admin')
    const users = await fetchAllUsers()

    return (
        <DashboardLayout user={userProfile}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/super-admin/dashboard"
                            className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-sm text-gray-500">Create and manage system-wide accounts.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl">
                        <Users size={20} />
                        <span className="font-semibold text-lg">{users.length}</span>
                        <span className="text-sm">Total</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Create User Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <CreateUserForm currentUserRole="super_admin" />

                        {/* User List */}
                        <UserList
                            users={users}
                            title="System-wide User Directory"
                            showActions={true}
                        />
                    </div>

                    {/* User Stats / Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Role Guide</h3>
                            <div className="space-y-3">
                                <RoleInfo role="Super Admin" desc="Full system access across all modules." />
                                <RoleInfo role="Admin" desc="Campus-specific management and approvals." />
                                <RoleInfo role="Vendor Admin" desc="Manage food stalls and shop inventory." />
                                <RoleInfo role="Delivery" desc="Pickup and delivery logistics." />
                                <RoleInfo role="Lecturer" desc="Academic course and timetable management." />
                                <RoleInfo role="Student" desc="Access to all campus student services." />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white">
                            <h3 className="font-semibold mb-2">Automated Onboarding</h3>
                            <p className="text-sm text-blue-100 mb-4">
                                Newly created users will receive an invitation email with their temporary credentials.
                            </p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/20">
                                View Onboarding Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function RoleInfo({ role, desc }: { role: string; desc: string }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-900">{role}</p>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
    )
}
