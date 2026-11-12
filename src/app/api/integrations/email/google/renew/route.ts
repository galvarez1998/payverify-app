import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { renewGoogleWatch } from "@/backend/email/pubsub/google-pubsub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const companyId = request.nextUrl.searchParams.get("company_id") || "";
  if (!companyId) {
    return NextResponse.json({ error: "company_id_required" }, { status: 400 });
  }

  const { data: membership } = await auth.supabase
    .from("company_memberships")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .eq("role", "company_admin")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "company_admin_required" }, { status: 403 });
  }

  const { data: connection } = await auth.supabase
    .from("email_connections")
    .select("id, email_address")
    .eq("company_id", companyId)
    .eq("provider", "google")
    .eq("status", "connected")
    .maybeSingle();

  if (!connection) {
    return NextResponse.json({ error: "gmail_connection_missing" }, { status: 404 });
  }

  try {
    const result = await renewGoogleWatch(companyId, connection.id, connection.email_address);
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "gmail_renew_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
