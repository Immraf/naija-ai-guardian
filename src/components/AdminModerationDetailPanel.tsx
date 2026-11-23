import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Eye, EyeSlash, X, SealCheck, Check, Copy, Link, Shield, Warning, WarningCircle, XCircle, MagnifyingGlass } from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import { maskSensitiveData, timeAgo, getStatusBadgeClass, normalizePhoneNumber } from '@/utils/scamUtils'
import { STATUS_OPTIONS } from '@/constants'
import type { ScamReport, AdminProfile, ConfirmationDialog } from '@/types'

interface Props {
  report: ScamReport
  adminProfile: AdminProfile
  hasPermission: (perm: string) => boolean
  onRefresh: () => void
  onClose: () => void
  onConfirm: (dialog: ConfirmationDialog) => void
  showFullData: boolean
  onToggleFullData: () => void
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

export default function AdminModerationDetailPanel({ report, adminProfile, hasPermission, onRefresh, onClose, onConfirm, showFullData, onToggleFullData }: Props) {
  const [duplicateCandidates, setDuplicateCandidates] = useState<ScamReport[]>([])
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const [duplicatesExpanded, setDuplicatesExpanded] = useState(false)

  async function findDuplicates() {
    if (!report.identifier) return
    setDuplicateLoading(true)
    setDuplicatesExpanded(true)
    const normalized = normalizePhoneNumber(report.identifier).toLowerCase()
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .neq('id', report.id)
      .or(`normalized_identifier.ilike.%${normalized}%,identifier.ilike.%${normalized}%`)
      .limit(5)
    if (error) { toast.error('Duplicate check failed'); setDuplicateCandidates([]) }
    else setDuplicateCandidates((data || []) as ScamReport[])
    setDuplicateLoading(false)
  }

  async function markAsDuplicate(reportId: string, parentId: string) {
    const { error } = await supabase
      .from('scam_reports')
      .update({ duplicate_of: parentId, status: 'Resolved', updated_at: new Date().toISOString() })
      .eq('id', reportId)
    if (error) { toast.error(error.message) } else {
      await supabase.from('audit_logs').insert({
        admin_id: adminProfile.id, admin_email: adminProfile.email,
        action: `Marked report ${reportId} as duplicate of ${parentId}`,
        details: { report_id: reportId, duplicate_of: parentId },
      })
      toast.success('Marked as duplicate')
      onRefresh()
    }
  }

  async function updateStatus(id: string, newStatus: string, impact: 'danger' | 'warning' | 'info' = 'warning') {
    const impactLabels: Record<string, { title: string; message: string }> = {
      danger: { title: 'Confirm Scam', message: 'This will mark the report as a confirmed scam. It will be published to the public scam database. This action is recorded in the audit log.' },
      warning: { title: 'Update Status', message: `Are you sure you want to change the status to "${newStatus}"? This action will be recorded in the audit log.` },
      info: { title: 'Resolve Report', message: 'Marking this report as resolved. Ensure all necessary actions have been taken before resolving.' },
    }
    const label = impactLabels[impact] || impactLabels.warning
    onConfirm({
      open: true, title: label.title, message: label.message, impact,
      confirmLabel: newStatus === 'Confirmed' ? 'Confirm Scam' : newStatus === 'Rejected' ? 'Reject Report' : 'Resolve Report',
      onConfirm: async () => {
        const { error } = await supabase.from('scam_reports').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) { toast.error(error.message) } else {
          await supabase.from('audit_logs').insert({ admin_id: adminProfile.id, admin_email: adminProfile.email, action: `Updated report ${id} to ${newStatus}`, details: { report_id: id, new_status: newStatus } })
          toast.success(`Status updated to ${newStatus}`)
          onRefresh()
        }
      },
      onCancel: () => onConfirm({ ...label, open: false, confirmLabel: '', impact, onConfirm: async () => {}, onCancel: () => {} }),
    })
  }

  const riskDisplay = getRiskDisplay(report.risk_level || 'Suspicious')

