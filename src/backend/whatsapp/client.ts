import "server-only";

import { getWhatsAppConfig, getWhatsAppGraphUrl } from "@/backend/config/integrations";

export async function downloadWhatsAppMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const config = getWhatsAppConfig();
  const metadataResponse = await fetch(getWhatsAppGraphUrl(config.graphApiVersion, mediaId), {
    headers: { Authorization: `Bearer ${config.accessToken}` },
    cache: "no-store",
  });
  if (!metadataResponse.ok) throw new Error("whatsapp_media_metadata_failed");
  const metadata = (await metadataResponse.json()) as { url?: string; mime_type?: string };
  if (!metadata.url || !metadata.mime_type) throw new Error("whatsapp_media_metadata_invalid");

  const mediaResponse = await fetch(metadata.url, {
    headers: { Authorization: `Bearer ${config.accessToken}` },
    cache: "no-store",
  });
  if (!mediaResponse.ok) throw new Error("whatsapp_media_download_failed");
  const buffer = Buffer.from(await mediaResponse.arrayBuffer());
  return { buffer, mimeType: metadata.mime_type };
}

export async function sendWhatsAppText(phoneNumberId: string, recipient: string, body: string): Promise<void> {
  const config = getWhatsAppConfig();
  const response = await fetch(getWhatsAppGraphUrl(config.graphApiVersion, `${phoneNumberId}/messages`), {
    method: "POST",
    headers: { Authorization: `Bearer ${config.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: recipient, type: "text", text: { body } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("whatsapp_send_message_failed");
}
