import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Warning, ChartBar, Eye, MagnifyingGlass, Flame, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import { analyzeMessage, timeAgo, getStatusBadgeClass, getRiskBadgeClass, formatPhoneDisplay } from '@/utils/scamUtils'
import { SCAM_CATEGORIES, BRAND } from '@/constants'
import type { ScamReport, AnalyzerResult } from '@/types'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-[#667085] dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-[#111827] dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ report }: { report: ScamReport }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#667085] dark:text-gray-400">{report.reference_id || '---'}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getStatusBadgeClass(report.status))}>{report.status}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskBadgeClass(report.risk_level || 'Suspicious'))}>{report.risk_level || 'Suspicious'}</span>
          </div>
          <p className="text-sm font-medium text-[#111827] dark:text-white">{report.category}</p>
          <p className="mt-1 text-xs text-[#667085] dark:text-gray-400 line-clamp-2">{report.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#667085] dark:text-gray-500">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(report.created_at)}</span>
            {report.platform && <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{report.platform}</span>}
            {report.identifier && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{formatPhoneDisplay(report.identifier)}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAnalyzerResult({ result }: { result: AnalyzerResult }) {
  const riskColor = { 'Low Risk': '#10B981', 'Suspicious': '#F59E0B', 'High Risk': '#EF4444' }
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-3 rounded-lg border border-[#E5E7EB] p-4 dark:border-gray-600">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: riskColor[result.riskLevel] }}>
          {result.riskLevel === 'High Risk' ? <Warning className="h-4 w-4 text-white" weight="fill" /> :
           result.riskLevel === 'Suspicious' ? <MagnifyingGlass className="h-4 w-4 text-white" /> :
           <CheckCircle className="h-4 w-4 text-white" weight="fill" />}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: riskColor[result.riskLevel] }}>{result.riskLevel}</p>
          <p className="text-xs text-[#667085] dark:text-gray-400">Risk Score: {result.score}/100</p>
        </div>
      </div>
      <p className="text-sm text-[#111827] dark:text-gray-300">{result.explanation}</p>
      {result.indicators.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-[#667085] dark:text-gray-400">Indicators detected:</p>
          <ul className="space-y-1">
            {result.indicators.map((ind, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#667085] dark:text-gray-400">
                <Warning className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#F59E0B]" weight="fill" />{ind}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="mb-1 text-xs font-semibold text-[#667085] dark:text-gray-400">Recommendations:</p>
        <ul className="space-y-1">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#667085] dark:text-gray-400">
              <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#00796B]" />{rec}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

import { Clock, Monitor, Phone, ArrowRight } from '@phosphor-icons/react'

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, confirmed: 0, suspicious: 0, resolved: 0 })
  const [recentReports, setRecentReports] = useState<ScamReport[]>([])
  const [analyzerInput, setAnalyzerInput] = useState('')
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(null)

  useEffect(() => { loadStats(); loadRecentReports() }, [])

  async function loadStats() {
    const { data, error } = await supabase.from('public_scam_reports').select('status, risk_level')
    if (error) { toast.error('Community stats are unavailable right now.'); return }
    setStats({
      total: data?.length || 0,
      confirmed: data?.filter(r => r.status === 'Confirmed' || r.risk_level === 'Confirmed Scam').length || 0,
      suspicious: data?.filter(r => r.status === 'Under Review' || r.risk_level === 'Suspicious').length || 0,
      resolved: data?.filter(r => r.status === 'Resolved').length || 0,
    })
  }

  async function loadRecentReports() {
    const { data, error } = await supabase
      .from('public_scam_reports')
      .select('id, reference_id, category, platform, status, risk_level, identifier, description, view_count, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (error) { toast.error('Recent reports could not be loaded.'); return }
    setRecentReports(
      (data ?? []).map((row) => ({
        ...row,
        evidence: null,
        reporter_name: null,
        reporter_email: null,
        duplicate_of: null,
        updated_at: row.created_at,
      })) as unknown as ScamReport[],
    )
  }

  function handleQuickAnalyze() {
    if (!analyzerInput.trim()) return
    setAnalyzerResult(analyzeMessage(analyzerInput))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#00796B] to-[#00695C] p-8 text-white sm:p-12">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Shield weight="fill" className="h-8 w-8" />
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">{BRAND.name}</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl">{BRAND.tagline}</h1>
          <p className="mb-6 text-base leading-relaxed opacity-90 sm:text-lg">{BRAND.description}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <ChartBar className="h-4 w-4" /><span>{stats.total} reports filed</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Eye className="h-4 w-4" /><span>Real-time alerts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard icon={Warning} label="Total Reports" value={stats.total} color="bg-[#00796B]" />
        <StatCard icon={Flame} label="Confirmed Scams" value={stats.confirmed} color="bg-[#EF4444]" />
        <StatCard icon={MagnifyingGlass} label="Under Review" value={stats.suspicious} color="bg-[#F59E0B]" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="bg-[#10B981]" />
      </div>

      <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-gray-700 dark:bg-[#111827]">
        <h2 className="mb-3 text-lg font-semibold text-[#111827] dark:text-white">Quick Scam Check</h2>
        <p className="mb-4 text-sm text-[#667085] dark:text-gray-400">Paste a suspicious message, email, or SMS to check if it is a scam.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={analyzerInput} onChange={e => setAnalyzerInput(e.target.value)} placeholder="Paste the suspicious message here..." className="flex-1 rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-2.5 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500" />
          <button onClick={handleQuickAnalyze} className="flex items-center justify-center gap-2 rounded-lg bg-[#00796B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00695C]"><Sparkle className="h-4 w-4" /> Analyze</button>
        </div>
        {analyzerResult && <QuickAnalyzerResult result={analyzerResult} />}
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">Watch Out For</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SCAM_CATEGORIES.map(cat => (
            <div key={cat.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#00796B]/30 dark:border-gray-700 dark:bg-[#111827]">
              <h3 className="mb-1 text-sm font-semibold text-[#111827] dark:text-white">{cat.label}</h3>
              <p className="text-xs leading-relaxed text-[#667085] dark:text-gray-400">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {recentReports.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">Latest Reports</h2>
          <div className="space-y-3">{recentReports.map(r => <ReportCard key={r.id} report={r} />)}</div>
        </div>
      )}
    </div>
  )
}