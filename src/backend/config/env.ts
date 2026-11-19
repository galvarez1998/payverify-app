export type SupabaseConfig = { url: string; anonKey: string };

export type GoogleVisionConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  maxFileSizeBytes: number;
};

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

/**
 * Configuración de Vision exclusivamente server-side.
 * La clave privada se normaliza porque las plataformas suelen entregarla con
 * los saltos de línea escapados como `\\n`.
 */
export function getGoogleVisionConfig(): GoogleVisionConfig {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const configuredLimit = Number(process.env.OCR_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024);
  const maxFileSizeBytes = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 10 * 1024 * 1024;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Google Cloud Vision no está configurado en el servidor.");
  }

  return { projectId, clientEmail, privateKey, maxFileSizeBytes };
}
