/**
 * Structured usage logging for all Claude API calls.
 * Emits to console (captured by Vercel log drains / Functions tab).
 * Format: [claude-usage] <route> in=<n> out=<n> model=<m> userId=<id>
 *
 * To make this queryable in the future, swap console.log for a Supabase insert
 * into an `api_usage_log` table with columns: route, model, input_tokens,
 * output_tokens, user_id, created_at.
 */

interface UsageParams {
  route: string
  model: string
  usage: { input_tokens: number; output_tokens: number }
  userId?: string | null
}

export function logClaudeUsage({ route, model, usage, userId }: UsageParams): void {
  console.log(
    `[claude-usage] route=${route} in=${usage.input_tokens} out=${usage.output_tokens} model=${model} userId=${userId ?? 'anon'}`
  )
}
