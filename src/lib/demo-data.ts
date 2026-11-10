export type Status = "confirmado" | "rechazado" | "pendiente" | "no-identificado";
export type PlanKey = "emprende" | "crecimiento" | "pro" | "enterprise";
export type Transaction = { id: string; companyId: string; date: string; amount: number; bank: string; reference: string; account: string; status: Status; employee: string; source: string; reason?: string };
export type Company = { id: string; name: string; owner: string; city: string; plan: PlanKey; status: "active" | "suspended"; branches: number; employees: number; mrr: number };
export type Branch = { id: string; name: string; city: string; manager: string; active: boolean };
export type Employee = { id: string; name: string; email: string; role: string; branch: string; active: boolean };
export type Plan = { key: PlanKey; name: string; price: number; verifications: number; branches: string; employees: string };

export const DEMO_COMPANY_ID = "c-001";
export const plans: Plan[] = [
  { key: "emprende", name: "Emprende", price: 99900, verifications: 200, branches: "1 sucursal", employees: "3 empleados" },
  { key: "crecimiento", name: "Crecimiento", price: 249900, verifications: 800, branches: "3 sucursales", employees: "10 empleados" },
  { key: "pro", name: "Pro", price: 499900, verifications: 2500, branches: "10 sucursales", employees: "30 empleados" },
  { key: "enterprise", name: "Enterprise", price: 999900, verifications: 6000, branches: "Según contrato", employees: "Según contrato" },
];
export const profiles = [
  { id: "superadmin", name: "Superadministrador PayVerify", email: "admin@payverify.co", password: "PayVerify2025!", role: "superadmin", company: "PayVerify" },
  { id: "company", name: "Administrador de empresa", email: "empresa@elbuen-sabor.com", password: "Demo123!", role: "company-admin", company: "Restaurante El Buen Sabor" },
];
export const initialCompanies: Company[] = [
  { id: "c-001", name: "Restaurante El Buen Sabor", owner: "Carlos Pérez", city: "Bogotá", plan: "pro", status: "active", branches: 3, employees: 14, mrr: 499900 },
  { id: "c-002", name: "Supermercado Central", owner: "María Rodríguez", city: "Medellín", plan: "crecimiento", status: "active", branches: 2, employees: 19, mrr: 249900 },
  { id: "c-003", name: "Tiendas La Economía", owner: "Andrés Gómez", city: "Cali", plan: "emprende", status: "suspended", branches: 1, employees: 8, mrr: 99900 },
];
export const initialTransactions: Transaction[] = [
  { id: "PV-1001", companyId: DEMO_COMPANY_ID, date: "2026-11-03 09:14", amount: 150000, bank: "Davivienda", reference: "REF-1550", account: "9281", status: "confirmado", employee: "Carlos Pérez", source: "WhatsApp" },
  { id: "PV-1002", companyId: DEMO_COMPANY_ID, date: "2026-11-04 11:32", amount: 85500, bank: "Bancolombia", reference: "REF-1850", account: "9281", status: "rechazado", employee: "María Rodríguez", source: "Web", reason: "El monto no coincide con el movimiento de prueba." },
  { id: "PV-1003", companyId: DEMO_COMPANY_ID, date: "2026-11-05 13:06", amount: 320000, bank: "Davivienda", reference: "REF-2240", account: "9281", status: "pendiente", employee: "Andrés Gómez", source: "Web" },
  { id: "PV-1004", companyId: DEMO_COMPANY_ID, date: "2026-11-06 15:43", amount: 45000, bank: "Nequi", reference: "REF-2670", account: "1111", status: "no-identificado", employee: "Carlos Pérez", source: "WhatsApp", reason: "No se encontró un movimiento de prueba coincidente." },
  { id: "PV-1005", companyId: DEMO_COMPANY_ID, date: "2026-11-07 17:20", amount: 150000, bank: "Davivienda", reference: "REF-1550", account: "9281", status: "rechazado", employee: "María Rodríguez", source: "Web", reason: "Comprobante duplicado: la referencia ya fue utilizada." },
];
export const initialBranches: Branch[] = [
  { id: "b-01", name: "Sucursal Norte", city: "Bogotá", manager: "Carlos Pérez", active: true },
  { id: "b-02", name: "Sucursal Centro", city: "Bogotá", manager: "María Rodríguez", active: true },
  { id: "b-03", name: "Sucursal Sur", city: "Bogotá", manager: "Andrés Gómez", active: false },
];
export const initialEmployees: Employee[] = [
  { id: "e-01", name: "Carlos Pérez", email: "carlos@elbuen-sabor.demo", role: "Cajero", branch: "Sucursal Norte", active: true },
  { id: "e-02", name: "María Rodríguez", email: "maria@elbuen-sabor.demo", role: "Administradora", branch: "Sucursal Centro", active: true },
  { id: "e-03", name: "Andrés Gómez", email: "andres@elbuen-sabor.demo", role: "Supervisor", branch: "Sucursal Sur", active: false },
];