  return (
    <div role="region" aria-label={`Report details for ${report.reference_id || 'selected report'}`}
      className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#111827] dark:text-white">Report Details</h3>
        <button onClick={onClose} className="text-xs text-[#00796B] hover:underline focus-ring rounded px-1" aria-label="Close report details">Close</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Reference</p>
          <p className="text-sm font-mono text-[#111827] dark:text-white">{report.reference_id || '---'}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Status</p>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', getStatusBadgeClass(report.status))}>{report.status}</span>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Risk Level</p>
          <span className={riskDisplay.className}><riskDisplay.Icon className="h-3 w-3" aria-hidden="true" weight="fill" /><span>{riskDisplay.label}</span></span>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Phone / Identifier</p>
          <p className="text-sm font-medium text-[#111827] dark:text-white" aria-label={showFullData ? report.identifier : 'Masked identifier'}>
            {maskSensitiveData(report.identifier, showFullData)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Category</p>
          <p className="text-sm font-medium text-[#111827] dark:text-white">{report.category}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Platform</p>
          <p className="text-sm font-medium text-[#111827] dark:text-white">{report.platform}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium text-[#667085] uppercase">Description</p>
          <p className="mt-1 text-sm text-[#111827] dark:text-white">{report.description}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Reporter</p>
          <p className="text-sm text-[#111827] dark:text-white">
            {report.reporter_name || 'Anonymous'}
            {report.reporter_email ? ` (${maskSensitiveData(report.reporter_email, showFullData)})` : ''}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#667085] uppercase">Reported</p>
          <p className="text-sm text-[#111827] dark:text-white">{timeAgo(report.created_at)}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-4 dark:border-gray-700">
        {hasPermission('confirm_scam') && report.status !== 'Confirmed' && report.status !== 'Resolved' && (
          <button onClick={() => updateStatus(report.id, 'Confirmed', 'danger')}
            className="flex items-center gap-1 rounded-lg bg-[#EF4444] px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 active:scale-[0.98] focus-ring-white"
            aria-label={`Confirm scam report ${report.reference_id || report.id}`}>
            <SealCheck className="h-3.5 w-3.5" aria-hidden="true" /> Confirm Scam
          </button>
        )}
        {hasPermission('reject_report') && report.status !== 'Rejected' && report.status !== 'Resolved' && (
          <button onClick={() => updateStatus(report.id, 'Rejected', 'warning')}
            className="flex items-center gap-1 rounded-lg border border-[#6B7280] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-gray-50 active:scale-[0.98] focus-ring dark:hover:bg-gray-800"
            aria-label={`Reject report ${report.reference_id || report.id}`}>
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
          </button>
        )}
        {hasPermission('resolve_report') && report.status !== 'Resolved' && (
          <button onClick={() => updateStatus(report.id, 'Resolved', 'info')}
            className="flex items-center gap-1 rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 active:scale-[0.98] focus-ring-white"
            aria-label={`Resolve report ${report.reference_id || report.id}`}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Resolve
          </button>
        )}
        <button onClick={findDuplicates} disabled={duplicateLoading}
          className="flex items-center gap-1 rounded-lg border border-[#6B7280] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-gray-50 active:scale-[0.98] focus-ring dark:hover:bg-gray-800"
          aria-label="Check for duplicate reports">
          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> {duplicateLoading ? 'Checking...' : 'Check Duplicates'}
        </button>
        <select
          value={report.status}
          onChange={(e) => updateStatus(report.id, e.target.value)}
          aria-label="Change report status"
          className="ml-auto rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs text-[#111827] outline-none focus:border-[#00796B] focus-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Duplicate candidates */}
      {duplicatesExpanded && (
        <div className="mt-4 border-t border-[#E5E7EB] pt-4 dark:border-gray-700">
          <div className="mb-2 flex items-center gap-2">
            <Copy className="h-3.5 w-3.5 text-[#667085]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Duplicate Candidates</h4>
            {duplicateLoading && <span className="ml-auto text-[10px] text-[#667085]">Searching...</span>}
          </div>
          {duplicateLoading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg border border-[#E5E7EB] bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50" />)}</div>
          ) : duplicateCandidates.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] p-3 dark:border-gray-700">
              <Shield className="h-4 w-4 text-[#10B981]" />
              <p className="text-xs text-[#667085]">No duplicates found — this appears to be a unique report.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {duplicateCandidates.map((dc) => {
                const dcRisk = getRiskDisplay(dc.risk_level || 'Suspicious')
                return (
                  <div key={dc.id} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#667085]">{dc.reference_id || '---'}</span>
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', getStatusBadgeClass(dc.status))}>{dc.status}</span>
                        <span className={dcRisk.className}><dcRisk.Icon className="h-2.5 w-2.5" weight="fill" />{dcRisk.label}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#667085] truncate">{dc.description}</p>
                    </div>
                    {report.status !== 'Resolved' && report.status !== 'Rejected' && (
                      <button
                        onClick={() => markAsDuplicate(report.id, dc.id)}
                        className="ml-2 flex items-center gap-1 rounded-lg border border-[#F59E0B] px-2 py-1 text-[9px] font-medium text-[#F59E0B] hover:bg-amber-50 transition-colors"
                        aria-label={`Mark as duplicate of ${dc.reference_id || dc.id}`}
                      >
                        <Link className="h-3 w-3" /> Mark Duplicate
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}