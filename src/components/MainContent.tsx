import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TabId, AdminProfile } from '@/types'
import HomePage from '@/components/HomePage'
import AnalyzerSection from '@/components/AnalyzerSection'
import DatabaseSection from '@/components/DatabaseSection'
import ReportSection from '@/components/ReportSection'
import AwarenessSection from '@/components/AwarenessSection'
import QuizSection from '@/components/QuizSection'
import SafetySection from '@/components/SafetySection'
import AdminSection from '@/components/AdminSection'

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
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#00796B]" />
    </div>
  )
}

const TAB_COMPONENTS: Record<TabId, React.ComponentType<{ onTabChange: (t: TabId) => void }>> = {
  home: () => <HomePage />,
  analyzer: AnalyzerSection,
  database: DatabaseSection,
  report: ReportSection,
  awareness: AwarenessSection,
  quiz: QuizSection,
  safety: SafetySection,
  admin: () => <></>,
}

export default function MainContent({ activeTab, onTabChange, adminProfile, onAdminLogin, onAdminLogout }: MainContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'admin' ? (
            <AdminSection
              onTabChange={onTabChange}
              adminProfile={adminProfile}
              onAdminLogin={onAdminLogin}
              onAdminLogout={onAdminLogout}
            />
          ) : (
            (() => {
              const C = TAB_COMPONENTS[activeTab]
              return <C onTabChange={onTabChange} />
            })()
          )}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}