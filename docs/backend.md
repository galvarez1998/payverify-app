# Backend y base de datos PayVerify

## Arquitectura inicial
- **Aplicación/backend:** Next.js App Router. Las rutas `/api/*` ejecutan en servidor y validan la sesión con Supabase Auth.
- **Base de datos:** PostgreSQL administrado por Supabase; migración inicial en `supabase/migrations/`.
- **Aislamiento:** cada entidad operativa lleva `company_id`; Row Level Security valida membresías/roles desde la sesión autenticada.
- **Demo:** las páginas actuales siguen utilizando datos locales. La demo de login no equivale a una sesión autenticada y no autoriza las rutas API.

## Activar Supabase
1. Crea un proyecto Supabase y copia su Project URL y anon/publishable key.
2. Copia `.env.example` a `.env.local` y define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Aplica la migración `supabase/migrations/20261110000000_initial_multitenant_schema.sql` con Supabase CLI (`supabase db push`) o desde el SQL Editor.
4. Configura Auth → URL Configuration con la URL local/de despliegue y los callback URLs que uses.
5. Instala y ejecuta:
   ```bash
   npm install
   npm run dev
   ```

No se requiere ni se usa `service_role` en el frontend. La clave privilegiada, si en el futuro se añade un worker confiable, debe permanecer únicamente en el entorno server-side.

## API inicial
- `GET /api/health`: estado de configuración y consulta de disponibilidad de base de datos; nunca devuelve secretos.
- `GET /api/me`: usuario autenticado y membresías activas.
- `GET /api/companies`: compañías accesibles por la sesión.
- `POST /api/companies`: crea una compañía y vincula al usuario como administrador mediante RPC transaccional.

Las rutas devuelven `503 backend_not_configured` si faltan las variables de Supabase y `401 unauthorized` si no existe sesión válida.

## Entidades
- `user_profiles`, `companies`, `company_memberships`
- `plans`, `subscriptions`
- `branches`, `employees`
- `proof_documents`, `bank_movements`, `verification_events`
- `audit_logs`

Tokens OAuth, webhooks y correo bancario aún no se almacenan ni procesan. Se diseñarán en una fase posterior con cifrado de tokens, retención mínima, idempotencia y autorización por empresa.

## Seguridad y límites actuales
- RLS está habilitado para todas las tablas de negocio.
- Las políticas usan `auth.uid()` y membresías activas; las funciones privilegiadas son `SECURITY DEFINER` con `search_path` fijado.
- La creación de empresa usa una función transaccional y no acepta un `user_id` suministrado por el cliente.
- Las operaciones sensibles dependen de la sesión real de Supabase; el perfil demo local no las habilita.
- La migración no configura un bucket de comprobantes. Si se agrega Supabase Storage, deberá habilitarse un bucket privado con políticas por empresa antes de guardar imágenes.
- El acceso de superadministrador debe ser concedido por un operador confiable en la base de datos, no desde una pantalla cliente.
