import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeSlash, LockKey, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import {
  LOCKOUT_MS,
  MAX_FAILED_ATTEMPTS,
  fetchAdminProfile,
  recordStaffLogin,
  resolveStaffEmail,
} from '@/lib/staffAuth'
import type { AdminProfile } from '@/types'

interface StaffLoginProps {
  onLogin: (profile: AdminProfile) => void
  onExit: () => void
}

type Mode = 'signin' | 'reset'

export default function StaffLogin({ onLogin, onExit }: StaffLoginProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [failures, setFailures] = useState(0)
  const [lockUntil, setLockUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!lockUntil) return
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [lockUntil])

  const secondsLeft = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0
  const lockedOut = secondsLeft > 0

  function registerFailure() {
    const next = failures + 1
    setFailures(next)
    if (next >= MAX_FAILED_ATTEMPTS) {
      setLockUntil(Date.now() + LOCKOUT_MS)
      setFailures(0)
      setError('Too many attempts. Sign-in is paused for 30 seconds.')
    }
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lockedOut || busy) return
    setError('')
    setNotice('')

    const email = resolveStaffEmail(username)
    if (!email || password.length === 0) {
      setError('Enter your username and password.')
      return
    }

    setBusy(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setBusy(false)
      registerFailure()
      setError('Invalid username or password.')
      return
    }

    const profile = await fetchAdminProfile(data.user.id)
    if (!profile || profile.status !== 'ACTIVE') {
      await supabase.auth.signOut()
      setBusy(false)
      registerFailure()
      setError('Invalid username or password.')
      return
    }

    void recordStaffLogin(profile.id)
    setBusy(false)
    setFailures(0)
    setPassword('')
    toast.success(`Signed in as ${profile.full_name}`)
    onLogin(profile)
  }

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setNotice('')

    const email = resolveStaffEmail(username)
    if (!email) {
      setError('Enter the staff username you sign in with.')
      return
    }

    setBusy(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })
    setBusy(false)

    if (resetError) {
      toast.error(resetError.message || 'Could not send the reset link')
      return
    }

    setNotice(`If ${email} belongs to a staff account, a reset link is on its way.`)
  }

  return (
    <div className="relative isolate overflow-hidden bg-[#04231F]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#0B3B33_0%,#04231F_55%,#02110F_100%)]"
      />
      <div className="relative mx-auto flex min-h-[88vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#00897B]/25 text-[#5EEAD4]">
            <LockKey weight="fill" className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Staff access</h1>
          <p className="mt-1 text-sm leading-relaxed text-white/60">
            Internal moderation console. Sign in with the username issued to you — no public sign-up
            exists.
          </p>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="staff-username" className="block text-[13px] font-medium text-white/75">
                  Username
                </label>
                <input
                  id="staff-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-base text-white placeholder-white/35 outline-none focus:border-[#5EEAD4] focus:ring-2 focus:ring-[#5EEAD4]/40"
                  placeholder="e.g. amaka.o"
                />
              </div>

              <div>
                <label htmlFor="staff-password" className="block text-[13px] font-medium text-white/75">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 pr-11 text-base text-white placeholder-white/35 outline-none focus:border-[#5EEAD4] focus:ring-2 focus:ring-[#5EEAD4]/40"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div aria-live="polite" className="min-h-[1.25rem]">
                {error && (
                  <p className="flex items-start gap-1.5 text-[13px] text-[#FCA5A5]">
                    <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                    {lockedOut ? ` Try again in ${secondsLeft}s.` : ''}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || lockedOut}
                className="focus-ring-white inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00897B] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#00796B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Checking credentials…' : lockedOut ? `Locked · ${secondsLeft}s` : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="reset-username" className="block text-[13px] font-medium text-white/75">
                  Username
                </label>
                <input
                  id="reset-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-base text-white placeholder-white/35 outline-none focus:border-[#5EEAD4] focus:ring-2 focus:ring-[#5EEAD4]/40"
                  placeholder="e.g. amaka.o"
                />
              </div>

              <p className="text-[13px] leading-relaxed text-white/55">
                The reset link is sent to the internal mailbox linked to that username. Nothing is
                posted publicly.
              </p>

              <div aria-live="polite" className="min-h-[1.25rem]">
                {error && <p className="text-[13px] text-[#FCA5A5]">{error}</p>}
                {notice && <p className="text-[13px] text-[#5EEAD4]">{notice}</p>}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="focus-ring-white inline-flex w-full items-center justify-center rounded-xl bg-[#00897B] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#00796B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'reset' : 'signin')
                setError('')
                setNotice('')
              }}
              className="focus-ring-white rounded-lg text-[13px] font-medium text-white/60 hover:text-white"
            >
              {mode === 'signin' ? 'Forgot password?' : 'Back to sign in'}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="focus-ring-white inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to ScamShield
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[13px] leading-relaxed text-white/40">
          Access is logged. Every action inside the console is written to the audit trail.
        </p>
      </div>
    </div>
  )
}