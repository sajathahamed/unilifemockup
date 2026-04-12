import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { AdminPageHero, AdminPageStack, AdminBackToDashboard } from '@/components'
import AdminLaundryAddForm from './AdminLaundryAddForm'

export default async function AdminLaundryAddPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <AdminPageStack>
        <AdminPageHero
          title="Add laundry shop"
          subtitle="Register a laundry shop and assign it to a laundry vendor account created in Super Admin."
        />
        <AdminLaundryAddForm />
        <AdminBackToDashboard />
      </AdminPageStack>
    </DashboardLayout>
  )
}
