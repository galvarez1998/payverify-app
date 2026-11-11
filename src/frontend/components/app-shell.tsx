"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Building2, CheckCheck, CreditCard, FileImage, LayoutDashboard, MessageCircle, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/verificaciones", "Verificaciones", CheckCheck], ["/comprobantes", "Comprobantes", FileImage], ["/movimientos", "Movimientos", Wallet], ["/sucursales", "Sucursales", Building2], ["/empleados", "Empleados", Users], ["/whatsapp", "WhatsApp", MessageCircle], ["/reportes", "Reportes", BarChart3], ["/suscripcion", "Suscripción", CreditCard], ["/superadmin", "Superadmin", ShieldCheck], ["/configuracion", "Configuración", Settings]
] as const;

export function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("Cargando...");
  const [companyName, setCompanyName] = useState<string>("Sin empresa");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        setUserEmail("Sesión no activa");
        setCompanyName("Sin empresa");
        router.replace("/login");
        return;
      }

      setUserEmail(data.user.email ?? "Sesión activa");

      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (!response.ok) {
          setCompanyName("Sin empresa");
          return;
        }

        const payload = await response.json();
        const memberships = Array.isArray(payload?.memberships) ? payload.memberships : [];
        const activeCompany = memberships.find((membership: { status?: string; companies?: { name?: string } }) => membership.status === "active")?.companies?.name;
        setCompanyName(activeCompany || "Sin empresa");
      } catch {
        setCompanyName("Sin empresa");
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="bg-slate-950 text-white md:fixed md:inset-y-0 md:w-64">
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 font-bold">P</div>
          <div><div className="text-lg font-bold">PayVerify</div><div className="text-xs text-slate-400">Entorno de demostración</div></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:block">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active === label ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-4 pb-4 md:block"><div className="rounded-xl bg-slate-900 p-3 text-sm"><div className="font-medium">{companyName}</div><div className="mt-1 text-xs text-slate-400">{userEmail}</div></div></div>
      </aside>
      <main className="min-w-0 flex-1 md:ml-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div><div className="text-xs text-slate-500">Panel de control</div><h1 className="text-xl font-bold text-slate-900">{active}</h1></div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline">Sesión activa</span>
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600 md:inline">{userEmail}</span>
            <button type="button" onClick={handleLogout} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">Salir</button>
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
        <footer className="px-6 pb-5 text-xs text-slate-400">Los resultados son simulados; no constituyen confirmaciones bancarias reales.</footer>
      </main>
    </div>
  );
}
