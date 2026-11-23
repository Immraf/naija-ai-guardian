import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Warning, MagnifyingGlass, CheckCircle, Sparkle, Spinner,
  Trash, Copy, Hourglass, Info, Flag, ArrowRight, ArrowClockwise
} from '@phosphor-icons/react'
import { analyzeMessage } from '@/utils/scamUtils'
import type { AnalyzerResult, TabId } from '@/types'

export default function AnalyzerSection({ onTabChange }: { onTabChange: (t: TabId) => void }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<AnalyzerResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch {
      toast.error('Unable to paste. Please use Ctrl+V.')
    }
  }

  const handleAnalyze = () => {
    if (!input.trim() || input.trim().length < 5) {
      toast.error('Please enter a message at least 5 characters long.')
      return
    }
    setAnalyzing(true)
    setResult(null)
    setTimeout(() => {
      const res = analyzeMessage(input)
      setResult(res)
      setAnalyzing(false)
    }, 1200)
  }

  const riskColor = { 'Low Risk': '#10B981', 'Suspicious': '#F59E0B', 'High Risk': '#EF4444' }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white sm:text-3xl">AI Scam Analyzer</h1>
        <p className="mt-2 text-sm text-[#667085] dark:text-gray-400">Paste a suspicious message, SMS, or email below to analyze it for scam indicators.</p>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-gray-700 dark:bg-[#111827]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            placeholder="Paste the suspicious message here..."
            rows={5}
            className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-[#F7F8F6] p-3 text-sm text-[#111827] outline-none placeholder:text-[#667085] focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[#667085] dark:text-gray-500">
            <span>{input.length}/2000 characters</span>
            <div className="flex gap-2">
              <button onClick={() => { setInput(''); setResult(null) }} className="flex items-center gap-1 rounded-md px-2 py-1 text-[#667085] hover:bg-gray-100 dark:hover:bg-gray-700">
                <Trash className="h-3.5 w-3.5" /> Clear
              </button>
              <button onClick={handlePaste} className="flex items-center gap-1 rounded-md px-2 py-1 text-[#667085] hover:bg-gray-100 dark:hover:bg-gray-700">
                <Copy className="h-3.5 w-3.5" /> Paste
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !input.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#00796B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00695C] disabled:opacity-50"
        >
          {analyzing ? (
            <><ArrowClockwise className="h-4 w-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkle className="h-4 w-4" /> Analyze Message</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-gray-700 dark:bg-[#111827]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00796B]/10">
                <Hourglass className="h-5 w-5 animate-pulse text-[#00796B]" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-2 w-48 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-gray-700 dark:bg-[#111827]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: riskColor[result.riskLevel] }}>
                  {result.riskLevel === 'High Risk' ? <Warning className="h-5 w-5 text-white" weight="fill" /> :
                   result.riskLevel === 'Suspicious' ? <MagnifyingGlass className="h-5 w-5 text-white" /> :
                   <CheckCircle className="h-5 w-5 text-white" weight="fill" />}
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: riskColor[result.riskLevel] }}>{result.riskLevel}</p>
                  <p className="text-xs text-[#667085] dark:text-gray-400">Risk Score: {result.score}/100</p>
                </div>
              </div>

              <p className="mb-4 text-sm text-[#111827] dark:text-gray-300">{result.explanation}</p>

              {result.indicators.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#667085] dark:text-gray-400">Indicators Detected</p>
                  <ul className="space-y-1.5">
                    {result.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#667085] dark:text-gray-400">
                        <Warning className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F59E0B]" weight="fill" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#667085] dark:text-gray-400">Recommendations</p>
                <ul className="space-y-1.5">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#667085] dark:text-gray-400">
                      <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00796B]" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  This analysis is based on pattern recognition and is not 100% accurate. A &quot;Low Risk&quot; result does not guarantee a message is safe. Always use your best judgment and verify through official channels.
                </p>
              </div>

              <button
                onClick={() => onTabChange('report')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#EF4444] px-4 py-2.5 text-sm font-medium text-[#EF4444] transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Flag className="h-4 w-4" /> Report This Scam
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}