import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser, listCompanyBranches } from "@/backend/companies/service";

export default async function WhatsappPage() {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return (
      <AppShell active="WhatsApp">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Debes iniciar sesión para ver el canal de WhatsApp.</div>
      </AppShell>
    );
  }

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;

  if (!companyId) {
    return (
      <AppShell active="WhatsApp">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">No hay una empresa activa asociada a esta sesión.</div>
      </AppShell>
    );
  }

  const branchesResult = await listCompanyBranches(auth.supabase, companyId);
  const branches = branchesResult.data ?? [];

  return (
    <AppShell active="WhatsApp">
      <div className="space-y-6">
        <Card title="WhatsApp de operaciones" description="Canales activos para la empresa actual">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {branches.length > 0 ? branches.map((branch: any) => (
              <div key={branch.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-lg font-semibold text-slate-900">{branch.name}</div>
                <div className="mt-2 text-sm text-slate-600">{branch.city ?? "Ciudad no registrada"}</div>
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Canal activo</div>
              </div>
            )) : <div className="text-slate-500">No hay sucursales activas para este canal.</div>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
