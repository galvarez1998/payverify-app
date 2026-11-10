import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { listCompanyMemberships } from "@/backend/companies/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await listCompanyMemberships(auth.supabase, auth.user.id);
  if (error) return NextResponse.json({ error: "membership_lookup_failed" }, { status: 500 });
  return NextResponse.json({ user: { id: auth.user.id, email: auth.user.email }, memberships: data ?? [] });
}
