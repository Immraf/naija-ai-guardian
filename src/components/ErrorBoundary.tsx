import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ArrowRight, Warning } from '@phosphor-icons/react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ScamShield crashed while rendering:', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.assign(window.location.pathname)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EF4444]/10 text-[#EF4444]">
          <Warning weight="fill" className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl dark:text-white">
          Something broke on this screen
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#667085] dark:text-gray-400">
          Your reports are safe. Reload the page to pick up where you left off — if it keeps
          happening, reach us at hello@scamshield.ng.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="focus-ring mt-7 inline-flex items-center gap-2 rounded-xl bg-[#00796B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00695C]"
        >
          Reload ScamShield
          <ArrowRight weight="bold" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }
}