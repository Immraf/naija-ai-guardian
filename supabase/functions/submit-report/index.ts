// ScamShield Nigeria — public scam report intake.
// Runs with the service role so the base table never needs an anonymous
// INSERT policy. Validates, throttles, and returns only a reference id.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_PER_WINDOW = 5;
const WINDOW_MS = 60_000;
const MAX_DESCRIPTION = 1000;
const MAX_EVIDENCE = 2000;

const ALLOWED_CATEGORIES = new Set([
  "Phishing",
  "Bank Impersonation",
  "WhatsApp Takeover",
  "POS Fraud",
  "BVN/NIN Update",
  "Fake Lottery/Grant",
  "Romance Scam",
  "Investment Scam",
  "Employment Scam",
  "Delivery Scam",
  "Other",
]);

const ALLOWED_PLATFORMS = new Set([
  "Phone Call",
  "SMS",
  "WhatsApp",
  "Email",
  "Facebook",
  "Instagram",
  "Telegram",
  "In-person",
  "Website",
  "Other",
]);

const hits = new Map<string, number[]>();

function throttled(key: string): boolean {
  const now = Date.now();
  const previous = (hits.get(key) ?? []).filter((ts) => now - ts < WINDOW_MS);
  previous.push(now);
  hits.set(key, previous);
  return previous.length > MAX_PER_WINDOW;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function normalisePhone(input: string): string {
  const cleaned = input.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+234")) return cleaned;
  if (cleaned.startsWith("234")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
  return cleaned;
}

function referenceId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let tail = "";
  for (let i = 0; i < 5; i += 1) {
    tail += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return `NG-SCAM-${tail}`;
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (throttled(ip)) {
    return json(
      { error: "Too many reports from this connection. Please try again in a minute." },
      429,
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const category = text(payload.category, 80);
  const platform = text(payload.platform, 60);
  const identifier = normalisePhone(text(payload.identifier, 40));
  const description = text(payload.description, MAX_DESCRIPTION);
  const evidence = text(payload.evidence, MAX_EVIDENCE);
  const reporterName = text(payload.reporter_name, 120);
  const reporterEmail = text(payload.reporter_email, 160);

  if (!category || !ALLOWED_CATEGORIES.has(category)) {
    return json({ error: "Choose a valid scam category." }, 422);
  }
  if (!platform || !ALLOWED_PLATFORMS.has(platform)) {
    return json({ error: "Choose a valid platform." }, 422);
  }
  if (identifier.length < 7) {
    return json({ error: "Enter the phone number or handle used by the scammer." }, 422);
  }
  if (description.length < 20) {
    return json({ error: "Please describe what happened in at least 20 characters." }, 422);
  }
  if (reporterEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reporterEmail)) {
    return json({ error: "Enter a valid email address or leave it blank." }, 422);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Reporting is temporarily unavailable." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const refId = referenceId();
  const { error } = await admin.from("scam_reports").insert({
    reference_id: refId,
    category,
    identifier,
    normalized_identifier: identifier,
    platform,
    description,
    evidence: evidence || null,
    reporter_name: reporterName || null,
    reporter_email: reporterEmail || null,
    status: "Reported",
    risk_level: "Suspicious",
    risk_score: 0,
  });

  if (error) {
    console.error("submit-report insert failed", error.message);
    return json({ error: "We could not save this report. Please try again." }, 500);
  }

  return json({ reference_id: refId });
});