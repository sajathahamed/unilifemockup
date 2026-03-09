/**
 * Server-only: read and update page permissions from DB.
 * Fallback to registry when DB has no rows.
 */

import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/auth'
import {
  PAGE_REGISTRY,
  getDefaultNavItemsForRole,
  getAllPagesForRole,
  type PageRecord,
} from './registry'

export interface NavItemPayload {
  label: string
  href: string
  icon: string
}

/** Returns nav items allowed for this role (for sidebar). Super_admin gets all pages. */
export async function getAllowedNavItemsForRole(role: UserRole): Promise<NavItemPayload[]> {
  const supabase = await createClient()

  if (role === 'super_admin') {
    const { data: pages } = await supabase.from('app_pages').select('*').order('role').order('sort_order')
    if (pages && pages.length > 0) {
      const sorted = [...pages].sort(
        (a: any, b: any) => (a.role || '').localeCompare(b.role || '') || (a.sort_order || 0) - (b.sort_order || 0)
      )
      return sorted.map((p: any) => ({ label: p.label, href: p.path, icon: p.icon }))
    }
    return getAllPagesForRole('super_admin').map((p) => ({ label: p.label, href: p.path, icon: p.icon }))
  }

  const { data: perms } = await supabase
    .from('role_page_permissions')
    .select('page_id')
    .eq('role', role)
    .eq('enabled', true)

  if (perms && perms.length > 0) {
    const pageIds = perms.map((r: any) => r.page_id)
    const { data: pages } = await supabase
      .from('app_pages')
      .select('id, path, label, icon, sort_order')
      .in('id', pageIds)
      .order('sort_order')
    if (pages?.length) {
      return pages.map((p: any) => ({ label: p.label, href: p.path, icon: p.icon }))
    }
  }

  return getDefaultNavItemsForRole(role)
}

/** List all pages with permission for a role (for super-admin page management). */
export async function getPagesWithPermissionsForRole(role: UserRole): Promise<
  { page_id: number; path: string; label: string; role: string; icon: string; sort_order: number; enabled: boolean }[]
> {
  const supabase = await createClient()
  const { data: pages } = await supabase.from('app_pages').select('*').eq('role', role).order('sort_order')
  if (!pages?.length) {
    return getAllPagesForRole(role).map((p) => ({
      page_id: p.id,
      path: p.path,
      label: p.label,
      role: p.role,
      icon: p.icon,
      sort_order: p.sort_order,
      enabled: true,
    }))
  }
  const { data: perms } = await supabase
    .from('role_page_permissions')
    .select('page_id, enabled')
    .eq('role', role)
  const permMap = new Map((perms || []).map((r: any) => [r.page_id, r.enabled]))
  return (pages as any[]).map((p: any) => ({
    page_id: p.id,
    path: p.path,
    label: p.label,
    role: p.role,
    icon: p.icon,
    sort_order: p.sort_order,
    enabled: permMap.get(p.id) ?? true,
  }))
}

/** All app_pages (for super_admin: all roles). */
export async function getAllAppPages(): Promise<PageRecord[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('app_pages').select('*').order('id')
  if (data?.length) {
    return data as PageRecord[]
  }
  return PAGE_REGISTRY
}

/** Total number of app pages (from DB or registry). */
export async function getAppPagesCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase.from('app_pages').select('*', { count: 'exact', head: true })
  if (count != null) return count
  return PAGE_REGISTRY.length
}

/** Set enabled for one role+page. Caller must ensure user is super_admin. */
export async function setPagePermission(role: UserRole, pageId: number, enabled: boolean): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('role_page_permissions')
    .upsert({ role, page_id: pageId, enabled }, { onConflict: 'role,page_id' })
  return { error: error?.message ?? null }
}

/** Get permissions for one role (all pages for that role with enabled flag). */
export async function getPermissionsByRole(role: UserRole): Promise<{ page_id: number; enabled: boolean }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('role_page_permissions')
    .select('page_id, enabled')
    .eq('role', role)
  return (data || []) as { page_id: number; enabled: boolean }[]
}
