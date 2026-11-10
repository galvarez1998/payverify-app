import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { initialCompanies } from "@/lib/demo-data";
import { formatCOP } from "@/lib/utils";
import { Building2, CircleDollarSign, ShieldCheck, Sparkles } from "lucide-react";

export default function SuperAdminPage() {
  return (
    <AppShell active="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">Empresas</span><div className="mt-4 text-3xl font-bold text-slate-900">3</div><p className="mt-1 text-sm text-slate-500">Registradas</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Activas</span><div className="mt-4 text-3xl font-bold text-slate-900">2</div><p className="mt-1 text-sm text-slate-500">Empresas operando</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">Suspendidas</span><div className="mt-4 text-3xl font-bold text-slate-900">1</div><p className="mt-1 text-sm text-slate-500">Requieren atención</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">MRR</span><div className="mt-4 text-3xl font-bold text-slate-900">{formatCOP(1840000)}</div><p className="mt-1 text-sm text-slate-500">Mensual</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">Verificaciones</span><div className="mt-4 text-3xl font-bold text-slate-900">24.900</div><p className="mt-1 text-sm text-slate-500">Total</p></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <Card title="Clientes" description="Listado de compañías activas y suspendidas">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Empresa</th>
                    <th className="py-3 pr-4 font-medium">Plan</th>
                    <th className="py-3 pr-4 font-medium">Estado</th>
                    <th className="py-3 pr-4 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {initialCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-slate-200 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{company.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{company.plan}</td>
                      <td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${company.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{company.status}</span></td>
                      <td className="py-3 pr-4 text-slate-800">{formatCOP(company.mrr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Resumen global" description="Indicadores principales">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-brand-600" />Empresas activas</div><span className="font-semibold text-slate-900">2</span></div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-3"><CircleDollarSign className="h-4 w-4 text-emerald-600" />MRR</div><span className="font-semibold text-slate-900">{formatCOP(1840000)}</span></div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-amber-600" />Plan más vendido</div><span className="font-semibold text-slate-900">Pro</span></div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-brand-600" />Suscripciones</div><span className="font-semibold text-slate-900">84%</span></div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
