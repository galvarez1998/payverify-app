import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { initialTransactions } from "@/lib/demo-data";
import { formatCOP, statusClass, statusLabel } from "@/lib/utils";

export default function VerificacionesPage() {
  return (
    <AppShell active="Verificaciones">
      <Card title="Historial de verificaciones" description="Estados simulados con finalidad de demostración">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">ID</th>
                <th className="py-3 pr-4 font-medium">Empresa</th>
                <th className="py-3 pr-4 font-medium">Fecha</th>
                <th className="py-3 pr-4 font-medium">Monto</th>
                <th className="py-3 pr-4 font-medium">Referencia</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">Empleado</th>
              </tr>
            </thead>
            <tbody>
              {initialTransactions.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-800">{item.id}</td>
                  <td className="py-3 pr-4 text-slate-600">Restaurante El Buen Sabor</td>
                  <td className="py-3 pr-4 text-slate-600">{item.date}</td>
                  <td className="py-3 pr-4 text-slate-800">{formatCOP(item.amount)}</td>
                  <td className="py-3 pr-4 text-slate-600">{item.reference}</td>
                  <td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(item.status)}`}>{statusLabel(item.status)}</span></td>
                  <td className="py-3 pr-4 text-slate-600">{item.employee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
