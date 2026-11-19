# Etapas 1 y 2: configuración y servicio OCR

Esta fase agrega el cliente server-side y el parser OCR, pero todavía no crea el endpoint `/api/ocr` ni persiste comprobantes. Es intencional: primero se valida el proveedor y la extracción de datos sin modificar el flujo existente.

## Dependencia utilizada

El repositorio ya incluía `google-auth-library`. Se reutiliza para solicitar un token OAuth y llamar directamente al endpoint oficial de Cloud Vision. Así se evita añadir otra dependencia y se mantiene `package-lock.json` consistente.

La llamada usa exclusivamente `DOCUMENT_TEXT_DETECTION`.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```dotenv
GOOGLE_CLOUD_PROJECT_ID=mi-proyecto
GOOGLE_CLOUD_CLIENT_EMAIL=payverify-ocr@mi-proyecto.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OCR_MAX_FILE_SIZE_BYTES=10485760
```

Las tres primeras variables son server-only. No deben comenzar por `NEXT_PUBLIC_`, no deben importarse desde componentes React cliente y la clave JSON no debe subirse al repositorio.

## Google Cloud

1. Crear o seleccionar un proyecto de Google Cloud.
2. Habilitar **Cloud Vision API**.
3. Crear una cuenta de servicio exclusiva para OCR.
4. Crear una clave JSON solo si el entorno no usa Workload Identity.
5. Guardar sus valores como secretos del entorno de despliegue.

## Tipos y límites

Se aceptan `image/jpeg`, `image/png` y `image/webp`. El límite predeterminado es 10 MiB. El servicio rechaza archivos vacíos, tipos no permitidos y tamaños superiores antes de contactar a Google.

## Extracción segura

`extractTransferFields` solo reconoce valores que aparecen en una línea con una etiqueta explícita: valor/monto/total, fecha, hora, referencia, autorización, banco de origen o banco de destino. Cuando no puede identificar un valor devuelve `null`.

El parser no usa logotipos, no adivina bancos y no marca ningún pago como confirmado. El texto completo se conserva en memoria para que la etapa posterior lo persista con controles de empresa.

## Prueba manual de la etapa 2

La función `detectDocumentText(file)` se debe invocar desde un contexto server-side, por ejemplo una prueba o el futuro caso de uso. Un comprobante ficticio puede contener:

```text
COMPROBANTE DE TRANSFERENCIA
Banco de origen: Bancolombia
Banco de destino: Davivienda
Valor: $150.000
Fecha: 19/11/2026
Hora: 14:35
Referencia: PED-2026-001
Número de autorización: AUT-884421
```

Resultado esperado del parser:

```json
{
  "amountCop": 150000,
  "date": "2026-11-19",
  "time": "14:35",
  "reference": "PED-2026-001",
  "authorizationNumber": "AUT-884421",
  "sourceBank": "Bancolombia",
  "destinationBank": "Davivienda"
}
```

La etapa siguiente deberá añadir el caso de uso, autorización por `company_id`/`proof_id`, endpoint HTTP, persistencia RLS, auditoría y revisión manual.
