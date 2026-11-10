import "server-only";
import type { EmailProviderAdapter, EmailProviderId } from "./types";
import { GoogleGmailOAuthAdapter, MicrosoftGraphOAuthAdapter } from "./oauth-adapters";

const adapters: Record<EmailProviderId, EmailProviderAdapter> = {
  google: new GoogleGmailOAuthAdapter(),
  microsoft: new MicrosoftGraphOAuthAdapter(),
};

export function getEmailProviderAdapter(id: string): EmailProviderAdapter | null {
  return Object.prototype.hasOwnProperty.call(adapters, id) ? adapters[id as EmailProviderId] : null;
}

// Add/replace providers here; routes depend only on the adapter contract.
