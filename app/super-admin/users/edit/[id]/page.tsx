import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { EditUserForm } from '@/components'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminEditUserPage({ params }: { params: { id: string } }) {
    const userProfile = await requireRole('super_admin')

    return (
        <DashboardLayout user={userProfile}>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/super-admin/users"
                        className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System User Management</h1>
                        <p className="text-sm text-gray-500">Global account modification and authority control.</p>
                    </div>
                </div>

                {/* Edit Form */}
                <EditUserForm userId={params.id} currentUserRole="super_admin" />
            </div>
        </DashboardLayout>
    )
}
