# Arquitectura PayVerify

## Visión general
PayVerify es una demo SaaS multiempresa desarrollada en Next.js para demostrar la validación inteligente de transferencias bancarias en Colombia. El modelo está pensado para aislar empresas, sucursales y empleados con roles y permisos.

## Capas

### 1. Frontend
- App Router de Next.js
- TypeScript
- Tailwind CSS
- Componentes reutilizables para layout, tarjetas y métricas

### 2. Domain logic
- Estado de verificación: confirmado, rechazado, pendiente y no identificado
- Reglas demo: monto, referencia, fecha, cuenta y duplicados
- Validación de duplicados y registros de actividad

### 3. Persistencia
- Estructura preparada para PostgreSQL / Supabase
- Políticas de seguridad propuestas con RLS para aislamiento por empresa

### 4. Integraciones simuladas
- OCR local mock
- WhatsApp mock
- Motor de comparación bancario en entorno demo

## Multi-tenancy
Cada entidad tiene una relación con `company_id`, con la intención de aislar datos en el mismo backend. La estructura de rutas y permisos está preparada para aplicar políticas por rol y aislamiento de datos.

## Roadmap a producción
- Supabase Auth
- PostgreSQL + Row Level Security
- Edge Functions para procesamiento y webhooks
- OCR real y conexión bancaria segura
