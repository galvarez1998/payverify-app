import Link from "next/link";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm font-medium">Cargando PayVerify...</span>
        </div>
      </div>
    </div>
  );
}
