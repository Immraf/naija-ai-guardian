import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://qlgvkvjbycjigyodkomx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZ3ZrdmpieWNqaWd5b2Rrb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDUwOTEsImV4cCI6MjEwMjEyMTA5MX0.-29uljNfSgH13VseheWjOak4XiPc62YsbQx96CWBGHw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
