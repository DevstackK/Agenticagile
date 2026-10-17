import { useState } from 'react'
import type { StageGate as StageGateData } from '../lib/schema'
import { isValidEmail, requestGenerateDeck, requestSendDeckEmail } from '../lib/stageGate'

type AsyncState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }

type Props = {
  stageGate: StageGateData
  businessCaseAnswers: Record<string, string>
  onUpdate: (patch: Partial<StageGateData>) => void
  onContinue: () => void
  onBackToForm: () => void
}

export function StageGate({ stageGate, businessCaseAnswers, onUpdate, onContinue, onBackToForm }: Props) {
  const [generateState, setGenerateState] = useState<AsyncState>({ status: 'idle' })
  const [sendState, setSendState] = useState<AsyncState>({ status: 'idle' })
  const [email, setEmail] = useState('')

  async function handleGenerate() {
    setGenerateState({ status: 'loading' })
    const result = await requestGenerateDeck(businessCaseAnswers)
    if (result.ok) {
      setGenerateState({ status: 'idle' })
      onUpdate({
        deckUrl: result.deckUrl,
        deckGeneratedAt: new Date().toISOString(),
        status: 'pending',
        decidedAt: null,
        sentTo: null,
        sentAt: null,
      })
    } else {
      setGenerateState({ status: 'error', message: result.error })
    }
  }

  async function handleSend() {
    if (!stageGate.deckUrl) return
    setSendState({ status: 'loading' })
    const result = await requestSendDeckEmail(email, stageGate.deckUrl)
    if (result.ok) {
      setSendState({ status: 'idle' })
      onUpdate({ sentTo: email, sentAt: result.sentAt })
    } else {
      setSendState({ status: 'error', message: result.error })
    }
  }

  function handleApprove() {
    onUpdate({ status: 'approved', decidedAt: new Date().toISOString() })
  }

  function handleReject() {
    onUpdate({ status: 'rejected', decidedAt: new Date().toISOString() })
  }

  const canSend = isValidEmail(email) && Boolean(stageGate.deckUrl) && sendState.status !== 'loading'

  return (
    <div className="stage-gate">
      <h2>Stage Gate: Executive Approval</h2>
      <p>Generate an executive deck from your Business Case Discovery answers and get it approved before continuing to User Research.</p>

      <section className="stage-gate-deck">
        <h3>Executive Deck</h3>
        {stageGate.deckUrl && (
          <p>
            <a href={stageGate.deckUrl} target="_blank" rel="noreferrer">
              View generated deck
            </a>
          </p>
        )}

        {generateState.status === 'loading' && <button type="button" disabled>Generating…</button>}
        {generateState.status === 'idle' && (
          <button type="button" onClick={handleGenerate}>
            {stageGate.deckUrl ? 'Regenerate Executive Deck' : 'Generate Executive Deck'}
          </button>
        )}
        {generateState.status === 'error' && (
          <div className="error-message">
            {generateState.message}{' '}
            <button type="button" onClick={handleGenerate}>
              Retry
            </button>
          </div>
        )}
      </section>

      <section className="stage-gate-send">
        <h3>Send to Exec</h3>
        <input
          type="email"
          placeholder="exec@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="button" onClick={handleSend} disabled={!canSend}>
          {sendState.status === 'loading' ? 'Sending…' : 'Send to Exec'}
        </button>
        {stageGate.sentTo && stageGate.sentAt && (
          <p>
            Sent to {stageGate.sentTo} at {new Date(stageGate.sentAt).toLocaleString()}
          </p>
        )}
        {sendState.status === 'error' && (
          <div className="error-message">
            {sendState.message}{' '}
            <button type="button" onClick={handleSend}>
              Retry
            </button>
          </div>
        )}
      </section>

      <section className="stage-gate-decision">
        <h3>Decision</h3>
        <p>Current status: {stageGate.status}</p>
        <button type="button" onClick={handleApprove}>
          Approve
        </button>
        <button type="button" onClick={handleReject}>
          Not Approved
        </button>
      </section>

      <div className="stage-gate-nav">
        <button type="button" onClick={onBackToForm}>
          Back to Business Case
        </button>
        <button type="button" onClick={onContinue} disabled={stageGate.status !== 'approved'}>
          Continue to User Research
        </button>
      </div>
    </div>
  )
}
