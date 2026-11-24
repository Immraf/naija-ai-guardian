import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'

interface NotFoundProps {
  path: string
  onHome: () => void
}

export default function NotFound({ path, onHome }: NotFoundProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00796B]/10 text-[#00796B] dark:bg-[#5EEAD4]/10 dark:text-[#5EEAD4]">
        <MagnifyingGlass weight="bold" className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#667085] dark:text-gray-400">
        404 · unknown route
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance text-[#111827] sm:text-3xl dark:text-white">
        That page does not exist
      </h1>
      <p className="mt-3 text-base leading-relaxed text-pretty text-[#667085] dark:text-gray-400">
        We could not find anything at <span className="font-mono text-[#111827] dark:text-white">{path}</span>.
        ScamShield has no secret pages — everything lives on the home screen.
      </p>
      <button
        type="button"
        onClick={onHome}
        className="focus-ring mt-7 inline-flex items-center gap-2 rounded-xl bg-[#00796B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00695C]"
      >
        <ArrowLeft weight="bold" className="h-4 w-4" aria-hidden="true" />
        Back to ScamShield
      </button>
    </div>
  )
}