"use client";

import { useEffect, useState } from "react";
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

type Membership = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at?: string;
  user_profiles?: { display_name?: string | null } | null;
};

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

const roleOptions = ["company_admin", "branch_manager", "employee", "analyst"];
const statusOptions = ["active", "invited", "suspended"];

export default function ConfiguracionPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState({ userId: "", role: "employee", status: "active" });
  const [savingInvite, setSavingInvite] = useState(false);

  async function loadMemberships() {
    try {
      const response = await fetch("/api/company-memberships", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || payload?.error || "No se pudieron cargar los miembros");
      setMemberships(Array.isArray(payload.memberships) ? payload.memberships : []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los miembros");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMemberships();
  }, []);

  async function updateMembership(id: string, field: "role" | "status", value: string) {
    const response = await fetch(`/api/company-memberships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || "No se pudo actualizar el miembro");
    }
  }

  async function handleMembershipChange(id: string, field: "role" | "status", value: string) {
    try {
      await updateMembership(id, field, value);
      await loadMemberships();
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "No se pudo actualizar el miembro");
    }
  }

  async function handleCreateMembership(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invite.userId.trim()) {
      setError("Debes ingresar un userId válido");
      return;
    }

    try {
      setSavingInvite(true);
      const response = await fetch("/api/company-memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "No se pudo agregar el miembro");
      }

      setInvite({ userId: "", role: "employee", status: "active" });
      await loadMemberships();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo agregar el miembro");
    } finally {
      setSavingInvite(false);
    }
  }

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

        <Card title="Membresía de la empresa" description="Roles y estado de acceso para cada miembro">
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

          <form onSubmit={handleCreateMembership} className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
            <input
              value={invite.userId}
              onChange={(event) => setInvite((current) => ({ ...current, userId: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="user_id UUID"
            />
            <select value={invite.role} onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select value={invite.status} onChange={(event) => setInvite((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button type="submit" disabled={savingInvite} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
              {savingInvite ? "Guardando..." : "Invitar"}
            </button>
          </form>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Cargando miembros...</div>
          ) : memberships.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">No hay miembros asociados.</div>
          ) : (
            <div className="space-y-3">
              {memberships.map((member) => (
                <div key={member.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{member.user_profiles?.display_name || member.user_id}</div>
                      <div className="text-sm text-slate-500">{member.created_at ? new Date(member.created_at).toLocaleString("es-CO") : "Sin fecha"}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select value={member.role} onChange={(event) => void handleMembershipChange(member.id, "role", event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <select value={member.status} onChange={(event) => void handleMembershipChange(member.id, "status", event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500">
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

