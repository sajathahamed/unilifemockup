import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import TripPlannerClient from '@/components/trip-planner/TripPlannerClient'

export default async function StudentTripsPage() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <TripPlannerClient />
    </DashboardLayout>
  )
}
