import { describe, expect, it } from 'vitest'
import { validateDraftRequest } from './validateDraftRequest'

function validBody() {
  return {
    businessCase: { problemStatement: 'Manual onboarding is slow' },
    userResearch: { jobToBeDone: 'Get productive fast' },
    baRequirements: { functionalRequirements: 'Must support SSO' },
    tradeoffs: { buildBuyExtend: 'Buy' },
  }
}

describe('validateDraftRequest', () => {
  it('accepts a valid body', () => {
    const result = validateDraftRequest(validBody())
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.businessCase.problemStatement).toBe('Manual onboarding is slow')
    }
  })

  it('rejects a body missing a stage key', () => {
    const body = validBody()
    // @ts-expect-error testing invalid input
    delete body.tradeoffs
    const result = validateDraftRequest(body)
    expect(result.ok).toBe(false)
  })

  it('filters non-string values out of a stage', () => {
    const body = validBody() as Record<string, unknown>
    body.businessCase = { ...(body.businessCase as object), weird: 42 }
    const result = validateDraftRequest(body)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.businessCase.weird).toBeUndefined()
    }
  })

  it('rejects non-object bodies', () => {
    expect(validateDraftRequest(null).ok).toBe(false)
    expect(validateDraftRequest('nope').ok).toBe(false)
  })
})
