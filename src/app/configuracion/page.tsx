import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { Settings, ShieldCheck } from "lucide-react";

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
      </div>
    </AppShell>
  );
}
