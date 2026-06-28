// Layer 4 — the dealbreaker screen, verbatim from SPEC §10.
// Not a quiz: 29 binary filters + open text. Contested issues are PAIRED so
// neither side feels targeted (displayed side by side). Selected ids become hard
// exclusion filters in the recommendation engine.

export interface DealbreakerItem {
  id: string
  text: string
}

export interface DealbreakerPair {
  issue: string
  left: DealbreakerItem
  right: DealbreakerItem
}

export interface DealbreakerSection {
  title: string
  items?: DealbreakerItem[]
  pairs?: DealbreakerPair[]
}

export const FRAMING =
  'Which of these, if true of a candidate, would make them a non-starter for you — no matter how much you agreed with everything else about them?'

export const LAYER4_SECTIONS: DealbreakerSection[] = [
  {
    title: 'Process & Institutions',
    items: [
      { id: 'DB-1', text: 'Questioned the legitimacy of a certified election result without credible evidence' },
      { id: 'DB-2', text: 'Used public office for personal financial gain' },
      { id: 'DB-5', text: 'Has a documented pattern of lying about verifiable facts' },
    ],
  },
  {
    title: 'Civil Liberties',
    items: [
      { id: 'DB-6', text: 'Supports deploying federal law enforcement against peaceful protesters' },
      { id: 'DB-8', text: 'Supports restricting access to legal voting without evidence of fraud' },
    ],
  },
  {
    title: 'Policy Absolutes',
    pairs: [
      {
        issue: 'Abortion',
        left: { id: 'DB-10', text: 'Supports a complete abortion ban with no exceptions' },
        right: { id: 'DB-11', text: 'Supports unrestricted abortion access at any point in pregnancy with no limitations' },
      },
      {
        issue: 'Firearms',
        left: { id: 'DB-12', text: 'Supports confiscating legally owned firearms from legal owners' },
        right: { id: 'DB-13', text: 'Opposes all restrictions on firearms including military-style weapons' },
      },
      {
        issue: 'Healthcare',
        left: { id: 'DB-14', text: 'Supports an immediate single-payer transition that eliminates employer-sponsored insurance' },
        right: { id: 'DB-15', text: 'Supports eliminating Medicare, Medicaid, or other public health coverage entirely' },
      },
    ],
  },
  {
    title: 'Other',
    items: [
      { id: 'DB-19', text: 'Supports eliminating LGBTQ+ anti-discrimination protections' },
      { id: 'DB-20', text: 'Denies that human activity contributes to climate change' },
    ],
  },
  {
    title: 'Character',
    items: [
      { id: 'DB-26', text: 'Credibly accused of sexual misconduct' },
      { id: 'DB-29', text: 'Has been convicted of a felony involving fraud, violence, or abuse of office' },
    ],
  },
]

export const DEALBREAKER_OTHER_PROMPT =
  'Anything else that would disqualify a candidate for you, regardless of their other positions?'

// Flat id → text lookup across all sections (for results-page summaries).
export const DEALBREAKER_TEXT: Record<string, string> = LAYER4_SECTIONS.reduce(
  (acc, section) => {
    section.items?.forEach((it) => (acc[it.id] = it.text))
    section.pairs?.forEach((p) => {
      acc[p.left.id] = p.left.text
      acc[p.right.id] = p.right.text
    })
    return acc
  },
  {} as Record<string, string>
)
