/**
 * ScamShield Nigeria — first SUPER_ADMIN bootstrap.
 *
 * Usage (never commit credentials):
 *   SUPABASE_URL="https://<project>.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="<service role key>" \
 *   SEED_ADMIN_USERNAME="owner" \
 *   SEED_ADMIN_PASSWORD="a-long-temporary-password" \
 *   SEED_ADMIN_NAME="Funmi Adebayo" \
 *   deno run -A scripts/seed-admins.ts
 *
 * Idempotent: re-running with the same username only refreshes the profile
 * row, it never creates a second auth user.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STAFF_EMAIL_DOMAIN = "portal.scamshield.local";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const USERNAME = (Deno.env.get("SEED_ADMIN_USERNAME") ?? "").toLowerCase();
const PASSWORD = Deno.env.get("SEED_ADMIN_PASSWORD") ?? "";
const FULL_NAME = Deno.env.get("SEED_ADMIN_NAME") ?? "ScamShield Owner";

async function main(): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
  }
  if (!/^[a-z0-9._-]{3,40}$/.test(USERNAME)) {
    throw new Error("Set SEED_ADMIN_USERNAME to 3-40 lowercase letters, numbers, dot, dash or underscore.");
  }
  if (PASSWORD.length < 10) {
    throw new Error("Set SEED_ADMIN_PASSWORD to at least 10 characters.");
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = `${USERNAME}@${STAFF_EMAIL_DOMAIN}`;

  const { data: existingProfile } = await admin
    .from("admin_profiles")
    .select("id, role, status")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    const { error } = await admin
      .from("admin_profiles")
      .update({ full_name: FULL_NAME, role: "SUPER_ADMIN", status: "ACTIVE" })
      .eq("id", existingProfile.id);
    if (error) throw new Error(error.message);
    console.log(`Updated existing super admin: ${username()}`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: FULL_NAME, portal: "staff" },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "Could not create the auth user.");
  }

  const { error: profileError } = await admin.from("admin_profiles").insert({
    id: data.user.id,
    full_name: FULL_NAME,
    email,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    permissions: [
      "view_reports",
      "confirm_scam",
      "reject_report",
      "mark_duplicate",
      "resolve_report",
      "view_intelligence",
      "manage_admins",
      "view_audit_logs",
    ],
  });
  if (profileError) throw new Error(profileError.message);

  await admin.from("audit_logs").insert({
    admin_id: data.user.id,
    admin_email: email,
    action: "SEED_SUPER_ADMIN",
    details: { seeded: true },
  });

  console.log(`Created super admin: ${username()}`);
  console.log("Sign in at #/staff-access, then change this password.");
}

function username(): string {
  return USERNAME || "(unknown)";
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  Deno.exit(1);
});