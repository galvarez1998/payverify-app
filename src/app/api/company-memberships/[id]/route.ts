import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { deleteMembershipForCompany, getActiveCompanyForUser, updateMembershipForCompany } from "@/backend/companies/service";

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
    role: typeof payload === "object" && payload !== null && "role" in payload ? String((payload as Record<string, unknown>).role ?? "") : undefined,
    status: typeof payload === "object" && payload !== null && "status" in payload ? String((payload as Record<string, unknown>).status ?? "") : undefined,
  };

  const { data, error } = await updateMembershipForCompany(auth.supabase, id, updateInput);
  if (error) {
    return NextResponse.json({ error: "membership_update_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ membership: data, companyId });
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
  const { data, error } = await deleteMembershipForCompany(auth.supabase, id);
  if (error) {
    return NextResponse.json({ error: "membership_delete_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ deleted: data, companyId });
}
