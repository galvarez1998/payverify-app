import "server-only";

import { PubSub } from "@google-cloud/pubsub";
import { OAuth2Client } from "google-auth-library";
import { createSupabaseAdminClient } from "@/backend/supabase/admin";

const GOOGLE_TOPIC = process.env.GOOGLE_PUBSUB_TOPIC || "payverify-gmail-events";
const GOOGLE_AUDIENCE = process.env.GOOGLE_PUBSUB_AUDIENCE || "projects/payverify-dev/topics/payverify-gmail-events";
const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_PUBSUB_SERVICE_ACCOUNT || "service-account@payverify-dev.iam.gserviceaccount.com";

export type GmailPubSubMessage = {
  emailAddress: string;
  historyId: string;
  provider: "google";
  companyId: string;
  connectionId: string;
};

export function getGooglePubSubClient() {
  return new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT || "payverify-dev" });
}

export function getGoogleWebhookVerifier() {
  const audience = GOOGLE_AUDIENCE;
  const serviceAccount = GOOGLE_SERVICE_ACCOUNT;
  const configuredCertificate = process.env.GOOGLE_PUBSUB_CERTIFICATE || "";

  return {
    async verify(jwtHeader: string, payload: any) {
      if (!jwtHeader || !payload) throw new Error("invalid_pubsub_payload");

      if (!configuredCertificate) {
        if (typeof payload === "object" && payload?.aud && payload?.iss) {
          return payload;
        }
        throw new Error("google_pubsub_verification_disabled");
      }

      const client = new OAuth2Client();
      const certs = {
        default: configuredCertificate,
      } as const;

      const ticket = await client.verifySignedJwtWithCertsAsync(
        jwtHeader,
        certs,
        "https://pubsub.googleapis.com/",
        [audience]
      );

      const claims = ticket.getPayload();
      if (!claims) throw new Error("invalid_pubsub_claims");
      if (claims.aud !== audience) throw new Error("invalid_pubsub_audience");
      if (claims.iss !== serviceAccount) throw new Error("invalid_pubsub_issuer");
      if (!claims.email_verified) throw new Error("pubsub_email_unverified");

      return claims;
    },
  };
}

export async function createGoogleWatch(companyId: string, connectionId: string, emailAddress: string) {
  const supabase = createSupabaseAdminClient();
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(emailAddress)}/watch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GOOGLE_TEST_ACCESS_TOKEN || ""}` },
    body: JSON.stringify({
      topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT || "payverify-dev"}/topics/${GOOGLE_TOPIC}`,
      labelIds: ["INBOX"],
      labelFilterAction: "include",
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`gmail_watch_failed:${text.slice(0, 160)}`);
  }

  const payload = await response.json().catch(() => ({}));
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

  await supabase.from("email_sync_runs").insert({
    company_id: companyId,
    connection_id: connectionId,
    status: "succeeded",
    history_id: String(payload.historyId ?? ""),
    cursor: String(payload.historyId ?? ""),
    metadata: { emailAddress, topic: GOOGLE_TOPIC, startedAt: new Date().toISOString(), expiry },
    finished_at: new Date().toISOString(),
  });

  return { expiry, historyId: String(payload.historyId ?? "") };
}

export async function renewGoogleWatch(companyId: string, connectionId: string, emailAddress: string) {
  return createGoogleWatch(companyId, connectionId, emailAddress);
}

export async function saveGoogleWebhookEvent(input: { companyId: string; connectionId: string; provider: "google"; historyId: string; emailAddress: string }) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("email_sync_runs").insert({
    company_id: input.companyId,
    connection_id: input.connectionId,
    status: "queued",
    history_id: input.historyId,
    cursor: input.historyId,
    metadata: {
      provider: input.provider,
      emailAddress: input.emailAddress,
      receivedAt: new Date().toISOString(),
    },
  });

  if (error) throw new Error(error.message || "webhook_event_save_failed");
}
