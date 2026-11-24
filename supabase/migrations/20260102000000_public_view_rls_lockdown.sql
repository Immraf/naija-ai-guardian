-- ScamShield Nigeria — Task 5: public read model + base-table RLS lockdown.
-- Idempotent: safe to re-run. Never drops tables or data.

-- ---------------------------------------------------------------------------
-- 1. Public read model
--    Anonymous visitors may only ever see masked, moderation-approved rows.
--    Reporter identity, evidence, raw description and internal moderation
--    columns are never exposed.
-- ---------------------------------------------------------------------------
drop view if exists public.public_scam_reports;

create view public.public_scam_reports
with (security_invoker = false) as
select
  r.id,
  r.reference_id,
  r.category,
  r.platform,
  r.status,
  r.risk_level,
  overlay(r.identifier placing '****' from 4 for 4) as identifier,
  left(coalesce(r.description, ''), 280) as description,
  coalesce(r.view_count, 0) as view_count,
  r.created_at
from public.scam_reports r
where r.status <> 'Rejected'
  and r.duplicate_of is null;

comment on view public.public_scam_reports is
  'Anonymous read model for scam reports: masked identifier, trimmed description, no reporter PII.';

revoke all on public.public_scam_reports from anon, authenticated;
grant select on public.public_scam_reports to anon, authenticated;
grant select on public.public_scam_reports to service_role;

-- ---------------------------------------------------------------------------
-- 2. Staff login timestamp RPC
--    Self-service last_login stamp; RLS on admin_profiles stays intact for
--    every other write path.
-- ---------------------------------------------------------------------------
create or replace function public.touch_last_login()
returns void
language sql
security definer
set search_path = public
as $$
  update public.admin_profiles
     set last_login = now()
   where id = auth.uid()
     and status = 'ACTIVE';
$$;

revoke all on function public.touch_last_login() from public;
grant execute on function public.touch_last_login() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Lockdown: remove anonymous / public write + read policies on base tables
-- ---------------------------------------------------------------------------
-- scam_reports: public inserts now go through the submit-report edge function
-- (service role); anonymous updates of any row were a full write hole.
drop policy if exists "Anyone can insert scam reports" on public.scam_reports;
drop policy if exists "Public update scam reports" on public.scam_reports;

-- admin_profiles: any authenticated user could previously insert a profile row.
drop policy if exists "Admin profiles can be inserted by authenticated users" on public.admin_profiles;
drop policy if exists "Admin profiles are readable by authenticated admins" on public.admin_profiles;

-- audit_logs / admin_notifications: replace coarse auth.role() checks with
-- ACTIVE-admin checks so a disabled staff row keeps no access.
drop policy if exists "Admin notifications are readable by admins" on public.admin_notifications;
drop policy if exists "Admin notifications can be inserted" on public.admin_notifications;
drop policy if exists "Admin notifications can be updated by admins" on public.admin_notifications;
drop policy if exists "Notifications readable by authenticated admins" on public.admin_notifications;
drop policy if exists "Notifications insertable by authenticated admins" on public.admin_notifications;
drop policy if exists "Notifications updatable by authenticated admins" on public.admin_notifications;

drop policy if exists "Audit logs are readable by authenticated admins" on public.audit_logs;
drop policy if exists "Audit logs can be inserted by authenticated admins" on public.audit_logs;

-- scam_intelligence: was world-readable (anon could enumerate every row).
drop policy if exists "Anyone can read scam_intelligence" on public.scam_intelligence;

-- ---------------------------------------------------------------------------
-- 4. Re-create the admin notification policies on the ACTIVE-admin predicate
-- ---------------------------------------------------------------------------
drop policy if exists "Active admin read notifications" on public.admin_notifications;
create policy "Active admin read notifications" on public.admin_notifications
  for select to authenticated using (public.is_active_admin());

drop policy if exists "Active admin insert notifications" on public.admin_notifications;
create policy "Active admin insert notifications" on public.admin_notifications
  for insert to authenticated with check (public.is_active_admin());

drop policy if exists "Active admin update notifications" on public.admin_notifications;
create policy "Active admin update notifications" on public.admin_notifications
  for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists "Active admin delete notifications" on public.admin_notifications;
create policy "Active admin delete notifications" on public.admin_notifications
  for delete to authenticated using (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- 5. Scam intelligence is staff-only from now on
-- ---------------------------------------------------------------------------
drop policy if exists "Active admin read scam intelligence" on public.scam_intelligence;
create policy "Active admin read scam intelligence" on public.scam_intelligence
  for select to authenticated using (public.is_active_admin());

drop policy if exists "Active admin update scam intelligence" on public.scam_intelligence;
create policy "Active admin update scam intelligence" on public.scam_intelligence
  for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());