# PayVerify Demo SaaS

PayVerify es una demo funcional de plataforma SaaS enfocada en la verificación inteligente de transferencias bancarias para negocios en Colombia.

## Vision general
La aplicación simula un entorno fintech multiempresa con:
- dashboard ejecutivo para empresas y superadmin
- gestión de sucursales y empleados
- módulos de comprobantes, verificación y movimientos
- integración WhatsApp en modo demo
- planes y suscripción
- datos aislados por empresa para una arquitectura multi-tenant

## Stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Lucide Icons

## Instalación

```bash
npm install
npm run dev
```

Abrir: http://localhost:3000

## Credenciales demo

- Superadministrador: `admin@payverify.co` / `PayVerify2025!`
- Empresa demo: `empresa@elbuen-sabor.com` / `Demo123!`

## Funcionalidades implementadas
- Landing page comercial con CTA y planes
- Login con perfiles demo y selección visual
- Dashboard empresarial con KPIs, alertas y gráficos simples
- Módulo de comprobantes con procesamiento simulado
- Historial de verificaciones con estados: confirmado, rechazado, pendiente y no identificado
- Configuración de WhatsApp con mensajes mock y respuesta de PayVerify
- Sucursales y empleados
- Suscripción y cambio de plan en modo demo
- Panel de superadministrador con métricas globales
- Arquitectura documentada para Supabase/PostgreSQL

## Importante
Todos los resultados de verificación están marcados como demostración y no sustituyen una confirmación bancaria real.

## Estructura del proyecto

```text
payverify-app/
├─ src/
│  ├─ app/
│  │  ├─ dashboard/
│  │  ├─ comprobantes/
│  │  ├─ verificaciones/
│  │  ├─ sucursales/
│  │  ├─ empleados/
│  │  ├─ whatsapp/
│  │  ├─ suscripcion/
│  │  ├─ superadmin/
│  │  ├─ configuracion/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  ├─ not-found.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ app-shell.tsx
│  │  └─ ui.tsx
│  └─ lib/
│     ├─ demo-data.ts
│     └─ utils.ts
├─ docs/
│  ├─ architecture.md
│  └─ schema.sql
├─ .env.example
├─ .eslintrc.json
├─ next-env.d.ts
├─ next.config.mjs
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md
```
