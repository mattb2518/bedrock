// Layer 4 — the dealbreaker screen, verbatim from SPEC §10.
// Not a quiz: 17 binary filters + open text. Contested issues are PAIRED so
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
    pairs: [
      {
        issue: 'Voting',
        left: { id: 'DB-30', text: 'Supports removing safeguards that verify voter eligibility or identity' },
        right: { id: 'DB-8', text: 'Supports restricting ballot access for eligible citizens without evidence of fraud' },
      },
      {
        issue: 'Speech',
        left: { id: 'DB-31', text: 'Supports giving government the power to ban or criminalize lawful speech based on its content or viewpoint' },
        right: { id: 'DB-6', text: 'Supports deploying federal law enforcement against peaceful protesters' },
      },
    ],
  },
  {
    title: 'Policy Absolutes',
    pairs: [
      {
        issue: 'Abortion',
        left: { id: 'DB-11', text: 'Supports unrestricted abortion access at any point in pregnancy with no limitations' },
        right: { id: 'DB-10', text: 'Supports a complete abortion ban with no exceptions' },
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
      { id: 'DB-19', text: 'Supports stripping anti-discrimination protections from any group based on identity' },
      { id: 'DB-20', text: 'Rejects the scientific consensus that routine childhood vaccines are safe and effective — for instance, promoting the discredited claim that vaccines cause autism' },
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
