import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlass, Funnel, Eye, EyeSlash, Shield, Check, Warning, WarningCircle, XCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { maskSensitiveData, timeAgo, getStatusBadgeClass } from '@/utils/scamUtils'
import AdminModerationDetailPanel from '@/components/AdminModerationDetailPanel'
import AdminModerationConfirmDialog from '@/components/AdminModerationConfirmDialog'
import { STATUS_OPTIONS } from '@/constants'
import type { ScamReport, AdminProfile, ConfirmationDialog } from '@/types'

interface Props {
  reports: ScamReport[]
  loading: boolean
  adminProfile: AdminProfile
  hasPermission: (perm: string) => boolean
  onRefresh: () => void
}

function getRiskDisplay(risk: string): { label: string; className: string; Icon: React.ComponentType<{ className?: string; weight?: string }> } {
  const map: Record<string, { label: string; className: string; Icon: React.ComponentType<{ className?: string; weight?: string }> }> = {
    'Low Risk': { label: 'Low Risk', className: 'risk-dot-low', Icon: Check },
    'Suspicious': { label: 'Suspicious', className: 'risk-dot-medium', Icon: Warning },
    'High Risk': { label: 'High Risk', className: 'risk-dot-high', Icon: WarningCircle },
    'Confirmed Scam': { label: 'Confirmed Scam', className: 'risk-dot-high', Icon: XCircle },
  }
  return map[risk] || { label: risk, className: 'risk-dot-low', Icon: Shield }
}

export default function AdminModeration({ reports, loading, adminProfile, hasPermission, onRefresh }: Props) {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<ScamReport | null>(null)
  const [showFullData, setShowFullData] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog | null>(null)

  const filtered = reports.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (r.identifier && r.identifier.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.reference_id && r.reference_id.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <motion.div key="moderation" role="region" aria-label="Report moderation panel"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="mod-search" className="sr-only">Search reports</label>
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
          <input id="mod-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, phone, email, or keyword..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <div className="flex items-center gap-2">
          <Funnel className="h-4 w-4 text-[#667085]" aria-hidden="true" />
          <label htmlFor="mod-status-filter" className="sr-only">Filter by status</label>
          <select id="mod-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setShowFullData(!showFullData)}
            aria-label={showFullData ? 'Mask sensitive data' : 'Show all sensitive data'} aria-pressed={showFullData}
            className={cn('flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-ring',
              showFullData ? 'border-[#00796B] bg-[#00796B]/10 text-[#00796B]' : 'border-[#E5E7EB] text-[#667085] dark:border-gray-600')}>
            {showFullData ? <EyeSlash className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
            <span className="hidden sm:inline">{showFullData ? 'Mask' : 'Show All'}</span>
          </button>
        </div>
      </div>

      {/* Selected report detail panel */}
      {selected && (
        <AdminModerationDetailPanel
          report={selected}
          adminProfile={adminProfile}
          hasPermission={hasPermission}
          onRefresh={onRefresh}
          onClose={() => setSelected(null)}
          onConfirm={setConfirmDialog}
          showFullData={showFullData}
          onToggleFullData={() => setShowFullData(!showFullData)}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading reports...</span>
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-16 dark:border-gray-700" role="status">
          <Shield className="mb-3 h-10 w-10 text-[#667085]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#667085]">No reports to moderate</p>
          <p className="mt-1 text-xs text-[#667085]">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-[#667085]" role="status" aria-live="polite">{filtered.length} report{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.map((report) => {
            const riskDisplay = getRiskDisplay(report.risk_level || 'Suspicious')
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelected(report)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(report) } }}
                role="button" tabIndex={0}
                aria-label={`Report ${report.reference_id || report.id}: ${report.category}, status ${report.status}, risk ${report.risk_level || 'Suspicious'}`}
                aria-expanded={selected?.id === report.id}
                className={cn('cursor-pointer rounded-xl border bg-white p-3 transition-all hover:shadow-sm focus-ring dark:bg-[#111827]',
                  selected?.id === report.id ? 'border-[#00796B] dark:border-[#00796B]' : 'border-[#E5E7EB] dark:border-gray-700')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-[#667085]">{report.reference_id || '---'}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getStatusBadgeClass(report.status))}>{report.status}</span>
                      <span className={riskDisplay.className}><riskDisplay.Icon className="h-3 w-3" aria-hidden="true" weight="fill" /><span>{riskDisplay.label}</span></span>
                    </div>
                    <p className="text-sm font-medium text-[#111827] dark:text-white">{report.category}</p>
                    <p className="mt-0.5 text-xs text-[#667085] line-clamp-1">{report.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[#667085]">
                      <span>{timeAgo(report.created_at)}</span>
                      {report.platform && <span aria-hidden="true"> &middot; {report.platform}</span>}
                      <span aria-hidden="true"> &middot; {maskSensitiveData(report.identifier, showFullData)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Confirmation dialog */}
      <AdminModerationConfirmDialog dialog={confirmDialog} />
    </motion.div>
  )
}