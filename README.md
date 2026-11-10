# PayVerify Demo SaaS

Demo fintech para conciliación y validación de transferencias en comercios colombianos. Proyecto Next.js con separación por capas frontend/backend y soporte opcional de Supabase/PostgreSQL.

## Carpetas
- `src/frontend`: componentes visuales, datos de demostración y utilidades de UI.
- `src/backend`: sesión, configuración server-side y casos de uso de API.
- `src/app`: rutas Next.js y adaptadores HTTP necesarios para App Router.
- `supabase/migrations`: esquema PostgreSQL y políticas RLS.

Consulta [`docs/folder-structure.md`](docs/folder-structure.md) para el detalle de límites entre capas y [`docs/backend.md`](docs/backend.md) para activar Supabase.

## Ejecutar
```bash
npm install
npm run dev
```
Abrir `http://localhost:3000`.

## Modo demo
Los perfiles visibles en el login sirven solo para presentar la interfaz; no autentican las API ni sustituyen Supabase Auth.
- Superadmin demo: `admin@payverify.co` / `PayVerify2025!`
- Empresa demo: `empresa@elbuen-sabor.com` / `Demo123!`

Los correos bancarios, las integraciones OAuth, OCR y confirmaciones siguen simulados/no conectados. No son confirmaciones bancarias reales.
