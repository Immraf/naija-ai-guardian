import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ArrowRight, Shield, ChatCircleDots, CreditCard, IdentificationBadge, Phone, Coin } from '@phosphor-icons/react'
import { AWARENESS_GUIDES } from '@/constants'
import type { AwarenessGuide, TabId } from '@/types'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ChatCircleDots, CreditCard, IdentificationBadge, Phone, Coin,
}

export default function AwarenessSection(_props: { onTabChange: (t: TabId) => void }) {
  const [selected, setSelected] = useState<AwarenessGuide | null>(null)

  if (selected) {
    const Icon = ICON_MAP[selected.icon] || Shield
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-[#00796B] hover:underline">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to Guides
        </button>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-gray-700 dark:bg-[#111827]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00796B]/10">
              <Icon className="h-6 w-6 text-[#00796B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111827] dark:text-white">{selected.title}</h1>
              <p className="text-sm text-[#667085]">{selected.summary}</p>
            </div>
          </div>
          <div className="mb-6 text-sm leading-relaxed text-[#111827] dark:text-gray-300 whitespace-pre-line">
            {selected.content}
          </div>
          <div className="rounded-lg bg-[#00796B]/5 p-4 dark:bg-[#00796B]/10">
            <h3 className="mb-2 text-sm font-semibold text-[#00796B]">Protection Tips</h3>
            <ul className="space-y-2">
              {selected.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#667085] dark:text-gray-400">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00796B]" weight="fill" />{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-3xl">Scam Awareness</h1>
        <p className="mt-2 text-sm text-[#667085] dark:text-gray-400">Learn about common scams in Nigeria and how to protect yourself.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {AWARENESS_GUIDES.map((guide) => {
          const Icon = ICON_MAP[guide.icon] || Shield
          return (
            <motion.button
              key={guide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(guide as AwarenessGuide)}
              className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-left transition-all hover:border-[#00796B]/30 hover:shadow-sm dark:border-gray-700 dark:bg-[#111827]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00796B]/10">
                <Icon className="h-5 w-5 text-[#00796B]" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#111827] dark:text-white">{guide.title}</h3>
              <p className="text-sm text-[#667085] dark:text-gray-400 line-clamp-2">{guide.summary}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#00796B]">
                Read Guide <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}