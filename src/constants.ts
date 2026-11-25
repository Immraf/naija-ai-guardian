import type { SafetyTip } from './types'

export const BRAND = {
  name: 'ScamShield Nigeria',
  tagline: 'Stay One Step Ahead of Scammers.',
  description: "Nigeria's trusted community-powered platform to report, verify, and stay informed about scams.",
  email: 'hello@scamshield.ng',
  website: 'scamshield.ng',
} as const

export const STAFF_ROUTE = '#/staff-access'

export const MEDIA = {
  hero: '/scamshield-hero.webp',
  community: '/awareness-community.webp',
} as const

export const COLORS = {
  bg: '#F7F8F6',
  card: '#FFFFFF',
  brand: '#00796B',
  brandDark: '#00695C',
  textPrimary: '#111827',
  textSecondary: '#667085',
  border: '#E5E7EB',
  confirmed: '#EF4444',
  suspicious: '#F59E0B',
  lowRisk: '#10B981',
  darkBg: '#0F172A',
  darkCard: '#111827',
} as const

export const SCAM_CATEGORIES = [
  { id: 'phishing', label: 'Phishing & Smishing', description: 'Fake messages pretending to be banks or official agencies' },
  { id: 'bank', label: 'Bank Impersonation', description: 'Calls or texts claiming to be from your bank' },
  { id: 'whatsapp', label: 'WhatsApp Takeover', description: 'Account hijacking and impersonation on WhatsApp' },
  { id: 'pos', label: 'POS Fraud', description: 'Card skimming, swapping, and POS terminal fraud' },
  { id: 'bvn', label: 'BVN/NIN Update Scam', description: 'Fake requests to update biometric data' },
  { id: 'lottery', label: 'Fake Lottery & Grant', description: 'False promises of prizes, grants, or inheritance' },
  { id: 'romance', label: 'Romance Scam', description: 'Dating and relationship-based financial fraud' },
  { id: 'investment', label: 'Ponzi & Investment', description: 'Fake investment schemes promising high returns' },
] as const

export const PLATFORMS = [
  'Phone Call', 'SMS', 'WhatsApp', 'Email', 'Facebook', 'Instagram',
  'Telegram', 'In-person', 'Website', 'Other',
] as const

export const SCAM_TYPES = [
  'Phishing', 'Bank Impersonation', 'WhatsApp Takeover', 'POS Fraud',
  'BVN/NIN Update', 'Fake Lottery/Grant', 'Romance Scam', 'Investment Scam',
  'Employment Scam', 'Delivery Scam', 'Other',
] as const

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'A caller claiming to be from your bank asks for your PIN and OTP to "secure your account." What should you do?',
    options: [
      'Provide the information immediately',
      "Hang up and call your bank's official number",
      'Ask them to call back later',
      'Send a text with the details',
    ],
    correctIndex: 1,
    explanation: 'Banks will NEVER ask for your PIN, OTP, or password over the phone. Hang up and contact your bank using the official number on your bank card or their website.',
  },
  {
    id: 2,
    question: 'You receive an SMS saying you won 5 million Naira in a lottery you never entered. What is this?',
    options: [
      'Your lucky day — claim it quickly',
      'A common advance-fee scam',
      'A government grant program',
      'A promotion from your bank',
    ],
    correctIndex: 1,
    explanation: 'If you did not enter a lottery, you cannot win it. Scammers ask you to pay a "processing fee" upfront and then disappear with your money.',
  },
  {
    id: 3,
    question: 'What is the safest way to verify a call from someone claiming to be a bank representative?',
    options: [
      'Call back the number they called from',
      "Use the official customer care number on your bank's website",
      'Trust the caller ID display',
      'Ask for their name and employee ID',
    ],
    correctIndex: 1,
    explanation: 'Scammers spoof phone numbers. Always use the number on your bank card, statement, or official website — never the number that called you.',
  },
  {
    id: 4,
    question: 'A "friend" on WhatsApp messages you asking for money urgently, but their account seems odd. What should you do?',
    options: [
      'Send the money to help a friend',
      'Call them on their known phone number to verify',
      'Reply asking for more proof',
      'Send a small amount to test',
    ],
    correctIndex: 1,
    explanation: 'WhatsApp takeover scams are common. If a friend asks for money, call them directly on their usual number to confirm before sending anything.',
  },
  {
    id: 5,
    question: 'Which of these is a red flag for a job offer?',
    options: [
      'A formal interview process',
      'Requesting payment for "training" or "processing" before you start',
      'A detailed job description',
      'A company email address',
    ],
    correctIndex: 1,
    explanation: 'Legitimate employers never ask you to pay for training, processing, or work permits. If they ask for money upfront, it is a scam.',
  },
  {
    id: 6,
    question: 'What should you do if you suspect you have fallen victim to a scam?',
    options: [
      'Keep quiet out of shame',
      'Report to your bank immediately and file a police report',
      'Try to recover money by contacting the scammer',
      'Wait to see if it happens again',
    ],
    correctIndex: 1,
    explanation: 'Act fast. Contact your bank to block transactions, change your PINs and passwords, and file a report with the police and the EFCC.',
  },
  {
    id: 7,
    question: 'What does "419" refer to in Nigeria?',
    options: [
      'A section of the criminal code about advance-fee fraud',
      'A bank account type',
      'A type of insurance policy',
      'A government tax form',
    ],
    correctIndex: 0,
    explanation: 'Section 419 of the Nigerian Criminal Code deals with advance-fee fraud. It covers scams where victims pay upfront fees for promised larger benefits.',
  },
  {
    id: 8,
    question: 'Someone offers to double your money in 24 hours through a "special investment." What is this?',
    options: [
      'A legitimate high-yield investment',
      'A Ponzi or pyramid scheme',
      'A government-approved opportunity',
      'A bank promotion',
    ],
    correctIndex: 1,
    explanation: 'No legitimate investment guarantees massive returns in 24 hours. These are Ponzi schemes that pay early investors with money from new victims.',
  },
] as const

