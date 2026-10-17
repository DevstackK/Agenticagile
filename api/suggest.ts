import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildAnthropicMessages } from './_lib/buildAnthropicMessages'
import { validateSuggestRequest } from './_lib/validateSuggestRequest'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const TIMEOUT_MS = 10000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const validation = validateSuggestRequest(req.body)
  if (!validation.ok) {
    res.status(400).json({ error: validation.error })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'AI helper is not configured' })
    return
  }

  const payload = buildAnthropicMessages(validation.data)
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

    const data = (await response.json()) as { content?: Array<{ type?: string; text?: string }> }
    const suggestion = data.content?.find((block) => block.type === 'text')?.text

    if (typeof suggestion !== 'string') {
      res.status(502).json({ error: 'AI helper returned an unexpected response' })
      return
    }

    res.status(200).json({ suggestion: suggestion.trim() })
  } catch {
    res.status(502).json({ error: 'AI helper request failed or timed out' })
  } finally {
    clearTimeout(timeout)
  }
}
