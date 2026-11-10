import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ChevronRight, MessageCircle, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const benefits = [
  { title: "Verificación inteligente", text: "Compara comprobantes y movimientos para detectar coincidencias reales y riesgos." },
  { title: "WhatsApp nativo", text: "Recibe alertas y confirma pagos desde los canales que usa tu operación diaria." },
  { title: "Rendimiento operativo", text: "Centraliza sucursales, empleados, pagos y monitoreo de riesgo en un solo panel." },
];

const plans = [
  { name: "Emprende", price: "$99.900", volume: "200 verificaciones", note: "1 sucursal" },
  { name: "Crecimiento", price: "$249.900", volume: "800 verificaciones", note: "3 sucursales" },
  { name: "Pro", price: "$499.900", volume: "2.500 verificaciones", note: "10 sucursales" },
  { name: "Enterprise", price: "Desde $999.900", volume: "6.000 verificaciones", note: "Configuración a medida" },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white">P</div>
            <div>
              <div className="text-2xl font-black">PayVerify</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Verificación inteligente</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#beneficios">Beneficios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#planes">Planes</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Iniciar sesión</Link>
            <Link href="/login" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft">Comenzar ahora</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" /> Verificación inteligente para pagos en Colombia
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Verificación inteligente. <span className="text-brand-600">Pagos con mayor confianza.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              PayVerify ayuda a restaurantes, supermercados y comercios a validar transferencias, detectar riesgo y dejar trazabilidad por sucursal, empleado y comprobante.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft">Comenzar ahora <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Iniciar sesión</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-500" />4.8/5 satisfacción</div>
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-500" />+1.200 negocios</div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Dashboard de verificación</div>
                  <div className="text-2xl font-bold text-slate-900">92.4%</div>
                </div>
                <div className="rounded-xl bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Confirmados</div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Transferencia 150.000", state: "Confirmado", tone: "success" },
                  { label: "Transferencia 85.500", state: "Rechazado", tone: "danger" },
                  { label: "Transferencia 320.000", state: "Pendiente", tone: "amber" },
                  { label: "Transferencia 45.000", state: "No identificado", tone: "gray" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <div className="font-medium text-slate-800">{item.label}</div>
                      <div className="text-xs text-slate-500">Ref: 15302029</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      item.tone === "success" ? "bg-emerald-100 text-emerald-700" :
                      item.tone === "danger" ? "bg-rose-100 text-rose-700" :
                      item.tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                    }`}>{item.state}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Beneficios</div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Todo lo que necesita tu operación</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600"><ShieldCheck className="h-6 w-6" /></div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{benefit.title}</h3>
                  <p className="mt-3 text-slate-600">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Cómo funciona</div>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Verifica cada pago en menos de 3 pasos</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { number: "01", title: "Sube el comprobante", text: "Carga la imagen del recibo o transferencia desde caja o sucursal." },
              { number: "02", title: "Analiza coincidencias", text: "Compara monto, referencia, fecha y cuenta en un motor de validación." },
              { number: "03", title: "Resuelve y confirma", text: "Recibe un estado claro con trazabilidad para la operación." },
            ].map((step) => (
              <div key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="text-2xl font-black text-brand-600">{step.number}</div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planes" className="bg-slate-950 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center text-white">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Planes</div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Elige el plan del negocio</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {plans.map((plan) => (
                <div key={plan.name} className={`rounded-2xl border p-6 ${plan.name === "Crecimiento" ? "border-brand-400 bg-brand-500/5" : "border-slate-700 bg-slate-900"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    {plan.name === "Crecimiento" && <span className="rounded-full bg-brand-500 px-2 py-1 text-[10px] font-semibold">Más popular</span>}
                  </div>
                  <div className="mt-5 text-3xl font-black text-white">{plan.price}</div>
                  <p className="mt-2 text-sm text-slate-300">{plan.volume}</p>
                  <div className="mt-5 text-sm text-slate-300">{plan.note}</div>
                  <button className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">Ver plan <ChevronRight className="ml-2 inline h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">FAQ</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "¿PayVerify funciona para negocios con varias sucursales?", a: "Sí. La solución está pensada para multiempresa con sucursales, empleados y permisos por rol." },
              { q: "¿Es una integración real con bancos?", a: "En esta demo no se usa una conexión real; se simula el flujo en un entorno de demostración para pruebas funcionales." },
              { q: "¿Puedo entrar sin registro?", a: "Sí. La app tiene perfiles demo visibles para iniciar sesión con un clic." },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="font-semibold text-slate-900">{item.q}</div>
                <p className="mt-2 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
