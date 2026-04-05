import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SavedTripDetailClient from '@/components/trip-planner/SavedTripDetailClient'

export default async function StudentTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole('student')
  const { id } = await params
  const tripId = parseInt(id, 10)

  return (
    <DashboardLayout user={user}>
      <SavedTripDetailClient tripId={tripId} />
    </DashboardLayout>
  )
}
