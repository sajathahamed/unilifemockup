import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { EditUserForm } from '@/components'
import SuperAdminPageHeader from '@/components/super-admin/SuperAdminPageHeader'

export default async function SuperAdminEditUserPage({ params }: { params: { id: string } }) {
  const userProfile = await requireRole('super_admin')

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <SuperAdminPageHeader
          title="Edit User"
          subtitle="Update name, email, role, and university. Changes apply after save."
          backHref="/super-admin/users"
        />
        <EditUserForm userId={params.id} currentUserRole="super_admin" />
      </div>
    </DashboardLayout>
  )
}
