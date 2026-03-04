import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DeliveryLaundryClient from '@/app/delivery/laundry/DeliveryLaundryClient'

export default async function LaundryDeliveryPage() {
    const user = await requireRole('delivery')

    return (
        <DashboardLayout user={user}>
            <DeliveryLaundryClient user={user} />
        </DashboardLayout>
    )
}
