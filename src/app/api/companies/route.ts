import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getAuthenticatedClient() {
  if (!isSupabaseConfigured()) return { response: NextResponse.json({ error: "backend_not_configured" }, { status: 503 }) };
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  return { supabase, user };
}

export async function GET() {
  const auth = await getAuthenticatedClient();
  if ("response" in auth) return auth.response;

  const { data, error } = await auth.supabase
    .from("company_memberships")
    .select("company_id, role, status, companies(id, name, city, status)")
    .eq("user_id", auth.user.id)
    .eq("status", "active");

  if (error) return NextResponse.json({ error: "company_lookup_failed" }, { status: 500 });
  return NextResponse.json({ companies: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedClient();
  if ("response" in auth) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof payload === "object" && payload !== null && "name" in payload ? String(payload.name).trim() : "";
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "invalid_company_name", message: "El nombre debe tener entre 2 y 120 caracteres." }, { status: 400 });
  }

  const { data, error } = await auth.supabase.rpc("create_company_with_owner", { company_name: name });
  if (error) return NextResponse.json({ error: "company_creation_failed" }, { status: 400 });
  return NextResponse.json({ company_id: data }, { status: 201 });
}
