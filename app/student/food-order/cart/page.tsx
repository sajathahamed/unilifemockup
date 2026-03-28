import { requireRole } from '@/lib/auth.server'
import StudentFoodCartPageClient from './StudentFoodCartPageClient'

export default async function StudentFoodCartPage() {
  const user = await requireRole('student')
  return <StudentFoodCartPageClient user={user} />
}

