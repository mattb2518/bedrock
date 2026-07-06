import arcjet, { tokenBucket, shield } from '@arcjet/next'

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 20,
      interval: 60,
      capacity: 40,
    }),
  ],
})
