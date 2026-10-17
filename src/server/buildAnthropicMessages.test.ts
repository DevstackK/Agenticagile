import { describe, expect, it } from 'vitest'
import { buildAnthropicMessages } from './buildAnthropicMessages'

describe('buildAnthropicMessages', () => {
  it('includes the question and grounding in the user message', () => {
    const payload = buildAnthropicMessages({
      question: 'What problem does this solve?',
      grounding: 'Lean Inception',
      contextAnswers: {},
    })
    const content = payload.messages[0].content
    expect(content).toContain('What problem does this solve?')
    expect(content).toContain('Lean Inception')
  })

  it('includes only the provided context answers', () => {
    const payload = buildAnthropicMessages({
      question: 'What is the job-to-be-done?',
      grounding: 'Jobs-to-be-Done',
      contextAnswers: { problemStatement: 'Manual onboarding is slow' },
    })
    const content = payload.messages[0].content
    expect(content).toContain('problemStatement: Manual onboarding is slow')
  })

  it('omits the context section when there are no context answers', () => {
    const payload = buildAnthropicMessages({
      question: 'What is the job-to-be-done?',
      grounding: 'Jobs-to-be-Done',
      contextAnswers: {},
    })
    const content = payload.messages[0].content
    expect(content).not.toContain('Context from other answers')
  })
})
