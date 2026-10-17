import { describe, expect, it } from 'vitest'
import { STAGES } from '../data/questions'
import { createEmptySession } from './schema'
import { toJSON, toMarkdown } from './export'

describe('export', () => {
  it('toJSON produces output that matches the session', () => {
    const session = createEmptySession('JSON Test')
    session.answers.businessCase.problemStatement = 'Manual onboarding takes too long'

    const json = toJSON(session)
    const parsed = JSON.parse(json)

    expect(parsed.name).toBe('JSON Test')
    expect(parsed.answers.businessCase.problemStatement).toBe('Manual onboarding takes too long')
  })

  it('toMarkdown includes all four stages and the given answers', () => {
    const session = createEmptySession('Markdown Test')
    session.answers.businessCase.problemStatement = 'Manual onboarding takes too long'
    session.answers.userResearch.jobToBeDone = 'Get a new hire productive on day one'
    session.answers.baRequirements.functionalRequirements = 'Must support SSO'
    session.answers.tradeoffs.buildBuyExtend = 'Buy'

    const markdown = toMarkdown(session)

    for (const stage of STAGES) {
      expect(markdown).toContain(`## ${stage.title}`)
    }
    expect(markdown).toContain('Manual onboarding takes too long')
    expect(markdown).toContain('Get a new hire productive on day one')
    expect(markdown).toContain('Must support SSO')
    expect(markdown).toContain('Buy')
  })

  it('toMarkdown marks unanswered questions', () => {
    const session = createEmptySession('Empty Test')
    const markdown = toMarkdown(session)
    expect(markdown).toContain('_No answer provided_')
  })
})
