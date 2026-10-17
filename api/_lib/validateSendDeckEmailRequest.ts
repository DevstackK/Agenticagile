const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SendDeckEmailRequest = { to: string; deckUrl: string }

export type ValidationResult = { ok: true; data: SendDeckEmailRequest } | { ok: false; error: string }

export function validateSendDeckEmailRequest(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'to and deckUrl are required' }
  }

  const record = body as Record<string, unknown>

  if (typeof record.to !== 'string' || !EMAIL_PATTERN.test(record.to)) {
    return { ok: false, error: 'a valid "to" email address is required' }
  }

  if (typeof record.deckUrl !== 'string' || record.deckUrl.trim().length === 0) {
    return { ok: false, error: 'deckUrl is required' }
  }

  return { ok: true, data: { to: record.to, deckUrl: record.deckUrl } }
}
