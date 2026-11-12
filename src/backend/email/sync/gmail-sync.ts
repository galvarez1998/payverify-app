import "server-only";

import { createSupabaseAdminClient } from "@/backend/supabase/admin";
import { decryptEmailToken, encryptEmailToken } from "@/backend/email/security/token-vault";

export type GmailSyncSummary = {
  ok: boolean;
  provider: "google" | "microsoft";
  companyId: string;
  connectionId: string;
  created: number;
  skipped: number;
  errors: string[];
  lastSyncAt: string | null;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`provider_not_configured:${name}`);
  return value;
}

function toIsoFromSeconds(value: number | string | null | undefined): string | null {
  if (!value) return null;
  const timestamp = typeof value === "number" ? value * 1000 : Number(value) * 1000;
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || typeof payload.access_token !== "string") {
    throw new Error("google_token_refresh_failed");
  }

  return {
    accessToken: payload.access_token as string,
    expiresAt: toIsoFromSeconds(payload.expires_in as number | string | undefined),
    refreshToken: typeof payload.refresh_token === "string" ? payload.refresh_token : refreshToken,
  };
}

async function getValidAccessToken(connectionId: string): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { data: secret, error } = await supabase
    .from("email_connection_secrets")
    .select("access_token_ciphertext, refresh_token_ciphertext, token_expires_at")
    .eq("connection_id", connectionId)
    .maybeSingle();

  if (error || !secret) {
    throw new Error("gmail_connection_secret_missing");
  }

  const accessToken = decryptEmailToken(secret.access_token_ciphertext);
  const refreshToken = secret.refresh_token_ciphertext ? decryptEmailToken(secret.refresh_token_ciphertext) : null;
  const expiresAt = secret.token_expires_at ? new Date(secret.token_expires_at).getTime() : null;

  if (refreshToken && expiresAt && expiresAt <= Date.now() + 60_000) {
    const refreshed = await refreshGoogleAccessToken(refreshToken);
    await supabase.from("email_connection_secrets").update({
      access_token_ciphertext: encryptEmailToken(refreshed.accessToken),
      refresh_token_ciphertext: refreshed.refreshToken ? encryptEmailToken(refreshed.refreshToken) : secret.refresh_token_ciphertext,
      token_expires_at: refreshed.expiresAt ? new Date(refreshed.expiresAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("connection_id", connectionId);

    return {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: refreshed.expiresAt,
    };
  }

  return { accessToken, refreshToken, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null };
}

async function listGmailMessageIds(accessToken: string, sinceIso: string | null): Promise<string[]> {
  const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  url.searchParams.set("maxResults", "25");
  if (sinceIso) {
    const seconds = Math.floor(new Date(sinceIso).getTime() / 1000);
    url.searchParams.set("q", `after:${seconds}`);
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error("gmail_messages_list_failed");
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  return messages.map((item) => String((item as Record<string, unknown>).id ?? "")).filter(Boolean);
}

function decodeGmailBody(value: string | undefined): string {
  if (!value) return "";
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function extractHeader(headers: Array<{ name?: string; value?: string }> | undefined, name: string): string | null {
  const found = headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase());
  return found?.value ?? null;
}

function extractTextFromPayload(payload: Record<string, unknown> | null | undefined): string {
  if (!payload) return "";
  const bodyPart = payload.body as Record<string, unknown> | undefined;
  if (typeof bodyPart?.data === "string") {
    return decodeGmailBody(bodyPart.data);
  }

  const parts = Array.isArray(payload.parts) ? payload.parts : [];
  const full = parts
    .map((part) => extractTextFromPayload(part as Record<string, unknown>))
    .join("\n");

  return full || "";
}

async function getGmailMessage(accessToken: string, messageId: string): Promise<Record<string, unknown>> {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error("gmail_message_fetch_failed");
  }
  return payload;
}

function parseGmailMessage(raw: Record<string, unknown>) {
  const payload = raw.payload as Record<string, unknown> | undefined;
  const headers = Array.isArray(payload?.headers) ? payload.headers as Array<{ name?: string; value?: string }> : [];
  const from = extractHeader(headers, "From");
  const subject = extractHeader(headers, "Subject");
  const receivedAtRaw = extractHeader(headers, "Date");
  const receivedAt = receivedAtRaw ? new Date(receivedAtRaw).toISOString() : new Date().toISOString();
  const text = extractTextFromPayload(payload);

  return {
    providerMessageId: String(raw.id ?? ""),
    historyId: raw.historyId ? String(raw.historyId) : null,
    fromAddress: from,
    subject,
    receivedAt,
    body: text,
    rawMetadata: {
      threadId: raw.threadId ?? null,
      labelIds: raw.labelIds ?? [],
      snippet: raw.snippet ?? null,
    },
  };
}

export async function syncGoogleMailboxForCompany(companyId: string): Promise<GmailSyncSummary> {
  const supabase = createSupabaseAdminClient();
  const { data: connection, error: connectionError } = await supabase
    .from("email_connections")
    .select("id, company_id, provider, status, last_sync_at")
    .eq("company_id", companyId)
    .eq("provider", "google")
    .eq("status", "connected")
    .maybeSingle();

  if (connectionError || !connection) {
    throw new Error("gmail_connection_not_found");
  }

  const { accessToken } = await getValidAccessToken(connection.id);
  const sinceIso = connection.last_sync_at ? new Date(connection.last_sync_at).toISOString() : null;
  const messageIds = await listGmailMessageIds(accessToken, sinceIso);

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const messageId of messageIds) {
    const existing = await supabase
      .from("gmail_message_events")
      .select("id")
      .eq("connection_id", connection.id)
      .eq("provider_message_id", messageId)
      .maybeSingle();

    if (existing.data) {
      skipped += 1;
      continue;
    }

    try {
      const rawMessage = await getGmailMessage(accessToken, messageId);
      const parsed = parseGmailMessage(rawMessage);

      const { error: insertError } = await supabase.from("gmail_message_events").insert({
        company_id: companyId,
        connection_id: connection.id,
        provider_message_id: parsed.providerMessageId,
        history_id: parsed.historyId,
        from_address: parsed.fromAddress,
        subject: parsed.subject,
        received_at: parsed.receivedAt,
        status: "processed",
        raw_metadata: parsed.rawMetadata,
      });

      if (insertError) {
        errors.push(insertError.message || "gmail_message_insert_failed");
        continue;
      }

      created += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "gmail_message_processing_failed";
      errors.push(message);
    }
  }

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabase.from("email_connections").update({
    last_sync_at: nowIso,
    status: errors.length > 0 ? "error" : "connected",
    last_error_code: errors.length > 0 ? "gmail_sync_partial" : null,
    updated_at: nowIso,
  }).eq("id", connection.id);

  if (updateError) {
    errors.push(updateError.message || "gmail_status_update_failed");
  }

  return {
    ok: errors.length === 0 || created > 0,
    provider: "google",
    companyId,
    connectionId: connection.id,
    created,
    skipped,
    errors,
    lastSyncAt: nowIso,
  };
}
