import { useCallback, useEffect, useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Shield } from '@phosphor-icons/react'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'
import Navbar from '@/components/Navbar'
import MainContent from '@/components/MainContent'
import LandingPage from '@/components/LandingPage'
import StaffLogin from '@/components/StaffLogin'
import ErrorBoundary from '@/components/ErrorBoundary'
import { STAFF_ROUTE } from '@/constants'
import { IDLE_LIMIT_MS, IDLE_WARNING_MS, fetchAdminProfile } from '@/lib/staffAuth'
import type { TabId, AdminProfile } from '@/types'

/** Every portal tab owns a hash route so a refresh or a shared link reopens it. */
const TAB_ROUTES: Partial<Record<TabId, string>> = {
  home: '#/dashboard',
  analyzer: '#/analyzer',
  database: '#/database',
  report: '#/report',
  awareness: '#/awareness',
  quiz: '#/quiz',
  safety: '#/safety',
  admin: '#/admin',
  portal: STAFF_ROUTE,
}

function tabFromHash(hash: string): TabId {
  if (hash === STAFF_ROUTE) return 'portal'
  const match = Object.entries(TAB_ROUTES).find(([, route]) => route === hash)
  return (match?.[0] as TabId | undefined) ?? 'landing'
}

function initialTab(): TabId {
  if (typeof window === 'undefined') return 'landing'
  return tabFromHash(window.location.hash)
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

function AppShell() {
  const { user, loading, signOut } = useAuth()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('scamshield-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const warningShown = useRef(false)

  /* ------------------------------------------------------------- theming */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('scamshield-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  /* ------------------------------------------------- URL <-> tab plumbing */
  const navigate = useCallback((tab: TabId) => {
    setActiveTab(tab)
    if (typeof window === 'undefined') return
    const base = `${window.location.pathname}${window.location.search}`
    const next = `${base}${TAB_ROUTES[tab] ?? ''}`
    if (`${base}${window.location.hash}` !== next) {
      window.history.pushState(null, '', next)
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash
      // In-page anchors (#main-content, #features) must never change the tab.
      if (hash && hash !== STAFF_ROUTE && !hash.startsWith('#/')) return
      setActiveTab(tabFromHash(hash))
    }
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  /* --------------------------------------- hidden portal hash + noindex */
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]')
    if (activeTab !== 'portal') {
      if (existing) existing.remove()
      return
    }
    const meta = existing ?? document.createElement('meta')
    meta.setAttribute('name', 'robots')
    meta.setAttribute('content', 'noindex, nofollow')
    if (!existing) document.head.appendChild(meta)
  }, [activeTab])

  /* --------------------------------------- staff profile for signed-in user */
  useEffect(() => {
    if (!user) {
      setAdminProfile(null)
      setProfileLoading(false)
      return
    }
    let cancelled = false
    setProfileLoading(true)
    fetchAdminProfile(user.id)
      .then((profile) => {
        if (cancelled) return
        setAdminProfile(profile && profile.status === 'ACTIVE' ? profile : null)
        setProfileLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setAdminProfile(null)
        setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const handleAdminLogout = useCallback(async () => {
    await signOut()
    setAdminProfile(null)
    navigate('landing')
  }, [navigate, signOut])

  const handleAdminLogin = useCallback(
    (profile: AdminProfile) => {
      setAdminProfile(profile)
      navigate('admin')
    },
    [navigate],
  )

  /* ------------------------------------------- idle auto sign-out (30m) */
  useEffect(() => {
    if (!adminProfile) return

    let warning: number | undefined
    let limit: number | undefined

    const clear = () => {
      if (warning) window.clearTimeout(warning)
      if (limit) window.clearTimeout(limit)
    }

    const start = () => {
      clear()
      warningShown.current = false
      warning = window.setTimeout(() => {
        warningShown.current = true
        toast.warning('Still there? Staff sessions sign out after 30 minutes of inactivity.')
      }, IDLE_WARNING_MS)
      limit = window.setTimeout(() => {
        void handleAdminLogout()
        toast.info('Signed out after 30 minutes of inactivity.')
      }, IDLE_LIMIT_MS)
    }

    const activity = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart']
    let last = 0
    const onActivity = () => {
      const now = Date.now()
      if (now - last < 5000) return
      last = now
      start()
    }

    start()
    activity.forEach((event) => window.addEventListener(event, onActivity, { passive: true }))
    return () => {
      clear()
      activity.forEach((event) => window.removeEventListener(event, onActivity))
    }
  }, [adminProfile, handleAdminLogout])

  const isPortal = activeTab === 'portal'
  const sessionLoading = loading || profileLoading

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only-focusable focus-ring absolute left-4 top-4 z-[60] rounded-lg bg-card px-4 py-2 text-sm font-semibold text-primary shadow-lg"
      >
        Skip to main content
      </a>

      <Toaster position="bottom-right" closeButton />

      {!isPortal && (
        <Navbar
          activeTab={activeTab}
          onTabChange={navigate}
          isDark={isDark}
          onToggleDark={() => setIsDark((value) => !value)}
          adminProfile={adminProfile}
          onAdminLogout={handleAdminLogout}
        />
      )}

      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary>
          {activeTab === 'landing' ? (
            <LandingPage onTabChange={navigate} />
          ) : isPortal ? (
            <StaffLogin onLogin={handleAdminLogin} onExit={() => navigate('landing')} />
          ) : sessionLoading && activeTab === 'admin' ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
                role="status"
                aria-label="Restoring your session"
              />
            </div>
          ) : (
            <MainContent
              activeTab={activeTab}
              onTabChange={navigate}
              adminProfile={adminProfile}
              onAdminLogin={handleAdminLogin}
              onAdminLogout={handleAdminLogout}
            />
          )}
        </ErrorBoundary>
      </main>

      {!isPortal && (
        <footer className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:py-6 sm:text-left">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Shield weight="fill" className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>ScamShield Nigeria — Stay One Step Ahead of Scammers.</span>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Report scams to the EFCC or forward suspicious SMS to 7726, free from all networks.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}