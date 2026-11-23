import { motion, AnimatePresence } from 'framer-motion'
import { WarningCircle, Warning, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ConfirmationDialog } from '@/types'

interface Props {
  dialog: ConfirmationDialog | null
}

export default function AdminModerationConfirmDialog({ dialog }: Props) {
  if (!dialog?.open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-label={dialog.title}
        aria-describedby="confirm-dialog-message"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-[#111827]"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              dialog.impact === 'danger' ? 'bg-red-100 text-red-600' :
              dialog.impact === 'warning' ? 'bg-amber-100 text-amber-600' :
              'bg-blue-100 text-blue-600'
            )}>
              {dialog.impact === 'danger' ? <WarningCircle className="h-5 w-5" weight="fill" aria-hidden="true" /> :
               dialog.impact === 'warning' ? <Warning className="h-5 w-5" weight="fill" aria-hidden="true" /> :
               <Check className="h-5 w-5" weight="bold" aria-hidden="true" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">{dialog.title}</h3>
              <p id="confirm-dialog-message" className="text-xs text-[#667085] mt-1">{dialog.message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={dialog.onCancel}
              className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#667085] hover:bg-gray-50 focus-ring dark:border-gray-600 dark:hover:bg-gray-800"
              aria-label="Cancel action"
            >
              Cancel
            </button>
            <button
              onClick={dialog.onConfirm}
              className={cn(
                'rounded-lg px-4 py-2 text-xs font-medium text-white transition-all focus-ring-white',
                dialog.impact === 'danger' ? 'bg-[#EF4444] hover:bg-red-600' :
                dialog.impact === 'warning' ? 'bg-[#F59E0B] hover:bg-amber-600' :
                'bg-[#00796B] hover:bg-[#00695C]'
              )}
              aria-label={dialog.confirmLabel}
            >
              {dialog.confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}