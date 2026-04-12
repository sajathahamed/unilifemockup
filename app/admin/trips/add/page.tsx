import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { AdminPageHero, AdminPageStack, AdminBackToDashboard } from '@/components'
import AdminTripAddForm from './AdminTripAddForm'

export default async function AdminTripsAddPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <AdminPageStack>
        <AdminPageHero
          title="Add trip location"
          subtitle="Add trip destinations with itinerary, schedule, and budget details."
        />
        <AdminTripAddForm />
        <AdminBackToDashboard />
      </AdminPageStack>
    </DashboardLayout>
  )
}
