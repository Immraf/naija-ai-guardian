import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Bell } from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import type { AdminProfile, AdminNotification } from '@/types'

interface Props {
  notifications: AdminNotification[]
  loading: boolean
  adminProfile: AdminProfile
  onRefresh: () => void
}

export default function AdminNotificationsList({ notifications, loading, adminProfile, onRefresh }: Props) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  async function markAsRead(id: string) {
    const { error } = await supabase.from('admin_notifications').update({ read: true }).eq('id', id)
    if (error) toast.error(error.message)
    else onRefresh()
  }

  async function markAllRead() {
    const { error } = await supabase.from('admin_notifications').update({ read: true }).eq('admin_id', adminProfile.id)
    if (error) toast.error(error.message)
    else { toast.success('All notifications marked as read'); onRefresh() }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#EF4444] px-2 py-0.5 text-[10px] font-medium text-white">{unreadCount} unread</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white p-0.5 dark:border-gray-700 dark:bg-[#111827]">
            {(['all', 'unread'] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)}
                aria-pressed={filter === t}
                className={cn('rounded-md px-2.5 py-1 text-[10px] font-medium transition-all focus-ring',
                  filter === t ? 'bg-[#00796B] text-white' : 'text-[#667085] hover:text-[#111827] dark:hover:text-white'
                )}>{t === 'all' ? 'All' : 'Unread'}</button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[10px] font-medium text-[#00796B] hover:underline">Mark all read</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-16 dark:border-gray-700">
          <Bell className="mb-3 h-10 w-10 text-[#667085]" />
          <p className="text-sm font-medium text-[#667085]">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const typeColors: Record<string, string> = {
              info: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10',
              warning: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10',
              alert: 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10',
              success: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10',
            }
            const typeIcons: Record<string, React.ComponentType<{ className?: string; weight?: string }>> = {
              info: Bell, warning: Bell, alert: Bell, success: Bell,
            }
            const NotifIcon = typeIcons[n.type] || Bell
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => { if (!n.read) markAsRead(n.id) }}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !n.read) { e.preventDefault(); markAsRead(n.id) } }}
                role="button" tabIndex={0}
                aria-label={`${n.title}: ${n.message}. ${n.read ? 'Read' : 'Unread'}`}
                className={cn('cursor-pointer rounded-xl border p-3 transition-all focus-ring', typeColors[n.type] || 'border-[#E5E7EB] bg-white dark:border-gray-700 dark:bg-[#111827]',
                  !n.read && 'ring-1 ring-[#00796B]/20')}>
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-full',
                    n.type === 'alert' ? 'bg-red-100 text-red-600' : n.type === 'warning' ? 'bg-amber-100 text-amber-600' : n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600')}>
                    <NotifIcon className="h-3.5 w-3.5" weight={n.type === 'alert' ? 'fill' : 'regular'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-[#111827] dark:text-white">{n.title}</p>
                      <span className="text-[10px] text-[#667085] flex-shrink-0 ml-2">{new Date(n.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#667085]">{n.message}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#00796B]" />}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}