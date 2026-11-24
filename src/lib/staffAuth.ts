import { supabase } from '@/integrations/supabase/client'
import type { AdminProfile, AdminRole, AdminStatus } from '@/types'

/**
 * Staff never type a real e-mail address. A bare username is mapped to a
 * synthetic mailbox before it reaches Supabase Auth, so the hidden portal
 * exposes no real domain and the public app can never guess an account.
 */
export const STAFF_EMAIL_DOMAIN = 'portal.scamshield.local'

/** Consecutive failed sign-in attempts before the UI locks itself. */
export const MAX_FAILED_ATTEMPTS = 5
/** Lockout length after too many failures (UX throttle only). */
export const LOCKOUT_MS = 30_000
/** Idle warning shown one minute before the automatic sign-out. */
export const IDLE_WARNING_MS = 29 * 60 * 1000
/** Automatic sign-out for inactive staff sessions. */
export const IDLE_LIMIT_MS = 30 * 60 * 1000

export function resolveStaffEmail(input: string): string {
  const value = input.trim()
  if (!value) return ''
  if (value.includes('@')) return value.toLowerCase()
  return `${value.toLowerCase()}@${STAFF_EMAIL_DOMAIN}`
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    role: data.role as AdminRole,
    status: data.status as AdminStatus,
    permissions: data.permissions || [],
    created_at: data.created_at,
    last_login: data.last_login,
  }
}

export async function recordStaffLogin(userId: string): Promise<void> {
  await supabase
    .from('admin_profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}