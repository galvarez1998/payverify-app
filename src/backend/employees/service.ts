import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCompanyEmployees(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("employees")
    .select("id, name, email, role_label, active, branch_id, branches(name, city)")
    .eq("company_id", companyId)
    .order("name", { ascending: true });
}

export async function createEmployee(supabase: SupabaseClient, companyId: string, input: { name: string; email?: string; roleLabel?: string; branchId?: string | null; active?: boolean }) {
  const name = String(input.name ?? "").trim();
  if (!name || name.length < 2) {
    return { data: null, error: new Error("employee_name_required") };
  }

  return supabase
    .from("employees")
    .insert({
      company_id: companyId,
      branch_id: input.branchId || null,
      name,
      email: input.email?.trim() || null,
      role_label: input.roleLabel?.trim() || "Empleado",
      active: input.active ?? true,
    })
    .select("id, name, email, role_label, active, branch_id, branches(name, city)")
    .single();
}

export async function updateEmployee(supabase: SupabaseClient, employeeId: string, input: { name?: string; email?: string; roleLabel?: string; branchId?: string | null; active?: boolean }) {
  const payload: Record<string, unknown> = {};

  if (typeof input.name === "string") {
    const name = input.name.trim();
    if (!name || name.length < 2) {
      return { data: null, error: new Error("employee_name_required") };
    }
    payload.name = name;
  }
  if (typeof input.email === "string") payload.email = input.email.trim() || null;
  if (typeof input.roleLabel === "string") payload.role_label = input.roleLabel.trim() || "Empleado";
  if (typeof input.branchId === "string" || input.branchId === null) payload.branch_id = input.branchId || null;
  if (typeof input.active === "boolean") payload.active = input.active;

  if (Object.keys(payload).length === 0) {
    return { data: null, error: new Error("employee_no_changes") };
  }

  return supabase
    .from("employees")
    .update(payload)
    .eq("id", employeeId)
    .select("id, name, email, role_label, active, branch_id, branches(name, city)")
    .single();
}

export async function deleteEmployee(supabase: SupabaseClient, employeeId: string) {
  return supabase.from("employees").delete().eq("id", employeeId).select("id").single();
}
