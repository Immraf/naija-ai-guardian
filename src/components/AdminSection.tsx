import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { SquaresFour, ShieldCheck, Users, ChartBar, Clock, SignOut, Bell, BellRinging, Copy, Graph, Heartbeat } from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import AdminLogin from '@/components/AdminLogin'
import AdminDashboard from '@/components/AdminDashboard'
import AdminModeration from '@/components/AdminModeration'
import AdminAdministrators from '@/components/AdminAdministrators'
import AdminIntelligence from '@/components/AdminIntelligence'
import AdminAudit from '@/components/AdminAudit'
import AdminNotificationsList from '@/components/AdminNotificationsList'
import AdminSystemHealthView from '@/components/AdminSystemHealthView'
import type { ScamReport, TabId, AdminProfile, AdminSubTab, AuditLog, AdminNotification } from '@/types'

interface AdminSectionProps {
  onTabChange: (t: TabId) => void
  adminProfile: AdminProfile | null
  onAdminLogin: (profile: AdminProfile) => void
  onAdminLogout: () => void
}

const SUB_TABS: { id: AdminSubTab; label: string; icon: React.ComponentType<{ className?: string }>; superAdminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
  { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
  { id: 'intelligence', label: 'Intelligence', icon: ChartBar },
  { id: 'analytics', label: 'Analytics', icon: Graph },
  { id: 'duplicates', label: 'Duplicates', icon: Copy },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'administrators', label: 'Admins', icon: Users, superAdminOnly: true },
  { id: 'audit', label: 'Audit Logs', icon: Clock },
  { id: 'systemhealth', label: 'System Health', icon: Heartbeat },
]

