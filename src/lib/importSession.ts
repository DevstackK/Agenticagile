import { SessionSchema, type Session } from './schema'

export type ImportResult = { ok: true; session: Session } | { ok: false; error: string }

export async function importSessionFromFile(file: File): Promise<ImportResult> {
  let text: string
  try {
    text = await file.text()
  } catch {
    return { ok: false, error: 'Could not read the selected file.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }

  const result = SessionSchema.safeParse(parsed)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const path = firstIssue?.path.join('.') || '(root)'
    return { ok: false, error: `File does not match the expected session format (${path}: ${firstIssue?.message}).` }
  }

  return { ok: true, session: result.data }
}
