import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptySession } from './schema'
import { getStorageStatus, loadSession, saveSession } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a session through save and load', () => {
    const session = createEmptySession('Round Trip')
    session.answers.businessCase.problemStatement = 'Too much manual work'

    const saved = saveSession(session)
    expect(saved).toBe(true)

    const result = loadSession(session.id)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.session.name).toBe('Round Trip')
      expect(result.session.answers.businessCase.problemStatement).toBe('Too much manual work')
    }
  })

  it('returns ok:false for a corrupted session', () => {
    localStorage.setItem('agentic-agile:sessions:bad-id', '{not valid json')
    const result = loadSession('bad-id')
    expect(result.ok).toBe(false)
  })

  it('returns ok:false for a session that fails schema validation', () => {
    localStorage.setItem('agentic-agile:sessions:bad-schema', JSON.stringify({ id: 'bad-schema' }))
    const result = loadSession('bad-schema')
    expect(result.ok).toBe(false)
  })

  it('flags storage unavailable when setItem throws (simulated full storage)', () => {
    const session = createEmptySession('Full Storage')
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })

    const saved = saveSession(session)
    expect(saved).toBe(false)
    expect(getStorageStatus().available).toBe(false)

    spy.mockRestore()
  })
})
