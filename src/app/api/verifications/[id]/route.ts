import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { updateVerificationEventStatus } from "@/backend/metrics/service";

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

  const status = typeof payload === "object" && payload !== null && "status" in payload ? String((payload as Record<string, unknown>).status ?? "") : "";
  const reason = typeof payload === "object" && payload !== null && "reason" in payload ? String((payload as Record<string, unknown>).reason ?? "") : "";

  if (!status) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const { data, error } = await updateVerificationEventStatus(auth.supabase, id, { status, reason });
  if (error) {
    return NextResponse.json({ error: "verification_update_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ verification: data, companyId });
}