export const AWARENESS_GUIDES = [
  {
    id: 'whatsapp-takeover',
    title: 'WhatsApp Takeover Scams',
    summary: 'How scammers hijack your WhatsApp account and what to do about it.',
    icon: 'ChatCircleDots',
    tips: [
      'Enable two-step verification in WhatsApp settings',
      'Never share your 6-digit verification code with anyone',
      'Be suspicious of messages from friends asking for money',
      'Log out of WhatsApp Web sessions you do not recognize',
    ],
    content: 'WhatsApp takeover is one of the fastest-growing scams in Nigeria. Scammers gain access to your account by tricking you into sharing your 6-digit verification code. Once in, they message your contacts asking for money while pretending to be you. They often claim they are in an emergency and need funds urgently. Protect yourself by enabling two-step verification under Settings > Account > Two-step verification. Never share your verification code, even if someone claims they need it to "help you" or "verify your account."',
  },
  {
    id: 'pos-fraud',
    title: 'POS Terminal Fraud',
    summary: 'Stay safe when using POS terminals at shops and agents.',
    icon: 'CreditCard',
    tips: [
      'Always check the POS terminal before swiping',
      'Do not let the terminal out of your sight',
      'Cover the keypad when entering your PIN',
      'Request a receipt for every transaction',
    ],
    content: 'POS fraud in Nigeria includes card skimming, where scammers attach hidden devices to capture card details, and card swapping, where your card is switched with a fake one. Always inspect the POS terminal for loose parts or unusual attachments. Never let the terminal leave your sight. When entering your PIN, cover the keypad with your other hand. Always take a receipt and verify the amount before leaving the counter.',
  },
  {
    id: 'bvn-scam',
    title: 'BVN/NIN Update Scams',
    summary: 'Fake requests to update your biometric data are a common trap.',
    icon: 'IdentificationBadge',
    tips: [
      'BVN/NIN updates are free and done only at bank branches',
      'No bank or agency will call asking for your BVN or NIN',
      'Do not click links in SMS claiming your BVN is blocked',
      'Verify by visiting your bank branch in person',
    ],
    content: 'Scammers send fake SMS messages claiming your BVN (Bank Verification Number) or NIN (National Identification Number) is blocked or expired. They provide a link to "update now" that steals your personal information. The truth is: BVN and NIN do not expire, and updates are only done at your bank branch in person. Banks never send links to update your biometric data. If you receive such a message, ignore it and report it to your bank.',
  },
  {
    id: 'bank-impersonation',
    title: 'Bank Impersonation Calls',
    summary: 'Fake bank representatives calling to steal your account details.',
    icon: 'Phone',
    tips: [
      'Your bank will never ask for your PIN, password, or OTP',
      'Hang up and call the official bank number',
      'Do not trust caller ID — scammers spoof numbers',
      "Register for your bank's official fraud alert service",
    ],
    content: `Scammers call pretending to be from your bank, claiming there is suspicious activity on your account. They ask for your PIN, password, or OTP to "verify your identity" or "reverse a transaction." This is always a scam. Banks never call to ask for sensitive information. If you receive such a call, hang up immediately and call your bank's official customer care number. Report the number to your bank and the EFCC.`,
  },
  {
    id: 'fake-grants',
    title: 'Fake Grants & Government Payments',
    summary: 'Scammers promising free money from the government.',
    icon: 'Coin',
    tips: [
      'Government grants are announced through official channels',
      'You never pay to receive a grant or prize',
      'Verify any grant offer on the official NITDA or government website',
      'Be suspicious of "processing fees" for free money',
    ],
    content: 'Scammers contact victims claiming they have been selected for a government grant, COVID-19 relief fund, or Trader Moni payment. They ask for a "processing fee" or "registration fee" to release the money. Once you pay, they disappear. Legitimate government grants are announced through official channels and do not require upfront fees. Check the official NITDA, FG, or CBN websites for authentic programs.',
  },
] as const

