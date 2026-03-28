import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DeliveryOrdersClient from './DeliveryOrdersClient'

export default async function DeliveryOrdersPage() {
    const user = await requireRole('delivery')

    return (
        <DashboardLayout user={user}>
            <DeliveryOrdersClient user={user} />
        </DashboardLayout>
    )
}
