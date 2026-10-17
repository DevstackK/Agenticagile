import { describe, expect, it } from 'vitest'
import { createEmptySession } from './schema'
import { buildContextAnswers } from './suggest'

describe('buildContextAnswers', () => {
  it('flattens non-empty answers across all four stages', () => {
    const session = createEmptySession('Test')
    session.answers.businessCase.problemStatement = 'Manual onboarding is slow'
    session.answers.userResearch.jobToBeDone = 'Get a new hire productive fast'
    session.answers.baRequirements.functionalRequirements = 'Must support SSO'
    session.answers.tradeoffs.buildBuyExtend = 'Buy'

    const context = buildContextAnswers(session.answers)

    expect(context.problemStatement).toBe('Manual onboarding is slow')
    expect(context.jobToBeDone).toBe('Get a new hire productive fast')
    expect(context.functionalRequirements).toBe('Must support SSO')
    expect(context.buildBuyExtend).toBe('Buy')
  })

  it('filters out empty, whitespace-only, and unset answers', () => {
    const session = createEmptySession('Test')
    session.answers.businessCase.problemStatement = 'Real answer'
    session.answers.businessCase.costOfInaction = '   '
    session.answers.businessCase.urgencyDriver = ''

    const context = buildContextAnswers(session.answers)

    expect(context.problemStatement).toBe('Real answer')
    expect(context.costOfInaction).toBeUndefined()
    expect(context.urgencyDriver).toBeUndefined()
  })

  it('returns an empty object for a fresh session', () => {
    const session = createEmptySession('Test')
    expect(buildContextAnswers(session.answers)).toEqual({})
  })
})
