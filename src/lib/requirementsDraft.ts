import type { RequirementsDraft } from '../../api/_lib/requirementsDraftSchema'
import type { Answers } from './schema'

export type { RequirementsDraft }

export type DraftResult = { ok: true; draft: RequirementsDraft } | { ok: false; error: string }

export async function requestRequirementsDraft(answers: Answers): Promise<DraftResult> {
  try {
    const response = await fetch('/api/draft-requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })

    const data = (await response.json().catch(() => null)) as { error?: string; draft?: RequirementsDraft } | null

    if (!response.ok) {
      const message = data && typeof data.error === 'string' ? data.error : `Request failed (${response.status})`
      return { ok: false, error: message }
    }

    if (!data || !data.draft) {
      return { ok: false, error: 'Unexpected response from AI helper.' }
    }

    return { ok: true, draft: data.draft }
  } catch {
    return { ok: false, error: 'Could not reach the AI helper. Check your connection and try again.' }
  }
}

export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(fields: string[]): string {
  return fields.map(csvEscape).join(',')
}

export function toJiraCsv(draft: RequirementsDraft): string {
  const rows = ['Issue Type,Summary,Description,Epic Name,Epic Link']

  for (const epic of draft.epics) {
    rows.push(csvRow(['Epic', epic.title, epic.description, epic.title, '']))

    for (const story of epic.stories) {
      const userStory = `As a ${story.userStory.role}, I want ${story.userStory.capability}, so that ${story.userStory.benefit}.`
      const criteria = story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
      const description = `${userStory}\n\nAcceptance Criteria:\n${criteria}`
      rows.push(csvRow(['Story', story.title, description, '', epic.title]))
    }
  }

  return rows.join('\n')
}

export function toDraftMarkdown(draft: RequirementsDraft): string {
  const lines: string[] = []
  lines.push(`# ${draft.initiative.title}`)
  if (draft.initiative.description) {
    lines.push('', draft.initiative.description)
  }

  for (const epic of draft.epics) {
    lines.push('', `## Epic: ${epic.title}`)
    if (epic.description) {
      lines.push('', epic.description)
    }

    for (const story of epic.stories) {
      lines.push('', `### Story: ${story.title}`)
      lines.push('', `**As a** ${story.userStory.role}, **I want** ${story.userStory.capability}, **so that** ${story.userStory.benefit}.`)
      lines.push('', '**Acceptance Criteria:**')
      story.acceptanceCriteria.forEach((criterion, i) => {
        lines.push(`${i + 1}. ${criterion}`)
      })
    }
  }

  return lines.join('\n')
}
