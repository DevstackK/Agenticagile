import { describe, expect, it } from 'vitest'
import { buildDeckOutline } from './buildDeckOutline'

describe('buildDeckOutline', () => {
  it('includes each question label and its answer', () => {
    const outline = buildDeckOutline({
      problemStatement: 'Manual onboarding is slow',
      urgencyDriver: 'Losing deals to competitors',
    })
    expect(outline).toContain('What problem does this solve, and for whom specifically?')
    expect(outline).toContain('Manual onboarding is slow')
    expect(outline).toContain("What's driving urgency now versus later?")
    expect(outline).toContain('Losing deals to competitors')
  })

  it('skips empty or whitespace-only answers', () => {
    const outline = buildDeckOutline({
      problemStatement: 'Manual onboarding is slow',
      costOfInaction: '   ',
      budgetTimeline: '',
    })
    expect(outline).not.toContain('cost of inaction')
    expect(outline).not.toContain('budget envelope')
  })

  it('falls back to the raw key for an unknown question id', () => {
    const outline = buildDeckOutline({ someUnknownQuestion: 'An answer' })
    expect(outline).toContain('someUnknownQuestion')
    expect(outline).toContain('An answer')
  })
})
