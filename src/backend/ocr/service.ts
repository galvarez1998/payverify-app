import "server-only";

import { GoogleAuth } from "google-auth-library";
import { getGoogleVisionConfig } from "@/backend/config/env";

export const OCR_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type OcrAllowedMimeType = (typeof OCR_ALLOWED_MIME_TYPES)[number];

export type OcrExtraction = {
  amountCop: number | null;
  date: string | null;
  time: string | null;
  reference: string | null;
  authorizationNumber: string | null;
  sourceBank: string | null;
  destinationBank: string | null;
};

export type OcrResult = {
  fullText: string;
  extraction: OcrExtraction;
};

type VisionResponse = {
  responses?: Array<{
    fullTextAnnotation?: { text?: string };
    error?: { message?: string };
  }>;
};

const VISION_SCOPE = "https://www.googleapis.com/auth/cloud-vision";
const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

export function validateOcrFile(file: { type: string; size: number }): void {
  const config = getGoogleVisionConfig();
  if (!(OCR_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new OcrInputError("unsupported_file_type", 400);
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new OcrInputError("empty_file", 400);
  }
  if (file.size > config.maxFileSizeBytes) {
    throw new OcrInputError("file_too_large", 413);
  }
}

/** Ejecuta DOCUMENT_TEXT_DETECTION sin exponer credenciales al navegador. */
export async function detectDocumentText(file: File): Promise<OcrResult> {
  validateOcrFile(file);
  const config = getGoogleVisionConfig();
  const imageContent = Buffer.from(await file.arrayBuffer()).toString("base64");
  const auth = new GoogleAuth({
    credentials: { client_email: config.clientEmail, private_key: config.privateKey },
    projectId: config.projectId,
    scopes: [VISION_SCOPE],
  });
  const client = await auth.getClient();
  const tokenResult = await client.getAccessToken();
  const accessToken = typeof tokenResult === "string" ? tokenResult : tokenResult.token;
  if (!accessToken) throw new Error("No se pudo obtener un token de Google Cloud Vision.");

  const response = await fetch(VISION_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        image: { content: imageContent },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Cloud Vision respondió con HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as VisionResponse;
  const result = payload.responses?.[0];
  if (result?.error) throw new Error(result.error.message || "Google Cloud Vision rechazó la imagen.");
  const fullText = result?.fullTextAnnotation?.text?.trim() ?? "";
  return { fullText, extraction: extractTransferFields(fullText) };
}

/**
 * Parser deliberadamente conservador: solo devuelve un valor cuando aparece
 * junto a una etiqueta explícita. No confirma pagos ni inventa información.
 */
export function extractTransferFields(text: string): OcrExtraction {
  const normalized = text.replace(/\r/g, "");
  return {
    amountCop: parseAmount(findLabeledValue(normalized, [/valor/i, /monto/i, /total/i])),
    date: parseDate(findLabeledValue(normalized, [/fecha/i])),
    time: parseTime(findLabeledValue(normalized, [/hora/i])),
    reference: findLabeledValue(normalized, [/referencia/i, /ref\.?/i]),
    authorizationNumber: findLabeledValue(normalized, [/n[úu]mero de autorizaci[óo]n/i, /autorizaci[óo]n/i]),
    sourceBank: findLabeledValue(normalized, [/banco de origen/i, /banco origen/i]),
    destinationBank: findLabeledValue(normalized, [/banco de destino/i, /banco destino/i]),
  };
}

function findLabeledValue(text: string, labels: RegExp[]): string | null {
  for (const line of text.split("\n")) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    if (labels.some((label) => label.test(cleanLine))) {
      const value = cleanLine.replace(/^[^:：-]+[:：-]\s*/, "").trim();
      if (value && !labels.some((label) => label.test(value))) return value;
    }
  }
  return null;
}

function parseAmount(value: string | null): number | null {
  if (!value) return null;
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function parseDate(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function parseTime(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}${match[3] ? `:${match[3]}` : ""}` : null;
}

export class OcrInputError extends Error {
  constructor(public readonly code: "unsupported_file_type" | "empty_file" | "file_too_large", public readonly status: 400 | 413) {
    super(code);
    this.name = "OcrInputError";
  }
}
