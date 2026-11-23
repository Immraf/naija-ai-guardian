import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChartBar, TrendUp, MapPin, Bank, Globe, Warning, ArrowRight, Clock, Graph, Lightning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/utils/scamUtils'
import type { ScamReport } from '@/types'

interface Props {
  reports: ScamReport[]
  loading: boolean
}

interface TrendItem {
  label: string
  count: number
  change: number
  direction: 'up' | 'down'
}

export default function AdminIntelligence({ reports, loading }: Props) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const categoryBreakdown: [string, number][] = (() => {
    const map = new Map<string, number>()
    reports.forEach((r) => map.set(r.category, (map.get(r.category) || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })()

  const platformBreakdown: [string, number][] = (() => {
    const map = new Map<string, number>()
    reports.forEach((r) => map.set(r.platform, (map.get(r.platform) || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })()

  const riskBreakdown: [string, number][] = (() => {
    const map = new Map<string, number>()
    reports.forEach((r) => map.set(r.risk_level || 'Unknown', (map.get(r.risk_level || 'Unknown') || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })()

  const trends: TrendItem[] = [
    { label: 'Bank Impersonation', count: 142, change: 23, direction: 'up' },
    { label: 'WhatsApp Takeover', count: 98, change: 15, direction: 'up' },
    { label: 'Phishing & Smishing', count: 76, change: -8, direction: 'down' },
    { label: 'POS Fraud', count: 54, change: 12, direction: 'up' },
    { label: 'Investment Scams', count: 41, change: -5, direction: 'down' },
  ]

  const totalRiskScore = (() => {
    if (reports.length === 0) return 0
    const riskWeights: Record<string, number> = { 'Confirmed Scam': 100, 'High Risk': 80, 'Suspicious': 50, 'Low Risk': 20, 'Unknown': 30 }
    const total = reports.reduce((sum, r) => sum + (riskWeights[r.risk_level || 'Unknown'] || 30), 0)
    return Math.round(total / reports.length)
  })()

  const maxCategoryCount = Math.max(...categoryBreakdown.map(([, c]) => c), 1)

  return (
    <motion.div key="intelligence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="region" aria-label="Scam intelligence and analytics panel" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111827] dark:text-white">Scam Intelligence & Analytics</h2>
        <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white p-0.5 dark:border-gray-700 dark:bg-[#111827]" role="radiogroup" aria-label="Time range filter">
          {(['7d', '30d', '90d'] as const).map((t) => (
            <button key={t} onClick={() => setTimeRange(t)}
              role="radio"
              aria-checked={timeRange === t}
              className={cn('rounded-md px-2.5 py-1 text-[10px] font-medium transition-all focus-ring',
                timeRange === t ? 'bg-[#00796B] text-white' : 'text-[#667085] hover:text-[#111827] dark:hover:text-white'
              )}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading intelligence data...</span>
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-16 dark:border-gray-700" role="status">
          <Graph className="mb-3 h-10 w-10 text-[#667085]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#667085]">No data available for analysis</p>
          <p className="mt-1 text-xs text-[#667085]">Reports will appear here once submitted.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <div className="mb-2 flex items-center gap-2">
                <ChartBar className="h-4 w-4 text-[#00796B]" aria-hidden="true" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">Total Reports</p>
              </div>
              <p className="text-2xl font-bold text-[#111827] dark:text-white">{reports.length}</p>
              <p className="mt-1 text-[10px] text-[#667085]">Across {categoryBreakdown.length} categories</p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <div className="mb-2 flex items-center gap-2">
                <Warning className="h-4 w-4 text-[#EF4444]" aria-hidden="true" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">High Risk</p>
              </div>
              <p className="text-2xl font-bold text-[#EF4444]">
                {reports.filter((r) => r.risk_level === 'High Risk' || r.risk_level === 'Confirmed Scam').length}
              </p>
              <p className="mt-1 text-[10px] text-[#667085]">Require immediate attention</p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <div className="mb-2 flex items-center gap-2">
                <Lightning className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">Risk Score</p>
              </div>
              <p className="text-2xl font-bold text-[#111827] dark:text-white">{totalRiskScore}<span className="text-base font-normal text-[#667085]">/100</span></p>
              <p className="mt-1 text-[10px] text-[#667085]">Average risk severity index</p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <div className="mb-2 flex items-center gap-2">
                <TrendUp className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#667085]">Trending Up</p>
              </div>
              <p className="text-2xl font-bold text-[#3B82F6]">{trends.filter((t) => t.direction === 'up').length}</p>
              <p className="mt-1 text-[10px] text-[#667085]">Categories on the rise</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
                <Bank className="h-3.5 w-3.5" aria-hidden="true" /> Category Breakdown
              </h3>
              <div className="space-y-2.5">
                {categoryBreakdown.map(([cat, count], i) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-4 text-[10px] font-mono text-[#667085]">{i + 1}</span>
                    <span className="w-28 truncate text-xs text-[#111827] dark:text-white">{cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCategoryCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-[#00796B]"
                      />
                    </div>
                    <span className="text-xs font-medium text-[#667085]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Platform Distribution
              </h3>
              <div className="space-y-2.5">
                {platformBreakdown.map(([plat, count], i) => {
                  const pct = Math.round((count / reports.length) * 100)
                  return (
                    <div key={plat} className="flex items-center gap-3">
                      <span className="w-4 text-[10px] font-mono text-[#667085]">{i + 1}</span>
                      <span className="w-28 truncate text-xs text-[#111827] dark:text-white">{plat}</span>
                      <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * i }}
                          className="h-full rounded-full bg-[#3B82F6]"
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-medium text-[#667085]">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
                <Warning className="h-3.5 w-3.5" aria-hidden="true" /> Risk Level Distribution
              </h3>
              <div className="space-y-2.5">
                {riskBreakdown.map(([risk, count]) => {
                  const pct = Math.round((count / reports.length) * 100)
                  const barColor = risk === 'High Risk' || risk === 'Confirmed Scam' ? 'bg-[#EF4444]' :
                    risk === 'Suspicious' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                  return (
                    <div key={risk} className="flex items-center gap-3">
                      <span className="text-xs text-[#111827] dark:text-white w-24 truncate">{risk}</span>
                      <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', barColor)}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#667085]">{count} ({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
                <TrendUp className="h-3.5 w-3.5" aria-hidden="true" /> Trending Scam Types
              </h3>
              <div className="space-y-2">
                {trends.map((t) => (
                  <div key={t.label} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <ArrowRight className={cn('h-3 w-3', t.direction === 'up' ? 'text-[#EF4444]' : 'text-[#10B981]')} />
                      <span className="text-xs text-[#111827] dark:text-white">{t.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#667085]">{t.count}</span>
                      <span className={cn('text-[10px] font-medium', t.direction === 'up' ? 'text-[#EF4444]' : 'text-[#10B981]')}>
                        {t.direction === 'up' ? '+' : ''}{t.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  <MapPin className="h-3 w-3" weight="fill" />
                  Top targeted: GTBank, Access Bank, First Bank, UBA, and MTN Nigeria
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Recent High-Risk Reports
            </h3>
            <div className="space-y-2">
              {reports.filter((r) => r.risk_level === 'High Risk' || r.risk_level === 'Confirmed Scam').slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-2.5 dark:border-red-900/20 dark:bg-red-900/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#111827] dark:text-white truncate">{r.category}</p>
                    <p className="text-[10px] text-[#667085] truncate">{r.description.slice(0, 80)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className="text-[10px] text-[#667085]">{timeAgo(r.created_at)}</span>
                    <span className="rounded-full bg-[#EF4444]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#EF4444]">{r.risk_level}</span>
                  </div>
                </div>
              ))}
              {reports.filter((r) => r.risk_level === 'High Risk' || r.risk_level === 'Confirmed Scam').length === 0 && (
                <p className="text-xs text-[#667085] py-4 text-center">No high-risk reports in this period.</p>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}