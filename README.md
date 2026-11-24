# ScamShield Nigeria

Public scam-checking platform for Nigeria: analyze suspicious messages, search
reported identifiers, and file a report that warns the next person. A hidden,
staff-only console lets moderators triage reports, manage scam intelligence and
provision accounts.

Built with Vite + React + TypeScript + Tailwind CSS, backed by Supabase
(Postgres + Row Level Security + Auth + Edge Functions).

---

## 1. Local setup

```bash
bun install
cp .env.example .env.local   # then fill in the two values below
bun run dev
```

| Variable | Where it is used | Exposure |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase client (browser) | public |
| `VITE_SUPABASE_ANON_KEY` | Supabase client (browser) | public (RLS enforced) |

Never put the service-role key in a `VITE_` variable — anything prefixed
`VITE_` is bundled into the browser build.

## 2. Database

Migrations live in `supabase/migrations/` and are applied in filename order.

1. `*_create_admin_profiles_and_audit_logs.sql` — staff profiles + audit trail.
2. `*_public_view_rls_lockdown.sql` — creates the `public_scam_reports`
   security-definer view, the `touch_last_login()` RPC, and removes every
   anonymous policy from the base tables.

Public visitors can only read the masked `public_scam_reports` view. Direct
table access is limited to ACTIVE staff, gated by `auth.uid()` and
`admin_profiles`. Apply with:

```bash
supabase db push          # or apply the SQL from the Supabase dashboard
```

## 3. Edge functions

```bash
supabase functions deploy submit-report
supabase functions deploy create-admin
```

- `submit-report` — public write path. Validates and normalizes the payload,
  rate-limits per IP, inserts with the service role and returns a
  `reference_id`. No client ever inserts into `scam_reports`.
- `create-admin` — verifies the caller's JWT belongs to an ACTIVE
  `SUPER_ADMIN`, then creates the auth user (`<username>@portal.scamshield.local`),
  writes the `admin_profiles` row and appends an `audit_logs` entry.

## 4. Seeding the first super admin

Staff accounts are never created from the client. Bootstrap one with:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
SEED_ADMIN_USERNAME=owner \
SEED_ADMIN_PASSWORD='a-long-unique-password' \
bun run scripts/seed-admins.ts
```

The script is idempotent: it re-uses an existing auth user and only repairs the
profile row. Rotate the password from the Supabase dashboard afterwards.

## 5. Staff portal

The console is not linked from the public site. Open `/#/staff-access`, sign in
with the username and password issued by a super admin, and you are dropped into
the moderation dashboard. Sessions sign out automatically after 30 minutes of
inactivity, and the portal route is marked `noindex, nofollow`.

## 6. Project layout

```
src/
  components/        marketing + dashboard sections, staff console
  auth/              session/profile provider (Supabase Auth + admin_profiles)
  lib/staffAuth.ts   staff login helpers (username -> synthetic mailbox)
  integrations/      Supabase client and generated types
supabase/
  migrations/        schema + RLS
  functions/         submit-report, create-admin
scripts/seed-admins.ts
```

## 7. Brand tokens

Colours and radii are CSS variables in `src/index.css` (`:root` and `.dark`);
components consume them through Tailwind utilities (`bg-background`,
`text-foreground`, `bg-primary`, `border-border`, …). Change the palette there,
not in individual components.