import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ status: "not_configured", database: "offline", message: "Configura Supabase para habilitar la persistencia." }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("plans").select("id", { head: true, count: "exact" }).limit(1);
    if (error) {
      return NextResponse.json({ status: "degraded", database: "unavailable", message: "No se pudo consultar la base de datos." }, { status: 503 });
    }
    return NextResponse.json({ status: "ok", database: "connected", app: "PayVerify" });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  }
}
