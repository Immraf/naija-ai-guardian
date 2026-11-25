-- Admin RLS helper functions + hardened policies (applied verbatim from the user's SQL).
-- SECURITY DEFINER helpers bypass RLS on admin_profiles to avoid recursive policy evaluation.

create or replace function public.is_active_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_profiles where id = auth.uid() and status = 'ACTIVE');
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_profiles
                 where id = auth.uid() and status = 'ACTIVE' and role = 'SUPER_ADMIN');
$$;

-- admin_profiles: SELECT own row or super admin; UPDATE super admin only.
drop policy if exists "own profile or super admin can read" on public.admin_profiles;
create policy "own profile or super admin can read" on public.admin_profiles
  for select to authenticated using (id = auth.uid() or public.is_super_admin());

drop policy if exists "super admin can update" on public.admin_profiles;
create policy "super admin can update" on public.admin_profiles
  for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

-- audit_logs: SELECT / INSERT active admins only.
drop policy if exists "active admins read audit logs" on public.audit_logs;
create policy "active admins read audit logs" on public.audit_logs
  for select to authenticated using (public.is_active_admin());

drop policy if exists "active admins insert audit logs" on public.audit_logs;
create policy "active admins insert audit logs" on public.audit_logs
  for insert to authenticated with check (public.is_active_admin());

-- scam_reports: SELECT / UPDATE active admins only.
drop policy if exists "admins read scam reports" on public.scam_reports;
create policy "admins read scam reports" on public.scam_reports
  for select to authenticated using (public.is_active_admin());

drop policy if exists "admins update scam reports" on public.scam_reports;
create policy "admins update scam reports" on public.scam_reports
  for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
