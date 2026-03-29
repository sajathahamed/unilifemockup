import { requireRole } from '@/lib/auth.server'
import FoodOrderClient from './FoodOrderClient'

export default async function FoodOrderPage() {
    const user = await requireRole('student')
    return <FoodOrderClient user={user} />
}
