import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Warning, CheckCircle, ArrowRight, ArrowLeft, Flag,
  FileText, Info, Copy, Shield, SealWarning
} from '@phosphor-icons/react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import { normalizePhoneNumber } from '@/utils/scamUtils'
import { SCAM_TYPES, PLATFORMS } from '@/constants'
import type { TabId, ReportFormData } from '@/types'

const STEPS = ['Type', 'Details', 'Evidence', 'Verify & Submit'] as const

const INITIAL_FORM: ReportFormData = {
  scamType: '', phoneNumber: '', bankName: '', accountNumber: '',
  platform: '', amount: '', description: '', evidence: '',
  reporterName: '', reporterEmail: '',
}

export default function ReportSection({ onTabChange }: { onTabChange: (t: TabId) => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [referenceId, setReferenceId] = useState('')

  function update(field: keyof ReportFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function canNext(): boolean {
    if (step === 0) return !!form.scamType
    if (step === 1) return !!(form.description && form.platform && form.phoneNumber)
    if (step === 2) return true
    return false
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      // Reports are written by the submit-report edge function, never directly
      // from the browser, so the base table needs no anonymous insert policy.
      const { data, error } = await supabase.functions.invoke('submit-report', {
        body: {
          category: form.scamType,
          identifier: normalizePhoneNumber(form.phoneNumber),
          platform: form.platform,
          description: form.description,
          evidence: form.evidence,
          reporter_name: form.reporterName,
          reporter_email: form.reporterEmail,
        },
      })
      if (error) throw error
      const payload = data as { reference_id?: string; error?: string } | null
      if (!payload?.reference_id) {
        throw new Error(payload?.error || 'Failed to submit report.')
      }
      setReferenceId(payload.reference_id)
      setStep(3)
      toast.success('Report submitted successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit report.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM)
    setStep(0)
    setReferenceId('')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-3xl">Report a Scam</h1>
        <p className="mt-2 text-sm text-[#667085] dark:text-gray-400">Help protect others by reporting scam activity you have encountered.</p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
              i <= step ? 'bg-[#00796B] text-white' : 'bg-[#E5E7EB] text-[#667085] dark:bg-gray-700'
            )}>{i + 1}</div>
            <span className={cn('text-xs font-medium', i <= step ? 'text-[#00796B]' : 'text-[#667085]')}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-[#E5E7EB] dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-gray-700 dark:bg-[#111827]">
            <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">What type of scam did you encounter?</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SCAM_TYPES.map((t) => (
                <button key={t} onClick={() => update('scamType', t)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all',
                    form.scamType === t
                      ? 'border-[#00796B] bg-[#00796B]/10 text-[#00796B]'
                      : 'border-[#E5E7EB] text-[#111827] hover:border-[#00796B]/30 dark:border-gray-600 dark:text-white'
                  )}
                >{t}</button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setStep(1)} disabled={!canNext()} className="flex items-center gap-2 rounded-lg bg-[#00796B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00695C] disabled:opacity-50">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-gray-700 dark:bg-[#111827]">
            <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">Provide details about the scam</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#667085]">Phone Number Used *</label>
                <input value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="e.g. 08031234567 or +234803..." className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#667085]">Platform *</label>
                  <select value={form.platform} onChange={(e) => update('platform', e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#667085]">Amount Lost (if any)</label>
                  <input value={form.amount} onChange={(e) => update('amount', e.target.value)} placeholder="₦0" className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#667085]">Description *</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value.slice(0, 1000))} rows={4} placeholder="Describe what happened, when, and any communication you received..." className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] p-3 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                <p className="mt-1 text-xs text-[#667085]">{form.description.length}/1000</p>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm text-[#667085] hover:text-[#00796B]"><ArrowLeft className="h-4 w-4" /> Back</button>
              <button onClick={() => setStep(2)} disabled={!canNext()} className="flex items-center gap-2 rounded-lg bg-[#00796B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00695C] disabled:opacity-50">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <SealWarning className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Important: Do Not Share Sensitive Information</p>
                  <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                    <li>Never share your Bank Verification Number (BVN)</li>
                    <li>Never share your National Identification Number (NIN)</li>
                    <li>Never share your PIN, password, or One-Time Password (OTP)</li>
                    <li>Never share your ATM card number or CVV</li>
                    <li>Do not include personal information you are not comfortable sharing publicly</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-gray-700 dark:bg-[#111827]">
              <h2 className="mb-4 text-lg font-semibold text-[#111827] dark:text-white">Evidence (Optional)</h2>
              <textarea value={form.evidence} onChange={(e) => update('evidence', e.target.value.slice(0, 2000))} rows={4} placeholder="Paste any evidence text, URLs, or screenshots description here..." className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] p-3 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              <p className="mt-1 text-xs text-[#667085]">{form.evidence.length}/2000</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#667085]">Your Name (Optional)</label>
                  <input value={form.reporterName} onChange={(e) => update('reporterName', e.target.value)} placeholder="Anonymous" className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#667085]">Email (Optional)</label>
                  <input value={form.reporterEmail} onChange={(e) => update('reporterEmail', e.target.value)} placeholder="For follow-up" className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-[#667085] hover:text-[#00796B]"><ArrowLeft className="h-4 w-4" /> Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50">
                {submitting ? 'Submitting...' : <><Flag className="h-4 w-4" /> Submit Report</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center dark:border-gray-700 dark:bg-[#111827]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10">
              <CheckCircle className="h-8 w-8 text-[#10B981]" weight="fill" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-[#111827] dark:text-white">Report Submitted</h2>
            <p className="mb-4 text-sm text-[#667085]">Thank you for helping keep the community safe.</p>
            <div className="mx-auto mb-6 max-w-xs rounded-lg bg-[#F7F8F6] p-4 dark:bg-gray-800">
              <p className="text-xs text-[#667085] mb-1">Your Reference ID</p>
              <p className="text-lg font-mono font-bold text-[#00796B]">{referenceId}</p>
              <button onClick={() => { navigator.clipboard.writeText(referenceId); toast.success('Copied!') }} className="mt-2 flex items-center justify-center gap-1 text-xs text-[#00796B] hover:underline mx-auto"><Copy className="h-3 w-3" /> Copy Reference</button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={handleReset} className="rounded-lg bg-[#00796B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#00695C]">Report Another Scam</button>
              <button onClick={() => onTabChange('home')} className="rounded-lg border border-[#E5E7EB] px-5 py-2.5 text-sm font-medium text-[#667085] hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Back to Home</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}