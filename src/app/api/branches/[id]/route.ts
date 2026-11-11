import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { deleteBranch, getActiveCompanyForUser, updateBranch } from "@/backend/companies/service";

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
    city: typeof payload === "object" && payload !== null && "city" in payload ? String((payload as Record<string, unknown>).city ?? "") : undefined,
    address: typeof payload === "object" && payload !== null && "address" in payload ? String((payload as Record<string, unknown>).address ?? "") : undefined,
    active: typeof payload === "object" && payload !== null && "active" in payload ? Boolean((payload as Record<string, unknown>).active) : undefined,
  };

  const { data, error } = await updateBranch(auth.supabase, id, updateInput);
  if (error) {
    return NextResponse.json({ error: "branch_update_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ branch: data, companyId });
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
  const { data, error } = await deleteBranch(auth.supabase, id);
  if (error) {
    return NextResponse.json({ error: "branch_delete_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ deleted: data, companyId });
}
