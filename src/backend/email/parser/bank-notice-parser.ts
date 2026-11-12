import "server-only";

export type ParsedBankNotice = {
  bankName: string | null;
  senderName: string | null;
  recipientName: string | null;
  amountCop: number | null;
  currency: string;
  reference: string | null;
  operationDate: string | null;
  subject: string | null;
  rawText: string;
  isBankNotification: boolean;
  confidence: number;
  providerMessageId: string;
  parsedPayload: Record<string, unknown>;
};

const bankKeywords = [
  "transferencia",
  "transfer",
  "deposito",
  "pago",
  "abono",
  "banco",
  "movimiento",
  "notificacion",
  "efectivo",
  "credito",
  "debito",
  "consignacion",
  "consignación",
  "comprobante",
  "referencia",
  "confirmacion",
  "confirmación",
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findFirstMatch(text: string, patterns: string[]): string | null {
  for (const pattern of patterns) {
    const index = text.indexOf(pattern.toLowerCase());
    if (index >= 0) return pattern;
  }
  return null;
}

function extractAmount(text: string): number | null {
  const cleaned = text.replace(/[^0-9,\.]/g, " ");
  const matches = cleaned.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/g) ?? [];
  const candidates = matches
    .map((value) => value.replace(".", "").replace(",", "."))
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (candidates.length === 0) return null;
  return Math.round(Math.max(...candidates));
}

function extractReference(text: string): string | null {
  const patterns = [
    /ref(?:erencia)?\s*[:#-]?\s*([A-Z0-9-]+)/i,
    /transferencia\s*[:#-]?\s*([A-Z0-9-]+)/i,
    /voucher\s*[:#-]?\s*([A-Z0-9-]+)/i,
    /pv[-_ ]?test[-_ ]?[0-9]+/i,
    /[A-Z]{2,5}-\d{3,10}/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
    if (match?.[0]) return match[0].trim();
  }

  return null;
}

function extractDate(text: string): string | null {
  const patterns = [
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}\s+(?:de\s+)?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return new Date(match[1]).toISOString();
  }
  return null;
}

export function parseBankNoticeMessage(input: { messageId: string; subject: string | null; body: string; from?: string | null }): ParsedBankNotice {
  const subjectText = input.subject ?? "";
  const combined = `${subjectText}\n${input.body ?? ""}`;
  const normalized = normalizeText(combined);

  const isBankNotification = findFirstMatch(normalized, bankKeywords) !== null || /(transferencia|deposito|abono|pago)/i.test(normalized);
  const amountCop = extractAmount(combined);
  const reference = extractReference(combined);
  const operationDate = extractDate(combined);
  const bankName = /(bancolombia|davivienda|banco de bogota|bbva|banco bogota|nequi|scotiabank|itau|banco popular|banco de occidente)/i.test(normalized)
    ? ((combined.match(/(bancolombia|davivienda|banco de bogota|bbva|banco bogota|nequi|scotiabank|itau|banco popular|banco de occidente)/i) ?? [""])[0] || null)
    : null;

  const senderMatch = input.from?.match(/<([^>]+)>|([^<\s]+)/);
  const senderName = senderMatch?.[1] ?? senderMatch?.[2] ?? null;

  const parsedPayload: Record<string, unknown> = {
    messageId: input.messageId,
    subject: subjectText,
    from: input.from ?? null,
    amount: amountCop,
    reference,
    operationDate,
    bankName,
    senderName,
  };

  return {
    bankName,
    senderName,
    recipientName: null,
    amountCop,
    currency: "COP",
    reference,
    operationDate,
    subject: subjectText,
    rawText: combined,
    isBankNotification,
    confidence: isBankNotification ? (amountCop && reference ? 0.86 : 0.7) : 0,
    providerMessageId: input.messageId,
    parsedPayload,
  };
}
