import { requireRole } from '@/lib/auth.server'
import OrderClient from './OrderClient'

export default async function OrderPage({ params }: { params: { shopId: string } }) {
    const user = await requireRole('student')
    return <OrderClient user={user} shopId={params.shopId} />
}
