import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StudentProfileClient from '@/components/student/StudentProfileClient'
import { createClient } from '@/lib/supabase/server'

export default async function StudentProfilePage() {
  const user = await requireRole('student')
  const supabase = await createClient()

  const { data: phoneData } = await supabase
    .from('student_phones')
    .select('mobile')
    .eq('user_id', user.id)
    .single()

  return (
    <DashboardLayout user={user}>
      <StudentProfileClient user={user} initialMobile={phoneData?.mobile || ''} />
    </DashboardLayout>
  )
}
