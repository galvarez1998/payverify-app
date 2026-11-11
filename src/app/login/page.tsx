"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, UserCircle2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function normalizeRole(role?: string | null) {
  return typeof role === "string" ? role.toLowerCase().replace(/[-\s]+/g, "_") : "";
}

async function resolveUserHomeRoute(supabase: ReturnType<typeof createSupabaseBrowserClient>, userId: string, role?: string | null) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "superadmin") {
    return "/superadmin";
  }

  const { data: membershipRows } = await supabase.from("company_memberships").select("company_id, status").eq("user_id", userId).eq("status", "active");
  const hasActiveMembership = (membershipRows ?? []).length > 0;

  return hasActiveMembership ? "/dashboard" : "/login";
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const targetRoute = await resolveUserHomeRoute(supabase, user.id, user.user_metadata?.role ?? user.app_metadata?.role);
      if (targetRoute !== "/login") {
        router.replace(targetRoute);
      }
    });
  }, [router]);

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("No se pudo recuperar el usuario autenticado.");
        return;
      }

      const targetRoute = await resolveUserHomeRoute(supabase, user.id, user.user_metadata?.role ?? user.app_metadata?.role);

      if (targetRoute === "/login") {
        setError("Tu cuenta no está asociada a una empresa activa.");
        return;
      }

      router.push(targetRoute);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft md:grid-cols-2">
        <div className="bg-slate-950 p-8 text-white md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-lg font-bold">P</div>
            <div>
              <div className="text-2xl font-black">PayVerify</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-300">Monitor de pagos</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-brand-200">Acceso real</div>
              <h1 className="mt-3 text-3xl font-bold leading-tight">Ingresa con tu cuenta de PayVerify.</h1>
            </div>
            <p className="text-slate-300">Autenticación con Supabase. La sesión y los permisos se validan contra tu cuenta real y las empresas asociadas.</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Inicio de sesión</div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Bienvenido</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Correo electrónico</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <UserCircle2 className="h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tu@empresa.com"
                    className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Contraseña</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="p-1 text-slate-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2"><input type="checkbox" />Recordarme</label>
                <a href="#" className="text-brand-600">¿Olvidaste tu contraseña?</a>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
              )}

              <button type="button" disabled={isSubmitting} onClick={handleLogin} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Ingresando..." : "Ingresar"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
