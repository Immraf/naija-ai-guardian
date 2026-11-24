import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  ShieldCheck,
  Users,
} from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { MEDIA } from '@/constants'
import { LandingEmergency, LandingFeatures, LandingFinalCta, LandingScamTypes } from '@/components/LandingSections'
import type { TabId } from '@/types'

interface LandingPageProps {
  onTabChange: (tab: TabId) => void
}

type TrustStats = { total: number; confirmed: number; week: number }

type CountResult = { count: number | null; error: unknown }

interface CountQuery extends PromiseLike<CountResult> {
  eq: (column: string, value: string) => PromiseLike<CountResult>
  gte: (column: string, value: string) => PromiseLike<CountResult>
}

interface PublicReportsView {
  select: (columns: string, options: { count: 'exact'; head: true }) => CountQuery
}

/** Anonymous reads go through the security-definer view only — never the base table. */
function publicReports(): PublicReportsView {
  const client = supabase as unknown as { from: (table: string) => PublicReportsView }
  return client.from('public_scam_reports')
}

const STEPS = [
  {
    number: '01',
    title: 'Paste the message',
    body: 'Drop in the full SMS, WhatsApp thread or e-mail. Nothing is published unless you choose to report it.',
  },
  {
    number: '02',
    title: 'Read the risk score',
    body: 'The analyzer names the patterns it recognises: sender mismatch, payment pressure, lookalike domains.',
  },
  {
    number: '03',
    title: 'Report and protect others',
    body: 'One click files a report. Once a moderator confirms it, the number appears in the public database.',
  },
]

const FACTS = [
  { Icon: CheckCircle, label: 'No account needed' },
  { Icon: Clock, label: 'Reports reviewed by moderators' },
  { Icon: Users, label: 'Free on every network' },
]

