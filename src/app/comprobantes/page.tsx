import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { initialTransactions } from "@/lib/demo-data";
import { formatCOP } from "@/lib/utils";
import { Camera, CheckCheck, Download, ImageIcon } from "lucide-react";

export default function ComprobantesPage() {
  return (
    <AppShell active="Comprobantes">
      <div className="space-y-6">
        <Card title="Carga de comprobantes" description="OCR simulado y validación del pago">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="flex h-52 items-center justify-center rounded-2xl bg-white">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="mt-3 text-sm text-slate-600">Arrastra un comprobante o súbelo desde tu dispositivo</div>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><Camera className="h-4 w-4" />Adjuntar</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Monto extraído</div><div className="mt-2 text-xl font-bold text-slate-900">{formatCOP(150000)}</div></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Banco</div><div className="mt-2 text-xl font-bold text-slate-900">Davivienda</div></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Fecha</div><div className="mt-2 text-xl font-bold text-slate-900">03/11/2026</div></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Responsable</div><div className="mt-2 text-xl font-bold text-slate-900">Carlos Pérez</div></div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600"><span>Referencia</span><span className="font-medium text-slate-900">REF-1550</span></div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600"><span>Resultado</span><span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">CONFIRMADO</span></div>
                <div className="flex items-center justify-between text-sm text-slate-600"><span>Validación</span><span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700"><CheckCheck className="h-3.5 w-3.5" /> Entorno demo</span></div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Comprobantes recientes" description="Últimos documentos cargados">
          <div className="grid gap-4 md:grid-cols-3">
            {initialTransactions.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold text-slate-800">{item.reference}</div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${item.status === "confirmado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between"><span>Monto</span><span className="font-medium text-slate-900">{formatCOP(item.amount)}</span></div>
                  <div className="flex items-center justify-between"><span>Fecha</span><span>{item.date}</span></div>
                  <div className="flex items-center justify-between"><span>Empleado</span><span>{item.employee}</span></div>
                </div>
                <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"><Download className="h-3.5 w-3.5" />Ver detalle</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
