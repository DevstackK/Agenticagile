export type DeckResult = { ok: true; deckUrl: string } | { ok: false; error: string }
export type SendResult = { ok: true; sentAt: string } | { ok: false; error: string }

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function requestGenerateDeck(businessCaseAnswers: Record<string, string>): Promise<DeckResult> {
  try {
    const response = await fetch('/api/generate-deck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessCase: businessCaseAnswers }),
    })

    const data = (await response.json().catch(() => null)) as { error?: string; deckUrl?: string } | null

    if (!response.ok) {
      const message = data && typeof data.error === 'string' ? data.error : `Request failed (${response.status})`
      return { ok: false, error: message }
    }

    if (!data || typeof data.deckUrl !== 'string') {
      return { ok: false, error: 'Unexpected response from deck generator.' }
    }

    return { ok: true, deckUrl: data.deckUrl }
  } catch {
    return { ok: false, error: 'Could not reach the deck generator. Check your connection and try again.' }
  }
}

export async function requestSendDeckEmail(to: string, deckUrl: string): Promise<SendResult> {
  try {
    const response = await fetch('/api/send-deck-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, deckUrl }),
    })

    const data = (await response.json().catch(() => null)) as { error?: string; sentAt?: string } | null

    if (!response.ok) {
      const message = data && typeof data.error === 'string' ? data.error : `Request failed (${response.status})`
      return { ok: false, error: message }
    }

    if (!data || typeof data.sentAt !== 'string') {
      return { ok: false, error: 'Unexpected response from email sender.' }
    }

    return { ok: true, sentAt: data.sentAt }
  } catch {
    return { ok: false, error: 'Could not reach the email sender. Check your connection and try again.' }
  }
}
