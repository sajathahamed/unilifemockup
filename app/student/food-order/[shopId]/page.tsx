import { requireRole } from '@/lib/auth.server'
import ShopDetailClient from './ShopDetailClient'

export default async function ShopDetailPage({ params }: { params: Promise<{ shopId: string }> }) {
    const user = await requireRole('student')
    const { shopId } = await params
    return <ShopDetailClient user={user} shopId={shopId ?? ''} />
}
