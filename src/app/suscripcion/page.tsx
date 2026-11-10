import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { plans } from "@/lib/demo-data";
import { formatCOP } from "@/lib/utils";
import { CreditCard, RefreshCcw } from "lucide-react";

export default function SuscripcionPage() {
  return (
    <AppShell active="Suscripción">
      <div className="space-y-6">
        <Card title="Suscripción actual" description="Plan activo y consumo del mes">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-brand-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-brand-600">Plan actual</div><div className="mt-3 text-2xl font-bold text-slate-900">Pro</div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Consumo</div><div className="mt-3 text-2xl font-bold text-slate-900">1.840</div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Disponibles</div><div className="mt-3 text-2xl font-bold text-slate-900">660</div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Renovación</div><div className="mt-3 text-2xl font-bold text-slate-900">15/12</div></div>
          </div>
        </Card>

        <Card title="Planes disponibles" description="Cambio de plan en modo demo" action={<button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white"><RefreshCcw className="h-4 w-4" />Cambiar de plan</button>}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div key={plan.key} className={`rounded-2xl border p-4 ${plan.key === "pro" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-slate-900">{plan.name}</div>
                  {plan.key === "pro" && <span className="rounded-full bg-brand-500 px-2 py-1 text-[10px] font-semibold text-white">Actual</span>}
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">{formatCOP(plan.price)}</div>
                <div className="mt-2 text-sm text-slate-500">{plan.verifications} verificaciones</div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div>{plan.branches}</div>
                  <div>{plan.employees}</div>
                </div>
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><CreditCard className="h-4 w-4" />Seleccionar</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
