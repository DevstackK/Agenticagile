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
})
