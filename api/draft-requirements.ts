import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildDraftPrompt } from './_lib/buildDraftPrompt'
import { validateDraftRequest } from './_lib/validateDraftRequest'
import { RequirementsDraftSchema } from './_lib/requirementsDraftSchema'
import { extractJson } from './_lib/extractJson'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const TIMEOUT_MS = 20000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const validation = validateDraftRequest(req.body)
  if (!validation.ok) {
    res.status(400).json({ error: validation.error })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'AI helper is not configured' })
    return
  }

  const payload = buildDraftPrompt(validation.data)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      res.status(502).json({ error: `AI helper upstream error (${response.status})` })
      return
    }

    const data = (await response.json()) as { content?: Array<{ text?: string }> }
    const rawText = data.content?.[0]?.text

    if (typeof rawText !== 'string') {
      res.status(502).json({ error: 'AI helper returned an unexpected response' })
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(extractJson(rawText))
    } catch (err) {
      console.error('draft-requirements: JSON.parse failed', err, rawText.slice(0, 500))
      res.status(502).json({ error: 'AI helper returned an unexpected response' })
      return
    }

    const result = RequirementsDraftSchema.safeParse(parsed)
    if (!result.success) {
      console.error('draft-requirements: schema validation failed', result.error.issues)
      res.status(502).json({ error: 'AI helper returned an unexpected response' })
      return
    }

    res.status(200).json({ draft: result.data })
  } catch {
    res.status(502).json({ error: 'AI helper request failed or timed out' })
  } finally {
    clearTimeout(timeout)
  }
}
