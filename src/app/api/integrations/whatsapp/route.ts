import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { listWhatsAppConnections } from "@/backend/whatsapp/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  if (!membership.data?.company_id) return NextResponse.json({ error: "no_active_company" }, { status: 403 });
  const result = await listWhatsAppConnections(auth.supabase, membership.data.company_id);
  if (result.error) return NextResponse.json({ error: "whatsapp_connections_lookup_failed" }, { status: 500 });
  return NextResponse.json({ connections: result.data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;
  if (!companyId || !["company_admin", "branch_manager"].includes(String(membership.data?.role))) return NextResponse.json({ error: "company_admin_required" }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const phoneNumberId = String(body?.phone_number_id ?? "").trim();
  const businessAccountId = String(body?.business_account_id ?? "").trim();
  const displayPhoneNumber = String(body?.display_phone_number ?? "").trim();
  if (!phoneNumberId || !businessAccountId) return NextResponse.json({ error: "phone_number_id_and_business_account_id_required" }, { status: 400 });
  const result = await auth.supabase.from("whatsapp_connections").upsert({ company_id: companyId, phone_number_id: phoneNumberId, business_account_id: businessAccountId, display_phone_number: displayPhoneNumber || null, status: "active" }, { onConflict: "phone_number_id" }).select("id, phone_number_id, business_account_id, display_phone_number, status").single();
  if (result.error) return NextResponse.json({ error: "whatsapp_connection_save_failed" }, { status: 400 });
  return NextResponse.json({ connection: result.data }, { status: 201 });
}
