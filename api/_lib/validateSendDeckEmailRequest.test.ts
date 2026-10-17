import { describe, expect, it } from 'vitest'
import { validateSendDeckEmailRequest } from './validateSendDeckEmailRequest'

describe('validateSendDeckEmailRequest', () => {
  it('accepts a valid body', () => {
    const result = validateSendDeckEmailRequest({ to: 'exec@example.com', deckUrl: 'https://gamma.app/docs/abc' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.to).toBe('exec@example.com')
    }
  })

  it('rejects an invalid email', () => {
    const result = validateSendDeckEmailRequest({ to: 'not-an-email', deckUrl: 'https://gamma.app/docs/abc' })
    expect(result.ok).toBe(false)
  })

  it('rejects a missing deckUrl', () => {
    const result = validateSendDeckEmailRequest({ to: 'exec@example.com' })
    expect(result.ok).toBe(false)
  })

  it('rejects non-object bodies', () => {
    expect(validateSendDeckEmailRequest(null).ok).toBe(false)
  })
})
