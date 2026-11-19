# Integración WhatsApp Cloud API

La interfaz anterior de WhatsApp era únicamente una maqueta. Esta implementación agrega recepción de imágenes por Meta, idempotencia, validación HMAC, descarga de medios, OCR y creación de comprobantes pendientes.

## Variables de entorno

```dotenv
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_GRAPH_API_VERSION=v21.0
```

Nunca expongas estas variables con `NEXT_PUBLIC_` ni las envíes al navegador.

## Configuración en Meta

1. Crea una aplicación en Meta for Developers y agrega WhatsApp Business.
2. Configura el número empresarial y copia el `phone_number_id` y `business_account_id`.
3. Genera un token de sistema con permisos de WhatsApp Business Management y WhatsApp Business Messaging.
4. Publica el webhook en `https://TU_DOMINIO/api/integrations/whatsapp/webhook`.
5. Usa `WHATSAPP_VERIFY_TOKEN` como token de verificación en Meta.
6. Suscribe el campo `messages` del webhook.
7. Registra el número mediante `POST /api/integrations/whatsapp` usando una sesión de administrador.

## Flujo real

Meta → webhook firmado → resolución por `phone_number_id` → registro idempotente → descarga de imagen → Vision `DOCUMENT_TEXT_DETECTION` → `proof_documents` en `pending` → `verification_events` y `audit_logs` → mensaje de respuesta.

Un OCR nunca confirma un pago. Todo comprobante recibido por WhatsApp requiere revisión manual.

## Migración

Aplicar después del esquema inicial:

```bash
supabase db push
```

La migración crea `whatsapp_connections` y `whatsapp_messages`, activa RLS y aplica aislamiento por empresa. El webhook utiliza `service_role` exclusivamente server-side después de validar la firma y el `phone_number_id`.

## Prueba de verificación

Meta ejecuta una petición GET con `hub.mode=subscribe`, `hub.verify_token` y `hub.challenge`. El endpoint devuelve el challenge solo con token correcto.

Para un POST, Meta debe enviar `X-Hub-Signature-256`. Una firma inválida se rechaza con 401. El mismo `provider_message_id` no se procesa dos veces.

Envía una imagen JPG, PNG o WEBP con texto ficticio. Debe crearse un comprobante `pending`, una verificación `pending` y una auditoría. Los mensajes de texto u otros medios reciben una respuesta indicando que se necesita una imagen.

## Límites conocidos

La descarga se valida por MIME y tamaño dentro del servicio OCR. Para producción conviene añadir un proxy de descarga con timeout, rate limiting y validación de firma del contenido. Los tokens de Meta deben rotarse mediante el gestor de secretos del proveedor.
