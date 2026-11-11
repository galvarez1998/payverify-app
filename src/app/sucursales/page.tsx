"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  active: boolean;
};

const emptyForm = { name: "", city: "", address: "", active: true };

export default function SucursalesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadBranches() {
    try {
      setLoading(true);
      const response = await fetch("/api/branches", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar las sucursales");
      const payload = await response.json();
      setBranches(Array.isArray(payload.branches) ? payload.branches : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las sucursales");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBranches();
  }, []);

  function handleOpenCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  function handleOpenEdit(branch: Branch) {
    setEditingId(branch.id);
    setForm({ name: branch.name, city: branch.city ?? "", address: branch.address ?? "", active: branch.active });
    setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/branches/${editingId}` : "/api/branches";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "No se pudo guardar la sucursal");
      }

      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadBranches();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la sucursal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(branchId: string) {
    const confirmed = window.confirm("¿Deseas eliminar esta sucursal?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/branches/${branchId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "No se pudo eliminar la sucursal");
      }
      await loadBranches();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la sucursal");
    }
  }

  return (
    <AppShell active="Sucursales">
      <Card
        title="Gestión de sucursales"
        description="Administración de múltiples puntos de venta"
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
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Sucursal Norte" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Ciudad</span>
                <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Bogotá" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Dirección</span>
                <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Cra 10 #20-30" />
              </label>
            </div>

            <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              Sucursal activa
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Cargando sucursales...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {branches.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">No hay sucursales registradas.</div>
            ) : (
              branches.map((branch) => (
                <div key={branch.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="font-semibold text-slate-800">{branch.name}</div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${branch.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{branch.active ? "Activo" : "Pausado"}</span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-500" />{branch.city || "Sin ciudad"}</div>
                    <div>{branch.address || "Sin dirección registrada"}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => handleOpenEdit(branch)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><Pencil className="h-4 w-4" />Editar</button>
                    <button type="button" onClick={() => handleDelete(branch.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"><Trash2 className="h-4 w-4" />Borrar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
