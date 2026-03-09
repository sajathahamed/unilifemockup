import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { CreateUserForm } from '@/components'
import SuperAdminUsersListSection from '@/components/super-admin/SuperAdminUsersListSection'
import SuperAdminPageHeader from '@/components/super-admin/SuperAdminPageHeader'
import { Users, AlertCircle } from 'lucide-react'
import { fetchAllUsersForSuperAdmin } from '@/lib/supabase/admin'
import { ROLES } from '@/lib/pages/registry'
import { UserRole } from '@/lib/auth'

export default async function SuperAdminUsersPage() {
    const userProfile = await requireRole('super_admin')
    const { users, limited } = await fetchAllUsersForSuperAdmin()

    const roleCounts = ROLES.map((role) => ({
        role,
        count: users.filter((u) => u.role === role).length,
    }))

    return (
        <DashboardLayout user={userProfile}>
            <div className="space-y-6">
                <SuperAdminPageHeader
                    title="All Users"
                    subtitle="Create and manage system-wide accounts. Edit roles and delete users."
                    icon={Users}
                    badge={<><span className="font-semibold text-lg">{users.length}</span><span className="text-sm">Total</span></>}
                />

                {limited && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        <div>
                            <p className="font-medium">Showing limited results</p>
                            <p className="text-amber-700 mt-0.5">
                                Add <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your environment (e.g. in Supabase Dashboard: Project Settings → API → service_role secret) so all users are loaded. Right now only rows allowed by Row Level Security are shown.
                            </p>
                        </div>
                    </div>
                )}

                {/* All roles summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Users by role</h3>
                    <div className="flex flex-wrap gap-3">
                        {roleCounts.map(({ role, count }) => (
                            <div
                                key={role}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${getRoleCardClass(role)}`}
                            >
                                <span className="capitalize">{formatRoleLabel(role)}</span>
                                <span className="bg-white/60 dark:bg-black/10 px-2 py-0.5 rounded-lg">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Create User Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <CreateUserForm currentUserRole="super_admin" />

                        {/* User List with vendor filter */}
                        <SuperAdminUsersListSection users={users} title="System-wide User Directory" />
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

function formatRoleLabel(role: string): string {
    return role.replace(/_/g, ' ')
}

function getRoleCardClass(role: UserRole): string {
    switch (role) {
        case 'super_admin':
            return 'bg-purple-50 text-purple-800 border-purple-200'
        case 'admin':
            return 'bg-blue-50 text-blue-800 border-blue-200'
        case 'vendor-food':
            return 'bg-emerald-50 text-emerald-800 border-emerald-200'
        case 'vendor-laundry':
            return 'bg-teal-50 text-teal-800 border-teal-200'
        case 'delivery':
            return 'bg-orange-50 text-orange-800 border-orange-200'
        case 'lecturer':
            return 'bg-indigo-50 text-indigo-800 border-indigo-200'
        case 'student':
            return 'bg-sky-50 text-sky-800 border-sky-200'
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200'
    }
}
