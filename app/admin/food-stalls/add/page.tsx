import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { AdminPageHero, AdminPageStack, AdminBackToDashboard } from '@/components'
import AdminFoodStallAddForm from './AdminFoodStallAddForm'

export default async function AdminFoodStallsAddPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <AdminPageStack>
        <AdminPageHero
          title="Add food stall"
          subtitle="Register a food stall and assign it to a food vendor account created in Super Admin."
        />
        <AdminFoodStallAddForm />
        <AdminBackToDashboard />
      </AdminPageStack>
    </DashboardLayout>
  )
}
