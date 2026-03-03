import { requireRole } from '@/lib/auth.server'
import ShopDetailClient from './ShopDetailClient'

export default async function ShopDetailPage({ params }: { params: { shopId: string } }) {
    const user = await requireRole('student')
    return <ShopDetailClient user={user} shopId={params.shopId} />
}
