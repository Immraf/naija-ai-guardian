export interface ScamReport {
  id: string
  reference_id: string | null
  category: string
  identifier: string
  platform: string
  description: string
  evidence: string | null
  status: 'Reported' | 'Under Review' | 'Confirmed' | 'Rejected' | 'Resolved'
  risk_level: 'Low Risk' | 'Suspicious' | 'High Risk' | 'Confirmed Scam'
  reporter_name: string | null
  reporter_email: string | null
  view_count: number | null
  duplicate_of: string | null
  created_at: string
  updated_at: string
}

export interface AnalyzerResult {
  riskLevel: 'Low Risk' | 'Suspicious' | 'High Risk'
  score: number
  indicators: string[]
  explanation: string
  recommendations: string[]
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface AwarenessGuide {
  id: string
  title: string
  summary: string
  content: string
  icon: string
  tips: readonly string[]
}

export interface SafetyTip {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

export type TabId =
  | 'home'
  | 'analyzer'
  | 'database'
  | 'report'
  | 'awareness'
  | 'quiz'
  | 'safety'
  | 'admin'

export interface ReportFormData {
  scamType: string
  phoneNumber: string
  bankName: string
  accountNumber: string
  platform: string
  amount: string
  description: string
  evidence: string
  reporterName: string
  reporterEmail: string
}

export type AdminRole = 'SUPER_ADMIN' | 'SUB_ADMIN'

export type AdminStatus = 'ACTIVE' | 'DISABLED'

export interface AdminProfile {
  id: string
  full_name: string
  email: string
  role: AdminRole
  status: AdminStatus
  permissions: string[]
  created_at: string
  last_login: string | null
}

export interface AuditLog {
  id: string
  admin_id: string | null
  admin_email: string
  action: string
  details: Record<string, unknown>
  created_at: string
}

export type AdminSubTab = 'dashboard' | 'moderation' | 'administrators' | 'intelligence' | 'audit' | 'analytics' | 'duplicates' | 'notifications' | 'systemhealth'

export interface AdminNotification {
  id: string
  admin_id: string | null
  title: string
  message: string
  type: 'info' | 'warning' | 'alert' | 'success'
  read: boolean
  link: string | null
  created_at: string
}

export const ADMIN_PERMISSIONS = [
  { key: 'view_reports', label: 'View Reports' },
  { key: 'confirm_scam', label: 'Confirm Scam' },
  { key: 'reject_report', label: 'Reject Report' },
  { key: 'mark_duplicate', label: 'Mark Duplicate' },
  { key: 'resolve_report', label: 'Resolve Report' },
  { key: 'view_intelligence', label: 'Scam Intelligence' },
  { key: 'manage_admins', label: 'Manage Administrators' },
  { key: 'view_audit_logs', label: 'View Audit Logs' },
] as const

export interface ConfirmationDialog {
  open: boolean
  title: string
  message: string
  impact: 'danger' | 'warning' | 'info'
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export type PrivacyMode = 'masked' | 'unmasked'