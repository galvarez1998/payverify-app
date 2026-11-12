import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/backend/supabase/admin";
import { getGoogleWebhookVerifier, saveGoogleWebhookEvent } from "@/backend/email/pubsub/google-pubsub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const body = JSON.parse(rawBody) as { message?: { data?: string; attributes?: Record<string, string> } };
    const payload = body.message?.data ? Buffer.from(body.message.data, "base64").toString("utf8") : null;
    if (!payload) return NextResponse.json({ ok: false }, { status: 400 });

    const parsed = JSON.parse(payload) as { emailAddress?: string; historyId?: string; companyId?: string; connectionId?: string };

    const jwtHeader = request.headers.get("x-goog-iap-jwt-assertion") || request.headers.get("x-goog-authenticated-user-email") || "";
    if (!jwtHeader) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const verifier = getGoogleWebhookVerifier();
    await verifier.verify(jwtHeader, parsed);

    const db = createSupabaseAdminClient();
    const { data: connection } = await db
      .from("email_connections")
      .select("id, company_id")
      .eq("company_id", parsed.companyId ?? "")
      .eq("email_address", parsed.emailAddress ?? "")
      .maybeSingle();

    if (!connection) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await saveGoogleWebhookEvent({
      companyId: connection.company_id,
      connectionId: connection.id,
      provider: "google",
      historyId: parsed.historyId ?? "",
      emailAddress: parsed.emailAddress ?? "",
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "webhook_invalid" }, { status: 401 });
  }
}
