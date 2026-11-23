import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Funnel, Shield, MagnifyingGlass, ListChecks, Eye, EyeSlash, CheckCircle, X } from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/utils/scamUtils'
import type { AuditLog, AdminProfile } from '@/types'

interface Props {
  logs: AuditLog[]
  loading: boolean
  adminProfile: AdminProfile
  onRefresh: () => void
}

export default function AdminAudit({ logs, loading, adminProfile, onRefresh }: Props) {
  const [actionFilter, setActionFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [mfaEnabled, setMfaEnabled] = useState(false)

  const uniqueActions = [...new Set(logs.map((l) => l.action))]

  const filtered = logs.filter((l) => {
    if (actionFilter && !l.action.toLowerCase().includes(actionFilter.toLowerCase())) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        l.admin_email.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.details && JSON.stringify(l.details).toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="region" aria-label="Audit logs and security panel" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-[#111827] dark:text-white">Audit Logs & Security</h2>
        <button onClick={onRefresh} className="text-xs text-[#00796B] hover:underline focus-ring rounded px-1" aria-label="Refresh audit logs">Refresh</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div role="group" aria-label="Total actions logged" className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
          <div className="mb-2 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[#00796B]" aria-hidden="true" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">Total Actions</p>
          </div>
          <p className="text-2xl font-bold text-[#111827] dark:text-white">{logs.length}</p>
        </div>
        <div role="group" aria-label="Security status: Active" className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">Security Status</p>
          </div>
          <p className="text-lg font-bold text-[#10B981]">Active</p>
          <p className="mt-1 text-[10px] text-[#667085]">All systems operational</p>
        </div>
        <div role="group" aria-label={`MFA status: ${mfaEnabled ? 'Enabled' : 'Disabled'}`} className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">MFA Status</p>
            </div>
            <button
              onClick={() => setMfaEnabled(!mfaEnabled)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMfaEnabled(!mfaEnabled) } }}
              role="switch"
              aria-checked={mfaEnabled}
              aria-label="Toggle multi-factor authentication"
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors focus-ring',
                mfaEnabled ? 'bg-[#00796B]' : 'bg-[#E5E7EB] dark:bg-gray-600'
              )}
            >
              <span className={cn(
                'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
                mfaEnabled && 'translate-x-4'
              )} />
            </button>
          </div>
          <p className="text-lg font-bold text-[#111827] dark:text-white">{mfaEnabled ? 'Enabled' : 'Disabled'}</p>
          <p className="mt-1 text-[10px] text-[#667085]">Multi-factor authentication</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="audit-search" className="sr-only">Search audit logs</label>
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
          <input id="audit-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="audit-action-filter" className="sr-only">Filter by action</label>
          <Funnel className="h-4 w-4 text-[#667085]" aria-hidden="true" />
          <select id="audit-action-filter" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            <option value="">All Actions</option>
            {uniqueActions.slice(0, 20).map((a) => (
              <option key={a} value={a}>{a.slice(0, 40)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading audit logs...</span>
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-16 dark:border-gray-700" role="status">
          <Clock className="mb-3 h-10 w-10 text-[#667085]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#667085]">No audit logs found</p>
          <p className="mt-1 text-xs text-[#667085] no-underline">Admin actions will be recorded here.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs text-[#667085]" role="status" aria-live="polite">{filtered.length} log{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 dark:border-gray-700 dark:bg-[#111827]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00796B]/10">
                <Shield className="h-3.5 w-3.5 text-[#00796B]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-[#111827] dark:text-white truncate">{log.action}</p>
                  <span className="text-[10px] text-[#667085] flex-shrink-0">{timeAgo(log.created_at)}</span>
                </div>
                <p className="text-[10px] text-[#667085]">{log.admin_email}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[10px] text-[#00796B] hover:underline">View details</summary>
                    <pre className="mt-1 rounded bg-[#F7F8F6] p-2 text-[9px] text-[#667085] overflow-x-auto dark:bg-gray-800">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}