export default function AdminSection({ onTabChange, adminProfile, onAdminLogin, onAdminLogout }: AdminSectionProps) {
  const [subTab, setSubTab] = useState<AdminSubTab>('dashboard')
  const [reports, setReports] = useState<ScamReport[]>([])
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, reported: 0, underReview: 0, confirmed: 0, rejected: 0, resolved: 0 })
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const hasPermission = useCallback((perm: string) => {
    if (!adminProfile) return false
    if (adminProfile.role === 'SUPER_ADMIN') return true
    return adminProfile.permissions.includes(perm)
  }, [adminProfile])

  const loadData = useCallback(async () => {
    if (!adminProfile) return
    setLoading(true)

    const { data: reportsData, error: reportsError } = await supabase
      .from('scam_reports')
      .select('*')
      .order('created_at', { ascending: false })
    if (reportsError) { toast.error(reportsError.message) }
    const r = (reportsData || []) as ScamReport[]
    setReports(r)
    setStats({
      total: r.length,
      reported: r.filter((x) => x.status === 'Reported').length,
      underReview: r.filter((x) => x.status === 'Under Review').length,
      confirmed: r.filter((x) => x.status === 'Confirmed').length,
      rejected: r.filter((x) => x.status === 'Rejected').length,
      resolved: r.filter((x) => x.status === 'Resolved').length,
    })

    if (adminProfile.role === 'SUPER_ADMIN') {
      const { data: adminsData } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false })
      setAdmins((adminsData || []) as AdminProfile[])
    }

    const { data: logsData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
    setLogs((logsData || []) as AuditLog[])

    const { data: notifData } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications((notifData || []) as AdminNotification[])
    setUnreadNotifCount((notifData || []).filter((n: AdminNotification) => !n.read).length)

    setLoading(false)
  }, [adminProfile])

  // Poll for unread notifications every 30s
  useEffect(() => {
    if (!adminProfile) return
    loadData()
    pollRef.current = setInterval(async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('read')
        .eq('admin_id', adminProfile.id)
      if (!error && data) {
        setUnreadNotifCount(data.filter((n) => !n.read).length)
      }
    }, 30000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [adminProfile])

  if (!adminProfile) {
    return <AdminLogin onLogin={onAdminLogin} />
  }

  const visibleTabs = SUB_TABS.filter((t) => {
    if (t.superAdminOnly && adminProfile.role !== 'SUPER_ADMIN') return false
    return true
  })

  const needsAttention = reports.filter((r) =>
    r.status === 'Reported' || r.status === 'Under Review'
  )

  const categoryBreakdown: [string, number][] = (() => {
    const map = new Map<string, number>()
    reports.forEach((r) => map.set(r.category, (map.get(r.category) || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })()

  const platformBreakdown: [string, number][] = (() => {
    const map = new Map<string, number>()
    reports.forEach((r) => map.set(r.platform, (map.get(r.platform) || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })()

  return (
    <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6" role="main" aria-label="Admin Portal">
      <a href="#admin-main-content" className="sr-only-focusable fixed left-4 top-4 z-50 rounded-lg bg-[#00796B] px-4 py-2 text-sm font-medium text-white shadow-lg">
        Skip to main admin content
      </a>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00796B] to-[#00695C] shadow-lg shadow-[#00796B]/20" aria-hidden="true">
            <ShieldCheck className="h-5 w-5 text-white" weight="fill" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#111827] dark:text-white sm:text-xl">Admin Portal</h1>
            <p className="text-[11px] text-[#667085]">
              Welcome, {adminProfile.full_name}
              <span className="ml-1.5 rounded-full bg-[#00796B]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#00796B]">
                {adminProfile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub-Admin'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell with unread badge */}
          <button
            onClick={() => setSubTab('notifications')}
            aria-label={`Notifications: ${unreadNotifCount} unread`}
            className="relative rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#667085] hover:border-[#00796B] hover:text-[#00796B] transition-all focus-ring dark:border-gray-700 dark:bg-[#111827]"
          >
            {unreadNotifCount > 0 ? (
              <BellRinging className="h-4 w-4" weight="fill" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {unreadNotifCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#111827]">
                {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
              </span>
            )}
          </button>
          <button
            onClick={onAdminLogout}
            aria-label="Sign out of admin portal"
            className="flex items-center gap-1.5 self-start rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#667085] transition-colors hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-red-50 focus-ring dark:border-gray-700 dark:bg-[#111827] dark:hover:bg-red-900/20"
          >
            <SignOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </header>

      <nav aria-label="Admin navigation tabs" className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-1 dark:border-gray-700 dark:bg-[#111827]" role="tablist">
        {visibleTabs.map((tab, idx) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={subTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={subTab === tab.id ? 0 : -1}
              onClick={() => setSubTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  const nextIdx = (idx + 1) % visibleTabs.length
                  setSubTab(visibleTabs[nextIdx].id)
                }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  const prevIdx = (idx - 1 + visibleTabs.length) % visibleTabs.length
                  setSubTab(visibleTabs[prevIdx].id)
                }
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#00796B] focus-visible:ring-offset-1 focus-visible:outline-none',
                subTab === tab.id
                  ? 'bg-[#00796B] text-white shadow-sm'
                  : 'text-[#667085] hover:bg-[#00796B]/10 hover:text-[#00796B] dark:text-gray-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
              {tab.id === 'notifications' && unreadNotifCount > 0 && (
                <span className="ml-1 rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[8px] font-bold text-white">{unreadNotifCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div id="admin-main-content" role="region" aria-live="polite" aria-atomic="true" className="relative">
        <AnimatePresence mode="wait">
          {subTab === 'dashboard' && (
            <div key="dashboard" id="panel-dashboard" role="tabpanel" aria-label="Dashboard">
              <AdminDashboard
                stats={stats}
                needsAttention={needsAttention}
                categoryBreakdown={categoryBreakdown}
                platformBreakdown={platformBreakdown}
                onSelectReport={(r) => { setSubTab('moderation'); setReports((prev) => prev) }}
              />
            </div>
          )}
          {subTab === 'moderation' && (
            <AdminModeration
              key="moderation"
              reports={reports}
              loading={loading}
              adminProfile={adminProfile}
              hasPermission={hasPermission}
              onRefresh={loadData}
            />
          )}
          {subTab === 'administrators' && adminProfile.role === 'SUPER_ADMIN' && (
            <AdminAdministrators
              key="administrators"
              admins={admins}
              currentAdminId={adminProfile.id}
              onRefresh={loadData}
            />
          )}
          {subTab === 'intelligence' && (
            <AdminIntelligence
              key="intelligence"
              reports={reports}
              loading={loading}
            />
          )}
          {subTab === 'audit' && (
            <AdminAudit
              key="audit"
              logs={logs}
              loading={loading}
              adminProfile={adminProfile}
              onRefresh={loadData}
            />
          )}
          {subTab === 'analytics' && (
            <AdminModeration
              key="analytics"
              reports={reports}
              loading={loading}
              adminProfile={adminProfile}
              hasPermission={hasPermission}
              onRefresh={loadData}
            />
          )}
          {subTab === 'duplicates' && (
            <AdminModeration
              key="duplicates"
              reports={reports}
              loading={loading}
              adminProfile={adminProfile}
              hasPermission={hasPermission}
              onRefresh={loadData}
            />
          )}
          {subTab === 'notifications' && (
            <AdminNotificationsList
              key="notifications"
              notifications={notifications}
              loading={loading}
              adminProfile={adminProfile}
              onRefresh={loadData}
            />
          )}
          {subTab === 'systemhealth' && (
            <AdminSystemHealthView
              key="systemhealth"
              reports={reports}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}