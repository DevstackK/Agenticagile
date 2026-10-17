import type { SuggestRequestBody } from '../lib/suggest'

export type AnthropicMessagesPayload = {
  model: string
  max_tokens: number
  system: string
  messages: Array<{ role: 'user'; content: string }>
}

const MODEL = 'claude-sonnet-5'
const MAX_TOKENS = 400

export function buildAnthropicMessages(data: SuggestRequestBody): AnthropicMessagesPayload {
  const system =
    'You help draft answers for a product discovery questionnaire. ' +
    'Write a concise, first-person draft answer (2-4 sentences) for the given question. ' +
    'Ground your answer in the stated methodology where relevant. ' +
    'Use the provided context answers for consistency, but do not repeat them verbatim. ' +
    'Return only the draft answer text, with no preamble or labels.'

  const contextLines = Object.entries(data.contextAnswers)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n')

  const userContent = [
    `Question: ${data.question}`,
    data.grounding ? `Grounding methodology: ${data.grounding}` : null,
    contextLines ? `Context from other answers already given:\n${contextLines}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n\n')

  return {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: 'user', content: userContent }],
  }
}
