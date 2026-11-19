import "server-only";

import { GoogleAuth } from "google-auth-library";
import { getGoogleVisionConfig } from "@/backend/config/env";
import { OCR_ALLOWED_MIME_TYPES, OcrInputError, type OcrResult, extractTransferFields, validateOcrFile } from "@/backend/ocr/service";

export async function detectDocumentTextFromBuffer(buffer: Buffer, mimeType: string): Promise<OcrResult> {
  const file = new File([buffer], "whatsapp-proof", { type: mimeType });
  validateOcrFile({ type: mimeType, size: buffer.byteLength });
  if (!(OCR_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) throw new OcrInputError("unsupported_file_type", 400);
  const config = getGoogleVisionConfig();
  const auth = new GoogleAuth({ credentials: { client_email: config.clientEmail, private_key: config.privateKey }, projectId: config.projectId, scopes: ["https://www.googleapis.com/auth/cloud-vision"] });
  const client = await auth.getClient();
  const tokenResult = await client.getAccessToken();
  const accessToken = typeof tokenResult === "string" ? tokenResult : tokenResult.token;
  if (!accessToken) throw new Error("vision_access_token_missing");
  const response = await fetch("https://vision.googleapis.com/v1/images:annotate", {
    method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ image: { content: buffer.toString("base64") }, features: [{ type: "DOCUMENT_TEXT_DETECTION" }] }] }), cache: "no-store",
  });
  if (!response.ok) throw new Error(`vision_http_${response.status}`);
  const payload = await response.json() as { responses?: Array<{ fullTextAnnotation?: { text?: string }; error?: { message?: string } }> };
  const result = payload.responses?.[0];
  if (result?.error) throw new Error(result.error.message || "vision_rejected_image");
  const fullText = result?.fullTextAnnotation?.text?.trim() ?? "";
  return { fullText, extraction: extractTransferFields(fullText) };
}
