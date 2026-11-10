import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/backend/auth/context";
import { listCompanyMemberships, createCompanyWithOwner } from "@/backend/companies/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await listCompanyMemberships(auth.supabase, auth.user.id);
  if (error) return NextResponse.json({ error: "company_lookup_failed" }, { status: 500 });
  return NextResponse.json({ companies: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof payload === "object" && payload !== null && "name" in payload ? String(payload.name).trim() : "";
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "invalid_company_name", message: "El nombre debe tener entre 2 y 120 caracteres." }, { status: 400 });
  }

  const { data, error } = await createCompanyWithOwner(auth.supabase, name);
  if (error) return NextResponse.json({ error: "company_creation_failed" }, { status: 400 });
  return NextResponse.json({ company_id: data }, { status: 201 });
}
