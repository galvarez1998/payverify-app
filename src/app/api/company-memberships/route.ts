import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { createMembershipForCompany, getActiveCompanyForUser, listCompanyMembershipsForCompany } from "@/backend/companies/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  }

  const { data, error } = await listCompanyMembershipsForCompany(auth.supabase, companyId);
  if (error) return NextResponse.json({ error: "memberships_lookup_failed", message: error.message }, { status: 500 });

  const memberships = data ?? [];
  const userIds = memberships.map((membership) => membership.user_id).filter(Boolean);
  let profilesByUserId = new Map<string, { display_name?: string | null }>();

  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await auth.supabase
      .from("user_profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    if (!profilesError && Array.isArray(profilesData)) {
      profilesByUserId = new Map(profilesData.map((profile) => [profile.user_id, { display_name: profile.display_name }]));
    }
  }

  return NextResponse.json({
    memberships: memberships.map((membership) => ({
      ...membership,
      user_profiles: profilesByUserId.get(membership.user_id) ?? null,
    })),
  });
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

  const userId = typeof payload === "object" && payload !== null && "userId" in payload ? String((payload as Record<string, unknown>).userId ?? "") : "";
  const role = typeof payload === "object" && payload !== null && "role" in payload ? String((payload as Record<string, unknown>).role ?? "employee") : "employee";
  const status = typeof payload === "object" && payload !== null && "status" in payload ? String((payload as Record<string, unknown>).status ?? "active") : "active";

  if (!userId) {
    return NextResponse.json({ error: "invalid_user_id" }, { status: 400 });
  }

  const { data, error } = await createMembershipForCompany(auth.supabase, companyId, { userId, role, status });
  if (error) {
    return NextResponse.json({ error: "membership_creation_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ membership: data }, { status: 201 });
}
