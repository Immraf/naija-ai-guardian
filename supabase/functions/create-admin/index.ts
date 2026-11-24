// ScamShield Nigeria — staff account provisioning.
// Only an ACTIVE SUPER_ADMIN may create a staff account. The caller JWT is
// verified against admin_profiles before the service role creates anything.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STAFF_EMAIL_DOMAIN = "portal.scamshield.local";

const ALLOWED_PERMISSIONS = new Set([
  "view_reports",
  "confirm_scam",
  "reject_report",
  "mark_duplicate",
  "resolve_report",
  "view_intelligence",
  "manage_admins",
  "view_audit_logs",
]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: "Account provisioning is unavailable." }, 500);
  }
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json({ error: "Not authorised." }, 401);
  }

  // 1. Identify the caller from their own JWT.
  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Not authorised." }, 401);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 2. Verify the caller is an ACTIVE SUPER_ADMIN.
  const { data: callerProfile } = await admin
    .from("admin_profiles")
    .select("id, full_name, email, role, status")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (
    !callerProfile ||
    callerProfile.role !== "SUPER_ADMIN" ||
    callerProfile.status !== "ACTIVE"
  ) {
    return json({ error: "Only an active super admin can create staff accounts." }, 403);
  }

  // 3. Validate the payload.
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const username = text(payload.username, 40).toLowerCase();
  const fullName = text(payload.full_name, 120);
  const password = text(payload.password, 200);
  const rawPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];
  const permissions = rawPermissions
    .filter((value): value is string => typeof value === "string")
    .filter((value) => ALLOWED_PERMISSIONS.has(value));

  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return json(
      { error: "Use 3-40 characters: lowercase letters, numbers, dot, dash or underscore." },
      422,
    );
  }
  if (fullName.length < 2) {
    return json({ error: "Enter the staff member's full name." }, 422);
  }
  if (password.length < 10) {
    return json({ error: "Use a temporary password of at least 10 characters." }, 422);
  }

  const email = `${username}@${STAFF_EMAIL_DOMAIN}`;

  const { data: existing } = await admin
    .from("admin_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return json({ error: "That username is already in use." }, 409);
  }

  // 4. Create the auth user, then the staff profile.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, portal: "staff" },
  });

  if (createError || !created.user) {
    console.error("create-admin auth failure", createError?.message);
    return json({ error: "Could not create that staff account." }, 500);
  }

  const { error: profileError } = await admin.from("admin_profiles").insert({
    id: created.user.id,
    full_name: fullName,
    email,
    role: "SUB_ADMIN",
    status: "ACTIVE",
    permissions: permissions.length > 0 ? permissions : ["view_reports"],
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    console.error("create-admin profile failure", profileError.message);
    return json({ error: "Could not create that staff account." }, 500);
  }

  // 5. Audit trail.
  await admin.from("audit_logs").insert({
    admin_id: callerProfile.id,
    admin_email: callerProfile.email,
    action: "CREATE_SUB_ADMIN",
    details: { created_admin_id: created.user.id, username, permissions },
  });

  return json({
    id: created.user.id,
    username,
    email,
    full_name: fullName,
    permissions: permissions.length > 0 ? permissions : ["view_reports"],
  });
});