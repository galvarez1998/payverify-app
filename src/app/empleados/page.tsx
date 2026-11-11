"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  email?: string | null;
  role_label?: string | null;
  active: boolean;
  branch_id?: string | null;
  branches?: { name?: string | null; city?: string | null } | null;
};

type Branch = {
  id: string;
  name: string;
};

const emptyForm = { name: "", email: "", roleLabel: "Empleado", branchId: "", active: true };

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
    try {
      setLoading(true);
      const [employeesResponse, branchesResponse] = await Promise.all([
        fetch("/api/employees", { cache: "no-store" }),
        fetch("/api/branches", { cache: "no-store" }),
      ]);

      const employeesPayload = await employeesResponse.json().catch(() => ({}));
      const branchesPayload = await branchesResponse.json().catch(() => ({}));

      if (!employeesResponse.ok) throw new Error(employeesPayload?.message || employeesPayload?.error || "No se pudieron cargar los empleados");
      if (!branchesResponse.ok) throw new Error(branchesPayload?.message || branchesPayload?.error || "No se pudieron cargar las sucursales");

      setEmployees(Array.isArray(employeesPayload.employees) ? employeesPayload.employees : []);
      setBranches(Array.isArray(branchesPayload.branches) ? branchesPayload.branches : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los empleados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, []);

  function handleOpenCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  function handleOpenEdit(employee: Employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      email: employee.email ?? "",
      roleLabel: employee.role_label ?? "Empleado",
      branchId: employee.branch_id ?? "",
      active: employee.active,
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/employees/${editingId}` : "/api/employees";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || payload?.error || "No se pudo guardar el empleado");

      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadEmployees();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar el empleado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employeeId: string) {
    const confirmed = window.confirm("¿Deseas eliminar este empleado?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || payload?.error || "No se pudo eliminar el empleado");
      await loadEmployees();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el empleado");
    }
  }

  return (
    <AppShell active="Empleados">
      <Card
        title="Personal y empleados"
        description="Roles, sucursales y activación de usuarios"
        action={
          <button type="button" onClick={handleOpenCreate} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        }
      >
        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        {formOpen && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Nombre</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Carlos Pérez" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Correo</span>
                <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="empleado@empresa.com" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Rol</span>
                <input value={form.roleLabel} onChange={(event) => setForm((current) => ({ ...current, roleLabel: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Cajero" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Sucursal</span>
                <select value={form.branchId} onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="">Sin sucursal</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              Empleado activo
            </label>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
              </button>
              <button type="button" onClick={() => { setFormOpen(false); setError(null); setEditingId(null); setForm(emptyForm); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Cargando empleados...</div>
        ) : (
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
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">No hay empleados registrados.</td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-200 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{employee.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{employee.role_label || "Empleado"}</td>
                      <td className="py-3 pr-4 text-slate-600">{employee.branches?.name ?? "Sin sucursal"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${employee.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{employee.active ? "Activo" : "Inactivo"}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleOpenEdit(employee)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700"><Pencil className="h-3.5 w-3.5" />Editar</button>
                          <button type="button" onClick={() => handleDelete(employee.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-medium text-rose-700"><Trash2 className="h-3.5 w-3.5" />Borrar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
