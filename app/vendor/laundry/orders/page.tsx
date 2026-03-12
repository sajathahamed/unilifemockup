import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LaundryOrdersClient from './LaundryOrdersClient'

export default async function LaundryOrdersPage() {
    const user = await requireRole('vendor')

    return (
        <DashboardLayout user={user}>
            <LaundryOrdersClient user={user} />
        </DashboardLayout>
    )
}
