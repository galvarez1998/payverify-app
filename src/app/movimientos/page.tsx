import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { getCompanyTotals, listCompanyMovements } from "@/backend/metrics/service";
import { formatCOP } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export default async function MovimientosPage() {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return (
      <AppShell active="Movimientos">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Debes iniciar sesión para ver los movimientos.</div>
      </AppShell>
    );
  }

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;

  if (!companyId) {
    return (
      <AppShell active="Movimientos">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">No hay una empresa activa asociada a esta sesión.</div>
      </AppShell>
    );
  }

  const [totals, movementsResult] = await Promise.all([
    getCompanyTotals(auth.supabase, companyId),
    listCompanyMovements(auth.supabase, companyId),
  ]);
  const movements = movementsResult.data ?? [];

  return (
    <AppShell active="Movimientos">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Pagos confirmados" description="Eventos confirmados">
            <div className="text-3xl font-bold text-slate-900">{totals.approved}</div>
          </Card>
          <Card title="Pagos pendientes" description="Pendientes de revisión">
            <div className="text-3xl font-bold text-slate-900">{totals.pending}</div>
          </Card>
          <Card title="Ingreso del mes" description="COP">
            <div className="text-3xl font-bold text-slate-900">{formatCOP(totals.totalIncome)}</div>
          </Card>
        </div>

        <Card title="Últimos movimientos" description="Eventos bancarios reales de la empresa actual">
          <div className="space-y-3">
            {movements.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><ArrowUpRight className="h-4 w-4" /></div>
                  <div>
                    <div className="font-medium text-slate-800">{item.bank_name ?? "Movimiento bancario"}</div>
                    <div className="text-xs text-slate-500">{item.occurred_at ? new Date(item.occurred_at).toLocaleString("es-CO") : "Sin fecha"}</div>
                  </div>
                </div>
                <div className="font-semibold text-slate-900">{formatCOP(Number(item.amount_cop ?? 0))}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
