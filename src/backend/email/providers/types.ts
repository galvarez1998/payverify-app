import type { EmailProviderId } from "./types";

export type OAuthTokenSet = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  scopes: string[];
};

export type EmailIdentity = {
  email: string;
  displayName: string | null;
  providerUserId: string | null;
};

export type EmailProviderAdapter = {
  readonly id: EmailProviderId;
  buildAuthorizationUrl(state: string): URL;
  exchangeAuthorizationCode(code: string): Promise<OAuthTokenSet>;
  getIdentity(accessToken: string): Promise<EmailIdentity>;
};

// Optional capabilities stay separate so a provider can be replaced or added
// without forcing all providers to implement the same webhook/sync features.
export type MailboxSyncAdapter = {
  createOrRenewWatch(connectionId: string): Promise<{ expiresAt: string; cursor: string | null }>;
  listChangedMessageIds(connectionId: string, cursor: string | null): Promise<{ ids: string[]; cursor: string | null }>;
  getMinimalMessage(connectionId: string, providerMessageId: string): Promise<MinimalProviderMessage>;
};

export type MinimalProviderMessage = {
  providerMessageId: string;
  from: string | null;
  subject: string | null;
  receivedAt: string | null;
  textBody: string | null;
};

export type EmailProviderId = "google" | "microsoft";
