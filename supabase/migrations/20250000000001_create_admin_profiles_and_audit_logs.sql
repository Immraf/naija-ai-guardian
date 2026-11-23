-- Drop existing policies on scam_reports to re-create
DROP POLICY IF EXISTS "Anyone can insert scam reports" ON public.scam_reports;
DROP POLICY IF EXISTS "Anyone can read scam reports" ON public.scam_reports;
DROP POLICY IF EXISTS "Authenticated admins can update scam reports" ON public.scam_reports;

-- Create admin_profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'SUB_ADMIN')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on admin_profiles and audit_logs
DROP POLICY IF EXISTS "Admin profiles are readable by authenticated admins" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin profiles can be updated by SUPER_ADMIN only" ON public.admin_profiles;
DROP POLICY IF EXISTS "Audit logs are readable by authenticated admins" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs can be inserted by authenticated admins" ON public.audit_logs;

-- RLS policies for admin_profiles
CREATE POLICY "Admin profiles are readable by authenticated admins"
  ON public.admin_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin profiles can be updated by SUPER_ADMIN only"
  ON public.admin_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN' AND status = 'ACTIVE'
    )
  );

-- RLS policies for audit_logs
CREATE POLICY "Audit logs are readable by authenticated admins"
  ON public.audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Audit logs can be inserted by authenticated admins"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS policies for scam_reports
CREATE POLICY "Anyone can insert scam reports"
  ON public.scam_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read scam reports"
  ON public.scam_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admins can update scam reports"
  ON public.scam_reports FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON public.scam_reports(status);
CREATE INDEX IF NOT EXISTS idx_scam_reports_created_at ON public.scam_reports(created_at DESC);