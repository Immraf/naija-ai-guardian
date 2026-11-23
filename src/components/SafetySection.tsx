import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Warning, Info, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SAFETY_TIPS } from '@/constants'
import type { SafetyTip, TabId } from '@/types'

const PRIORITY_TABS = ['all', 'high', 'medium', 'low'] as const

export default function SafetySection(_props: { onTabChange: (t: TabId) => void }) {
  const [filter, setFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const tips = SAFETY_TIPS as SafetyTip[]
  const categories = [...new Set(tips.map((t) => t.category))]

  const filtered = tips.filter((t) => {
    if (filter !== 'all' && t.priority !== filter) return false
    if (categoryFilter && t.category !== categoryFilter) return false
    return true
  })

  const priorityColors = {
    high: 'border-l-[#EF4444] bg-red-50 dark:bg-red-900/10',
    medium: 'border-l-[#F59E0B] bg-amber-50 dark:bg-amber-900/10',
    low: 'border-l-[#10B981] bg-emerald-50 dark:bg-emerald-900/10',
  }
  const priorityIcons = {
    high: Warning,
    medium: Info,
    low: CheckCircle,
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-3xl">Safety Tips</h1>
        <p className="mt-2 text-sm text-[#667085] dark:text-gray-400">Practical tips to protect yourself from scams in Nigeria.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {PRIORITY_TABS.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              filter === p
                ? 'bg-[#00796B] text-white'
                : 'bg-[#E5E7EB] text-[#667085] hover:bg-[#00796B]/10 dark:bg-gray-700 dark:text-gray-400'
            )}
          >
            {p === 'all' ? 'All Tips' : p.charAt(0).toUpperCase() + p.slice(1) + ' Priority'}
          </button>
        ))}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="ml-auto rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-16 dark:border-gray-700">
            <MagnifyingGlass className="mb-3 h-10 w-10 text-[#667085]" />
            <p className="text-sm font-medium text-[#667085]">No tips match your filters</p>
          </div>
        ) : (
          filtered.map((tip, i) => {
            const Icon = priorityIcons[tip.priority]
            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'rounded-xl border border-[#E5E7EB] border-l-4 bg-white p-4 dark:border-gray-700 dark:bg-[#111827]',
                  priorityColors[tip.priority]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon className={cn(
                      'h-5 w-5',
                      tip.priority === 'high' ? 'text-[#EF4444]' :
                      tip.priority === 'medium' ? 'text-[#F59E0B]' : 'text-[#10B981]'
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#111827] dark:text-white">{tip.title}</h3>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                        tip.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        tip.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      )}>{tip.priority}</span>
                      <span className="rounded-full bg-[#E5E7EB] px-2 py-0.5 text-[10px] font-medium text-[#667085] dark:bg-gray-700 dark:text-gray-400">{tip.category}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#667085] dark:text-gray-400">{tip.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}