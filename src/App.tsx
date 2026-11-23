import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Shield, SignOut } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import MainContent from '@/components/MainContent'
import { supabase } from '@/integrations/supabase/client'
import type { TabId, AdminProfile, AdminRole, AdminStatus } from '@/types'

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scamshield-theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('scamshield-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadAdminProfile(session.user.id)
      } else {
        setSessionLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadAdminProfile(session.user.id)
      } else {
        setAdminProfile(null)
        setSessionLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadAdminProfile(userId: string) {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) {
      setAdminProfile({
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: data.role as AdminRole,
        status: data.status as AdminStatus,
        permissions: data.permissions || [],
        created_at: data.created_at,
        last_login: data.last_login,
      })
    } else {
      setAdminProfile(null)
    }
    setSessionLoading(false)
  }

  function handleAdminLogin(profile: AdminProfile) {
    setAdminProfile(profile)
    setActiveTab('admin')
  }

  async function handleAdminLogout() {
    await supabase.auth.signOut()
    setAdminProfile(null)
    setActiveTab('home')
  }

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#111827] dark:bg-[#0F172A] dark:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-[#111827] dark:text-white dark:border-gray-700',
        }}
      />
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        adminProfile={adminProfile}
        onAdminLogout={handleAdminLogout}
      />
      <main>
        <MainContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          adminProfile={adminProfile}
          onAdminLogin={handleAdminLogin}
          onAdminLogout={handleAdminLogout}
        />
      </main>
      <footer className="border-t border-[#E5E7EB] bg-white dark:border-gray-800 dark:bg-[#111827]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:justify-between sm:py-4">
          <div className="flex items-center gap-2 text-sm text-[#667085] dark:text-gray-400">
            <Shield weight="fill" className="h-4 w-4 text-[#00796B]" />
            <span>ScamShield Nigeria &mdash; Stay One Step Ahead of Scammers.</span>
          </div>
          <p className="text-xs text-[#667085] dark:text-gray-500">
            Report scams to EFCC or forward suspicious SMS to 7726 (free from all networks).
          </p>
        </div>
      </footer>
    </div>
  )
}