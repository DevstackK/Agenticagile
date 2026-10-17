import { describe, expect, it } from 'vitest'
import { SessionSchema, createEmptySession } from './schema'

describe('SessionSchema', () => {
  it('accepts a valid session', () => {
    const session = createEmptySession('Test Session')
    const result = SessionSchema.safeParse(session)
    expect(result.success).toBe(true)
  })

  it('rejects a session missing a required top-level key', () => {
    const session = createEmptySession('Test Session')
    const { name: _name, ...withoutName } = session
    const result = SessionSchema.safeParse(withoutName)
    expect(result.success).toBe(false)
  })

  it('rejects a session with a wrong-type field', () => {
    const session = createEmptySession('Test Session')
    const broken = { ...session, activeStageIndex: 'zero' }
    const result = SessionSchema.safeParse(broken)
    expect(result.success).toBe(false)
  })

  it('rejects a session with an out-of-range stage index', () => {
    const session = createEmptySession('Test Session')
    const broken = { ...session, activeStageIndex: 7 }
    const result = SessionSchema.safeParse(broken)
    expect(result.success).toBe(false)
  })

  it('backfills a default stageGate when loading a session saved before this field existed', () => {
    const session = createEmptySession('Legacy Session')
    const { stageGate: _stageGate, ...legacy } = session
    const result = SessionSchema.safeParse(legacy)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stageGate).toEqual({
        status: 'pending',
        deckUrl: null,
        deckGeneratedAt: null,
        sentTo: null,
        sentAt: null,
        decidedAt: null,
      })
    }
  })

  it('has status "pending" by default on a fresh session', () => {
    const session = createEmptySession('Fresh')
    expect(session.stageGate.status).toBe('pending')
  })

  it('rejects an invalid stageGate status value', () => {
    const session = createEmptySession('Test')
    const broken = { ...session, stageGate: { ...session.stageGate, status: 'maybe' } }
    const result = SessionSchema.safeParse(broken)
    expect(result.success).toBe(false)
  })
})
