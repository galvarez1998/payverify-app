import "server-only";
import type { EmailIdentity, EmailProviderAdapter, OAuthTokenSet } from "./types";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`provider_not_configured:${name}`);
  return value;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error("oauth_provider_request_failed");
  return body;
}

function tokenSet(body: Record<string, unknown>): OAuthTokenSet {
  const accessToken = typeof body.access_token === "string" ? body.access_token : null;
  if (!accessToken) throw new Error("oauth_access_token_missing");
  const expiresIn = typeof body.expires_in === "number" ? body.expires_in : null;
  const scope = typeof body.scope === "string" ? body.scope.split(" ").filter(Boolean) : [];
  return {
    accessToken,
    refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : null,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
    scopes: scope,
  };
}

export class GoogleGmailOAuthAdapter implements EmailProviderAdapter {
  readonly id = "google" as const;

  buildAuthorizationUrl(state: string): URL {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: required("GOOGLE_CLIENT_ID"),
      redirect_uri: required("GOOGLE_REDIRECT_URI"),
      response_type: "code",
      scope: "openid email https://www.googleapis.com/auth/gmail.readonly",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    }).toString();
    return url;
  }

  async exchangeAuthorizationCode(code: string): Promise<OAuthTokenSet> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: required("GOOGLE_CLIENT_ID"),
        client_secret: required("GOOGLE_CLIENT_SECRET"),
        redirect_uri: required("GOOGLE_REDIRECT_URI"),
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    return tokenSet(await readJson(response));
  }

  async getIdentity(accessToken: string): Promise<EmailIdentity> {
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { authorization: `Bearer ${accessToken}` }, cache: "no-store",
    });
    const body = await readJson(response);
    if (typeof body.emailAddress !== "string") throw new Error("provider_identity_missing");
    return { email: body.emailAddress, displayName: null, providerUserId: body.emailAddress };
  }
}

export class MicrosoftGraphOAuthAdapter implements EmailProviderAdapter {
  readonly id = "microsoft" as const;

  private get tenant(): string { return process.env.MICROSOFT_TENANT_ID || "common"; }
  private get authority(): string { return `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0`; }

  buildAuthorizationUrl(state: string): URL {
    const url = new URL(`${this.authority}/authorize`);
    url.search = new URLSearchParams({
      client_id: required("MICROSOFT_CLIENT_ID"),
      redirect_uri: required("MICROSOFT_REDIRECT_URI"),
      response_type: "code",
      response_mode: "query",
      scope: "openid profile email offline_access User.Read Mail.Read",
      state,
    }).toString();
    return url;
  }

  async exchangeAuthorizationCode(code: string): Promise<OAuthTokenSet> {
    const response = await fetch(`${this.authority}/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: required("MICROSOFT_CLIENT_ID"),
        client_secret: required("MICROSOFT_CLIENT_SECRET"),
        redirect_uri: required("MICROSOFT_REDIRECT_URI"),
        grant_type: "authorization_code",
        scope: "openid profile email offline_access User.Read Mail.Read",
      }),
      cache: "no-store",
    });
    return tokenSet(await readJson(response));
  }

  async getIdentity(accessToken: string): Promise<EmailIdentity> {
    const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName", {
      headers: { authorization: `Bearer ${accessToken}` }, cache: "no-store",
    });
    const body = await readJson(response);
    const email = typeof body.mail === "string" ? body.mail : typeof body.userPrincipalName === "string" ? body.userPrincipalName : null;
    if (!email) throw new Error("provider_identity_missing");
    return {
      email,
      displayName: typeof body.displayName === "string" ? body.displayName : null,
      providerUserId: typeof body.id === "string" ? body.id : null,
    };
  }
}
