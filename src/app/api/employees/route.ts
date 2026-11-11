import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { createEmployee, listCompanyEmployees } from "@/backend/employees/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  const { data, error } = await listCompanyEmployees(auth.supabase, companyId);
  if (error) return NextResponse.json({ error: "employees_lookup_failed", message: error.message }, { status: 500 });

  return NextResponse.json({ employees: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof payload === "object" && payload !== null && "name" in payload ? String((payload as Record<string, unknown>).name ?? "").trim() : "";
  const email = typeof payload === "object" && payload !== null && "email" in payload ? String((payload as Record<string, unknown>).email ?? "").trim() : "";
  const roleLabel = typeof payload === "object" && payload !== null && "roleLabel" in payload ? String((payload as Record<string, unknown>).roleLabel ?? "").trim() : "";
  const branchId = typeof payload === "object" && payload !== null && "branchId" in payload ? String((payload as Record<string, unknown>).branchId ?? "") || null : null;
  const active = typeof payload === "object" && payload !== null && "active" in payload ? Boolean((payload as Record<string, unknown>).active) : true;

  if (!name) {
    return NextResponse.json({ error: "invalid_employee_name" }, { status: 400 });
  }

  const { data, error } = await createEmployee(auth.supabase, companyId, { name, email, roleLabel: roleLabel || "Empleado", branchId, active });
  if (error) {
    return NextResponse.json({ error: "employee_creation_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ employee: data }, { status: 201 });
}
