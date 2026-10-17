const STAGE_KEYS = ['businessCase', 'userResearch', 'baRequirements', 'tradeoffs'] as const
type StageKey = (typeof STAGE_KEYS)[number]

export type DraftAnswers = Record<StageKey, Record<string, string>>

export type ValidationResult = { ok: true; data: DraftAnswers } | { ok: false; error: string }

function validateStage(value: unknown): Record<string, string> | null {
  if (typeof value !== 'object' || value === null) return null
  const stage: Record<string, string> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === 'string') {
      stage[key] = val
    }
  }
  return stage
}

export function validateDraftRequest(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'answers are required' }
  }

  const record = body as Record<string, unknown>
  const data = {} as DraftAnswers

  for (const key of STAGE_KEYS) {
    const stage = validateStage(record[key])
    if (!stage) {
      return { ok: false, error: `missing or invalid "${key}" answers` }
    }
    data[key] = stage
  }

  return { ok: true, data }
}
