import { z } from 'zod'

const AnswerValue = z.union([z.string(), z.null()])

export const AnswersSchema = z.object({
  businessCase: z.record(z.string(), AnswerValue),
  userResearch: z.record(z.string(), AnswerValue),
  baRequirements: z.record(z.string(), AnswerValue),
  tradeoffs: z.record(z.string(), AnswerValue),
})

export const SessionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activeStageIndex: z.number().min(0).max(3),
  answers: AnswersSchema,
})

export type Session = z.infer<typeof SessionSchema>
export type Answers = z.infer<typeof AnswersSchema>
export type StageKey = keyof Answers

export function createEmptySession(name: string): Session {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    activeStageIndex: 0,
    answers: {
      businessCase: {},
      userResearch: {},
      baRequirements: {},
      tradeoffs: {},
    },
  }
}
