import OrderClient from './OrderClient'

export default async function OrderPage({ params }: { params: Promise<{ shopId: string }> }) {
    // Avoid hard redirect when the Supabase session refresh token is missing.
    // This prevents the UI from looking like navigation "doesn't work".
    const { getCurrentUser } = await import('@/lib/auth.server')
    const user = await getCurrentUser()
    const { shopId } = await params

    if (!user) {
        return (
            <div className="max-w-xl mx-auto py-16 px-4">
                <h1 className="text-xl font-bold text-gray-900">Session expired</h1>
                <p className="text-gray-600 mt-2">
                    Please log in again, then open the shop and place your order.
                </p>
            </div>
        )
    }

    return <OrderClient user={user} shopId={shopId} />
}
