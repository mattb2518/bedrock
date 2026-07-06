import { NextRequest, NextResponse } from 'next/server'
import { aj } from '@/lib/arcjet'
import { request as arcjetRequest } from '@arcjet/next'

export async function POST(req: NextRequest) {
  const arcReq = await arcjetRequest(req)
  const decision = await aj.protect(arcReq)
  if (decision.isDenied()) {
    return NextResponse.json({ success: false }, { status: 429 })
  }

  const { token } = await req.json()
  if (!token) return NextResponse.json({ success: false }, { status: 400 })

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  })

  const data = await res.json()
  return NextResponse.json({ success: !!data.success })
}
