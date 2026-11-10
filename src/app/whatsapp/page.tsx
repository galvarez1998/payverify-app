import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { initialTransactions } from "@/lib/demo-data";
import { formatCOP } from "@/lib/utils";
import { MessageCircleMore, PhoneCall, Send, ShieldCheck } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <AppShell active="WhatsApp">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card title="Estado de conexión" description="Configuración del canal comercial">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div>
                  <div>
                    <div className="font-medium text-slate-800">Estado</div>
                    <div className="text-xs text-slate-500">Conectado en modo demo</div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">Activo</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <div className="mb-2 flex items-center justify-between"><span>Número asociado</span><span className="font-medium text-slate-900">+57 310 000 0000</span></div>
                <div className="mb-2 flex items-center justify-between"><span>Nombre de empresa</span><span className="font-medium text-slate-900">Restaurante El Buen Sabor</span></div>
                <div className="flex items-center justify-between"><span>Webhook</span><span className="font-medium text-slate-900">Activo</span></div>
              </div>
              <button className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Conectar WhatsApp</button>
            </div>
          </Card>

          <Card title="Instrucciones de integración" description="Preparado para conectarse más adelante a un webhook real">
            <ol className="space-y-3 text-sm text-slate-600">
              <li>1. Registra el negocio en Meta Developer Platform.</li>
              <li>2. Configura los webhooks para reasignar eventos de entrada y salidas.</li>
              <li>3. Usa un token seguro y valida firmantes con HMAC.</li>
              <li>4. En producción, conecta la lógica con Supabase o una API backend.</li>
            </ol>
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">El flujo actual es una simulación funcional del entorno de demostración, sin conexión real con Meta ni mensajes en vivo.</div>
          </Card>
        </div>

        <Card title="Historial de mensajes" description="Mensajes de ejemplo y respuestas demo">
          <div className="space-y-4">
            {[
              { sender: "Carlos Pérez", amount: 150000, message: "Comprobante de transferencia", response: "Estamos verificando tu transferencia. Resultado: pago confirmado en el entorno de demostración." },
              { sender: "María Rodríguez", amount: 85000, message: "Necesito revisar un pago pendiente", response: "El comprobante está en revisión. El entorno demo indica validación pendiente." },
            ].map((item) => (
              <div key={item.sender} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><MessageCircleMore className="h-4 w-4" /></div>
                    <div>
                      <div className="font-medium text-slate-800">{item.sender}</div>
                      <div className="text-xs text-slate-500">Hace 8 minutos</div>
                    </div>
                  </div>
                  <div className="font-medium text-slate-700">{formatCOP(item.amount)}</div>
                </div>
                <div className="rounded-xl bg-white p-3 text-sm text-slate-600">{item.message}</div>
                <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800"><div className="mb-1 flex items-center gap-2 font-medium"><Send className="h-4 w-4" />PayVerify</div>{item.response}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
