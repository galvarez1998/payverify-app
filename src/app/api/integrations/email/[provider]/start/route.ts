import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { createOAuthNonce, assertCompanyAdmin } from "@/backend/email/connections/repository";
import { createOAuthStatePayload, signOAuthState } from "@/backend/email/security/oauth-state";
import { getEmailProviderAdapter } from "@/backend/email/providers/registry";
import type { EmailProviderId } from "@/backend/email/providers/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: { provider: string } }) {
  const provider = context.params.provider;
  const adapter = getEmailProviderAdapter(provider);
  if (!adapter) return NextResponse.json({ error: "unsupported_email_provider" }, { status: 404 });

  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const companyId = request.nextUrl.searchParams.get("company_id") ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(companyId)) {
    return NextResponse.json({ error: "valid_company_id_required" }, { status: 400 });
  }

  try {
    if (!(await assertCompanyAdmin(companyId, auth.user.id))) return NextResponse.json({ error: "company_admin_required" }, { status: 403 });
    const payload = createOAuthStatePayload(provider as EmailProviderId, companyId, auth.user.id);
    const signedState = signOAuthState(payload);
    await createOAuthNonce({
      nonce: payload.nonce,
      provider,
      companyId,
      userId: auth.user.id,
      expiresAt: new Date((payload.issuedAt + 600) * 1000).toISOString(),
    });
    return NextResponse.redirect(adapter.buildAuthorizationUrl(signedState));
  } catch (error) {
    const message = error instanceof Error ? error.message : "email_oauth_start_failed";
    const status = message.startsWith("provider_not_configured:") || message.includes("not_configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "provider_not_configured" : "email_oauth_start_failed" }, { status });
  }
}
