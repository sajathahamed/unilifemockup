import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AssignmentDetailClient from '@/components/lecturer/AssignmentDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LecturerAssignmentDetailPage({ params }: PageProps) {
  const user = await requireRole('lecturer')
  const { id } = await params
  const assignmentId = parseInt(id, 10)
  if (Number.isNaN(assignmentId)) {
    return (
      <DashboardLayout user={user}>
        <div className="text-red-600">Invalid assignment ID</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <AssignmentDetailClient assignmentId={assignmentId} />
    </DashboardLayout>
  )
}
