import { describe, expect, it } from 'vitest'
import { extractJson } from './extractJson'

describe('extractJson', () => {
  it('returns plain JSON unchanged', () => {
    expect(extractJson('{"a":1}')).toBe('{"a":1}')
  })

  it('strips a ```json fenced block', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}')
  })

  it('strips a plain ``` fenced block', () => {
    expect(extractJson('```\n{"a":1}\n```')).toBe('{"a":1}')
  })

  it('extracts the JSON object from surrounding commentary', () => {
    expect(extractJson('Sure, here it is:\n{"a":1}\nLet me know if you need changes.')).toBe('{"a":1}')
  })
})
