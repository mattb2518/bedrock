// Perplexity verification — §21.3
// Checks current status of a source or candidate: ownership changes, reliability
// incidents, URL validity. Informational only — does not auto-apply changes.

export interface PerplexityVerifyInput {
  type: 'candidate' | 'source'
  name: string
  url?: string
  office?: string
  district?: string
}

export interface PerplexityVerifyResult {
  summary: string
  checkedAt: string       // ISO date string
  rawResponse: string
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

function buildPrompt(input: PerplexityVerifyInput): string {
  if (input.type === 'source') {
    return `You are verifying the current status of a media source for a civic information platform. Please answer ALL of the following questions about "${input.name}" (${input.url ?? 'URL unknown'}):

1. Is this source still active and publishing as of today?
2. Have there been any ownership changes or major editorial leadership changes in the last 12 months?
3. Have there been any documented reliability incidents, significant corrections, or credibility controversies in the last 12 months?
4. Is the URL still valid and pointing to the correct outlet?
5. Has the source's editorial independence or funding structure changed in any significant way?

Be specific and cite recent events where possible. If you cannot find information on a question, say so explicitly rather than speculating. Format your response as a brief paragraph per question.`
  }

  return `You are verifying the current status of a political candidate for a civic information platform. Please answer ALL of the following questions about ${input.name}${input.office ? ` (${input.office}${input.district ? ', ' + input.district : ''})` : ''}:

1. Is this person currently a candidate for office or an incumbent?
2. Have there been any significant changes to their policy positions, party affiliation, or campaign status in the last 12 months?
3. Are there any documented controversies, ethics violations, or credibility incidents in the last 12 months?
4. Is their campaign website and contact information still current?
5. Have there been any notable endorsements or public actions that would affect how voters perceive them?

Be specific and cite recent events where possible. If you cannot find information on a question, say so explicitly. Format your response as a brief paragraph per question.`
}

export async function verifyWithPerplexity(
  input: PerplexityVerifyInput,
  apiKey?: string
): Promise<PerplexityVerifyResult> {
  const key = apiKey ?? process.env.PERPLEXITY_API_KEY
  if (!key) throw new Error('PERPLEXITY_API_KEY is not set')

  const res = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: 'You are a fact-checker helping verify the current status of media sources and political candidates. Be concise, factual, and cite sources where possible.' },
        { role: 'user', content: buildPrompt(input) },
      ],
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Perplexity API error ${res.status}: ${err}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  const rawResponse = data.choices[0]?.message?.content ?? ''
  const checkedAt = new Date().toISOString().slice(0, 10)

  // Summarize: first 500 chars of response as a preview summary
  const summary = rawResponse.slice(0, 500).trim() + (rawResponse.length > 500 ? '…' : '')

  return { summary, checkedAt, rawResponse }
}
