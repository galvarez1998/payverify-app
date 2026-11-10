import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: memberships, error } = await supabase
    .from("company_memberships")
    .select("company_id, role, status, companies(id, name, city, status)")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) return NextResponse.json({ error: "membership_lookup_failed" }, { status: 500 });
  return NextResponse.json({ user: { id: user.id, email: user.email }, memberships });
}
