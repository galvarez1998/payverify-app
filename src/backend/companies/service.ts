import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCompanyMemberships(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("company_memberships")
    .select("company_id, role, status, companies(id, name, city, status)")
    .eq("user_id", userId)
    .eq("status", "active");
}

export async function createCompanyWithOwner(supabase: SupabaseClient, name: string) {
  return supabase.rpc("create_company_with_owner", { company_name: name });
}
