import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Trash2,
  Wifi,
  Zap,
} from "lucide-react";

const providers = [
  {
    id: "gmail",
    provider: "Gmail",
    email: "notificaciones@elbuen-sabor.com",
    company: "Restaurante El Buen Sabor",
    status: "Conectado",
    statusTone: "success",
    lastSync: "Hace 8 minutos",
    expires: "12/12/2026",
    autoSync: true,
    lastError: null,
  },
  {
    id: "outlook",
    provider: "Outlook / Microsoft 365",
    email: "pagos@elbuen-sabor.com",
    company: "Restaurante El Buen Sabor",
    status: "Sincronizando",
    statusTone: "warning",
    lastSync: "En curso",
    expires: "Pendiente",
    autoSync: true,
    lastError: "Sincronización parcial por limitación de API",
  },
  {
    id: "gmail-secondary",
    provider: "Gmail",
    email: "tesoreria@elbuen-sabor.com",
    company: "Restaurante El Buen Sabor",
    status: "Error de conexión",
    statusTone: "danger",
    lastSync: "Hace 3 horas",
    expires: "Revocado",
    autoSync: false,
    lastError: "Permiso revocado por el usuario o la sesión expiró.",
  },
] as const;

const syncHistory = [
  { label: "Bancolombia", time: "Hace 8 minutos", result: "Novedad detectada: 3 mensajes nuevos", tone: "success" },
  { label: "Davivienda", time: "Hace 22 minutos", result: "Sin coincidencias relevantes", tone: "neutral" },
  { label: "Nequi", time: "Hace 1 hora", result: "Error de autenticación revisado", tone: "danger" },
  { label: "Banco de Bogotá", time: "Hace 4 horas", result: "Última sincronización completada", tone: "success" },
] as const;

function statusClass(tone: "success" | "warning" | "danger" | "neutral") {
  const map = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-200 text-slate-700",
  } as const;
  return map[tone];
}

export default function ConfiguracionPage() {
  return (
    <AppShell active="Configuración">
      <div className="space-y-6">
        <Card title="Configuración general" description="Ajustes y seguridad del negocio">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3"><Settings className="h-5 w-5 text-brand-600" /><div className="font-semibold text-slate-800">Seguridad</div></div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between"><span>2FA</span><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">Activo</span></div>
                <div className="flex items-center justify-between"><span>Permisos por rol</span><span className="font-medium text-slate-900">Configurados</span></div>
                <div className="flex items-center justify-between"><span>RLS</span><span className="font-medium text-slate-900">Listo para Supabase</span></div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-600" /><div className="font-semibold text-slate-800">Auditoría</div></div>
              <div className="space-y-3 text-sm text-slate-600">
                <div>Registro de actividad: activado</div>
                <div>Último ingreso: hace 12 minutos</div>
                <div>Notificaciones: habilitadas</div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Integraciones → Correos bancarios"
          description="Conexiones a Gmail, Outlook y sincronización automática de notificaciones bancarias"
          action={
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white"><Mail className="h-4 w-4" />Conectar Gmail</button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><Zap className="h-4 w-4" />Conectar Outlook</button>
            </div>
          }
        >
          <div className="space-y-4">
            {providers.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{item.provider}</div>
                      <div className="text-sm text-slate-500">{item.email} · {item.company}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(item.statusTone)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Última sincronización</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">{item.lastSync}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Expira</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">{item.expires}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Sincronización automática</div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                      {item.autoSync ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4 text-amber-600" />}
                      {item.autoSync ? "Habilitada" : "No habilitada"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Error</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">{item.lastError ?? "Sin errores"}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><RefreshCcw className="h-4 w-4" />Sincronizar ahora</button>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><ArrowRight className="h-4 w-4" />Reconectar</button>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"><Trash2 className="h-4 w-4" />Desconectar</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Historial de sincronización y errores" description="Novedades bancarias detectadas por proveedor y control de fallas">
          <div className="space-y-3">
            {syncHistory.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 grid h-7 w-7 place-items-center rounded-lg ${item.tone === "success" ? "bg-emerald-100 text-emerald-700" : item.tone === "danger" ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"}`}>
                    {item.tone === "danger" ? <AlertTriangle className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{item.label}</div>
                    <div className="text-sm text-slate-600">{item.result}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{item.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

