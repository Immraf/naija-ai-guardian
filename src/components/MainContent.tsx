import { lazy, Suspense, useEffect } from 'react'
import type { ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck } from '@phosphor-icons/react'
import HomePage from '@/components/HomePage'
import AnalyzerSection from '@/components/AnalyzerSection'
import ReportSection from '@/components/ReportSection'
import SafetySection from '@/components/SafetySection'
import type { TabId, AdminProfile } from '@/types'

/* Heavy screens are split out of the initial bundle. */
const DatabaseSection = lazy(() => import('@/components/DatabaseSection'))
const AwarenessSection = lazy(() => import('@/components/AwarenessSection'))
const QuizSection = lazy(() => import('@/components/QuizSection'))
const AdminSection = lazy(() => import('@/components/AdminSection'))

interface MainContentProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  adminProfile: AdminProfile | null
  onAdminLogin: (profile: AdminProfile) => void
  onAdminLogout: () => void
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#00796B] dark:border-gray-800 dark:border-t-[#5EEAD4]"
        role="status"
        aria-label="Loading this section"
      />
    </div>
  )
}

const TAB_COMPONENTS: Record<TabId, ComponentType> = {
  landing: () => null,
  portal: () => null,
  home: HomePage,
  analyzer: AnalyzerSection,
  database: DatabaseSection,
  report: ReportSection,
  awareness: AwarenessSection,
  quiz: QuizSection,
  safety: SafetySection,
  admin: () => null,
}

export default function MainContent({
  activeTab,
  onTabChange,
  adminProfile,
  onAdminLogin,
  onAdminLogout,
}: MainContentProps) {
  const isAdminTab = activeTab === 'admin'
  const hasConsoleAccess = Boolean(adminProfile && adminProfile.status === 'ACTIVE')

  /* The console is never reachable without an ACTIVE staff profile. */
  useEffect(() => {
    if (isAdminTab && !hasConsoleAccess) onTabChange('landing')
  }, [isAdminTab, hasConsoleAccess, onTabChange])

  if (isAdminTab && !hasConsoleAccess) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <ShieldCheck weight="fill" className="h-10 w-10 text-[#00796B] dark:text-[#5EEAD4]" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-semibold text-[#111827] dark:text-white">Console restricted</h1>
        <p className="mt-2 text-base leading-relaxed text-pretty text-[#667085] dark:text-gray-400">
          This area is limited to active staff accounts. Returning you to the public site.
        </p>
      </div>
    )
  }

  const Tab = TAB_COMPONENTS[activeTab]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        exit={{ y: -12 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {isAdminTab ? (
            <AdminSection
              onTabChange={onTabChange}
              adminProfile={adminProfile}
              onAdminLogin={onAdminLogin}
              onAdminLogout={onAdminLogout}
            />
          ) : (
            <Tab />
          )}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}