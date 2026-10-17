import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildDeckOutline } from './_lib/buildDeckOutline'
import { createGeneration, pollGeneration } from './_lib/gammaClient'

export const config = { maxDuration: 60 }

const POLL_INTERVAL_MS = 2000
const POLL_BUDGET_MS = 55000

function validateBody(body: unknown): { ok: true; businessCase: Record<string, string> } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'businessCase is required' }
  }
  const record = body as Record<string, unknown>
  if (typeof record.businessCase !== 'object' || record.businessCase === null) {
    return { ok: false, error: 'businessCase is required' }
  }

  const businessCase: Record<string, string> = {}
  for (const [key, value] of Object.entries(record.businessCase as Record<string, unknown>)) {
    if (typeof value === 'string') {
      businessCase[key] = value
    }
  }

  return { ok: true, businessCase }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const validation = validateBody(req.body)
  if (!validation.ok) {
    res.status(400).json({ error: validation.error })
    return
  }

  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Deck generation is not configured' })
    return
  }

  const outline = buildDeckOutline(validation.businessCase)

  try {
    const { generationId } = await createGeneration(apiKey, {
      inputText: outline,
      title: 'Business Case Discovery',
    })

    const deadline = Date.now() + POLL_BUDGET_MS
    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS)
      const result = await pollGeneration(apiKey, generationId)

      if (result.status === 'completed') {
        if (!result.gammaUrl) {
          res.status(502).json({ error: 'Deck generation completed but returned no URL' })
          return
        }
        res.status(200).json({ deckUrl: result.gammaUrl })
        return
      }

      if (result.status === 'failed') {
        res.status(502).json({ error: 'Deck generation failed' })
        return
      }
    }

    res.status(502).json({ error: 'Deck generation timed out' })
  } catch (err) {
    console.error('generate-deck: request failed', err)
    res.status(502).json({ error: 'Deck generation request failed' })
  }
}
