import { motion } from 'framer-motion'
import { ChartBar, WarningCircle, MagnifyingGlass, SealCheck, X, Check, Bell, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getRiskBadgeClass } from '@/utils/scamUtils'
import type { ScamReport } from '@/types'

interface Props {
  stats: { total: number; reported: number; underReview: number; confirmed: number; rejected: number; resolved: number }
  needsAttention: ScamReport[]
  categoryBreakdown: [string, number][]
  platformBreakdown: [string, number][]
  onSelectReport: (r: ScamReport) => void
}

export default function AdminDashboard({ stats, needsAttention, categoryBreakdown, platformBreakdown, onSelectReport }: Props) {
  return (
    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="region" aria-label="Dashboard overview" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {[
          { label: 'Total Reports', value: stats.total, color: 'bg-[#00796B]', icon: ChartBar },
          { label: 'Pending Review', value: stats.reported, color: 'bg-[#F59E0B]', icon: WarningCircle },
          { label: 'Under Review', value: stats.underReview, color: 'bg-[#3B82F6]', icon: MagnifyingGlass },
          { label: 'Confirmed', value: stats.confirmed, color: 'bg-[#EF4444]', icon: SealCheck },
          { label: 'Rejected', value: stats.rejected, color: 'bg-[#6B7280]', icon: X },
          { label: 'Resolved', value: stats.resolved, color: 'bg-[#10B981]', icon: Check },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} role="group" aria-label={`${s.label}: ${s.value}`} className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-3 dark:border-gray-700 dark:bg-[#111827]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">{s.label}</p>
                <Icon className="h-4 w-4 text-[#667085]/40" aria-hidden="true" />
              </div>
              <p className="mt-1 text-xl font-bold text-[#111827] dark:text-white">{s.value}</p>
              <div className={cn('mt-2 h-1 w-full rounded-full opacity-30', s.color)} />
            </div>
          )
        })}
      </div>

      {needsAttention.length > 0 && (
        <div role="region" aria-label="Reports needing attention" className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600" weight="fill" aria-hidden="true" />
            <h2 className="text-sm font-bold text-amber-800 dark:text-amber-400">Needs Attention</h2>
            <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200" aria-live="polite" aria-atomic="true">
              {needsAttention.length} pending
            </span>
          </div>
          <div className="space-y-2">
            {needsAttention.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectReport(r)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectReport(r) } }}
                aria-label={`View report: ${r.category}, risk level ${r.risk_level || 'Suspicious'}`}
                className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white p-3 text-left transition-all hover:border-amber-400 focus-ring dark:border-amber-800/30 dark:bg-[#111827]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#111827] dark:text-white truncate">{r.category}</p>
                  <p className="text-[10px] text-[#667085] truncate">{r.description.slice(0, 80)}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskBadgeClass(r.risk_level || 'Suspicious'))}>{r.risk_level}</span>
                  <CaretRight className="h-3 w-3 text-[#667085]" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667085]">Category Breakdown</h3>
          <div className="space-y-2">
            {categoryBreakdown.length === 0 ? <p className="text-xs text-[#667085]">No reports yet</p> :
              categoryBreakdown.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-[#111827] dark:text-white truncate">{cat}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700">
                    <div className="h-full rounded-full bg-[#00796B]" style={{ width: `${(count / Math.max(...categoryBreakdown.map(([, c]) => c))) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-[#667085]">{count}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667085]">Platform Distribution</h3>
          <div className="space-y-2">
            {platformBreakdown.length === 0 ? <p className="text-xs text-[#667085]">No reports yet</p> :
              platformBreakdown.map(([plat, count]) => (
                <div key={plat} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-[#111827] dark:text-white truncate">{plat}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700">
                    <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${(count / Math.max(...platformBreakdown.map(([, c]) => c))) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-[#667085]">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}