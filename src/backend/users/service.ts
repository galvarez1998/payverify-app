import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCompanyMembers(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("company_memberships")
    .select("user_id, role, status")
    .eq("company_id", companyId)
    .order("role", { ascending: true });
}

export async function listPlatformUsers(supabase: SupabaseClient) {
  return supabase
    .from("user_profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false });
}
