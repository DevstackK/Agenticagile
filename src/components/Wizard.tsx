import { useEffect, useRef, useState } from 'react'
import { getMissingRequiredQuestionIds, STAGES } from '../data/questions'
import { createDebouncedSave } from '../lib/storage'
import type { Session } from '../lib/schema'
import { BriefExport } from './BriefExport'
import { StageForm } from './StageForm'
import { ProgressIndicator } from './ProgressIndicator'

type Props = {
  initialSession: Session
  onExit: () => void
}

export function Wizard({ initialSession, onExit }: Props) {
  const [session, setSession] = useState<Session>(initialSession)
  const [showValidation, setShowValidation] = useState(false)
  const [completed, setCompleted] = useState(false)
  const debouncedRef = useRef(createDebouncedSave())

  useEffect(() => {
    debouncedRef.current.save(session)
  }, [session])

  useEffect(() => {
    const flushOnUnload = () => debouncedRef.current.flush(session)
    window.addEventListener('beforeunload', flushOnUnload)
    return () => window.removeEventListener('beforeunload', flushOnUnload)
  }, [session])

  const stage = STAGES[session.activeStageIndex]
  const isLastStage = session.activeStageIndex === STAGES.length - 1
  const stageAnswers = session.answers[stage.key]
  const missing = getMissingRequiredQuestionIds(stage, stageAnswers)

  function updateAnswer(questionId: string, value: string) {
    setSession((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      answers: {
        ...prev.answers,
        [stage.key]: {
          ...prev.answers[stage.key],
          [questionId]: value,
        },
      },
    }))
  }

  function goNext() {
    if (missing.length > 0) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    if (isLastStage) {
      setCompleted(true)
      return
    }
    setSession((prev) => ({ ...prev, activeStageIndex: prev.activeStageIndex + 1 }))
  }

  function goBack() {
    setShowValidation(false)
    setSession((prev) => ({ ...prev, activeStageIndex: Math.max(0, prev.activeStageIndex - 1) }))
  }

  function exitToList() {
    debouncedRef.current.flush(session)
    onExit()
  }

  if (completed) {
    return <BriefExport session={session} onBack={() => setCompleted(false)} onExit={exitToList} />
  }

  return (
    <div className="wizard">
      <div className="wizard-header">
        <ProgressIndicator activeStageIndex={session.activeStageIndex} />
        <button type="button" onClick={exitToList} className="exit-link">
          Save &amp; back to sessions
        </button>
      </div>

      <StageForm stage={stage} answers={stageAnswers} onChange={updateAnswer} showValidation={showValidation} />

      <div className="wizard-nav">
        <button type="button" onClick={goBack} disabled={session.activeStageIndex === 0}>
          Back
        </button>
        <button type="button" onClick={goNext}>
          {isLastStage ? 'Generate Brief' : 'Next'}
        </button>
      </div>
    </div>
  )
}
