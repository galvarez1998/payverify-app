export type SupabaseConfig = { url: string; anonKey: string };

export function getOptionalSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return getOptionalSupabaseConfig() !== null;
}

export function getSupabaseConfig(): SupabaseConfig {
  const config = getOptionalSupabaseConfig();
  if (!config) {
    throw new Error("Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return config;
}
