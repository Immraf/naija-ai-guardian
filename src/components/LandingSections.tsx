import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  ChatCircleDots,
  Database,
  Flag,
  GraduationCap,
  Lifebuoy,
  MagnifyingGlass,
  Warning,
} from '@phosphor-icons/react'
import { MEDIA, SCAM_CATEGORIES } from '@/constants'
import type { TabId } from '@/types'

interface SectionProps {
  onTabChange: (tab: TabId) => void
}

const FEATURES = [
  {
    id: 'analyzer' as TabId,
    Icon: MagnifyingGlass,
    title: 'AI Analyzer',
    description:
      'Paste an SMS, WhatsApp thread or e-mail. Get a risk score plus the exact lines that triggered it.',
  },
  {
    id: 'database' as TabId,
    Icon: Database,
    title: 'Scam Database',
    description:
      'Search phone numbers, account numbers and handles that other Nigerians have already reported.',
  },
  {
    id: 'report' as TabId,
    Icon: Flag,
    title: 'Report a Scam',
    description:
      'File what happened in under two minutes. Moderators verify it before it appears publicly.',
  },
  {
    id: 'awareness' as TabId,
    Icon: ChatCircleDots,
    title: 'Awareness Guides',
    description:
      'Plain-language breakdowns of WhatsApp takeover, POS skimming, BVN fraud and fake grants.',
  },
  {
    id: 'quiz' as TabId,
    Icon: GraduationCap,
    title: 'Scam Quiz',
    description:
      'Eight questions built on real Nigerian scenarios, with an explanation after every answer.',
  },
  {
    id: 'safety' as TabId,
    Icon: Lifebuoy,
    title: 'Safety Tips',
    description:
      'Twelve habits that block most banking, SIM-swap and fake-job scams before they start.',
  },
]

const DISTRESS_ACTIONS = [
  'Call your bank on the number printed on your card and ask for an immediate transaction stop.',
  'Forward the suspicious SMS to 7726 — free on every Nigerian network — so the sender gets flagged.',
  'Report to the EFCC through efcc.gov.ng or the nearest office, and keep screenshots of everything.',
  'Change your banking PIN, e-mail password and WhatsApp two-step verification code the same day.',
]

export function LandingFeatures({ onTabChange }: SectionProps) {
  const reduce = useReducedMotion()

  return (
    <section
      aria-labelledby="features-heading"
      id="features"
      className="scroll-mt-20 border-y border-[#E5E7EB] bg-white py-16 sm:py-20 dark:border-gray-800 dark:bg-[#111827]"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#00796B] dark:text-[#5EEAD4]">
          Inside the app
        </p>
        <h2
          id="features-heading"
          className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-balance text-[#111827] sm:text-4xl dark:text-white"
        >
          Six tools, one goal — fewer people losing money
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ id, Icon, title, description }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              whileHover={reduce ? undefined : { y: -6 }}
              whileTap={reduce ? undefined : { y: -2 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F7F8F6] p-6 text-left transition-colors hover:border-[#00796B]/45 hover:shadow-lg hover:shadow-[#04231F]/5 dark:border-gray-800 dark:bg-[#0F172A] dark:hover:border-[#5EEAD4]/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#00796B]/10 text-[#00796B] transition-colors group-hover:bg-[#00796B] group-hover:text-white dark:bg-[#5EEAD4]/10 dark:text-[#5EEAD4] dark:group-hover:bg-[#00796B] dark:group-hover:text-white">
                <Icon weight="duotone" className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-[#111827] dark:text-white">{title}</h3>
              <p className="text-base leading-relaxed text-pretty text-[#667085] dark:text-gray-400">
                {description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-[#00796B] dark:text-[#5EEAD4]">
                Open
                <ArrowRight
                  weight="bold"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LandingScamTypes({ onTabChange }: SectionProps) {
  return (
    <section aria-labelledby="scams-heading" id="scam-types" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#00796B] dark:text-[#5EEAD4]">
              Know the playbook
            </p>
            <h2
              id="scams-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-balance text-[#111827] sm:text-4xl dark:text-white"
            >
              Eight schemes running right now
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('database')}
            className="focus-ring inline-flex items-center gap-1.5 self-start rounded-lg text-sm font-semibold text-[#00796B] hover:underline sm:self-auto dark:text-[#5EEAD4]"
          >
            Search the database
            <ArrowRight weight="bold" className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ol className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {SCAM_CATEGORIES.map((category, index) => (
            <li key={category.id} className="border-t border-[#E5E7EB] pt-4 dark:border-gray-800">
              <p className="font-mono text-[13px] text-[#00796B] dark:text-[#5EEAD4]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#111827] dark:text-white">
                {category.label}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-pretty text-[#667085] dark:text-gray-400">
                {category.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function LandingEmergency() {
  return (
    <section aria-labelledby="emergency-heading" id="emergency" className="scroll-mt-20 pb-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white dark:border-gray-800 dark:bg-[#111827]">
          <div className="grid lg:grid-cols-2">
            <img
              src={MEDIA.community}
              alt="Neighbours and family members sharing scam warnings with each other"
              width={1280}
              height={960}
              loading="lazy"
              className="h-56 w-full object-cover lg:h-full"
            />
            <div className="p-6 sm:p-9">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EF4444]/10 px-3 py-1 text-[13px] font-semibold text-[#B42318] dark:text-[#FCA5A5]">
                <Warning weight="fill" className="h-4 w-4" aria-hidden="true" />
                If money already left your account
              </span>
              <h2
                id="emergency-heading"
                className="mt-4 text-2xl font-semibold tracking-tight text-balance text-[#111827] sm:text-3xl dark:text-white"
              >
                Act inside the first hour
              </h2>
              <ol className="mt-5 space-y-3">
                {DISTRESS_ACTIONS.map((action, index) => (
                  <li
                    key={action}
                    className="flex gap-3 text-base leading-relaxed text-[#344054] dark:text-gray-300"
                  >
                    <span className="font-mono text-[13px] font-semibold text-[#00796B] dark:text-[#5EEAD4]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-pretty">{action}</span>
                  </li>
                ))}
              </ol>
              <a
                href="https://www.efcc.gov.ng"
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring mt-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-[#00796B] hover:underline dark:text-[#5EEAD4]"
              >
                Open the EFCC website
                <ArrowUpRight weight="bold" className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingFinalCta({ onTabChange }: SectionProps) {
  return (
    <section aria-labelledby="cta-heading" className="px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#04231F] via-[#063B33] to-[#00796B] px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2
          id="cta-heading"
          className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl"
        >
          One check costs nothing. One mistake can cost everything.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-pretty text-white/80 sm:text-lg">
          Run the message through ScamShield first, then tell the community what happened so the next
          person recognises the number.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onTabChange('analyzer')}
            className="focus-ring-white inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#04231F] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            Analyze a message
            <ArrowRight weight="bold" className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('report')}
            className="focus-ring-white inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Report a scam
          </button>
        </div>
      </div>
    </section>
  )
}