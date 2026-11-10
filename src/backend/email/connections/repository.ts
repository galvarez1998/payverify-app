import "server-only";
import type { OAuthTokenSet } from "../providers/types";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { encryptEmailToken } from "../security/token-vault";

export async function assertCompanyAdmin(companyId: string, userId: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("company_memberships")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .eq("role", "company_admin")
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error("company_membership_check_failed");
  return Boolean(data);
}

export async function createOAuthNonce(payload: { nonce: string; provider: string; companyId: string; userId: string; expiresAt: string }) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("email_oauth_states").insert({
    nonce: payload.nonce,
    provider: payload.provider,
    company_id: payload.companyId,
    user_id: payload.userId,
    expires_at: payload.expiresAt,
  });
  if (error) throw new Error("oauth_state_persistence_failed");
}

export async function consumeOAuthNonce(nonce: string, provider: string, companyId: string, userId: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await db.from("email_oauth_states")
    .update({ consumed_at: now })
    .eq("nonce", nonce)
    .eq("provider", provider)
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .is("consumed_at", null)
    .gt("expires_at", now)
    .select("nonce")
    .maybeSingle();
  if (error) throw new Error("oauth_state_consume_failed");
  return Boolean(data);
}

export async function saveEmailConnection(input: {
  provider: string;
  companyId: string;
  userId: string;
  email: string;
  displayName: string | null;
  providerUserId: string | null;
  tokens: OAuthTokenSet;
}) {
  const db = createSupabaseAdminClient();
  const { data: connection, error: connectionError } = await db.from("email_connections")
    .upsert({
      company_id: input.companyId,
      provider: input.provider,
      email_address: input.email.toLowerCase(),
      display_name: input.displayName,
      provider_user_id: input.providerUserId,
      status: "connected",
      scopes: input.tokens.scopes,
      token_expires_at: input.tokens.expiresAt,
      auto_sync_enabled: false,
      updated_by: input.userId,
      last_error_code: null,
    }, { onConflict: "company_id,provider,email_address" })
    .select("id")
    .single();

  if (connectionError || !connection) throw new Error("email_connection_save_failed");

  const { error: secretError } = await db.from("email_connection_secrets").upsert({
    connection_id: connection.id,
    access_token_ciphertext: encryptEmailToken(input.tokens.accessToken),
    refresh_token_ciphertext: input.tokens.refreshToken ? encryptEmailToken(input.tokens.refreshToken) : null,
    token_expires_at: input.tokens.expiresAt,
    key_version: 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: "connection_id" });
  if (secretError) throw new Error("email_connection_secret_save_failed");
  return connection.id as string;
}
