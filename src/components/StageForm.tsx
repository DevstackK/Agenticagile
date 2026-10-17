import { useState } from 'react'
import { getMissingRequiredQuestionIds, type StageDefinition } from '../data/questions'
import type { Answers, StageKey } from '../lib/schema'
import { buildContextAnswers, requestSuggestion } from '../lib/suggest'
import { SuggestionPanel, type SuggestionState } from './SuggestionPanel'

type StageAnswers = Answers[StageKey]

type Props = {
  stage: StageDefinition
  answers: StageAnswers
  allAnswers: Answers
  onChange: (questionId: string, value: string) => void
  showValidation: boolean
}

export function StageForm({ stage, answers, allAnswers, onChange, showValidation }: Props) {
  const missing = new Set(getMissingRequiredQuestionIds(stage, answers))
  const [suggestions, setSuggestions] = useState<Record<string, SuggestionState>>({})

  async function handleRequestSuggestion(questionId: string, label: string, grounding: string) {
    setSuggestions((prev) => ({ ...prev, [questionId]: { status: 'loading' } }))
    const result = await requestSuggestion({
      question: label,
      grounding,
      contextAnswers: buildContextAnswers(allAnswers),
    })
    setSuggestions((prev) => ({
      ...prev,
      [questionId]: result.ok ? { status: 'ready', text: result.suggestion } : { status: 'error', message: result.error },
    }))
  }

  function handleUse(questionId: string) {
    const suggestion = suggestions[questionId]
    if (suggestion?.status === 'ready') {
      onChange(questionId, suggestion.text)
    }
    setSuggestions((prev) => ({ ...prev, [questionId]: { status: 'idle' } }))
  }

  function handleDiscard(questionId: string) {
    setSuggestions((prev) => ({ ...prev, [questionId]: { status: 'idle' } }))
  }

  return (
    <div className="stage-form">
      <h2>{stage.title}</h2>
      {stage.questions.map((question) => {
        const value = answers[question.id] ?? ''
        const isMissing = showValidation && missing.has(question.id)
        const suggestionState = suggestions[question.id] ?? { status: 'idle' as const }

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

            {question.type === 'text' && (
              <SuggestionPanel
                state={suggestionState}
                onRequest={() => handleRequestSuggestion(question.id, question.label, question.grounding)}
                onUse={() => handleUse(question.id)}
                onDiscard={() => handleDiscard(question.id)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
