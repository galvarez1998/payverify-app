import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { createBranch, getActiveCompanyForUser, listCompanyBranches } from "@/backend/companies/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  const { data, error } = await listCompanyBranches(auth.supabase, companyId);
  if (error) return NextResponse.json({ error: "branches_lookup_failed", message: error.message }, { status: 500 });

  return NextResponse.json({ branches: data ?? [] });
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
  const city = typeof payload === "object" && payload !== null && "city" in payload ? String((payload as Record<string, unknown>).city ?? "").trim() : "";
  const address = typeof payload === "object" && payload !== null && "address" in payload ? String((payload as Record<string, unknown>).address ?? "").trim() : "";
  const active = typeof payload === "object" && payload !== null && "active" in payload ? Boolean((payload as Record<string, unknown>).active) : true;

  if (!name) {
    return NextResponse.json({ error: "invalid_branch_name" }, { status: 400 });
  }

  const { data, error } = await createBranch(auth.supabase, companyId, { name, city, address, active });
  if (error) {
    return NextResponse.json({ error: "branch_creation_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ branch: data }, { status: 201 });
}
