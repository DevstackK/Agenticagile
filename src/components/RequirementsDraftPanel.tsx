import { useState } from 'react'
import { downloadFile } from '../lib/export'
import type { Answers } from '../lib/schema'
import { requestRequirementsDraft, toDraftMarkdown, toJiraCsv, type RequirementsDraft } from '../lib/requirementsDraft'

type PanelState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; draft: RequirementsDraft }
  | { status: 'error'; message: string }

type Props = {
  answers: Answers
  fileBase: string
}

export function RequirementsDraftPanel({ answers, fileBase }: Props) {
  const [state, setState] = useState<PanelState>({ status: 'idle' })

  async function generate() {
    setState({ status: 'loading' })
    const result = await requestRequirementsDraft(answers)
    setState(result.ok ? { status: 'ready', draft: result.draft } : { status: 'error', message: result.error })
  }

  if (state.status === 'idle') {
    return (
      <div className="requirements-draft-panel">
        <button type="button" onClick={generate}>
          Generate Requirements Draft
        </button>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="requirements-draft-panel">
        <button type="button" disabled>
          Generating…
        </button>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="requirements-draft-panel">
        <div className="error-message">{state.message}</div>
        <button type="button" onClick={generate}>
          Retry
        </button>
      </div>
    )
  }

  const { draft } = state

  return (
    <div className="requirements-draft-panel requirements-draft-ready">
      <h3>Requirements Draft: {draft.initiative.title}</h3>
      {draft.initiative.description && <p>{draft.initiative.description}</p>}

      <div className="requirements-draft-actions">
        <button
          type="button"
          onClick={() => downloadFile(`${fileBase}-requirements.csv`, toJiraCsv(draft), 'text/csv')}
        >
          Export CSV (Jira import)
        </button>
        <button
          type="button"
          onClick={() => downloadFile(`${fileBase}-requirements.md`, toDraftMarkdown(draft), 'text/markdown')}
        >
          Export Markdown
        </button>
        <button type="button" onClick={generate}>
          Regenerate
        </button>
        <button type="button" onClick={() => setState({ status: 'idle' })}>
          Back
        </button>
      </div>

      <div className="requirements-draft-body">
        {draft.epics.map((epic) => (
          <section key={epic.title} className="requirements-draft-epic">
            <h4>Epic: {epic.title}</h4>
            {epic.description && <p>{epic.description}</p>}
            {epic.stories.map((story) => (
              <div key={story.title} className="requirements-draft-story">
                <h5>Story: {story.title}</h5>
                <p>
                  <strong>As a</strong> {story.userStory.role}, <strong>I want</strong> {story.userStory.capability},{' '}
                  <strong>so that</strong> {story.userStory.benefit}.
                </p>
                <strong>Acceptance Criteria:</strong>
                <ol>
                  {story.acceptanceCriteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ol>
                <p>
                  <strong>Recommended strategy:</strong> {story.strategy} — {story.strategyRationale}
                </p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
