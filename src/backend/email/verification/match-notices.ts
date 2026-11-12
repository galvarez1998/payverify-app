import "server-only";

import { createSupabaseAdminClient } from "@/backend/supabase/admin";

export type VerificationDecision = {
  status: "matched" | "pending" | "rejected" | "unidentified";
  reason: string;
  matchedFields: string[];
  differences: string[];
  proofId: string | null;
  noticeId: string | null;
  matchScore: number;
};

function normalizeReference(value: string | null | undefined): string {
  return String(value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function normalizeAmount(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function dateDiffDays(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const first = new Date(a);
  const second = new Date(b);
  if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) return null;
  return Math.abs(first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24);
}

function percentDifference(a: number | null, b: number | null): number | null {
  if (a === null || b === null || a === 0 || b === 0) return null;
  return Math.abs((a - b) / a) * 100;
}

function capitalize(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.trim() || null;
}

export async function processCompanyNoticeMatches(companyId: string): Promise<{ processed: number; created: number; results: VerificationDecision[] }> {
  const db = createSupabaseAdminClient();
  const { data: notices, error: noticesError } = await db
    .from("bank_email_notices")
    .select("id, company_id, provider_message_id, amount_cop, reference, bank_name, operation_date, sender_name, recipient_name, status, parsed_payload")
    .eq("company_id", companyId)
    .in("status", ["candidate", "pending", "unclassified"])
    .order("received_at", { ascending: false });

  if (noticesError) throw new Error(noticesError.message || "bank_notice_query_failed");

  const { data: proofs, error: proofsError } = await db
    .from("proof_documents")
    .select("id, company_id, amount_cop, bank_name, reference, occurred_at, recipient_account_last4, status")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (proofsError) throw new Error(proofsError.message || "proof_documents_query_failed");

  const processed: VerificationDecision[] = [];
  let created = 0;

  for (const notice of notices ?? []) {
    const noticeReference = normalizeReference(notice.reference);
    const noticeAmount = normalizeAmount(notice.amount_cop);
    const noticeDate = notice.operation_date ? new Date(notice.operation_date).toISOString() : null;

    let bestCandidate: { proof: any; score: number; matchedFields: string[]; differences: string[] } | null = null;

    for (const proof of proofs ?? []) {
      const proofReference = normalizeReference(proof.reference);
      const proofAmount = normalizeAmount(proof.amount_cop);
      const proofDate = proof.occurred_at ? new Date(proof.occurred_at).toISOString() : null;
      const dateDelta = dateDiffDays(noticeDate, proofDate);
      const amountDelta = percentDifference(noticeAmount, proofAmount);

      let score = 0;
      const matchedFields: string[] = [];
      const differences: string[] = [];

      if (noticeReference && proofReference) {
        if (noticeReference === proofReference) {
          score += 45;
          matchedFields.push("reference");
        } else {
          differences.push("reference");
        }
      }

      if (noticeAmount !== null && proofAmount !== null) {
        if (noticeAmount === proofAmount) {
          score += 35;
          matchedFields.push("amount_cop");
        } else if (amountDelta !== null && amountDelta <= 5) {
          score += 20;
          matchedFields.push("amount_cop");
        } else {
          differences.push("amount_cop");
        }
      }

      if (noticeDate && proofDate) {
        if (dateDelta !== null && dateDelta <= 2) {
          score += 15;
          matchedFields.push("operation_date");
        } else {
          differences.push("operation_date");
        }
      }

      if (capitalizedBankName(notice.bank_name) && capitalizedBankName(proof.bank_name)) {
        if (normalizeBankName(notice.bank_name) === normalizeBankName(proof.bank_name)) {
          score += 10;
          matchedFields.push("bank_name");
        } else {
          differences.push("bank_name");
        }
      }

      if (noticeReference === "" && proofReference === "") {
        score -= 15;
      }

      if (!bestCandidate || score > bestCandidate.score) {
        bestCandidate = { proof, score, matchedFields, differences };
      }
    }

    let decision: VerificationDecision;

    if (!bestCandidate) {
      decision = {
        status: "unidentified",
        reason: "No se encontró un comprobante relacionado con la notificación bancaria.",
        matchedFields: [],
        differences: ["proof_not_found"],
        proofId: null,
        noticeId: notice.id,
        matchScore: 0,
      };
    } else if (bestCandidate.score >= 70 && bestCandidate.differences.length === 0) {
      decision = {
        status: "matched",
        reason: "El comprobante coincide con la notificación bancaria en campos clave.",
        matchedFields: bestCandidate.matchedFields,
        differences: [],
        proofId: bestCandidate.proof.id,
        noticeId: notice.id,
        matchScore: bestCandidate.score,
      };
    } else if (bestCandidate.score >= 50 && bestCandidate.score < 70) {
      decision = {
        status: "pending",
        reason: "Existe coincidencia parcial, pero faltan evidencias o hay diferencias por revisar.",
        matchedFields: bestCandidate.matchedFields,
        differences: bestCandidate.differences,
        proofId: bestCandidate.proof.id,
        noticeId: notice.id,
        matchScore: bestCandidate.score,
      };
    } else if (bestCandidate.score >= 20 && (bestCandidate.differences.includes("amount_cop") || bestCandidate.differences.includes("reference"))) {
      decision = {
        status: "rejected",
        reason: "El comprobante presenta diferencias relevantes con la notificación bancaria.",
        matchedFields: bestCandidate.matchedFields,
        differences: bestCandidate.differences,
        proofId: bestCandidate.proof.id,
        noticeId: notice.id,
        matchScore: bestCandidate.score,
      };
    } else {
      decision = {
        status: "unidentified",
        reason: "No fue posible asociar la notificación a un comprobante con una confianza suficiente.",
        matchedFields: bestCandidate.matchedFields,
        differences: bestCandidate.differences,
        proofId: bestCandidate.proof.id,
        noticeId: notice.id,
        matchScore: bestCandidate.score,
      };
    }

    const { error: eventError } = await db.from("verification_events").insert({
      company_id: companyId,
      proof_id: decision.proofId,
      status: decision.status,
      reason: decision.reason,
      matched_fields: decision.matchedFields,
      evidence: {
        notice_id: notice.id,
        notice_reference: notice.reference,
        notice_amount_cop: notice.amount_cop,
        notice_bank_name: notice.bank_name,
        notice_operation_date: notice.operation_date,
        proof_id: decision.proofId,
        match_score: decision.matchScore,
        differences: decision.differences,
      },
    });

    if (!eventError) {
      created += 1;
    }

    await db.from("bank_email_notices")
      .update({ status: decision.status === "matched" ? "matched" : decision.status === "pending" ? "pending" : decision.status === "rejected" ? "rejected" : "unclassified", updated_at: new Date().toISOString() })
      .eq("id", notice.id);

    if (decision.proofId) {
      await db.from("proof_documents")
        .update({ status: decision.status === "matched" ? "matched" : decision.status === "pending" ? "pending" : decision.status === "rejected" ? "rejected" : "unidentified", updated_at: new Date().toISOString() })
        .eq("id", decision.proofId);
    }

    processed.push(decision);
  }

  return {
    processed: processed.length,
    created,
    results: processed,
  };
}

function capitalizedBankName(value: string | null | undefined): string | null {
  if (!value) return null;
  return String(value).trim() || null;
}

function normalizeBankName(value: string | null | undefined): string | null {
  if (!value) return null;
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "").trim() || null;
}
