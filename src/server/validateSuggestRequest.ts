import type { SuggestRequestBody } from '../lib/suggest'

export type ValidationResult =
  | { ok: true; data: SuggestRequestBody }
  | { ok: false; error: string }

export function validateSuggestRequest(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'question is required' }
  }

  const record = body as Record<string, unknown>

  if (typeof record.question !== 'string' || record.question.trim().length === 0) {
    return { ok: false, error: 'question is required' }
  }

  const grounding = typeof record.grounding === 'string' ? record.grounding : ''

  const contextAnswers: Record<string, string> = {}
  if (record.contextAnswers && typeof record.contextAnswers === 'object') {
    for (const [key, value] of Object.entries(record.contextAnswers as Record<string, unknown>)) {
      if (typeof value === 'string') {
        contextAnswers[key] = value
      }
    }
  }

  return {
    ok: true,
    data: { question: record.question, grounding, contextAnswers },
  }
}
