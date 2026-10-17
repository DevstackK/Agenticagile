import { describe, expect, it } from 'vitest'
import { validateSuggestRequest } from './validateSuggestRequest'

describe('validateSuggestRequest', () => {
  it('accepts a valid body', () => {
    const result = validateSuggestRequest({
      question: 'What problem does this solve?',
      grounding: 'Lean Inception',
      contextAnswers: { foo: 'bar' },
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.question).toBe('What problem does this solve?')
      expect(result.data.contextAnswers).toEqual({ foo: 'bar' })
    }
  })

  it('rejects a body missing question', () => {
    const result = validateSuggestRequest({ grounding: 'Lean Inception' })
    expect(result.ok).toBe(false)
  })

  it('rejects a body with an empty question string', () => {
    const result = validateSuggestRequest({ question: '   ' })
    expect(result.ok).toBe(false)
  })

  it('rejects non-object bodies', () => {
    expect(validateSuggestRequest(null).ok).toBe(false)
    expect(validateSuggestRequest('string').ok).toBe(false)
  })

  it('defaults contextAnswers to {} when absent', () => {
    const result = validateSuggestRequest({ question: 'Q?' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.contextAnswers).toEqual({})
    }
  })
})
