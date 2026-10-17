import { describe, expect, it } from 'vitest'
import { RequirementsDraftSchema } from './requirementsDraftSchema'

function validDraft() {
  return {
    initiative: { title: 'Launch cloud app', description: 'Ship the MVP' },
    epics: [
      {
        title: 'Onboarding',
        description: 'Get new users set up',
        stories: [
          {
            title: 'Sign up',
            userStory: { role: 'new user', capability: 'create an account', benefit: 'I can start using the app' },
            acceptanceCriteria: ['WHEN a user submits valid details THEN the system SHALL create an account.'],
          },
        ],
      },
    ],
  }
}

describe('RequirementsDraftSchema', () => {
  it('accepts a valid draft', () => {
    expect(RequirementsDraftSchema.safeParse(validDraft()).success).toBe(true)
  })

  it('rejects an epic with zero stories', () => {
    const draft = validDraft()
    draft.epics[0].stories = []
    expect(RequirementsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it('rejects a story with zero acceptance criteria', () => {
    const draft = validDraft()
    draft.epics[0].stories[0].acceptanceCriteria = []
    expect(RequirementsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it('rejects a missing initiative title', () => {
    const draft = validDraft()
    draft.initiative.title = ''
    expect(RequirementsDraftSchema.safeParse(draft).success).toBe(false)
  })

  it('rejects an initiative with zero epics', () => {
    const draft = validDraft()
    draft.epics = []
    expect(RequirementsDraftSchema.safeParse(draft).success).toBe(false)
  })
})
