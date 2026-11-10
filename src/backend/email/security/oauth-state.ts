import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { EmailProviderId } from "../providers/types";

export type OAuthStatePayload = {
  provider: EmailProviderId;
  companyId: string;
  userId: string;
  nonce: string;
  issuedAt: number;
};

const MAX_AGE_SECONDS = 600;

function stateSecret(): string {
  const secret = process.env.EMAIL_OAUTH_STATE_SECRET;
  if (!secret || secret.length < 32) throw new Error("email_oauth_state_secret_must_be_at_least_32_chars");
  return secret;
}

function signature(encodedPayload: string): string {
  return createHmac("sha256", stateSecret()).update(encodedPayload).digest("base64url");
}

export function createOAuthStatePayload(provider: EmailProviderId, companyId: string, userId: string): OAuthStatePayload {
  return { provider, companyId, userId, nonce: randomBytes(24).toString("base64url"), issuedAt: Math.floor(Date.now() / 1000) };
}

export function signOAuthState(payload: OAuthStatePayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function verifyOAuthState(state: string, expectedProvider: EmailProviderId): OAuthStatePayload | null {
  const [encoded, suppliedSignature, extra] = state.split(".");
  if (!encoded || !suppliedSignature || extra) return null;
  let expected: string;
  try { expected = signature(encoded); } catch { return null; }
  const supplied = Buffer.from(suppliedSignature);
  const actual = Buffer.from(expected);
  if (supplied.length !== actual.length || !timingSafeEqual(supplied, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<OAuthStatePayload>;
    const now = Math.floor(Date.now() / 1000);
    if (payload.provider !== expectedProvider || typeof payload.companyId !== "string" || typeof payload.userId !== "string" || typeof payload.nonce !== "string" || typeof payload.issuedAt !== "number") return null;
    if (payload.issuedAt > now + 30 || now - payload.issuedAt > MAX_AGE_SECONDS) return null;
    return payload as OAuthStatePayload;
  } catch {
    return null;
  }
}
