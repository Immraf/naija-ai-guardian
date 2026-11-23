import type { AnalyzerResult } from '@/types'

export function normalizePhoneNumber(input: string): string {
  if (!input) return ''
  const cleaned = input.replace(/[\s\-\(\)]/g, '')
  if (cleaned.startsWith('+234')) return cleaned
  if (cleaned.startsWith('234')) return `+${cleaned}`
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`
  return cleaned
}

export function formatPhoneDisplay(input: string): string {
  const n = normalizePhoneNumber(input)
  if (n.length === 14 && n.startsWith('+234')) {
    return `+234 ${n.slice(4, 7)} ${n.slice(7, 11)} ${n.slice(11)}`
  }
  return input
}

export function generateReferenceId(): string {
  const prefix = 'NG-SCAM'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${result}`
}

const SCAM_INDICATORS = [
  {
    pattern: /\b(bank|account|card|ATM|PIN|OTP|password|BVN|NIN)\b/i,
    label: 'Requests sensitive banking information (PIN, OTP, BVN, NIN)',
    weight: 25,
  },
  {
    pattern: /\b(urgent|immediately|now|before it.*(too late|expire)|limited time|act fast)\b/i,
    label: 'Uses urgency and pressure tactics to rush you',
    weight: 20,
  },
  {
    pattern: /\b(transfer|send|pay|deposit|wire|credit)\b.*\b(money|fund|cash|naira|amount)\b/i,
    label: 'Requests money transfer or payment',
    weight: 20,
  },
  {
    pattern: /\b(win|won|lottery|prize|jackpot|selected|promotion|free.*(money|gift|reward))\b/i,
    label: 'Unsolicited lottery, prize, or free money offer',
    weight: 20,
  },
  {
    pattern: /\b(link|click|www\.|https?:\/\/|\.com|\.ng|bit\.ly|tinyurl)\b/i,
    label: 'Contains suspicious link or URL',
    weight: 15,
  },
  {
    pattern: /\b(investment|profit|return|dividend|guaranteed.*(return|profit))\b/i,
    label: 'Promises guaranteed high returns on investment',
    weight: 20,
  },
  {
    pattern: /\b(romance|dating|love|partner|girlfriend|boyfriend|sugar)\b.*\b(money|help|send|support)\b/i,
    label: 'Romance-based financial request',
    weight: 25,
  },
  {
    pattern: /\b(grant|relief|palliative|FG|government|president|minister)\b.*\b(payment|fund|aid|support)\b/i,
    label: 'Fake government grant or relief fund offer',
    weight: 20,
  },
  {
    pattern: /\b(upgrade|update|verify|confirm|validate)\b.*\b(account|bank|BVN|NIN|card|wallet)\b/i,
    label: 'Fake account update or verification request',
    weight: 25,
  },
  {
    pattern: /\b(processing fee|registration fee|admin fee|activation fee|delivery fee)\b/i,
    label: 'Asks for upfront fee to receive a prize or service',
    weight: 20,
  },
  {
    pattern: /\b(WhatsApp|telegram|signal)\b.*\b(group|link|join|invite)\b/i,
    label: 'Invites you to a shady messaging group',
    weight: 10,
  },
  {
    pattern: /\b(don't tell|secret|confidential|private|between us)\b/i,
    label: 'Asks you to keep it secret from family or bank',
    weight: 25,
  },
]

export function analyzeMessage(text: string): AnalyzerResult {
  if (!text || text.trim().length < 10) {
    return {
      riskLevel: 'Low Risk',
      score: 0,
      indicators: [],
      explanation: 'The message is too short for a thorough analysis. Scam messages typically contain specific patterns.',
      recommendations: ['If you are unsure about this message, report it using the Report Scam feature.'],
    }
  }

  const matchedIndicators: { label: string; weight: number }[] = []

  for (const indicator of SCAM_INDICATORS) {
    if (indicator.pattern.test(text)) {
      matchedIndicators.push({ label: indicator.label, weight: indicator.weight })
    }
  }

  const totalScore = Math.min(100, matchedIndicators.reduce((sum, i) => sum + i.weight, 0))

  let riskLevel: 'Low Risk' | 'Suspicious' | 'High Risk'
  let explanation: string
  let recommendations: string[]

  if (totalScore >= 60) {
    riskLevel = 'High Risk'
    explanation = 'This message shows multiple strong indicators of a scam. It contains several patterns commonly used by fraudsters in Nigeria.'
    recommendations = [
      'Do not respond to this message or click any links',
      'Do not share any personal or banking information',
      'Report this message to your bank immediately if financial details are involved',
      'Forward any scam SMS to 7726 (free from all networks)',
      'Report this scam using the ScamShield Nigeria Report feature below',
    ]
  } else if (totalScore >= 25) {
    riskLevel = 'Suspicious'
    explanation = 'This message contains some patterns that scammers commonly use. While it may not be definitively a scam, caution is advised.'
    recommendations = [
      'Do not respond with any personal information until you verify the source',
      'Contact the organization directly using official contact details (not the number in the message)',
      'If it claims to be from your bank, call the official customer care number on your bank card',
      'Report this message using the ScamShield Nigeria Report feature if it seems suspicious',
    ]
  } else {
    riskLevel = 'Low Risk'
    explanation = 'This message does not contain the most common scam patterns. However, scammers constantly evolve their tactics, so always stay vigilant.'
    recommendations = [
      'If this message is from someone you know, verify by contacting them through another channel',
      'Never share your PIN, OTP, or password with anyone',
      'If something feels off, trust your instincts and report it',
    ]
  }

  return {
    riskLevel,
    score: totalScore,
    indicators: matchedIndicators.map(i => i.label),
    explanation,
    recommendations,
  }
}

export function checkForDuplicate(existing: { identifier: string }[], newIdentifier: string): boolean {
  const normalized = normalizePhoneNumber(newIdentifier).toLowerCase()
  return existing.some(
    (item) => normalizePhoneNumber(item.identifier).toLowerCase() === normalized
  )
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    'Reported': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Confirmed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  }
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

export function getRiskBadgeClass(risk: string): string {
  const map: Record<string, string> = {
    'Low Risk': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Suspicious': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'High Risk': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'Confirmed Scam': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[risk] || 'bg-gray-100 text-gray-800'
}

export function maskSensitiveData(value: string, showFull?: boolean): string {
  if (showFull) return value
  if (!value) return value
  const phoneMatch = value.match(/^(\+?\d{1,4})?(\d{7,14})$/)
  if (phoneMatch) {
    const prefix = phoneMatch[1] || ''
    const main = phoneMatch[2]
    return `${prefix} ${main.slice(0, 3)} XXX XXX${main.slice(-2)}`
  }
  if (value.includes('@')) {
    const [name, domain] = value.split('@')
    return `${name.slice(0, 2)}***@${domain}`
  }
  if (value.length > 6) return `${value.slice(0, 3)}...${value.slice(-3)}`
  return value
}

export function getRiskIcon(risk: string): { icon: string; label: string } {
  const map: Record<string, { icon: string; label: string }> = {
    'Low Risk': { icon: '●', label: 'Low Risk' },
    'Suspicious': { icon: '⚠', label: 'Suspicious' },
    'High Risk': { icon: '⚠', label: 'High Risk' },
    'Confirmed Scam': { icon: '✖', label: 'Confirmed Scam' },
  }
  return map[risk] || { icon: '○', label: risk }
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}