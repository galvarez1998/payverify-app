import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../supabase/server";
import { isSupabaseConfigured } from "../config/env";

export type AuthenticatedContext = { ok: true; supabase: SupabaseClient; user: User };
export type AuthenticationFailure = { ok: false; status: 401 | 503; error: "unauthorized" | "backend_not_configured" };

export async function getAuthenticatedContext(): Promise<AuthenticatedContext | AuthenticationFailure> {
  if (!isSupabaseConfigured()) return { ok: false, status: 503, error: "backend_not_configured" };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { ok: false, status: 401, error: "unauthorized" };
  return { ok: true, supabase, user };
}
