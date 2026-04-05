import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import TripPlannerClient from '@/components/trip-planner/TripPlannerClient'

export default async function StudentTripEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole('student')
  const { id } = await params
  const tripId = parseInt(id, 10)

  return (
    <DashboardLayout user={user}>
      <TripPlannerClient editTripId={tripId} />
    </DashboardLayout>
  )
}
