import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/backend/supabase/admin";
import { detectDocumentTextFromBuffer } from "@/backend/ocr/service";
import { downloadWhatsAppMedia, sendWhatsAppText } from "@/backend/whatsapp/client";

export type WhatsAppWebhookMessage = {
  id: string;
  from: string;
  timestamp?: string;
  type?: string;
  image?: { id?: string; mime_type?: string; caption?: string };
  text?: { body?: string };
};

export async function processWhatsAppImage(message: WhatsAppWebhookMessage, phoneNumberId: string, companyId: string) {
  const db = createSupabaseAdminClient();
  const mediaId = message.image?.id;
  if (!mediaId) throw new Error("whatsapp_image_media_id_missing");

  const media = await downloadWhatsAppMedia(mediaId);
  const ocr = await detectDocumentTextFromBuffer(media.buffer, media.mimeType);
  const occurredAt = ocr.extraction.date && ocr.extraction.time
    ? `${ocr.extraction.date}T${ocr.extraction.time}:00-05:00`
    : null;

  const { data: proof, error: proofError } = await db.from("proof_documents").insert({
    company_id: companyId,
    amount_cop: ocr.extraction.amountCop,
    bank_name: ocr.extraction.sourceBank ?? ocr.extraction.destinationBank,
    reference: ocr.extraction.reference,
    operation_id: ocr.extraction.authorizationNumber,
    occurred_at: occurredAt,
    status: "pending",
    created_by: null,
    extraction_data: {
      source: "whatsapp",
      whatsapp_message_id: message.id,
      whatsapp_media_id: mediaId,
      ocr: { full_text: ocr.fullText, ...ocr.extraction },
    },
  }).select("id").single();
  if (proofError || !proof) throw new Error("whatsapp_proof_insert_failed");

  await db.from("verification_events").insert({
    company_id: companyId,
    proof_id: proof.id,
    status: "pending",
    reason: "Comprobante recibido por WhatsApp; requiere revisión manual.",
    evidence: { source: "whatsapp", message_id: message.id, ocr: ocr.extraction },
    checked_by: null,
  });
  await db.from("audit_logs").insert({
    company_id: companyId,
    action: "whatsapp_ocr_processed",
    entity_type: "proof_document",
    entity_id: proof.id,
    metadata: { message_id: message.id, media_id: mediaId },
  });

  await sendWhatsAppText(phoneNumberId, message.from, "Recibimos tu comprobante. Quedó pendiente de revisión manual; el OCR no confirma el pago automáticamente.");
  return proof.id;
}

export async function processWhatsAppWebhook(rawBody: string): Promise<void> {
  const payload = JSON.parse(rawBody) as { entry?: Array<{ changes?: Array<{ value?: { metadata?: { phone_number_id?: string }; messages?: WhatsAppWebhookMessage[] } }> }> };
  const db = createSupabaseAdminClient();
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      if (!phoneNumberId) continue;
      const { data: connection } = await db.from("whatsapp_connections").select("company_id, phone_number_id").eq("phone_number_id", phoneNumberId).eq("status", "active").maybeSingle();
      if (!connection) continue;
      for (const message of value?.messages ?? []) {
        const { data: inserted, error } = await db.from("whatsapp_messages").insert({
          company_id: connection.company_id,
          provider_message_id: message.id,
          from_wa_id: message.from,
          phone_number_id: phoneNumberId,
          message_type: message.type ?? "unknown",
          text_body: message.text?.body ?? null,
          media_id: message.image?.id ?? null,
          media_mime_type: message.image?.mime_type ?? null,
          direction: "inbound",
          status: "received",
          raw_metadata: message,
        }).select("id").maybeSingle();
        if (error?.code === "23505") continue;
        if (error || !inserted) continue;
        try {
          if (message.type === "image") {
            await processWhatsAppImage(message, phoneNumberId, connection.company_id);
            await db.from("whatsapp_messages").update({ status: "processed" }).eq("id", inserted.id);
          } else {
            await db.from("whatsapp_messages").update({ status: "unsupported" }).eq("id", inserted.id);
            await sendWhatsAppText(phoneNumberId, message.from, "Recibimos tu mensaje. Envía el comprobante como imagen JPG, PNG o WEBP para procesarlo.");
          }
        } catch (error) {
          await db.from("whatsapp_messages").update({ status: "failed", error_message: error instanceof Error ? error.message : "processing_failed" }).eq("id", inserted.id);
          await db.from("audit_logs").insert({ company_id: connection.company_id, action: "whatsapp_processing_failed", entity_type: "whatsapp_message", metadata: { message_id: message.id } });
        }
      }
    }
  }
}

export async function listWhatsAppConnections(db: SupabaseClient, companyId: string) {
  return db.from("whatsapp_connections").select("id, phone_number_id, business_account_id, display_phone_number, status, last_event_at, created_at").eq("company_id", companyId).order("created_at", { ascending: false });
}
