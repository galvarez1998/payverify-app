import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser, listCompanyBranches } from "@/backend/companies/service";
import { getCompanyTotals } from "@/backend/metrics/service";

export default async function ReportesPage() {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return (
      <AppShell active="Reportes">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Debes iniciar sesión para ver los reportes.</div>
      </AppShell>
    );
  }

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;

  if (!companyId) {
    return (
      <AppShell active="Reportes">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">No hay una empresa activa asociada a esta sesión.</div>
      </AppShell>
    );
  }

  const [totals, branchesResult] = await Promise.all([
    getCompanyTotals(auth.supabase, companyId),
    listCompanyBranches(auth.supabase, companyId),
  ]);
  const branches = branchesResult.data ?? [];

  return (
    <AppShell active="Reportes">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Reporte de pagos" description="Resumen operativo actual">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Confirmados</span><span className="font-medium text-slate-900">{totals.approved}</span></div>
            <div className="flex items-center justify-between"><span>Rechazados</span><span className="font-medium text-slate-900">{totals.rejected}</span></div>
            <div className="flex items-center justify-between"><span>Pendientes</span><span className="font-medium text-slate-900">{totals.pending}</span></div>
          </div>
        </Card>

        <Card title="Reporte de sucursales" description="Puntos de venta de la empresa">
          <div className="space-y-2 text-sm text-slate-600">
            {branches.length > 0 ? branches.map((branch: any) => (
              <div key={branch.id} className="flex items-center justify-between">
                <span>{branch.name}</span>
                <span className="font-medium text-slate-900">{branch.active ? "Activa" : "Pausada"}</span>
              </div>
            )) : <div className="text-slate-500">Sin sucursales registradas.</div>}
          </div>
        </Card>

        <Card title="Exportación" description="Archivos listos para descargar">
          <div className="space-y-3">
            <button className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">CSV</button>
            <button className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">PDF</button>
            <button className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Excel</button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