export default function LandingPage({ onTabChange }: LandingPageProps) {
  const reduce = useReducedMotion()
  const [stats, setStats] = useState<TrustStats | 'unavailable' | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const view = publicReports()
        const [all, confirmed, week] = await Promise.all([
          view.select('id', { count: 'exact', head: true }),
          view.select('id', { count: 'exact', head: true }).eq('status', 'Confirmed'),
          view.select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        ])

        if (!active) return
        if (all.error || confirmed.error || week.error) {
          setStats('unavailable')
          return
        }
        setStats({ total: all.count ?? 0, confirmed: confirmed.count ?? 0, week: week.count ?? 0 })
      } catch {
        if (active) setStats('unavailable')
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="bg-[#F7F8F6] dark:bg-[#0F172A]">
      {/* ------------------------------------------------------------------ hero */}
      <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-[#04231F]">
        <img
          src={MEDIA.hero}
          alt="A phone screen of unread messages being checked against known scam patterns"
          width={1536}
          height={864}
          fetchPriority="high"
          loading="eager"
          className="kenburns absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#04231F]/95 via-[#04231F]/78 to-[#0B3B33]/25"
        />
        <div className="relative mx-auto flex min-h-[86vh] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8 lg:py-28">
          <motion.div
            initial={reduce ? false : { y: 18 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium tracking-wide text-white/85 backdrop-blur">
              <ShieldCheck weight="fill" className="h-4 w-4 text-[#5EEAD4]" aria-hidden="true" />
              Community scam intelligence · Nigeria
            </p>
            <h1
              id="hero-heading"
              className="mt-6 text-[clamp(2.5rem,6.2vw,4.4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance text-white"
            >
              Check the message before you pay, click, or reply.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-white/85 sm:text-xl">
              ScamShield Nigeria reads suspicious SMS, WhatsApp and e-mail messages and flags the
              patterns behind bank impersonation, BVN fraud and fake grants — then turns every report
              into a warning for the next person.
            </p>
          </motion.div>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => onTabChange('analyzer')}
              className="focus-ring-white inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00897B] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#02110F]/40 transition-transform hover:-translate-y-0.5 hover:bg-[#00796B] active:translate-y-0 sm:w-auto"
            >
              Analyze a message
              <ArrowRight weight="bold" className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onTabChange('report')}
              className="focus-ring-white inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/15 sm:w-auto"
            >
              Report a scam
            </button>
          </div>

          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-white/80">
            {FACTS.map(({ Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon weight="fill" className="h-4 w-4 text-[#5EEAD4]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <a
            href="#how-it-works"
            className="focus-ring-white mt-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            How the check works
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* -------------------------------------------------------- community stats */}
      <section
        aria-labelledby="community-heading"
        className="border-b border-[#E5E7EB] bg-white py-14 dark:border-gray-800 dark:bg-[#111827]"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#00796B] dark:text-[#5EEAD4]">
                Community signals
              </p>
              <h2
                id="community-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-balance text-[#111827] sm:text-3xl dark:text-white"
              >
                What Nigerians have reported so far
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-pretty text-[#667085] dark:text-gray-400">
              Live counts from the public report view. Sensitive details stay hidden — only the
              pattern, platform and status are published.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats === null &&
              [0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8F6] p-6 dark:border-gray-800 dark:bg-[#0F172A]"
                >
                  <div className="h-9 w-24 animate-pulse rounded-md bg-[#E5E7EB] dark:bg-gray-700" />
                  <div className="mt-3 h-3.5 w-32 animate-pulse rounded-md bg-[#E5E7EB] dark:bg-gray-700" />
                  <span className="sr-only">Loading community totals</span>
                </div>
              ))}

            {stats === 'unavailable' &&
              [
                'Every report is checked by a moderator before it is published.',
                'Confirmed scams stay searchable by number, account and platform.',
                'Reporter names and contact details are never published.',
              ].map((line) => (
                <div
                  key={line}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8F6] p-6 dark:border-gray-800 dark:bg-[#0F172A]"
                >
                  <ShieldCheck weight="fill" className="h-6 w-6 text-[#00796B] dark:text-[#5EEAD4]" aria-hidden="true" />
                  <p className="mt-3 text-base leading-relaxed text-pretty text-[#111827] dark:text-gray-200">
                    {line}
                  </p>
                </div>
              ))}

            {stats !== null &&
              stats !== 'unavailable' &&
              [
                { label: 'Reports filed', value: stats.total },
                { label: 'Confirmed scams', value: stats.confirmed },
                { label: 'Added this week', value: stats.week },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8F6] p-6 dark:border-gray-800 dark:bg-[#0F172A]"
                >
                  <p className="text-4xl font-semibold tabular-nums tracking-tight text-[#00796B] dark:text-[#5EEAD4]">
                    {tile.value.toLocaleString('en-NG')}
                  </p>
                  <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-[#667085] dark:text-gray-400">
                    {tile.label}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- how it works */}
      <section aria-labelledby="how-heading" id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#00796B] dark:text-[#5EEAD4]">
              Three steps
            </p>
            <h2
              id="how-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-balance text-[#111827] sm:text-4xl dark:text-white"
            >
              From a nagging suspicion to a clear answer
            </h2>
            <ol className="mt-8 space-y-6">
              {STEPS.map((step) => (
                <li key={step.number} className="flex gap-4">
                  <span className="font-mono text-lg font-semibold text-[#00796B]/70 dark:text-[#5EEAD4]/70">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827] dark:text-white">{step.title}</h3>
                    <p className="mt-1 text-base leading-relaxed text-pretty text-[#667085] dark:text-gray-400">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => onTabChange('analyzer')}
              className="focus-ring mt-8 inline-flex items-center gap-2 rounded-xl bg-[#00796B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00695C]"
            >
              Try the analyzer
              <ArrowRight weight="bold" className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#0F3A34] bg-[#04231F] p-6 text-white shadow-xl shadow-[#04231F]/20">
            <div className="flex items-center justify-between text-[13px] uppercase tracking-[0.18em] text-white/55">
              <span>Analyzer preview</span>
              <span className="font-mono lowercase tracking-normal">risk 92/100</span>
            </div>
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#5EEAD4]/30 to-transparent"
                  animate={{ y: [0, 168] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <p className="font-mono text-[13px] text-white/55">SMS · +234 80• ••• 4471</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/90">
                &ldquo;Dear customer, your BVN record is blocked. Update at bankverify-ng.top within
                24 hrs or your account will be frozen.&rdquo;
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#B42318]/20 px-4 py-3 ring-1 ring-[#F97066]/40">
              <span className="text-sm font-semibold text-[#FECACA]">High risk · block sender</span>
              <span className="text-[13px] text-white/60">3 signals</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/80">
              <li>Sender ID does not match any bank shortcode</li>
              <li>Domain registered six days ago, no bank affiliation</li>
              <li>24-hour threat used to force a fast decision</li>
            </ul>
          </div>
        </div>
      </section>

      <LandingFeatures onTabChange={onTabChange} />
      <LandingScamTypes onTabChange={onTabChange} />
      <LandingEmergency />
      <LandingFinalCta onTabChange={onTabChange} />
    </div>
  )
}