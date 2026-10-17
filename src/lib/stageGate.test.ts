import { describe, expect, it } from 'vitest'
import { isValidEmail } from './stageGate'

describe('isValidEmail', () => {
  it('accepts a valid email address', () => {
    expect(isValidEmail('exec@example.com')).toBe(true)
  })

  it('rejects a value missing an @', () => {
    expect(isValidEmail('execexample.com')).toBe(false)
  })

  it('rejects a value missing a domain', () => {
    expect(isValidEmail('exec@')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})
