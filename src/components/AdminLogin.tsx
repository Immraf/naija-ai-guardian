import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Shield, LockSimple, Eye, EyeSlash, ArrowRight, Key } from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import type { AdminProfile, AdminRole, AdminStatus } from '@/types'

interface AdminLoginProps {
  onLogin: (profile: AdminProfile) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError || !authData.user) {
      setError('Invalid email or password. Please try again.')
      toast.error('Invalid email or password')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      setError('Access denied. This account does not have admin privileges.')
      toast.error('Access denied. Admin privileges required.')
      setLoading(false)
      return
    }

    if (profile.status === 'DISABLED') {
      await supabase.auth.signOut()
      setError('This admin account has been disabled. Contact your administrator.')
      toast.error('Account disabled. Contact your administrator.')
      setLoading(false)
      return
    }

    await supabase
      .from('admin_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)

    const adminProfile: AdminProfile = {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role as AdminRole,
      status: profile.status as AdminStatus,
      permissions: profile.permissions || [],
      created_at: profile.created_at,
      last_login: profile.last_login,
    }

    toast.success(`Welcome back, ${adminProfile.full_name}`)
    onLogin(adminProfile)
    setLoading(false)
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })

    if (resetError) {
      setError('Failed to send reset email. Please try again.')
      toast.error('Failed to send reset email')
    } else {
      toast.success('Password reset link sent to your email.')
      setMode('login')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center px-4">
      <a href="#admin-login-form" className="sr-only-focusable fixed left-4 top-4 z-50 rounded-lg bg-[#00796B] px-4 py-2 text-sm font-medium text-white shadow-lg">
        Skip to login form
      </a>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-[#111827]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00796B] to-[#00695C] shadow-lg shadow-[#00796B]/20">
            <Shield className="h-8 w-8 text-white" weight="fill" />
          </div>

          <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
            {mode === 'login' ? 'Admin Access' : 'Reset Password'}
          </h1>
          <p className="mb-6 text-center text-sm text-[#667085] dark:text-gray-400">
            {mode === 'login'
              ? 'Sign in with your administrator credentials.'
              : 'Enter your email to receive a reset link.'}
          </p>

          <form id="admin-login-form" onSubmit={mode === 'login' ? handleLogin : handleForgotPassword} className="space-y-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-[#667085] dark:text-gray-400">
                Email Address
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="admin@scamshield.ng"
                  required
                  aria-required="true"
                  aria-describedby={error ? 'admin-login-error' : undefined}
                  autoComplete="email"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-2 focus:ring-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-[#667085] dark:text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <LockSimple className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="Enter your password"
                    required
                    aria-required="true"
                    aria-describedby={error ? 'admin-login-error' : undefined}
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] py-2.5 pl-10 pr-10 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-2 focus:ring-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#667085] hover:text-[#00796B] focus-visible:ring-2 focus-visible:ring-[#00796B] focus-visible:outline-none"
                  >
                    {showPassword ? <EyeSlash className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}

            <div aria-live="polite" aria-atomic="true">
              {error && (
                <motion.p
                  id="admin-login-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs text-[#EF4444] dark:bg-red-900/20"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-all',
                'bg-[#00796B] hover:bg-[#00695C] active:scale-[0.98] focus-ring-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  <span className="sr-only">Signing in...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  Sign In <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <nav className="mt-6 text-center" aria-label="Authentication options">
            <button
              onClick={() => { setMode('forgot'); setError('') }}
              className="text-xs font-medium text-[#00796B] hover:underline focus-ring rounded-md px-2 py-1"
            >
              {mode === 'login' ? 'Forgot your password?' : 'Back to sign in'}
            </button>
          </nav>
        </div>
      </motion.div>
    </div>
  )
}