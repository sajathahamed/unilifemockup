import { requireRole } from '@/lib/auth.server'
import VendorProductsClient from './VendorProductsClient'
import LaundryPricingClient from './LaundryPricingClient'

export default async function VendorProductsPage() {
  const user = await requireRole('vendor')
  if (user.role === 'vendor-laundry') {
    return <LaundryPricingClient user={user} />
  }
  return <VendorProductsClient user={user} />
}
