import { requireRole } from '@/lib/auth.server'
import VendorProductsClient from './VendorProductsClient'

export default async function VendorProductsPage() {
  const user = await requireRole('vendor')
  return <VendorProductsClient user={user} />
}
