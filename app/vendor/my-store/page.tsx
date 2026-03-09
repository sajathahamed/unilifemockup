import { requireRole } from '@/lib/auth.server'
import VendorMyStoreClient from './VendorMyStoreClient'

export default async function VendorMyStorePage() {
  const user = await requireRole('vendor')
  return <VendorMyStoreClient user={user} />
}
