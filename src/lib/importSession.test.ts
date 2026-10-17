import { describe, expect, it } from 'vitest'
import { createEmptySession } from './schema'
import { importSessionFromFile } from './importSession'

function fileFrom(content: string): File {
  return new File([content], 'session.json', { type: 'application/json' })
}

describe('importSessionFromFile', () => {
  it('imports a valid exported session', async () => {
    const session = createEmptySession('Importable')
    const file = fileFrom(JSON.stringify(session))

    const result = await importSessionFromFile(file)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.session.name).toBe('Importable')
    }
  })

  it('rejects invalid JSON', async () => {
    const file = fileFrom('{not valid json')
    const result = await importSessionFromFile(file)
    expect(result.ok).toBe(false)
  })

  it('rejects JSON that does not match the session schema', async () => {
    const file = fileFrom(JSON.stringify({ foo: 'bar' }))
    const result = await importSessionFromFile(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('expected session format')
    }
  })
})
