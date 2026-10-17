import { z } from 'zod'

export const StorySchema = z.object({
  title: z.string().min(1),
  userStory: z.object({
    role: z.string().min(1),
    capability: z.string().min(1),
    benefit: z.string().min(1),
  }),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
})

export const EpicSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  stories: z.array(StorySchema).min(1),
})

export const RequirementsDraftSchema = z.object({
  initiative: z.object({
    title: z.string().min(1),
    description: z.string().default(''),
  }),
  epics: z.array(EpicSchema).min(1),
})

export type Story = z.infer<typeof StorySchema>
export type Epic = z.infer<typeof EpicSchema>
export type RequirementsDraft = z.infer<typeof RequirementsDraftSchema>
