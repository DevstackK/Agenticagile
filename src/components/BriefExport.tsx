import { STAGES } from '../data/questions'
import { downloadFile, toJSON, toMarkdown } from '../lib/export'
import type { Session } from '../lib/schema'

type Props = {
  session: Session
  onBack: () => void
  onExit: () => void
}

function slug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'session'
}

export function BriefExport({ session, onBack, onExit }: Props) {
  const base = slug(session.name)

  return (
    <div className="brief-export">
      <h2>Discovery Brief: {session.name}</h2>

      <div className="brief-actions">
        <button type="button" onClick={() => downloadFile(`${base}-brief.json`, toJSON(session), 'application/json')}>
          Export Brief (JSON)
        </button>
        <button type="button" onClick={() => downloadFile(`${base}-brief.md`, toMarkdown(session), 'text/markdown')}>
          Export Brief (Markdown)
        </button>
        <button
          type="button"
          onClick={() => downloadFile(`${base}-session.json`, toJSON(session), 'application/json')}
        >
          Export Session for Sharing
        </button>
      </div>

      <div className="brief-body">
        {STAGES.map((stage) => (
          <section key={stage.key}>
            <h3>{stage.title}</h3>
            {stage.questions.map((question) => (
              <div key={question.id} className="brief-answer">
                <strong>{question.label}</strong>
                <p>{session.answers[stage.key][question.id] || <em>No answer provided</em>}</p>
              </div>
            ))}
          </section>
        ))}
      </div>

      <div className="brief-nav">
        <button type="button" onClick={onBack}>
          Back to editing
        </button>
        <button type="button" onClick={onExit}>
          Done — back to sessions
        </button>
      </div>
    </div>
  )
}
