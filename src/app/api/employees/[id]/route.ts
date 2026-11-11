import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { deleteEmployee, updateEmployee } from "@/backend/employees/service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  const { id } = await params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updateInput = {
    name: typeof payload === "object" && payload !== null && "name" in payload ? String((payload as Record<string, unknown>).name ?? "") : undefined,
    email: typeof payload === "object" && payload !== null && "email" in payload ? String((payload as Record<string, unknown>).email ?? "") : undefined,
    roleLabel: typeof payload === "object" && payload !== null && "roleLabel" in payload ? String((payload as Record<string, unknown>).roleLabel ?? "") : undefined,
    branchId: typeof payload === "object" && payload !== null && "branchId" in payload ? String((payload as Record<string, unknown>).branchId ?? "") || null : undefined,
    active: typeof payload === "object" && payload !== null && "active" in payload ? Boolean((payload as Record<string, unknown>).active) : undefined,
  };

  const { data, error } = await updateEmployee(auth.supabase, id, updateInput);
  if (error) {
    return NextResponse.json({ error: "employee_update_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ employee: data, companyId });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  const { id } = await params;
  const { data, error } = await deleteEmployee(auth.supabase, id);
  if (error) {
    return NextResponse.json({ error: "employee_delete_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ deleted: data, companyId });
}
