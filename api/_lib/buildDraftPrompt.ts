import type { DraftAnswers } from './validateDraftRequest'
import type { AnthropicMessagesPayload } from './buildAnthropicMessages'

const STAGE_LABELS: Record<keyof DraftAnswers, string> = {
  businessCase: 'Business Case Discovery',
  userResearch: 'User Research',
  baRequirements: 'BA Requirements Elicitation',
  tradeoffs: 'Trade-off Analysis',
}

const MODEL = 'claude-sonnet-5'
const MAX_TOKENS = 8000

const JSON_SHAPE_EXAMPLE = `{
  "initiative": { "title": "string", "description": "string" },
  "epics": [
    {
      "title": "string",
      "description": "string",
      "stories": [
        {
          "title": "string",
          "userStory": { "role": "string", "capability": "string", "benefit": "string" },
          "acceptanceCriteria": ["WHEN ... THEN the system SHALL ..."]
        }
      ]
    }
  ]
}`

export function buildDraftPrompt(answers: DraftAnswers): AnthropicMessagesPayload {
  const system =
    'You convert a product discovery brief into a backlog structure: one Initiative, broken into Epics, ' +
    'broken into Stories. Each Story must include a user story (role/capability/benefit) and one or more ' +
    'EARS-style acceptance criteria ("WHEN/IF ... THEN the system SHALL ..."). ' +
    'Every Epic must have at least one Story, and every Story must have at least one acceptance criterion. ' +
    'Respond with ONLY a single JSON object matching this shape, no markdown fences, no commentary:\n\n' +
    JSON_SHAPE_EXAMPLE

  const briefSections = (Object.keys(STAGE_LABELS) as Array<keyof DraftAnswers>)
    .map((key) => {
      const entries = Object.entries(answers[key])
      if (entries.length === 0) return null
      const lines = entries.map(([question, answer]) => `- ${question}: ${answer}`).join('\n')
      return `## ${STAGE_LABELS[key]}\n${lines}`
    })
    .filter((section): section is string => Boolean(section))
    .join('\n\n')

  const userContent = `Discovery brief:\n\n${briefSections}`

  return {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: 'user', content: userContent }],
  }
}
