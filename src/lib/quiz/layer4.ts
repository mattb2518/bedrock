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
      { id: 'DB-3', text: 'Accepted gifts or payments from industries they regulate' },
      { id: 'DB-4', text: 'Supports removing or threatening judges for their rulings' },
      { id: 'DB-5', text: 'Has a documented pattern of lying about verifiable facts' },
    ],
  },
  {
    title: 'Civil Liberties',
    items: [
      { id: 'DB-6', text: 'Supports deploying federal law enforcement against peaceful protesters' },
      { id: 'DB-7', text: 'Supports warrantless surveillance of American citizens' },
      { id: 'DB-8', text: 'Supports restricting access to legal voting without evidence of fraud' },
    ],
  },
  {
    title: 'National Security',
    items: [
      { id: 'DB-9', text: 'Supports withdrawing from NATO or other core defense alliances unilaterally' },
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
      {
        issue: 'Policing',
        left: { id: 'DB-16', text: 'Supports significantly reducing police department funding without an alternative public safety plan' },
        right: { id: 'DB-17', text: 'Supports eliminating civilian oversight of law enforcement' },
      },
    ],
  },
  {
    title: 'Other',
    items: [
      { id: 'DB-18', text: 'Supports race or gender-based preferences in hiring or admissions without accountability measures' },
      { id: 'DB-19', text: 'Supports eliminating LGBTQ+ anti-discrimination protections' },
      { id: 'DB-20', text: 'Denies that human activity contributes to climate change' },
      { id: 'DB-21', text: 'Rejects taking any meaningful policy action on climate' },
      { id: 'DB-22', text: 'Supports directing public education funds primarily to religious institutions' },
      { id: 'DB-23', text: 'Supports federal speech restrictions on “hate speech” or “misinformation” beyond current First Amendment limits' },
      { id: 'DB-24', text: 'Supports federal regulation of political campaign speech or content beyond current First Amendment limits' },
      { id: 'DB-25', text: 'Supports legalizing all federally controlled substances including hard drugs' },
    ],
  },
  {
    title: 'Character',
    items: [
      { id: 'DB-26', text: 'Credibly accused of sexual misconduct' },
      { id: 'DB-27', text: 'Has made public statements that explicitly denigrate people based on race, ethnicity, religion, gender identity, or sexual orientation' },
      { id: 'DB-28', text: 'Has supported policies that materially disadvantage people based on race, ethnicity, religion, gender identity, or sexual orientation' },
      { id: 'DB-29', text: 'Has been convicted of a felony involving fraud, violence, or abuse of office' },
    ],
  },
]

export const DEALBREAKER_OTHER_PROMPT =
  'Anything else that would disqualify a candidate for you, regardless of their other positions?'
