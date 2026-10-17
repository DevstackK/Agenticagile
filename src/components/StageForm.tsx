import { getMissingRequiredQuestionIds, type StageDefinition } from '../data/questions'
import type { Answers, StageKey } from '../lib/schema'

type StageAnswers = Answers[StageKey]

type Props = {
  stage: StageDefinition
  answers: StageAnswers
  onChange: (questionId: string, value: string) => void
  showValidation: boolean
}

export function StageForm({ stage, answers, onChange, showValidation }: Props) {
  const missing = new Set(getMissingRequiredQuestionIds(stage, answers))

  return (
    <div className="stage-form">
      <h2>{stage.title}</h2>
      {stage.questions.map((question) => {
        const value = answers[question.id] ?? ''
        const isMissing = showValidation && missing.has(question.id)

        return (
          <div className={isMissing ? 'question missing' : 'question'} key={question.id}>
            <label htmlFor={question.id}>
              {question.label}
              {question.required && <span className="required-mark"> *</span>}
            </label>
            <div className="grounding-label">via {question.grounding}</div>

            {question.type === 'text' ? (
              <textarea
                id={question.id}
                value={value}
                onChange={(event) => onChange(question.id, event.target.value)}
                rows={3}
              />
            ) : (
              <select
                id={question.id}
                value={value}
                onChange={(event) => onChange(question.id, event.target.value)}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {question.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {isMissing && <div className="missing-message">This question is required.</div>}
          </div>
        )
      })}
    </div>
  )
}
