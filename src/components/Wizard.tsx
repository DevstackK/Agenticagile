import { useEffect, useRef, useState } from 'react'
import { getMissingRequiredQuestionIds, STAGES } from '../data/questions'
import { createDebouncedSave } from '../lib/storage'
import type { Session, StageGate as StageGateData } from '../lib/schema'
import { BriefExport } from './BriefExport'
import { StageForm } from './StageForm'
import { StageGate } from './StageGate'
import { ProgressIndicator } from './ProgressIndicator'

type Props = {
  initialSession: Session
  onExit: () => void
}

export function Wizard({ initialSession, onExit }: Props) {
  const [session, setSession] = useState<Session>(initialSession)
  const [showValidation, setShowValidation] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showGate, setShowGate] = useState(false)
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

  function updateStageGate(patch: Partial<StageGateData>) {
    setSession((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      stageGate: { ...prev.stageGate, ...patch },
    }))
  }

  function goNext() {
    if (missing.length > 0) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    if (session.activeStageIndex === 0) {
      setShowGate(true)
      return
    }
    if (isLastStage) {
      setCompleted(true)
      return
    }
    setSession((prev) => ({ ...prev, activeStageIndex: prev.activeStageIndex + 1 }))
  }

  function goBack() {
    setShowValidation(false)
    if (session.activeStageIndex === 1) {
      setSession((prev) => ({ ...prev, activeStageIndex: 0 }))
      setShowGate(true)
      return
    }
    setSession((prev) => ({ ...prev, activeStageIndex: Math.max(0, prev.activeStageIndex - 1) }))
  }

  function exitToList() {
    debouncedRef.current.flush(session)
    onExit()
  }

  if (completed) {
    return <BriefExport session={session} onBack={() => setCompleted(false)} onExit={exitToList} />
  }

  if (showGate) {
    return (
      <div className="wizard">
        <div className="wizard-header">
          <ProgressIndicator activeStageIndex={session.activeStageIndex} />
          <button type="button" onClick={exitToList} className="exit-link">
            Save &amp; back to sessions
          </button>
        </div>

        <StageGate
          stageGate={session.stageGate}
          businessCaseAnswers={
            Object.fromEntries(
              Object.entries(session.answers.businessCase).filter((entry): entry is [string, string] => entry[1] !== null),
            )
          }
          onUpdate={updateStageGate}
          onContinue={() => {
            setShowGate(false)
            setSession((prev) => ({ ...prev, activeStageIndex: 1 }))
          }}
          onBackToForm={() => setShowGate(false)}
        />
      </div>
    )
  }

  return (
    <div className="wizard">
      <div className="wizard-header">
        <ProgressIndicator activeStageIndex={session.activeStageIndex} />
        <button type="button" onClick={exitToList} className="exit-link">
          Save &amp; back to sessions
        </button>
      </div>

      <StageForm
        stage={stage}
        answers={stageAnswers}
        allAnswers={session.answers}
        onChange={updateAnswer}
        showValidation={showValidation}
      />

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
