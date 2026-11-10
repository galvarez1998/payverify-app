"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Eye, EyeOff, Lock, UserCircle2 } from "lucide-react";
import { profiles } from "@/lib/demo-data";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(profiles[0]);

  const handleLogin = () => {
    router.push(profile.role === "superadmin" ? "/superadmin" : "/dashboard");
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
              <div className="text-sm uppercase tracking-[0.2em] text-brand-200">Demo SaaS</div>
              <h1 className="mt-3 text-3xl font-bold leading-tight">Accede a tu entorno de verificación financiera.</h1>
            </div>
            <p className="text-slate-300">Simulación de comprobantes, sucursales, empleados, riesgos y suscripción con aislamiento por empresa.</p>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-300"><Building2 className="h-4 w-4" />Perfiles demo</div>
              <div className="space-y-2">
                {profiles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfile(item)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${profile.id === item.id ? "border-brand-500 bg-brand-500/10" : "border-slate-800 bg-slate-900"}`}
                  >
                    <div>
                      <div className="font-medium text-white">{item.company}</div>
                      <div className="text-xs text-slate-400">{item.role}</div>
                    </div>
                    <div className="text-xs text-slate-300">{item.email}</div>
                  </button>
                ))}
              </div>
            </div>
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
                <label className="mb-2 block text-sm font-medium text-slate-700">Perfil seleccionado</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">{profile.company} · {profile.name}</div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Correo electrónico</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <UserCircle2 className="h-4 w-4 text-slate-500" />
                  <input defaultValue={profile.email} className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Contraseña</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input type={showPassword ? "text" : "password"} defaultValue={profile.password} className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none" />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="p-1 text-slate-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2"><input type="checkbox" />Recordarme</label>
                <a href="#" className="text-brand-600">¿Olvidaste tu contraseña?</a>
              </div>

              <button onClick={handleLogin} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft">
                Ingresar <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <div className="font-medium text-slate-800">Credenciales demo</div>
                <div className="mt-2">Email: {profile.email}</div>
                <div>Contraseña: {profile.password}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
