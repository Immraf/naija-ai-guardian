import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { MagnifyingGlass, Funnel, Warning, CheckCircle, Eye,
  Clock, Monitor, Phone, ArrowRight, X, ListBullets, CalendarBlank, SortAscending
} from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import { formatPhoneDisplay, timeAgo, getStatusBadgeClass, getRiskBadgeClass } from '@/utils/scamUtils'
import { SCAM_TYPES, STATUS_OPTIONS } from '@/constants'
import type { ScamReport, TabId } from '@/types'

export default function DatabaseSection(_props: { onTabChange: (t: TabId) => void }) {
  const [reports, setReports] = useState<ScamReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest')
  const [selected, setSelected] = useState<ScamReport | null>(null)

  useEffect(() => { loadReports() }, [])

  async function loadReports() {
    setLoading(true)
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { toast.error(error.message); setReports([]) }
    else setReports((data || []) as ScamReport[])
    setLoading(false)
  }

  const filtered = reports.filter((r) => {
    if (search) {
      const q = search.toLowerCase()
      const matchesSearch =
        (r.identifier && r.identifier.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.reference_id && r.reference_id.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      if (!matchesSearch) return false
    }
    if (statusFilter && r.status !== statusFilter) return false
    if (categoryFilter && r.category !== categoryFilter) return false
    if (dateFrom && r.created_at && new Date(r.created_at) < new Date(dateFrom)) return false
    if (dateTo && r.created_at) {
      const endOfDay = new Date(dateTo)
      endOfDay.setHours(23, 59, 59, 999)
      if (new Date(r.created_at) > endOfDay) return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sortBy === 'views') return (b.view_count || 0) - (a.view_count || 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const categories = [...new Set(reports.map((r) => r.category))]

  if (selected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-[#00796B] hover:underline">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to Database
        </button>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-gray-700 dark:bg-[#111827]">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#667085]">{selected.reference_id || '---'}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getStatusBadgeClass(selected.status))}>{selected.status}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRiskBadgeClass(selected.risk_level || 'Suspicious'))}>{selected.risk_level || 'Suspicious'}</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#111827] dark:text-white">{selected.category}</h2>
          <p className="mb-4 text-sm text-[#667085] dark:text-gray-400">{selected.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {selected.identifier && (
              <div><span className="text-xs text-[#667085]">Phone/Identifier</span><p className="font-medium text-[#111827] dark:text-white">{formatPhoneDisplay(selected.identifier)}</p></div>
            )}
            {selected.platform && (
              <div><span className="text-xs text-[#667085]">Platform</span><p className="font-medium text-[#111827] dark:text-white">{selected.platform}</p></div>
            )}
            {selected.created_at && (
              <div><span className="text-xs text-[#667085]">Reported</span><p className="font-medium text-[#111827] dark:text-white">{timeAgo(selected.created_at)}</p></div>
            )}
            {selected.view_count !== null && (
              <div><span className="text-xs text-[#667085]">Views</span><p className="font-medium text-[#111827] dark:text-white">{selected.view_count}</p></div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-3xl">Scam Database</h1>
        <p className="mt-2 text-sm text-[#667085] dark:text-gray-400">Search and browse community-reported scams in Nigeria.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone number, reference ID, or keyword..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'views')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="Sort results"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <CalendarBlank className="h-4 w-4 text-[#667085]" aria-hidden="true" />
          <label htmlFor="filter-date-from" className="sr-only">From date</label>
          <input id="filter-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        <div className="flex items-center gap-1">
          <CalendarBlank className="h-4 w-4 text-[#667085]" aria-hidden="true" />
          <label htmlFor="filter-date-to" className="sr-only">To date</label>
          <input id="filter-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }}
            className="flex items-center gap-1 rounded-lg border border-[#EF4444] px-3 py-2.5 text-xs font-medium text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Clear date filters">
            <X className="h-3.5 w-3.5" /> Clear Dates
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-16 dark:border-gray-700">
          <ListBullets className="mb-3 h-10 w-10 text-[#667085]" />
          <p className="text-sm font-medium text-[#667085]">No reports found</p>
          <p className="mt-1 text-xs text-[#667085]">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[#667085]">{filtered.length} report{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.map((report) => (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(report)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:border-[#00796B]/30 hover:shadow-sm dark:border-gray-700 dark:bg-[#111827]"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#667085]">{report.reference_id || '---'}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getStatusBadgeClass(report.status))}>{report.status}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskBadgeClass(report.risk_level || 'Suspicious'))}>{report.risk_level || 'Suspicious'}</span>
              </div>
              <p className="text-sm font-medium text-[#111827] dark:text-white">{report.category}</p>
              <p className="mt-1 text-xs text-[#667085] line-clamp-2">{report.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#667085]">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(report.created_at)}</span>
                {report.platform && <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{report.platform}</span>}
                {report.identifier && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{formatPhoneDisplay(report.identifier)}</span>}
                {report.view_count !== null && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{report.view_count} views</span>}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}