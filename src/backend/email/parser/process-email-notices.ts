import "server-only";

import { createSupabaseAdminClient } from "@/backend/supabase/admin";
import { parseBankNoticeMessage } from "@/backend/email/parser/bank-notice-parser";

export async function processQueuedBankMessagesForCompany(companyId: string) {
  const db = createSupabaseAdminClient();

  const { data: pendingMessages, error } = await db
    .from("gmail_message_events")
    .select("id, company_id, connection_id, provider_message_id, from_address, subject, received_at, raw_metadata")
    .eq("company_id", companyId)
    .eq("status", "processed")
    .limit(50);

  if (error) throw new Error(error.message || "gmail_message_query_failed");

  let created = 0;
  for (const message of pendingMessages ?? []) {
    const { data: existingNotice } = await db
      .from("bank_email_notices")
      .select("id")
      .eq("company_id", companyId)
      .eq("provider_message_id", message.provider_message_id)
      .maybeSingle();

    if (existingNotice) continue;

    const parsed = parseBankNoticeMessage({
      messageId: message.provider_message_id,
      subject: message.subject,
      body: JSON.stringify(message.raw_metadata ?? {}),
      from: message.from_address,
    });

    if (!parsed.isBankNotification) {
      continue;
    }

    const { error: insertError } = await db.from("bank_email_notices").insert({
      company_id: companyId,
      connection_id: message.connection_id,
      provider_message_id: message.provider_message_id,
      bank_name: parsed.bankName,
      amount_cop: parsed.amountCop,
      currency: parsed.currency,
      reference: parsed.reference,
      sender_name: parsed.senderName,
      recipient_name: parsed.recipientName,
      sender_email: message.from_address,
      operation_date: parsed.operationDate ? new Date(parsed.operationDate).toISOString() : null,
      received_at: message.received_at,
      subject: parsed.subject,
      message_body: parsed.rawText,
      parsed_payload: parsed.parsedPayload,
      status: parsed.amountCop && parsed.reference ? "candidate" : "unclassified",
    });

    if (!insertError) {
      created += 1;
    }
  }

  return { created };
}
