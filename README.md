# PayVerify Demo SaaS

PayVerify es una demo SaaS para la verificación inteligente de transferencias bancarias en negocios de Colombia. El frontend y los flujos locales funcionan en modo demo; el backend PostgreSQL/Supabase puede activarse con las instrucciones de [`docs/backend.md`](docs/backend.md).

## Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS y Lucide Icons
- Supabase Auth + PostgreSQL/RLS (opcional, requiere un proyecto y variables propios)

## Ejecutar la demo
```bash
npm install
npm run dev
```
Abre `http://localhost:3000`.

## Perfiles de presentación
- Superadministrador demo: `admin@payverify.co` / `PayVerify2025!`
- Empresa demo: `empresa@elbuen-sabor.com` / `Demo123!`

Estos perfiles son únicamente demostrativos y no autentican las API del backend.

## Backend y base de datos
Consulta [`docs/backend.md`](docs/backend.md) para crear el proyecto Supabase, aplicar la migración multiempresa y probar `/api/health`, `/api/me` y `/api/companies`.

## Integraciones todavía no conectadas
- OAuth Gmail/Outlook, Gmail API y Microsoft Graph
- OCR externo
- WhatsApp/Meta
- Conexiones bancarias

Los estados y resultados del frontend son simulados; no constituyen confirmaciones bancarias reales.
