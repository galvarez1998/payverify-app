import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { initialEmployees } from "@/lib/demo-data";
import { Plus, UserCog } from "lucide-react";

export default function EmpleadosPage() {
  return (
    <AppShell active="Empleados">
      <Card title="Personal y empleados" description="Roles, sucursales y activación de usuarios">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Nombre</th>
                <th className="py-3 pr-4 font-medium">Rol</th>
                <th className="py-3 pr-4 font-medium">Sucursal</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {initialEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-200 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-800">{employee.name}</td>
                  <td className="py-3 pr-4 text-slate-600">{employee.role}</td>
                  <td className="py-3 pr-4 text-slate-600">{employee.branch}</td>
                  <td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${employee.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{employee.active ? "Activo" : "Inactivo"}</span></td>
                  <td className="py-3 pr-4"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700"><UserCog className="h-3.5 w-3.5" />Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