export const SAFETY_TIPS: SafetyTip[] = [
  {
    id: 'tip-1', title: 'Never Share Your PIN or OTP',
    description: 'Your bank will never ask for your PIN, password, or One-Time Password (OTP) over the phone, SMS, or email.',
    category: 'Banking', priority: 'high',
  },
  {
    id: 'tip-2', title: 'Enable Two-Factor Authentication',
    description: 'Turn on 2FA on all your accounts — WhatsApp, email, social media, and banking apps.',
    category: 'Digital Security', priority: 'high',
  },
  {
    id: 'tip-3', title: 'Verify Before You Trust',
    description: 'If someone calls claiming to be a relative or friend in trouble, hang up and call them directly on their known number.',
    category: 'Personal Safety', priority: 'high',
  },
  {
    id: 'tip-4', title: 'Do Not Click Suspicious Links',
    description: 'Avoid clicking links in unsolicited SMS or emails. Check the URL carefully before entering any personal information.',
    category: 'Digital Security', priority: 'high',
  },
  {
    id: 'tip-5', title: 'Use Official Bank Apps',
    description: "Only download your bank's official app from Google Play Store or Apple App Store. Avoid APK files sent via WhatsApp.",
    category: 'Banking', priority: 'medium',
  },
  {
    id: 'tip-6', title: 'Check POS Terminals',
    description: 'Before using a POS terminal, check for loose parts or card skimmers. Never let the terminal leave your sight.',
    category: 'Shopping', priority: 'medium',
  },
  {
    id: 'tip-7', title: 'Beware of "Too Good to Be True" Offers',
    description: 'If an investment promises guaranteed returns of 20% or more monthly, it is almost certainly a Ponzi scheme.',
    category: 'Investments', priority: 'high',
  },
  {
    id: 'tip-8', title: 'Report Suspicious Numbers',
    description: 'Forward suspicious SMS to 7726 (free from all networks) or report scam numbers to the EFCC.',
    category: 'Reporting', priority: 'medium',
  },
  {
    id: 'tip-9', title: 'Monitor Your Bank Statements',
    description: 'Check your bank statements regularly for unauthorized transactions. Report any suspicious activity immediately.',
    category: 'Banking', priority: 'medium',
  },
  {
    id: 'tip-10', title: 'Secure Your SIM Card',
    description: 'Set a PIN on your SIM card to prevent SIM swap fraud. Contact your mobile network provider to enable this.',
    category: 'Digital Security', priority: 'medium',
  },
  {
    id: 'tip-11', title: 'Avoid Public Wi-Fi for Banking',
    description: 'Do not access banking apps or make transactions on public Wi-Fi networks. Use your mobile data instead.',
    category: 'Digital Security', priority: 'medium',
  },
  {
    id: 'tip-12', title: 'Be Wary of Job Scams',
    description: 'Legitimate employers never ask for payment for training, processing, or work permits. Report suspicious job offers.',
    category: 'Employment', priority: 'medium',
  },
]

export const RISK_COLORS: Record<string, string> = {
  'Low Risk': '#10B981',
  'Suspicious': '#F59E0B',
  'High Risk': '#EF4444',
  'Confirmed Scam': '#EF4444',
  'Reported': '#F59E0B',
  'Under Review': '#3B82F6',
  'Confirmed': '#EF4444',
  'Rejected': '#6B7280',
  'Resolved': '#10B981',
}

export const STATUS_OPTIONS = ['Reported', 'Under Review', 'Confirmed', 'Rejected', 'Resolved'] as const