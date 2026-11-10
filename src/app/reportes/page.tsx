import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { Activity, BarChart3, FileText } from "lucide-react";

export default function ReportesPage() {
  return (
    <AppShell active="Reportes">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Reporte de pagos" description="Resumen operativo">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Confirmados</span><span className="font-medium text-slate-900">1.220</span></div>
            <div className="flex items-center justify-between"><span>Rechazados</span><span className="font-medium text-slate-900">210</span></div>
            <div className="flex items-center justify-between"><span>Pendientes</span><span className="font-medium text-slate-900">160</span></div>
          </div>
        </Card>

        <Card title="Reporte de sucursales" description="Rendimiento por punto">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Sucursal Norte</span><span className="font-medium text-slate-900">82%</span></div>
            <div className="flex items-center justify-between"><span>Sucursal Centro</span><span className="font-medium text-slate-900">76%</span></div>
            <div className="flex items-center justify-between"><span>Sucursal Sur</span><span className="font-medium text-slate-900">61%</span></div>
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
