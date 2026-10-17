import type { Answers } from './schema'

export type SuggestRequestBody = {
  question: string
  grounding: string
  contextAnswers: Record<string, string>
}

export type SuggestResult = { ok: true; suggestion: string } | { ok: false; error: string }

export function buildContextAnswers(allAnswers: Answers): Record<string, string> {
  const context: Record<string, string> = {}
  for (const stage of Object.values(allAnswers)) {
    for (const [questionId, value] of Object.entries(stage)) {
      if (value && value.trim().length > 0) {
        context[questionId] = value
      }
    }
  }
  return context
}

export async function requestSuggestion(body: SuggestRequestBody): Promise<SuggestResult> {
  try {
    const response = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await response.json().catch(() => null)) as { error?: string; suggestion?: string } | null

    if (!response.ok) {
      const message = data && typeof data.error === 'string' ? data.error : `Request failed (${response.status})`
      return { ok: false, error: message }
    }

    if (!data || typeof data.suggestion !== 'string') {
      return { ok: false, error: 'Unexpected response from AI helper.' }
    }

    return { ok: true, suggestion: data.suggestion }
  } catch {
    return { ok: false, error: 'Could not reach the AI helper. Check your connection and try again.' }
  }
}
