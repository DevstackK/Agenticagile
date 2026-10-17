import { STAGES } from '../data/questions'
import type { Session } from './schema'

export function toJSON(session: Session): string {
  return JSON.stringify(session, null, 2)
}

export function toMarkdown(session: Session): string {
  const lines: string[] = []
  lines.push(`# Discovery Brief: ${session.name}`)
  lines.push('')
  lines.push(`_Generated ${new Date(session.updatedAt).toLocaleString()}_`)
  lines.push('')

  for (const stage of STAGES) {
    lines.push(`## ${stage.title}`)
    lines.push('')
    const stageAnswers = session.answers[stage.key]
    for (const question of stage.questions) {
      const answer = stageAnswers[question.id]
      lines.push(`**${question.label}**`)
      lines.push('')
      lines.push(answer && answer.trim().length > 0 ? answer : '_No answer provided_')
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
