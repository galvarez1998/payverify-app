import { NextResponse, type NextRequest } from "next/server";
import { getWhatsAppWebhookConfig, verifyWhatsAppSignature } from "@/backend/config/integrations";
import { processWhatsAppWebhook } from "@/backend/whatsapp/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const config = getWhatsAppWebhookConfig();
  const url = new URL(request.url);
  if (url.searchParams.get("hub.mode") !== "subscribe" || url.searchParams.get("hub.verify_token") !== config.verifyToken) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return new NextResponse(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  try {
    const config = getWhatsAppWebhookConfig();
    if (!verifyWhatsAppSignature(rawBody, request.headers.get("x-hub-signature-256"), config.appSecret)) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    await processWhatsAppWebhook(rawBody);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "webhook_processing_failed" }, { status: 400 });
  }
}
