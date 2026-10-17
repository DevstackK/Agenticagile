import { useRef, useState } from 'react'
import { createEmptySession, type Session } from '../lib/schema'
import { importSessionFromFile } from '../lib/importSession'
import { deleteSession, listSessions, loadSession, saveSession, type SessionIndexEntry } from '../lib/storage'

type Props = {
  onOpenSession: (session: Session) => void
}

export function SessionList({ onOpenSession }: Props) {
  const [entries, setEntries] = useState<SessionIndexEntry[]>(() => listSessions())
  const [newName, setNewName] = useState('')
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function refresh() {
    setEntries(listSessions())
  }

  function handleOpen(id: string) {
    const result = loadSession(id)
    if (!result.ok) {
      setRowErrors((prev) => ({ ...prev, [id]: result.error }))
      return
    }
    onOpenSession(result.session)
  }

  function handleDelete(id: string) {
    deleteSession(id)
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    refresh()
  }

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const session = createEmptySession(name)
    saveSession(session)
    setNewName('')
    refresh()
    onOpenSession(session)
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const result = await importSessionFromFile(file)
    if (!result.ok) {
      setImportError(result.error)
      return
    }
    setImportError(null)
    saveSession(result.session)
    refresh()
    onOpenSession(result.session)
  }

  return (
    <div className="session-list">
      <h1>Agentic Agile — Discovery Wizard</h1>

      <div className="new-session">
        <input
          type="text"
          placeholder="New session name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
        <button type="button" onClick={handleCreate} disabled={!newName.trim()}>
          New Session
        </button>
      </div>

      <div className="import-session">
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Import Session File
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
        {importError && <div className="error-message">{importError}</div>}
      </div>

      <ul className="session-entries">
        {entries.length === 0 && <li className="empty">No sessions yet. Start a new one above.</li>}
        {entries.map((entry) => (
          <li key={entry.id} className="session-entry">
            <button type="button" onClick={() => handleOpen(entry.id)} className="session-open">
              {entry.name}
              <span className="session-updated"> — updated {new Date(entry.updatedAt).toLocaleString()}</span>
            </button>
            <button type="button" onClick={() => handleDelete(entry.id)} className="session-delete">
              Delete
            </button>
            {rowErrors[entry.id] && (
              <div className="error-message">
                {rowErrors[entry.id]} <button type="button" onClick={() => handleDelete(entry.id)}>Delete this session</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
