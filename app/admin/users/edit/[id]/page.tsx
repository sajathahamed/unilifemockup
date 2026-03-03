import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { EditUserForm } from '@/components'
import { ArrowLeft, UserCog } from 'lucide-react'
import Link from 'next/link'

export default async function AdminEditUserPage({ params }: { params: { id: string } }) {
    const userProfile = await requireRole('admin')

    return (
        <DashboardLayout user={userProfile}>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/users"
                        className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                        <p className="text-sm text-gray-500">Modify campus user details and roles.</p>
                    </div>
                </div>

                {/* Edit Form */}
                <EditUserForm userId={params.id} currentUserRole="admin" />
            </div>
        </DashboardLayout>
    )
}
