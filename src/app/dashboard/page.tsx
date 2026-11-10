import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Metric } from "@/components/ui";
import { initialTransactions, initialCompanies } from "@/lib/demo-data";
import { formatCOP, statusClass, statusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const metrics = [
    { label: "Verificaciones del mes", value: "1.840", note: "Total del mes", color: "blue" },
    { label: "Pagos confirmados", value: "1.220", note: "Validaciones exitosas", color: "green" },
    { label: "Pagos rechazados", value: "210", note: "Casos con diferencia", color: "rose" },
    { label: "Pendientes", value: "160", note: "Requieren revisión", color: "amber" },
    { label: "No identificados", value: "54", note: "Sin coincidencia", color: "gray" },
  ] as const;

  return (
    <AppShell active="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((item) => <Metric key={item.label} label={item.label} value={item.value} note={item.note} color={item.color} />)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card title="Transacciones por día" description="Rendimiento mensual en COP">
            <div className="flex h-52 items-end gap-3">
              {[30, 48, 52, 62, 76, 88, 72].map((height, index) => (
                <div key={index} className="flex-1">
                  <div className="rounded-t-2xl bg-gradient-to-t from-brand-600 to-brand-300" style={{ height: `${height}%` }} />
                  <div className="mt-2 text-center text-xs text-slate-500">{["L", "M", "M", "J", "V", "S", "D"][index]}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Alertas de fraude" description="Eventos críticos del entorno demo">
            <div className="space-y-3">
              {[
                { title: "Referencias duplicadas", detail: "3 casos detectados" },
                { title: "Monto inconsistente", detail: "2 discrepancias OCR" },
                { title: "Cuenta no coincidente", detail: "1 revisión de auditoría" },
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
            {[
              "Se validó una transferencia de $150.000 para el restaurante.",
              "Se detectó diferencia de monto en una referencia duplicada.",
              "Se actualizó el acceso del módulo WhatsApp para la sucursal Norte.",
              "Quedan 110 verificaciones disponibles en el plan actual.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                <div className="text-sm text-slate-600">{item}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
