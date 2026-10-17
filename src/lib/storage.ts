import { SessionSchema, type Session } from './schema'

const SESSION_KEY_PREFIX = 'agentic-agile:sessions:'
const INDEX_KEY = 'agentic-agile:session-index'

export type SessionIndexEntry = { id: string; name: string; updatedAt: string }

type StorageStatus = { available: boolean }
const status: StorageStatus = { available: true }
const listeners = new Set<(status: StorageStatus) => void>()

function setAvailable(available: boolean) {
  if (status.available === available) return
  status.available = available
  listeners.forEach((listener) => listener({ ...status }))
}

export function onStorageStatusChange(listener: (status: StorageStatus) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getStorageStatus(): StorageStatus {
  return { ...status }
}

function readIndex(): SessionIndexEntry[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function writeIndex(index: SessionIndexEntry[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index))
}

export function listSessions(): SessionIndexEntry[] {
  return readIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export type LoadResult = { ok: true; session: Session } | { ok: false; error: string }

export function loadSession(id: string): LoadResult {
  try {
    const raw = localStorage.getItem(SESSION_KEY_PREFIX + id)
    if (!raw) return { ok: false, error: 'Session not found.' }
    const parsed = JSON.parse(raw)
    const result = SessionSchema.safeParse(parsed)
    if (!result.success) {
      return { ok: false, error: 'Saved session data is corrupted.' }
    }
    return { ok: true, session: result.data }
  } catch {
    return { ok: false, error: 'Saved session data is corrupted.' }
  }
}

export function saveSession(session: Session): boolean {
  try {
    localStorage.setItem(SESSION_KEY_PREFIX + session.id, JSON.stringify(session))
    const index = readIndex().filter((entry) => entry.id !== session.id)
    index.push({ id: session.id, name: session.name, updatedAt: session.updatedAt })
    writeIndex(index)
    setAvailable(true)
    return true
  } catch {
    setAvailable(false)
    return false
  }
}

export function deleteSession(id: string) {
  try {
    localStorage.removeItem(SESSION_KEY_PREFIX + id)
  } catch {
    // ignore - best effort
  }
  writeIndex(readIndex().filter((entry) => entry.id !== id))
}

export function createDebouncedSave(delayMs = 1500) {
  let timeout: ReturnType<typeof setTimeout> | undefined

  function save(session: Session) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      saveSession(session)
    }, delayMs)
  }

  function flush(session: Session) {
    if (timeout) clearTimeout(timeout)
    timeout = undefined
    saveSession(session)
  }

  return { save, flush }
}
