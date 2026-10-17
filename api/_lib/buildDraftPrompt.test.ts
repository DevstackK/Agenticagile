import { describe, expect, it } from 'vitest'
import { buildDraftPrompt } from './buildDraftPrompt'

describe('buildDraftPrompt', () => {
  it('includes the answers content grouped by stage', () => {
    const payload = buildDraftPrompt({
      businessCase: { problemStatement: 'Manual onboarding is slow' },
      userResearch: {},
      baRequirements: {},
      tradeoffs: {},
    })
    const content = payload.messages[0].content
    expect(content).toContain('Business Case Discovery')
    expect(content).toContain('problemStatement: Manual onboarding is slow')
  })

  it('includes explicit JSON-schema instructions in the system prompt', () => {
    const payload = buildDraftPrompt({
      businessCase: {},
      userResearch: {},
      baRequirements: {},
      tradeoffs: {},
    })
    expect(payload.system).toContain('"initiative"')
    expect(payload.system).toContain('"acceptanceCriteria"')
    expect(payload.system).toContain('ONLY a single JSON object')
  })

  it('omits empty stages from the brief section', () => {
    const payload = buildDraftPrompt({
      businessCase: { problemStatement: 'X' },
      userResearch: {},
      baRequirements: {},
      tradeoffs: {},
    })
    const content = payload.messages[0].content
    expect(content).not.toContain('User Research')
  })
})
