import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { CreateUserForm } from '@/components'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AdminNewUserPage() {
    const user = await requireRole('admin')

    return (
        <DashboardLayout user={user}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
                        <p className="text-sm text-gray-500">Create accounts for vendors, lecturers, or students.</p>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <CreateUserForm currentUserRole="admin" />
                </div>

                {/* Info Card */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-orange-800">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        Important Note
                    </h3>
                    <p className="text-sm">
                        As an Administrator, you can create various user roles except for other Admins or Super Admins.
                        New users will be automatically assigned to your current university if selected.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    )
}
