import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'bedrock',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
