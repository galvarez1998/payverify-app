import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCompanyMemberships(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("company_memberships")
    .select("company_id, role, status, companies(id, name, city, status)")
    .eq("user_id", userId)
    .eq("status", "active");
}

export async function getActiveCompanyForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("company_memberships")
    .select("company_id, role, status, companies(id, name, city, status)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  return {
    data: data && data.length > 0 ? data[0] : null,
    error,
  };
}

export async function listCompanyBranches(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("branches")
    .select("id, name, city, address, active")
    .eq("company_id", companyId)
    .order("name", { ascending: true });
}

export async function listCompanyEmployees(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("employees")
    .select("id, name, email, role_label, active, branch_id, branches(name, city)")
    .eq("company_id", companyId)
    .order("name", { ascending: true });
}

export async function listCompaniesForPlatformAdmin(supabase: SupabaseClient) {
  return supabase
    .from("companies")
    .select("id, name, city, status, subscriptions!inner(status, plan_id, plans(key, name, monthly_price_cop))")
    .order("name", { ascending: true });
}

export async function getCompanyDashboardSummary(supabase: SupabaseClient, companyId: string) {
  const [employees, branches, verificationEvents, movements] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("branches").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("verification_events").select("status").eq("company_id", companyId),
    supabase.from("bank_movements").select("operation_status, amount_cop, occurred_at").eq("company_id", companyId),
  ]);

  return {
    employeesCount: employees.count ?? 0,
    branchesCount: branches.count ?? 0,
    verificationStatuses: verificationEvents.data ?? [],
    movementRows: movements.data ?? [],
  };
}

export async function createBranch(supabase: SupabaseClient, companyId: string, input: { name: string; city?: string; address?: string; active?: boolean }) {
  const name = String(input.name ?? "").trim();
  if (!name || name.length < 2) {
    return { data: null, error: new Error("branch_name_required") };
  }

  return supabase
    .from("branches")
    .insert({
      company_id: companyId,
      name,
      city: input.city?.trim() || null,
      address: input.address?.trim() || null,
      active: input.active ?? true,
    })
    .select("id, name, city, address, active")
    .single();
}

export async function updateBranch(supabase: SupabaseClient, branchId: string, input: { name?: string; city?: string; address?: string; active?: boolean }) {
  const payload: Record<string, unknown> = {};
  if (typeof input.name === "string") {
    const name = input.name.trim();
    if (!name || name.length < 2) {
      return { data: null, error: new Error("branch_name_required") };
    }
    payload.name = name;
  }
  if (typeof input.city === "string") payload.city = input.city.trim() || null;
  if (typeof input.address === "string") payload.address = input.address.trim() || null;
  if (typeof input.active === "boolean") payload.active = input.active;

  if (Object.keys(payload).length === 0) {
    return { data: null, error: new Error("branch_no_changes") };
  }

  return supabase
    .from("branches")
    .update(payload)
    .eq("id", branchId)
    .select("id, name, city, address, active")
    .single();
}

export async function deleteBranch(supabase: SupabaseClient, branchId: string) {
  return supabase.from("branches").delete().eq("id", branchId).select("id").single();
}

export async function listCompanyMembershipsForCompany(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("company_memberships")
    .select("id, company_id, user_id, role, status, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
}

export async function createMembershipForCompany(supabase: SupabaseClient, companyId: string, input: { userId: string; role?: string; status?: string }) {
  const role = String(input.role ?? "employee");
  const status = String(input.status ?? "active");

  return supabase
    .from("company_memberships")
    .insert({
      company_id: companyId,
      user_id: input.userId,
      role: role as "company_admin" | "branch_manager" | "employee" | "analyst",
      status: status as "active" | "invited" | "suspended",
    })
    .select("id, company_id, user_id, role, status")
    .single();
}

export async function updateMembershipForCompany(supabase: SupabaseClient, membershipId: string, input: { role?: string; status?: string }) {
  const payload: Record<string, unknown> = {};
  if (input.role) payload.role = input.role as "company_admin" | "branch_manager" | "employee" | "analyst";
  if (input.status) payload.status = input.status as "active" | "invited" | "suspended";

  if (Object.keys(payload).length === 0) {
    return { data: null, error: new Error("membership_no_changes") };
  }

  return supabase
    .from("company_memberships")
    .update(payload)
    .eq("id", membershipId)
    .select("id, company_id, user_id, role, status")
    .single();
}

export async function deleteMembershipForCompany(supabase: SupabaseClient, membershipId: string) {
  return supabase.from("company_memberships").delete().eq("id", membershipId).select("id").single();
}

export async function createCompanyWithOwner(supabase: SupabaseClient, name: string) {
  return supabase.rpc("create_company_with_owner", { company_name: name });
}
