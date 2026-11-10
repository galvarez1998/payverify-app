# Organización de carpetas: frontend y backend

PayVerify conserva Next.js App Router. Para respetar sus convenciones, `src/app` sigue siendo el punto de entrada de rutas, layouts y adaptadores HTTP; la lógica de presentación está separada en `src/frontend` y la lógica de servidor en `src/backend`.

```text
src/
├── app/                         # Rutas Next.js, páginas y adaptadores API (/api/*)
│   └── api/                     # HTTP: parsea requests y traduce respuestas
├── frontend/                    # Presentación y datos exclusivamente demo
│   ├── components/              # AppShell, Card, Metric y UI compartida
│   ├── data/                    # Fixtures locales para modo demo
│   └── lib/                     # Utilidades de presentación
├── backend/                     # Lógica de servidor; no importar desde componentes cliente
│   ├── auth/                    # Resolución de sesión Supabase
│   ├── companies/               # Casos de uso/repositorio de compañías
│   ├── config/                  # Variables y configuración server-side
│   └── supabase/                # Cliente de servidor y middleware de sesión
├── components/                  # Re-exportadores de compatibilidad para imports existentes
└── lib/                         # Re-exportadores de compatibilidad para imports existentes

supabase/migrations/             # Migraciones PostgreSQL/Supabase
```

## Límites de capas
- Los componentes React de `src/frontend` nunca contienen claves secretas ni acceden a tokens privilegiados.
- `src/backend` se importa solo desde middleware, Server Components o Route Handlers.
- `src/app/api` contiene adaptadores pequeños; validación y casos de uso viven en backend.
- Los re-exportadores `src/components` y `src/lib` mantienen funcionando las rutas UI existentes mientras se migra el resto gradualmente.
- La API utiliza sesión real de Supabase y RLS; el selector de perfil de presentación no concede acceso al backend.

Esto separa el código por responsabilidad dentro de un único proyecto Next.js. No son dos aplicaciones desplegables independientes; extraer una API separada requeriría definir contrato HTTP, CORS, autenticación y despliegues propios.
