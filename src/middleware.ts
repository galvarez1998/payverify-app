import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getOptionalSupabaseConfig } from "@/backend/config/env";

const publicPaths = ["/", "/login"];
const protectedPrefixes = [
  "/superadmin"
];

function normalizeRole(role?: string | null) {
  return typeof role === "string" ? role.toLowerCase().replace(/[-\s]+/g, "_") : "";
}

async function getActiveCompanyMemberships(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data, error } = await supabase.from("company_memberships").select("company_id, role, status").eq("user_id", userId).eq("status", "active");
  return { data: data ?? [], error };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/") || pathname.includes(".") || publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const config = getOptionalSupabaseConfig();
  if (!config) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return response;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const normalizedRole = normalizeRole(user.user_metadata?.role ?? user.app_metadata?.role);
  const { data: memberships, error: membershipsError } = await getActiveCompanyMemberships(supabase, user.id);
  const hasActiveCompanyMembership = (memberships ?? []).length > 0;

  if (pathname.startsWith("/superadmin")) {
    if (normalizedRole !== "superadmin") {
      const target = hasActiveCompanyMembership ? "/dashboard" : "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return response;
  }

  if (normalizedRole === "superadmin") {
    return NextResponse.redirect(new URL("/superadmin", request.url));
  }

  if (!hasActiveCompanyMembership || membershipsError) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
