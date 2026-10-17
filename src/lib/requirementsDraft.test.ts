import { describe, expect, it } from 'vitest'
import { csvEscape, toDraftMarkdown, toJiraCsv, type RequirementsDraft } from './requirementsDraft'

function sampleDraft(): RequirementsDraft {
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
            acceptanceCriteria: [
              'WHEN a user submits valid details THEN the system SHALL create an account.',
              'IF the email is already registered THEN the system SHALL show an error.',
            ],
          },
        ],
      },
    ],
  }
}

describe('csvEscape', () => {
  it('leaves plain text unchanged', () => {
    expect(csvEscape('Sign up')).toBe('Sign up')
  })

  it('wraps and escapes a value containing a comma', () => {
    expect(csvEscape('a, b')).toBe('"a, b"')
  })

  it('wraps and doubles quotes in a value containing a quote', () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
  })

  it('wraps a value containing a newline', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('toJiraCsv', () => {
  it('produces a header row, one Epic row, and one Story row per story', () => {
    const csv = toJiraCsv(sampleDraft())
    const lines = csv.split('\n').filter((l) => !l.startsWith('WHEN') && !l.startsWith('IF') && !l.startsWith('1.') && !l.startsWith('2.') && !l.startsWith('Acceptance') && !l.startsWith('As a'))

    expect(lines[0]).toBe('Issue Type,Summary,Description,Epic Name,Epic Link')
    expect(csv).toContain('Epic,Onboarding,Get new users set up,Onboarding,')
    expect(csv).toContain('Story,Sign up,')
    expect(csv).toContain(',Onboarding') // Epic Link column on the story row
  })
})

describe('toDraftMarkdown', () => {
  it('produces nested headings with user story and acceptance criteria', () => {
    const markdown = toDraftMarkdown(sampleDraft())
    expect(markdown).toContain('# Launch cloud app')
    expect(markdown).toContain('## Epic: Onboarding')
    expect(markdown).toContain('### Story: Sign up')
    expect(markdown).toContain('**As a** new user, **I want** create an account, **so that** I can start using the app.')
    expect(markdown).toContain('1. WHEN a user submits valid details THEN the system SHALL create an account.')
    expect(markdown).toContain('2. IF the email is already registered THEN the system SHALL show an error.')
  })
})
