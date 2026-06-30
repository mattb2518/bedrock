/**
 * Pew Research Political Typology — reference constants.
 *
 * Developer note: The 2026 Pew typology identifies 9 political groups, most of
 * which fall outside the two major parties. Bedrock's Civic Mantle types cut
 * across multiple Pew groups in both directions — the mapping is many-to-many,
 * not one-to-one. We reference Pew to establish that the fragmented middle is
 * real and well-documented, not to re-label users with Pew's categories. Do NOT
 * attach per-Mantle Pew group labels anywhere in the product.
 */

export const PEW_REPORT_TITLE = "Beyond Red vs. Blue: The 2026 Political Typology"

export const PEW_REPORT_URL =
  "https://www.pewresearch.org/politics/2026/06/19/beyond-red-vs-blue-the-political-typology-2026/"

export const PEW_ATTRIBUTION = "Pew Research Center, June 2026"

/**
 * The nine 2026 Pew typology groups with approximate share of U.S. adults.
 * Ordered left to right as in Pew's published layout.
 */
export const PEW_GROUPS = [
  { name: "Order and Opportunity Left",  share: 18, side: "left"   as const },
  { name: "Left-Out Left",               share: 12, side: "left"   as const },
  { name: "Loyal Liberals",              share: 11, side: "left"   as const },
  { name: "Leftward Progressives",       share:  7, side: "left"   as const },
  { name: "Tuned-Out Middle",            share:  9, side: "center" as const },
  { name: "Unconventional Right",        share: 12, side: "right"  as const },
  { name: "Faith First Conservatives",   share: 12, side: "right"  as const },
  { name: "Pragmatic and Polite Right",  share: 11, side: "right"  as const },
  { name: "No Apologies Right",          share:  9, side: "right"  as const },
] as const
