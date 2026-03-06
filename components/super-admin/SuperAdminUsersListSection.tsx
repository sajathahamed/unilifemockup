'use client'

import { useState, useMemo } from 'react'
import { UserList } from '@/components'
import VendorSelect from './VendorSelect'

interface UserRow {
  id: number
  auth_id: string | null
  name: string
  email: string
  role: string
  uni_id: number | null
  created_at: string
}

interface SuperAdminUsersListSectionProps {
  users: UserRow[]
  title?: string
}

export default function SuperAdminUsersListSection({ users, title = 'System-wide User Directory' }: SuperAdminUsersListSectionProps) {
  const [vendorEmail, setVendorEmail] = useState('')

  const vendors = useMemo(
    () => users.filter((u) => u.role === 'vendor').map((u) => ({ id: u.id, name: u.name, email: u.email })),
    [users]
  )

  const filteredUsers = useMemo(() => {
    if (!vendorEmail) return users
    return users.filter((u) => u.email === vendorEmail)
  }, [users, vendorEmail])

  return (
    <div className="space-y-4">
      {vendors.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by vendor:</span>
          <VendorSelect
            vendors={vendors}
            value={vendorEmail}
            onChange={setVendorEmail}
            placeholder="All users"
            className="min-w-[200px]"
          />
          {vendorEmail && (
            <button
              type="button"
              onClick={() => setVendorEmail('')}
              className="text-sm text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <UserList users={filteredUsers} title={title} showActions={true} enableDelete={true} />
    </div>
  )
}
