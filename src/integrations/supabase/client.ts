import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Values come from Vite env vars (see `.env.example`). The connected project's
 * public URL + anon key act as the fallback so the deployed preview keeps
 * working when no `.env` file is present. RLS — not the key — is the boundary.
 */
const FALLBACK_URL = "https://qlgvkvjbycjigyodkomx.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZ3ZrdmpieWNqaWd5b2Rrb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDUwOTEsImV4cCI6MjEwMjEyMTA5MX0.-29uljNfSgH13VseheWjOak4XiPc62YsbQx96CWBGHw";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? FALLBACK_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);