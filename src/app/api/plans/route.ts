import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("plans")
    .select("id, key, name, monthly_price_cop, verification_limit, branch_limit, employee_limit, active")
    .eq("active", true)
    .order("monthly_price_cop", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "plans_lookup_failed", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ plans: data ?? [] });
}
