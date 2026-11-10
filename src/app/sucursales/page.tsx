import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { initialBranches } from "@/lib/demo-data";
import { MapPin, Plus } from "lucide-react";

export default function SucursalesPage() {
  return (
    <AppShell active="Sucursales">
      <Card title="Gestión de sucursales" description="Administración de múltiples puntos de venta">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {initialBranches.map((branch) => (
            <div key={branch.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold text-slate-800">{branch.name}</div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${branch.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{branch.active ? "Activo" : "Pausado"}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-500" />{branch.city}</div>
                <div>Encargado: {branch.manager}</div>
              </div>
              <button className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Administrar</button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
