import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { Activity, ArrowUpRight, CircleDollarSign, FileText } from "lucide-react";

export default function MovimientosPage() {
  return (
    <AppShell active="Movimientos">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Pagos confirmados" description="Entorno simulado">
            <div className="text-3xl font-bold text-slate-900">1.220</div>
          </Card>
          <Card title="Pagos pendientes" description="Pendientes de revisión">
            <div className="text-3xl font-bold text-slate-900">160</div>
          </Card>
          <Card title="Ingreso del mes" description="COP">
            <div className="text-3xl font-bold text-slate-900">$1.840.000</div>
          </Card>
        </div>

        <Card title="Últimos movimientos" description="Eventos bancarios simulados">
          <div className="space-y-3">
            {[
              { title: "Transferencia confirmada", value: "$150.000", time: "09:14" },
              { title: "Pago rechazado", value: "$85.500", time: "11:32" },
              { title: "Referencia pendiente", value: "$320.000", time: "13:06" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><ArrowUpRight className="h-4 w-4" /></div>
                  <div>
                    <div className="font-medium text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.time}</div>
                  </div>
                </div>
                <div className="font-semibold text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
