import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, List, X, Sun, Moon, SignOut, ShieldCheck, SquaresFour } from '@phosphor-icons/react'
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

const APP_ITEMS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Dashboard' },
  { id: 'analyzer', label: 'AI Analyzer' },
  { id: 'database', label: 'Database' },
  { id: 'report', label: 'Report' },
  { id: 'awareness', label: 'Awareness' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'safety', label: 'Safety' },
]

const LANDING_ANCHORS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Tools' },
  { href: '#scam-types', label: 'Scam types' },
  { href: '#emergency', label: 'Emergency' },
]

const MOBILE_MENU_ID = 'primary-mobile-menu'

export default function Navbar({
  activeTab,
  onTabChange,
  isDark,
  onToggleDark,
  adminProfile,
  onAdminLogout,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const onLanding = activeTab === 'landing'

  // Escape closes the mobile menu and returns focus to the trigger.
  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const themeButton = (className?: string) => (
    <button
      type="button"
      onClick={onToggleDark}
      className={cn(
        'rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={() => {
            onTabChange(onLanding ? 'landing' : 'home')
            setMobileOpen(false)
          }}
          className="focus-ring flex items-center gap-2 rounded-lg text-lg font-semibold tracking-tight text-foreground"
        >
          <Shield weight="fill" className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline">ScamShield</span>
          <span className="text-primary">Nigeria</span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {onLanding
            ? LANDING_ANCHORS.map((anchor) => (
                <a
                  key={anchor.href}
                  href={anchor.href}
                  className="focus-ring rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {anchor.label}
                </a>
              ))
            : APP_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  {item.label}
                </button>
              ))}

          {adminProfile && (
            <>
              <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onTabChange('admin')}
                aria-current={activeTab === 'admin' ? 'page' : undefined}
                className="focus-ring flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <ShieldCheck weight="fill" className="h-4 w-4" aria-hidden="true" />
                <span className="text-[13px]">
                  {adminProfile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </button>
              <button
                type="button"
                onClick={onAdminLogout}
                className="focus-ring rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Sign out of the staff console"
              >
                <SignOut className="h-4 w-4" />
              </button>
            </>
          )}

          {themeButton()}

          {onLanding && (
            <button
              type="button"
              onClick={() => onTabChange('home')}
              className="focus-ring ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <SquaresFour weight="bold" className="h-4 w-4" aria-hidden="true" />
              Open app
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {themeButton()}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-primary/10"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls={MOBILE_MENU_ID}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id={MOBILE_MENU_ID}
            initial={{ opacity: 1, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-background px-5 pb-4 md:hidden"
          >
            <div className="flex flex-col gap-1 pt-2">
              {onLanding ? (
                <>
                  {LANDING_ANCHORS.map((anchor) => (
                    <a
                      key={anchor.href}
                      href={anchor.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-left text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      {anchor.label}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('home')
                      setMobileOpen(false)
                    }}
                    className="mt-1 rounded-lg bg-primary px-3 py-2.5 text-left text-base font-semibold text-primary-foreground"
                  >
                    Open app
                  </button>
                </>
              ) : (
                <>
                  {APP_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onTabChange(item.id)
                        setMobileOpen(false)
                      }}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                      className={cn(
                        'rounded-lg px-3 py-2 text-left text-base font-medium transition-colors',
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                  {adminProfile && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('admin')
                          setMobileOpen(false)
                        }}
                        className="rounded-lg px-3 py-2 text-left text-base font-medium text-primary"
                      >
                        Staff console
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAdminLogout?.()
                          setMobileOpen(false)
                        }}
                        className="rounded-lg px-3 py-2 text-left text-base font-medium text-destructive"
                      >
                        Sign out
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('landing')
                      setMobileOpen(false)
                    }}
                    className="mt-1 rounded-lg border border-border px-3 py-2 text-left text-base font-medium text-muted-foreground"
                  >
                    Public homepage
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}