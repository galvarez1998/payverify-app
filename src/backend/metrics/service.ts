import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCompanySubscriptionState(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("subscriptions")
    .select("id, status, period_start, period_end, plans(id, key, name, monthly_price_cop, verification_limit, branch_limit, employee_limit)")
    .eq("company_id", companyId)
    .maybeSingle();
}

export async function listCompanyVerificationEvents(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("verification_events")
    .select("id, status, created_at, reason, proof_documents(reference, amount_cop), bank_movements(reference, amount_cop)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(10);
}

export async function listCompanyMovements(supabase: SupabaseClient, companyId: string) {
  return supabase
    .from("bank_movements")
    .select("id, bank_name, amount_cop, reference, operation_status, sender_name, recipient_name, occurred_at")
    .eq("company_id", companyId)
    .order("occurred_at", { ascending: false })
    .limit(10);
}

export async function getCompanyTotals(supabase: SupabaseClient, companyId: string) {
  const [verificationStats, movementStats] = await Promise.all([
    supabase.from("verification_events").select("status").eq("company_id", companyId),
    supabase.from("bank_movements").select("amount_cop, operation_status").eq("company_id", companyId),
  ]);

  const totals = {
    verificationEvents: verificationStats.data ?? [],
    bankMovements: movementStats.data ?? [],
  };

  const approved = totals.verificationEvents.filter((item) => String(item.status).toLowerCase() === "confirmed").length;
  const pending = totals.verificationEvents.filter((item) => String(item.status).toLowerCase() === "pending").length;
  const rejected = totals.verificationEvents.filter((item) => String(item.status).toLowerCase() === "rejected").length;
  const totalIncome = totals.bankMovements.reduce((sum, item) => sum + Number(item.amount_cop ?? 0), 0);

  return {
    approved,
    pending,
    rejected,
    totalIncome,
    verificationCount: totals.verificationEvents.length,
    movementCount: totals.bankMovements.length,
  };
}

export async function updateCompanySubscription(supabase: SupabaseClient, companyId: string, input: { status?: string; planId?: string }) {
  const payload: Record<string, unknown> = {};
  if (input.status) payload.status = input.status;
  if (input.planId) payload.plan_id = input.planId;
  if (Object.keys(payload).length === 0) {
    return { data: null, error: new Error("subscription_no_changes") };
  }

  return supabase
    .from("subscriptions")
    .update(payload)
    .eq("company_id", companyId)
    .select("id, company_id, status, plan_id")
    .single();
}

export async function updateVerificationEventStatus(supabase: SupabaseClient, eventId: string, input: { status: string; reason?: string }) {
  const status = String(input.status ?? "pending");
  const payload: Record<string, unknown> = {
    status: status as "matched" | "pending" | "rejected" | "unidentified" | "confirmed",
  };
  if (typeof input.reason === "string") payload.reason = input.reason.trim() || null;

  return supabase
    .from("verification_events")
    .update(payload)
    .eq("id", eventId)
    .select("id, status, reason, company_id")
    .single();
}
