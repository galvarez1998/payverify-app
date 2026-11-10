import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="text-5xl font-black text-brand-600">404</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Página no encontrada</h1>
        <p className="mt-3 text-slate-600">La ruta solicitada no existe en la demo de PayVerify.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
