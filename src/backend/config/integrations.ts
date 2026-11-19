import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getGoogleVisionConfig } from "@/backend/config/env";

export type WhatsAppConfig = {
  accessToken: string;
  appSecret: string;
  verifyToken: string;
  graphApiVersion: string;
};

export function getWhatsAppConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v21.0";
  if (!accessToken || !appSecret || !verifyToken) {
    throw new Error("WhatsApp Cloud API no está configurada en el servidor.");
  }
  return { accessToken, appSecret, verifyToken, graphApiVersion };
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_APP_SECRET && process.env.WHATSAPP_VERIFY_TOKEN);
}

export function getWhatsAppWebhookConfig(): Pick<WhatsAppConfig, "verifyToken" | "appSecret"> {
  const config = getWhatsAppConfig();
  return { verifyToken: config.verifyToken, appSecret: config.appSecret };
}

export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null, appSecret = getWhatsAppConfig().appSecret): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = Buffer.from(`sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`);
  const received = Buffer.from(signatureHeader);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function getWhatsAppGraphUrl(version: string, path: string): string {
  return `https://graph.facebook.com/${version}/${path.replace(/^\//, "")}`;
}

export function getOcrFileLimit(): number {
  try {
    return getGoogleVisionConfig().maxFileSizeBytes;
  } catch {
    return 10 * 1024 * 1024;
  }
}
