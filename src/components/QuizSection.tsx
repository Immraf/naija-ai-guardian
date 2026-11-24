import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, Trophy, ArrowRight, ArrowLeft, GraduationCap } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { QUIZ_QUESTIONS } from '@/constants'
import type { TabId } from '@/types'

export default function QuizSection(_props: { onTabChange: (t: TabId) => void }) {
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState<{ q: number; correct: boolean }[]>([])

  const questions = QUIZ_QUESTIONS as unknown as typeof QUIZ_QUESTIONS
  const total = questions.length

  const handleAnswer = useCallback((index: number) => {
    if (answered) return
    setSelectedIndex(index)
    setAnswered(true)
    const correct = index === questions[current].correctIndex
    if (correct) setScore((s) => s + 1)
    setResults((prev) => [...prev, { q: current, correct }])
  }, [answered, current, questions])

  const handleNext = useCallback(() => {
    if (current < total - 1) {
      setCurrent((c) => c + 1)
      setSelectedIndex(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }, [current, total])

  const handleRestart = useCallback(() => {
    setStarted(false)
    setCurrent(0)
    setSelectedIndex(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
    setResults([])
  }, [])

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Scam Awareness Quiz</h1>
          <p className="mb-6 text-sm text-muted-foreground">Test your knowledge of common scams in Nigeria. {total} questions to help you stay safe.</p>
          <button onClick={() => setStarted(true)} className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const percentage = Math.round((score / total) * 100)
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
            <Trophy className={cn('h-8 w-8', percentage >= 80 ? 'text-warning' : 'text-muted-foreground')} weight="fill" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Quiz Complete!</h2>
          <p className="text-3xl font-bold text-primary">{score}/{total}</p>
          <p className="mt-1 text-sm text-muted-foreground">{percentage}% correct</p>
          <div className="my-6 space-y-2 text-left">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                {r.correct ? <CheckCircle className="h-4 w-4 text-success" weight="fill" /> : <X className="h-4 w-4 text-destructive" weight="bold" />}
                <span className="text-foreground">Question {i + 1}</span>
                <span className="ml-auto text-[13px] text-muted-foreground">{r.correct ? 'Correct' : 'Incorrect'}</span>
              </div>
            ))}
          </div>
          <button onClick={handleRestart} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Try Again</button>
        </motion.div>
      </div>
    )
  }

  const q = questions[current]
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">Question {current + 1} of {total}</span>
        <span className="text-[13px] font-medium text-primary">Score: {score}</span>
      </div>
      <div className="mb-4 h-1.5 rounded-full bg-border">
        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold leading-relaxed text-foreground">{q.question}</h2>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={cn(
                  'w-full rounded-lg border px-4 py-3 text-left text-sm transition-all',
                  answered && i === q.correctIndex && 'border-success bg-success/10 text-success',
                  answered && i === selectedIndex && i !== q.correctIndex && 'border-destructive bg-destructive/10 text-destructive',
                  !answered && 'border-border text-foreground hover:border-primary/30',
                  answered && i !== selectedIndex && i !== q.correctIndex && 'border-border text-muted-foreground'
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    answered && i === q.correctIndex ? 'bg-success text-white' :
                    answered && i === selectedIndex && i !== q.correctIndex ? 'bg-destructive text-white' :
                    'bg-border text-muted-foreground'
                  )}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </span>
              </button>
            ))}
          </div>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className={cn('rounded-lg p-3 text-sm', selectedIndex === q.correctIndex ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                {selectedIndex === q.correctIndex ? 'Correct!' : 'Incorrect.'} {q.explanation}
              </div>
              <button onClick={handleNext} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#00796B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00695C]">
                {current < total - 1 ? <><ArrowRight className="h-4 w-4" /> Next Question</> : <><Trophy className="h-4 w-4" /> See Results</>}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}