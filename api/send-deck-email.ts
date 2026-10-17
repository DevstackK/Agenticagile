import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validateSendDeckEmailRequest } from './_lib/validateSendDeckEmailRequest'

const RESEND_URL = 'https://api.resend.com/emails'
const TIMEOUT_MS = 10000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const validation = validateSendDeckEmailRequest(req.body)
  if (!validation.ok) {
    res.status(400).json({ error: validation.error })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Email sending is not configured' })
    return
  }

  const { to, deckUrl } = validation.data
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Agentic Agile <onboarding@resend.dev>',
        to: [to],
        subject: 'Executive Deck for Review: Business Case Discovery',
        html: `<p>A business case deck is ready for your review.</p><p><a href="${deckUrl}">${deckUrl}</a></p>`,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      res.status(502).json({ error: `Email send failed (${response.status})` })
      return
    }

    res.status(200).json({ sentAt: new Date().toISOString() })
  } catch {
    res.status(502).json({ error: 'Email send request failed or timed out' })
  } finally {
    clearTimeout(timeout)
  }
}
