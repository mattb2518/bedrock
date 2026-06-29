// Demographic module — SPEC §12. Asked AFTER all four quiz layers, never before:
// pre-quiz demographic questions trigger tribal identity and contaminate the
// values answers. Post-quiz, the same information is calibration data only —
// explicitly NOT part of dimensional scoring. The entire module is optional.

export const DEMOGRAPHIC_INTRO = {
  kicker: 'Last thing — and it’s optional',
  heading: 'A little context helps us calibrate.',
  body: 'We saved these for the end on purpose. Asked up front, questions about your political background nudge people toward their tribe instead of their honest answers. Asked now — after you’ve already mapped what you believe — the same information just helps us read your profile more accurately. Skip any of it, or all of it.',
}

export interface DemographicChoiceQuestion {
  id: 'partyRelationship' | 'currentRegistration' | 'upbringing' | 'lineage'
  prompt: string
  options: string[]
}

// Question 1 — relationship to parties (always shown).
export const PARTY_RELATIONSHIP: DemographicChoiceQuestion = {
  id: 'partyRelationship',
  prompt: 'How would you describe your relationship to political parties?',
  options: [
    'Always independent — never affiliated',
    'Drifted away from a party — used to be closer to one',
    'Registered with a party but vote differently',
    'Currently affiliated — but it’s complicated',
    'It’s complicated',
  ],
}

// Current voter registration — a hard fact that complements the attitudinal
// relationship question above. No "prefer not to say": the whole module is
// optional, so skipping is the opt-out.
export const CURRENT_REGISTRATION: DemographicChoiceQuestion = {
  id: 'currentRegistration',
  prompt: 'How are you registered to vote today?',
  options: [
    'Independent / unaffiliated',
    'Democrat',
    'Republican',
    'Another party',
    'Not registered',
  ],
}

// The political environment the user grew up in — party identification is one of
// the most strongly inherited political traits, so this is genuinely formative
// calibration context.
export const UPBRINGING: DemographicChoiceQuestion = {
  id: 'upbringing',
  prompt: 'The politics you grew up around:',
  options: [
    'Mostly Democratic / left-leaning',
    'Mostly Republican / right-leaning',
    'Mixed — leaned different ways',
    'Independent / nonpartisan',
    'Apolitical — rarely discussed',
    'Not sure',
  ],
}

// Political lineage. Shown only if the relationship question is one of the "had a
// party" answers. Labels are deliberately specific and historically grounded.
export const LINEAGE_TRIGGERS = [
  'Drifted away from a party — used to be closer to one',
  'Registered with a party but vote differently',
  'Currently affiliated — but it’s complicated',
]

export const POLITICAL_LINEAGE: DemographicChoiceQuestion = {
  id: 'lineage',
  prompt: 'Which tradition feels most like your political background — even if you’ve moved away from it?',
  options: [
    'Progressive / democratic socialist',
    'Liberal Democrat',
    'Moderate / New Democrat',
    'Blue Dog / conservative Democrat',
    'Moderate / Rockefeller Republican',
    'Chamber of Commerce / business Republican',
    'Social conservative Republican',
    'National conservative / MAGA Republican',
    'Libertarian',
    'None of these feel right',
    'It’s complicated',
  ],
}

// Question 3 — basic demographics (optional block of three).
export const AGE_RANGES = ['Under 30', '30–44', '45–59', '60+']
export const GEOGRAPHIES = ['Urban', 'Suburban', 'Rural', 'Small town']
export const REGIONS = ['Northeast', 'South', 'Midwest', 'West', 'Other']

// Question 4 — open text (optional).
export const DEMOGRAPHIC_OTHER_PROMPT =
  'Anything else about your political background that would help us understand where you’re coming from? Totally optional — but we’re genuinely curious.'
