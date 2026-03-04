import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LecturerAssignmentDetailClient from '@/components/lecturer/LecturerAssignmentDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LecturerAssignmentDetailPage({ params }: PageProps) {
  const user = await requireRole('lecturer')
  const { id } = await params

  return (
    <DashboardLayout user={user}>
      <LecturerAssignmentDetailClient assignmentId={id} />
    </DashboardLayout>
  )
}
