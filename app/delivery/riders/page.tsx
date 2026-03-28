import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DeliveryRidersClient from './DeliveryRidersClient'

export default async function DeliveryRidersPage() {
    const user = await requireRole('delivery')

    return (
        <DashboardLayout user={user}>
            <DeliveryRidersClient user={user} />
        </DashboardLayout>
    )
}
