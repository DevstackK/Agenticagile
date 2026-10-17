const GAMMA_API_BASE = 'https://public-api.gamma.app/v1.0/generations'

export type CreateGenerationResult = { generationId: string }
export type PollGenerationResult = { status: 'completed' | 'failed' | 'pending'; gammaUrl?: string }

export async function createGeneration(
  apiKey: string,
  input: { inputText: string; title: string },
): Promise<CreateGenerationResult> {
  const response = await fetch(GAMMA_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      inputText: input.inputText,
      textMode: 'generate',
      format: 'presentation',
      numCards: 8,
      title: input.title,
    }),
  })

  if (!response.ok) {
    throw new Error(`Gamma create generation failed (${response.status})`)
  }

  const data = (await response.json()) as { generationId?: string }
  if (typeof data.generationId !== 'string') {
    throw new Error('Gamma create generation returned no generationId')
  }

  return { generationId: data.generationId }
}

export async function pollGeneration(apiKey: string, generationId: string): Promise<PollGenerationResult> {
  const response = await fetch(`${GAMMA_API_BASE}/${generationId}`, {
    method: 'GET',
    headers: { 'X-API-KEY': apiKey },
  })

  if (!response.ok) {
    throw new Error(`Gamma poll generation failed (${response.status})`)
  }

  const data = (await response.json()) as { status?: string; gammaUrl?: string }
  const status = data.status === 'completed' || data.status === 'failed' ? data.status : 'pending'

  return { status, gammaUrl: data.gammaUrl }
}
