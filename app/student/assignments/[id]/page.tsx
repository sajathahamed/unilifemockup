import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StudentAssignmentSubmitClient from '@/components/student/StudentAssignmentSubmitClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StudentAssignmentDetailPage({ params }: PageProps) {
  const user = await requireRole('student')
  const { id } = await params
  const assignmentId = parseInt(id, 10)

  if (Number.isNaN(assignmentId)) {
    return (
      <DashboardLayout user={user}>
        <div className="text-red-600">Invalid assignment</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <StudentAssignmentSubmitClient assignmentId={assignmentId} />
    </DashboardLayout>
  )
}
