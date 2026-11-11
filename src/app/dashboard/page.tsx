import { AppShell } from "@/components/app-shell";
import { Card, Metric } from "@/components/ui";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser, getCompanyDashboardSummary } from "@/backend/companies/service";

export default async function DashboardPage() {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return (
      <AppShell active="Dashboard">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Debes iniciar sesión para ver el dashboard.</div>
      </AppShell>
    );
  }

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;

  if (!companyId) {
    return (
      <AppShell active="Dashboard">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">No tienes una empresa activa asociada a esta sesión.</div>
      </AppShell>
    );
  }

  const summary = await getCompanyDashboardSummary(auth.supabase, companyId);
  const verificationCounts = summary.verificationStatuses.reduce<Record<string, number>>((acc, item) => {
    const status = String(item.status ?? "pending").toLowerCase();
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const totalIncome = summary.movementRows.reduce((sum, item) => sum + Number(item.amount_cop ?? 0), 0);
  const movementByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const label = new Intl.DateTimeFormat("es-CO", { weekday: "short" }).format(date);
    const value = summary.movementRows.reduce((sum, movement) => {
      if (!movement.occurred_at) return sum;
      const occurred = new Date(movement.occurred_at);
      return occurred.toDateString() === date.toDateString() ? sum + Number(movement.amount_cop ?? 0) : sum;
    }, 0);

    return { label, value };
  });

  const maxMovement = Math.max(...movementByDay.map((day) => day.value), 1);
  const recentActivity = [
    { title: "Verificaciones confirmadas", detail: `${verificationCounts.confirmed ?? 0} eventos aceptados` },
    { title: "Pendientes de revisión", detail: `${verificationCounts.pending ?? 0} esperando validación` },
    { title: "Movimientos bancarios", detail: `${summary.movementRows.length} registros en la base` },
    { title: "Ingresos estimados", detail: `${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(totalIncome)}` },
  ];

  const metrics = [
    { label: "Verificaciones", value: String(summary.verificationStatuses.length), note: "Totales registradas", color: "blue" as const },
    { label: "Empleados", value: String(summary.employeesCount), note: "Activos en la empresa", color: "green" as const },
    { label: "Sucursales", value: String(summary.branchesCount), note: "Puntos de venta", color: "amber" as const },
    { label: "Ingresos", value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(totalIncome), note: "En movimientos reales", color: "green" as const },
    { label: "Pendientes", value: String(verificationCounts.pending ?? 0), note: "Esperando revisión", color: "amber" as const },
  ];

  return (
    <AppShell active="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((item) => <Metric key={item.label} label={item.label} value={item.value} note={item.note} color={item.color} />)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card title="Movimientos por día" description="Rendimiento real de la empresa en COP">
            <div className="flex h-52 items-end gap-3">
              {movementByDay.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center">
                  <div className="flex h-full w-full items-end justify-center">
                    <div className="w-full rounded-t-2xl bg-gradient-to-t from-brand-600 to-brand-300" style={{ height: `${Math.max((day.value / maxMovement) * 100, day.value > 0 ? 12 : 4)}%` }} />
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-500">{day.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Alertas de negocio" description="Eventos relevantes del negocio">
            <div className="space-y-3">
              {[
                { title: "Referencias duplicadas", detail: `${verificationCounts.rejected ?? 0} casos detectados` },
                { title: "Pendientes de revisión", detail: `${verificationCounts.pending ?? 0} elementos abiertos` },
                { title: "Confirmadas", detail: `${verificationCounts.confirmed ?? 0} validaciones aceptadas` },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="font-medium text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.detail}</div>
                  </div>
                  <div className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">Alerta</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Actividad reciente" description="Últimos eventos del negocio">
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                <div>
                  <div className="font-medium text-slate-800">{item.title}</div>
                  <div className="text-sm text-slate-600">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
