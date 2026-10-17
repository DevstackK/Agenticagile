import { useState } from 'react'
import { SessionList } from './components/SessionList'
import { StorageWarningBanner } from './components/StorageWarningBanner'
import { Wizard } from './components/Wizard'
import { listSessions, loadSession } from './lib/storage'
import type { Session } from './lib/schema'

function mostRecentSessionId(): string | null {
  const entries = listSessions()
  return entries.length > 0 ? entries[0].id : null
}

export default function App() {
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [resumeId] = useState<string | null>(() => mostRecentSessionId())
  const [resumeDismissed, setResumeDismissed] = useState(false)

  function openSession(session: Session) {
    setActiveSession(session)
  }

  function exitToList() {
    setActiveSession(null)
  }

  function resumeMostRecent() {
    if (!resumeId) return
    const result = loadSession(resumeId)
    if (result.ok) setActiveSession(result.session)
  }

  return (
    <div className="app">
      <StorageWarningBanner />

      {activeSession ? (
        <Wizard initialSession={activeSession} onExit={exitToList} />
      ) : (
        <>
          {resumeId && !resumeDismissed && (
            <div className="resume-banner">
              Resume your most recent session?
              <button type="button" onClick={resumeMostRecent}>
                Resume
              </button>
              <button type="button" onClick={() => setResumeDismissed(true)}>
                Dismiss
              </button>
            </div>
          )}
          <SessionList onOpenSession={openSession} />
        </>
      )}
    </div>
  )
}
