import { NextResponse, type NextRequest } from "next/server";
import { assertCompanyAdmin, consumeOAuthNonce, saveEmailConnection } from "@/backend/email/connections/repository";
import { verifyOAuthState } from "@/backend/email/security/oauth-state";
import { getEmailProviderAdapter } from "@/backend/email/providers/registry";
import type { EmailProviderId } from "@/backend/email/providers/types";

export const runtime = "nodejs";

function settingsRedirect(request: NextRequest, result: string) {
  const url = new URL("/configuracion", request.url);
  url.searchParams.set("email_oauth", result);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest, context: { params: { provider: string } }) {
  const provider = context.params.provider;
  const adapter = getEmailProviderAdapter(provider);
  if (!adapter) return settingsRedirect(request, "unsupported_provider");

  const state = request.nextUrl.searchParams.get("state");
  if (!state) return settingsRedirect(request, "invalid_state");
  const payload = verifyOAuthState(state, provider as EmailProviderId);
  if (!payload) return settingsRedirect(request, "invalid_state");

  try {
    const consumed = await consumeOAuthNonce(payload.nonce, provider, payload.companyId, payload.userId);
    if (!consumed) return settingsRedirect(request, "state_expired_or_replayed");
    if (!(await assertCompanyAdmin(payload.companyId, payload.userId))) return settingsRedirect(request, "membership_revoked");

    const providerError = request.nextUrl.searchParams.get("error");
    if (providerError) return settingsRedirect(request, providerError === "access_denied" ? "authorization_denied" : "provider_error");

    const code = request.nextUrl.searchParams.get("code");
    if (!code) return settingsRedirect(request, "authorization_code_missing");

    const tokens = await adapter.exchangeAuthorizationCode(code);
    const identity = await adapter.getIdentity(tokens.accessToken);
    await saveEmailConnection({
      provider,
      companyId: payload.companyId,
      userId: payload.userId,
      email: identity.email,
      displayName: identity.displayName,
      providerUserId: identity.providerUserId,
      tokens,
    });
    return settingsRedirect(request, "connected_manual_sync_required");
  } catch {
    // Do not return provider responses, tokens, or database details to the browser.
    return settingsRedirect(request, "connection_failed_check_server_logs");
  }
}
