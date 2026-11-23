import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, List, X, Sun, Moon, SignOut, User, ShieldCheck } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { TabId, AdminProfile } from '@/types'

interface NavbarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  isDark: boolean
  onToggleDark: () => void
  adminProfile: AdminProfile | null
  onAdminLogout?: () => void
}

const NAV_ITEMS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'analyzer', label: 'AI Analyzer' },
  { id: 'database', label: 'Scam Database' },
  { id: 'report', label: 'Report a Scam' },
  { id: 'awareness', label: 'Awareness' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'safety', label: 'Safety Tips' },
  { id: 'admin', label: 'Admin' },
]

export default function Navbar({ activeTab, onTabChange, isDark, onToggleDark, adminProfile, onAdminLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-[#F7F8F6]/90 backdrop-blur-md dark:border-gray-800 dark:bg-[#0F172A]/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => { onTabChange('home'); setMobileOpen(false) }}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#111827] dark:text-white"
        >
          <Shield weight="fill" className="h-6 w-6 text-[#00796B]" />
          <span className="hidden sm:inline">ScamShield</span>
          <span className="text-[#00796B]">Nigeria</span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-[#00796B] text-white'
                  : 'text-[#667085] hover:bg-[#00796B]/10 hover:text-[#00796B] dark:text-gray-400 dark:hover:text-[#00796B]'
              )}
            >
              {item.label}
            </button>
          ))}
          {adminProfile && (
            <>
              <div className="mx-1 h-5 w-px bg-[#E5E7EB] dark:bg-gray-700" />
              <button
                onClick={() => onTabChange('admin')}
                className="flex items-center gap-1.5 rounded-lg bg-[#00796B]/10 px-3 py-1.5 text-sm font-medium text-[#00796B] hover:bg-[#00796B]/20 transition-colors"
              >
                <ShieldCheck weight="fill" className="h-4 w-4" />
                <span className="text-[10px]">{adminProfile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
              </button>
              <button
                onClick={onAdminLogout}
                className="rounded-lg p-2 text-[#667085] hover:bg-red-50 hover:text-[#EF4444] dark:hover:bg-red-900/20"
                aria-label="Sign out"
              >
                <SignOut className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={onToggleDark}
            className="rounded-lg p-2 text-[#667085] hover:bg-[#00796B]/10 hover:text-[#00796B] dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggleDark}
            className="rounded-lg p-2 text-[#667085] hover:bg-[#00796B]/10 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-[#667085] hover:bg-[#00796B]/10 dark:text-gray-400"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#E5E7EB] bg-[#F7F8F6] px-4 pb-4 dark:border-gray-800 dark:bg-[#0F172A] md:hidden"
          >
            <div className="flex flex-col gap-1 pt-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setMobileOpen(false) }}
                  className={cn(
                    'rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    activeTab === item.id
                      ? 'bg-[#00796B] text-white'
                      : 'text-[#667085] hover:bg-[#00796B]/10 hover:text-[#00796B] dark:text-gray-400'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}