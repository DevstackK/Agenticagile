export type SuggestionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'error'; message: string }

type Props = {
  state: SuggestionState
  onRequest: () => void
  onUse: () => void
  onDiscard: () => void
}

export function SuggestionPanel({ state, onRequest, onUse, onDiscard }: Props) {
  if (state.status === 'idle') {
    return (
      <button type="button" className="suggest-button" onClick={onRequest}>
        Suggest
      </button>
    )
  }

  if (state.status === 'loading') {
    return (
      <button type="button" className="suggest-button" disabled>
        Thinking…
      </button>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="suggestion-panel suggestion-error">
        <div className="error-message">{state.message}</div>
        <button type="button" onClick={onRequest}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="suggestion-panel suggestion-ready">
      <div className="suggestion-label">Suggested answer</div>
      <p className="suggestion-text">{state.text}</p>
      <div className="suggestion-actions">
        <button type="button" onClick={onUse}>
          Use this
        </button>
        <button type="button" onClick={onDiscard}>
          Discard
        </button>
      </div>
    </div>
  )
}
