export async function GET() {
  try {
    const { Inngest } = await import('inngest')
    const inngest = new Inngest({ id: 'bedrock-test' })
    const { serve } = await import('inngest/next')
    const handler = serve({ client: inngest, functions: [] })
    return new Response('serve() initialized OK', { status: 200 })
  } catch (e) {
    return new Response(String(e), { status: 500 })
  }
}

export const PUT = GET
export const POST = GET
