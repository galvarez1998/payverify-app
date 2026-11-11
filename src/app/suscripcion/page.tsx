"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value || 0);
}

type Plan = {
  id: string;
  key: string;
  name: string;
  monthly_price_cop: number;
  verification_limit: number;
  branch_limit?: number | null;
  employee_limit?: number | null;
};

type Subscription = {
  id: string;
  status: string;
  plan_id?: string | null;
  plans?: Plan | null;
};

const statusOptions = ["trialing", "active", "past_due", "cancelled", "suspended"];

export default function SuscripcionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [subscriptionResponse, plansResponse] = await Promise.all([
        fetch("/api/subscriptions", { cache: "no-store" }),
        fetch("/api/plans", { cache: "no-store" }),
      ]);

      const subscriptionPayload = await subscriptionResponse.json().catch(() => ({}));
      const plansPayload = await plansResponse.json().catch(() => ({}));

      if (!subscriptionResponse.ok) throw new Error(subscriptionPayload?.message || subscriptionPayload?.error || "No se pudo cargar la suscripción");
      if (!plansResponse.ok) throw new Error(plansPayload?.message || plansPayload?.error || "No se pudieron cargar los planes");

      setSubscription(subscriptionPayload.subscription ?? null);
      setPlans(Array.isArray(plansPayload.plans) ? plansPayload.plans : []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos de suscripción");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleStatusChange(nextStatus: string) {
    try {
      setUpdating(true);
      const response = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || payload?.error || "No se pudo actualizar el estado");
      setSubscription((current) => ({ ...(current ?? { id: "", status: nextStatus }), status: nextStatus }));
      await loadData();
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "No se pudo actualizar la suscripción");
    } finally {
      setUpdating(false);
    }
  }

  async function handlePlanChange(planId: string) {
    try {
      setUpdating(true);
      const response = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || payload?.error || "No se pudo cambiar el plan");
      await loadData();
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "No se pudo cambiar el plan");
    } finally {
      setUpdating(false);
    }
  }

  const activePlan = plans.find((plan) => plan.id === subscription?.plan_id) ?? (subscription?.plans ?? null);
  const monthlyPrice = Number(activePlan?.monthly_price_cop ?? 0);
  const verificationLimit = Number(activePlan?.verification_limit ?? 0);

  return (
    <AppShell active="Suscripción">
      <div className="space-y-6">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Cargando suscripción...</div>
        ) : (
          <>
            <Card title="Suscripción actual" description="Plan activo y consumo del mes">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-brand-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-brand-600">Plan actual</div><div className="mt-3 text-2xl font-bold text-slate-900">{activePlan?.name ?? "Sin plan"}</div></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Costo</div><div className="mt-3 text-2xl font-bold text-slate-900">{formatCOP(monthlyPrice)}</div></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Límite</div><div className="mt-3 text-2xl font-bold text-slate-900">{verificationLimit.toLocaleString("es-CO")}</div></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado</div><div className="mt-3 text-2xl font-bold text-slate-900">{subscription?.status ?? "Sin estado"}</div></div>
              </div>
            </Card>

            <Card title="Estado y plan" description="Actualiza el estado de la suscripción o cambia el plan activo">
              <div className="mb-5 grid gap-3 md:grid-cols-5">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updating || subscription?.status === status}
                    onClick={() => void handleStatusChange(status)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium ${subscription?.status === status ? "bg-brand-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    disabled={updating || activePlan?.id === plan.id}
                    onClick={() => void handlePlanChange(plan.id)}
                    className={`rounded-2xl border p-4 text-left ${activePlan?.id === plan.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{plan.key}</div>
                    <div className="mt-3 text-xl font-bold text-slate-900">{plan.name}</div>
                    <div className="mt-2 text-sm text-slate-600">{formatCOP(plan.monthly_price_cop)}</div>
                    <div className="mt-1 text-xs text-slate-500">{plan.verification_limit.toLocaleString("es-CO")} verificaciones</div>
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
