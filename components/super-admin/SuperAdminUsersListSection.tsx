'use client'

import { UserList } from '@/components'

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
  return <UserList users={users} title={title} showActions={true} enableDelete={true} />
}
