import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { getActiveCompanyForUser } from "@/backend/companies/service";
import { listCompanyVerificationEvents } from "@/backend/metrics/service";
import { formatCOP } from "@/lib/utils";

export default async function VerificacionesPage() {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return (
      <AppShell active="Verificaciones">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Debes iniciar sesión para ver las verificaciones.</div>
      </AppShell>
    );
  }

  const membership = await getActiveCompanyForUser(auth.supabase, auth.user.id);
  const companyId = membership.data?.company_id;

  if (!companyId) {
    return (
      <AppShell active="Verificaciones">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">No hay una empresa activa asociada a esta sesión.</div>
      </AppShell>
    );
  }

  const eventsResult = await listCompanyVerificationEvents(auth.supabase, companyId);
  const events = eventsResult.data ?? [];

  return (
    <AppShell active="Verificaciones">
      <Card title="Historial de verificaciones" description="Eventos reales de validación de la empresa actual">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">ID</th>
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Monto</th>
                <th className="py-3 pr-4 font-medium">Referencia</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {events.map((item: any) => {
                const proof = Array.isArray(item.proof_documents) ? item.proof_documents[0] : item.proof_documents;
                const movement = Array.isArray(item.bank_movements) ? item.bank_movements[0] : item.bank_movements;
                const amount = Number(proof?.amount_cop ?? movement?.amount_cop ?? 0);
                const reference = proof?.reference ?? movement?.reference ?? "Sin referencia";
                const status = String(item.status ?? "pending");

                return (
                  <tr key={item.id} className="border-b border-slate-200 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{item.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 text-slate-600">{new Date(item.created_at).toLocaleDateString("es-CO")}</td>
                    <td className="py-3 pr-4 text-slate-800">{formatCOP(amount)}</td>
                    <td className="py-3 pr-4 text-slate-600">{reference}</td>
                    <td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${status === "confirmed" ? "bg-emerald-100 text-emerald-700" : status === "rejected" ? "bg-rose-100 text-rose-700" : status === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>{status}</span></td>
                    <td className="py-3 pr-4 text-slate-600">{item.reason ?? "Sin motivo"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
