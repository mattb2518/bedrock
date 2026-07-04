import { permanentRedirect } from 'next/navigation'

export default function BallotRedirect() {
  permanentRedirect('/your-ballot')
}
