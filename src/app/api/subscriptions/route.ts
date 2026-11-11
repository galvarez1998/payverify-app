import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { getCompanySubscriptionState, updateCompanySubscription } from "@/backend/metrics/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  const { data, error } = await getCompanySubscriptionState(auth.supabase, companyId);
  if (error) return NextResponse.json({ error: "subscription_lookup_failed", message: error.message }, { status: 500 });

  return NextResponse.json({ subscription: data ?? null });
}

export async function PATCH(request: Request) {
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

  const updateInput = {
    status: typeof payload === "object" && payload !== null && "status" in payload ? String((payload as Record<string, unknown>).status ?? "") : undefined,
    planId: typeof payload === "object" && payload !== null && "planId" in payload ? String((payload as Record<string, unknown>).planId ?? "") : undefined,
  };

  const { data, error } = await updateCompanySubscription(auth.supabase, companyId, updateInput);
  if (error) {
    return NextResponse.json({ error: "subscription_update_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ subscription: data });
}
