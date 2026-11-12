import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { processCompanyNoticeMatches } from "@/backend/email/verification/match-notices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: { provider: string } }) {
  const provider = context.params.provider;
  if (provider !== "google" && provider !== "microsoft") {
    return NextResponse.json({ error: "unsupported_email_provider" }, { status: 404 });
  }

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

  try {
    const result = await processCompanyNoticeMatches(companyId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "email_verification_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
