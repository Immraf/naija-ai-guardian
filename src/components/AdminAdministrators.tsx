import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { UserPlus, Users, DotsThree } from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import type { AdminProfile, AdminRole } from '@/types'

const PERMISSION_OPTIONS = [
  { key: 'view_reports', label: 'View Reports' },
  { key: 'confirm_scam', label: 'Confirm Scam' },
  { key: 'reject_report', label: 'Reject Report' },
  { key: 'mark_duplicate', label: 'Mark Duplicate' },
  { key: 'resolve_report', label: 'Resolve Report' },
  { key: 'view_intelligence', label: 'Scam Intelligence' },
  { key: 'view_audit_logs', label: 'View Audit Logs' },
]

interface AdminRowProps {
  admin: AdminProfile
  isCurrentUser: boolean
  onToggleStatus: (id: string, status: string) => void
  onUpdatePermissions: (id: string, perms: string[]) => void
  onConfirmAction: (id: string, action: 'enable' | 'disable') => void
}

function AdminRow({ admin, isCurrentUser, onToggleStatus, onUpdatePermissions, onConfirmAction }: AdminRowProps & { onConfirmAction: (id: string, action: 'enable' | 'disable') => void }) {
  const [editing, setEditing] = useState(false)
  const [localPerms, setLocalPerms] = useState<string[]>(admin.permissions)

  function togglePerm(perm: string) {
    setLocalPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  function savePerms() {
    onUpdatePermissions(admin.id, localPerms)
    setEditing(false)
  }

  return (
    <div className={cn(
      'rounded-xl border bg-white p-3 dark:bg-[#111827] transition-all',
      admin.status === 'DISABLED' ? 'border-amber-200 dark:border-amber-900/30 opacity-60' : 'border-[#E5E7EB] dark:border-gray-700'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
            admin.role === 'SUPER_ADMIN' ? 'bg-[#00796B]/10 text-[#00796B]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'
          )} aria-hidden="true">
            {admin.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#111827] dark:text-white truncate">
              {admin.full_name}
              {isCurrentUser && <span className="ml-1.5 text-[10px] text-[#00796B]">(You)</span>}
            </p>
            <p className="text-[10px] text-[#667085]" aria-label={`Email: ${admin.email.replace(/(.{3}).+@/, '$1***@')}`}>{admin.email.replace(/(.{3}).+@/, '$1***@')}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                admin.role === 'SUPER_ADMIN'
                  ? 'bg-[#00796B]/10 text-[#00796B]'
                  : 'bg-[#3B82F6]/10 text-[#3B82F6]'
              )}>{admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub-Admin'}</span>
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                admin.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}>{admin.status === 'ACTIVE' ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {admin.role === 'SUB_ADMIN' && (
            <button
              onClick={() => onConfirmAction(admin.id, admin.status === 'ACTIVE' ? 'disable' : 'enable')}
              aria-label={admin.status === 'ACTIVE' ? `Disable ${admin.full_name}` : `Enable ${admin.full_name}`}
              className={cn(
                'rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors focus-ring',
                admin.status === 'ACTIVE'
                  ? 'border-[#EF4444] text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'border-[#10B981] text-[#10B981] hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              )}
            >
              {admin.status === 'ACTIVE' ? 'Disable' : 'Enable'}
            </button>
          )}
          <button
            onClick={() => { setEditing(!editing); setLocalPerms(admin.permissions) }}
            aria-label={editing ? `Close permissions for ${admin.full_name}` : `Edit permissions for ${admin.full_name}`}
            className="rounded-lg p-1.5 text-[#667085] hover:bg-[#00796B]/10 hover:text-[#00796B] focus-ring"
          >
            <DotsThree className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {editing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 border-t border-[#E5E7EB] pt-3 dark:border-gray-700">
          <p className="mb-2 text-[10px] font-medium text-[#667085] uppercase">Permissions</p>
          <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label={`Permissions for ${admin.full_name}`}>
            {PERMISSION_OPTIONS.map((p) => (
              <button key={p.key} onClick={() => togglePerm(p.key)}
                aria-pressed={localPerms.includes(p.key)}
                className={cn(
                  'rounded-lg border px-2 py-1 text-[10px] font-medium transition-all focus-ring',
                  localPerms.includes(p.key)
                    ? 'border-[#00796B] bg-[#00796B]/10 text-[#00796B]'
                    : 'border-[#E5E7EB] text-[#667085] hover:border-[#00796B]/30 dark:border-gray-600'
                )}
              >{p.label}</button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="rounded-lg border border-[#E5E7EB] px-3 py-1 text-[10px] font-medium text-[#667085] focus-ring">Cancel</button>
            <button onClick={savePerms} className="rounded-lg bg-[#00796B] px-3 py-1 text-[10px] font-medium text-white hover:bg-[#00695C] focus-ring">Save Permissions</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function AdminAdministrators({
  admins,
  currentAdminId,
  onRefresh,
}: {
  admins: AdminProfile[]
  currentAdminId: string
  onRefresh: () => void
}) {
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'enable' | 'disable' } | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['view_reports'])

  async function toggleAdminStatus(adminId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    const { error } = await supabase
      .from('admin_profiles')
      .update({ status: newStatus })
      .eq('id', adminId)
    if (error) { toast.error(error.message) } else {
      toast.success(`Admin ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'}`)
      onRefresh()
    }
  }

  async function handleAddSubAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim() || !newName.trim() || !newPassword.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setAdding(true)
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword,
      })
      if (signUpError || !authData.user) throw new Error(signUpError?.message || 'Failed to create user')

      const { error: profileError } = await supabase.from('admin_profiles').insert({
        id: authData.user.id,
        full_name: newName.trim(),
        email: newEmail.trim(),
        role: 'SUB_ADMIN' as AdminRole,
        status: 'ACTIVE',
        permissions: selectedPerms,
      })
      if (profileError) throw new Error(profileError.message)

      toast.success('Sub-Admin created successfully')
      setNewEmail('')
      setNewName('')
      setNewPassword('')
      setSelectedPerms(['view_reports'])
      setShowAdd(false)
      onRefresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin')
    } finally {
      setAdding(false)
    }
  }

  async function updatePermissions(adminId: string, perms: string[]) {
    const { error } = await supabase.from('admin_profiles').update({ permissions: perms }).eq('id', adminId)
    if (error) { toast.error(error.message) } else {
      toast.success('Permissions updated')
      onRefresh()
    }
  }

  function togglePerm(perm: string) {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  return (
    <div role="region" aria-label="Administrator accounts management" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111827] dark:text-white">Administrator Accounts</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          aria-label={showAdd ? 'Cancel adding sub-admin' : 'Add sub-admin'}
          className="flex items-center gap-1.5 rounded-lg bg-[#00796B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#00695C] focus-ring active:scale-[0.98] transition-all"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Add Sub-Admin
        </button>
      </div>

      {showAdd && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddSubAdmin}
          aria-label="Add new sub-administrator form"
          className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827] space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="new-admin-name" className="mb-1 block text-[10px] font-medium text-[#667085] uppercase">Full Name</label>
              <input id="new-admin-name" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Chidi Okafor"
                autoComplete="name"
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-3 py-2 text-xs text-[#111827] outline-none focus:border-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label htmlFor="new-admin-email" className="mb-1 block text-[10px] font-medium text-[#667085] uppercase">Email</label>
              <input id="new-admin-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-3 py-2 text-xs text-[#111827] outline-none focus:border-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label htmlFor="new-admin-password" className="mb-1 block text-[10px] font-medium text-[#667085] uppercase">Temp Password</label>
              <input id="new-admin-password" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set initial password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-3 py-2 text-xs text-[#111827] outline-none focus:border-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </div>
          </div>
          <div role="group" aria-label="Select permissions for new admin">
            <p className="mb-2 text-[10px] font-medium text-[#667085] uppercase">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {PERMISSION_OPTIONS.map((p) => (
                <button key={p.key} type="button" onClick={() => togglePerm(p.key)}
                  aria-pressed={selectedPerms.includes(p.key)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all focus-ring',
                    selectedPerms.includes(p.key)
                      ? 'border-[#00796B] bg-[#00796B]/10 text-[#00796B]'
                      : 'border-[#E5E7EB] text-[#667085] hover:border-[#00796B]/30 dark:border-gray-600'
                  )}
                >{p.label}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#667085] focus-ring dark:border-gray-600">Cancel</button>
            <button type="submit" disabled={adding}
              className="flex items-center gap-1 rounded-lg bg-[#00796B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#00695C] focus-ring disabled:opacity-50">
              {adding ? 'Creating...' : <><UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> Create Admin</>}
            </button>
          </div>
        </motion.form>
      )}

      {admins.length === 0 ? (
        <div role="status" className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-12 dark:border-gray-700">
          <Users className="mb-2 h-8 w-8 text-[#667085]" aria-hidden="true" />
          <p className="text-xs font-medium text-[#667085]">No administrators found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isCurrentUser={admin.id === currentAdminId}
              onToggleStatus={toggleAdminStatus}
              onUpdatePermissions={updatePermissions}
              onConfirmAction={(id, action) => setConfirmAction({ id, action })}
            />
          ))}
        </div>
      )}

      {/* Confirmation dialog for enable/disable */}
      {confirmAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Confirm ${confirmAction.action} administrator`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-sm font-bold text-[#111827] dark:text-white">
              {confirmAction.action === 'disable' ? 'Disable Administrator' : 'Enable Administrator'}
            </h3>
            <p className="mb-5 text-xs text-[#667085]">
              Are you sure you want to {confirmAction.action} this administrator? They will{" "}
              {confirmAction.action === 'disable' ? 'lose access to the admin panel' : 'regain access to the admin panel'}.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#667085] focus-ring dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const admin = admins.find((a) => a.id === confirmAction.id)
                  if (admin) toggleAdminStatus(admin.id, admin.status)
                  setConfirmAction(null)
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium text-white focus-ring',
                  confirmAction.action === 'disable'
                    ? 'bg-[#EF4444] hover:bg-red-600'
                    : 'bg-[#10B981] hover:bg-emerald-600'
                )}
              >
                {confirmAction.action === 'disable' ? 'Yes, Disable' : 'Yes, Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}