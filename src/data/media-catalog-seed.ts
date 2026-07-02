/**
 * Static seed data derived from media-catalog.csv.
 * Used by seedCatalogSources() in admin/actions.ts — the CSV itself is not
 * available in the Vercel serverless bundle at runtime, so the data is
 * imported here as a JS module instead.
 */

export interface CatalogSeedRow {
  name: string
  url: string
  format: string
  lean: string
  policyDepthScore: string
  flags: string
}

export const CATALOG_SEED_ROWS: CatalogSeedRow[] = [
  { name: 'Letters from an American',       url: 'https://heathercoxrichardson.substack.com',           format: 'Newsletter',                      lean: 'Center-left',                    policyDepthScore: '4', flags: '[P]' },
  { name: 'Popular Information',             url: 'https://popular.info',                                format: 'Newsletter',                      lean: 'Left',                           policyDepthScore: '5', flags: '[P]' },
  { name: 'The Lever',                       url: 'https://www.levernews.com',                           format: 'Newsletter + podcast',            lean: 'Left',                           policyDepthScore: '5', flags: '[P]' },
  { name: 'Zeteo',                           url: 'https://zeteo.substack.com',                          format: 'Newsletter + video',              lean: 'Left',                           policyDepthScore: '4', flags: '[P]' },
  { name: 'The Ink',                         url: 'https://the.ink',                                     format: 'Newsletter',                      lean: 'Left',                           policyDepthScore: '4', flags: '[P]' },
  { name: 'Erin in the Morning',             url: 'https://www.erininthemorning.com',                    format: 'Newsletter',                      lean: 'Left',                           policyDepthScore: '4', flags: '[P]' },
  { name: 'Civil Discourse',                 url: 'https://joycevance.substack.com',                     format: 'Newsletter',                      lean: 'Center-left',                    policyDepthScore: '5', flags: '[P]' },
  { name: 'BIG',                             url: 'https://mattstoller.substack.com',                    format: 'Newsletter',                      lean: 'Left-populist',                  policyDepthScore: '5', flags: '[P]' },
  { name: 'Robert Reich / Inequality Media', url: 'https://robertreich.substack.com',                    format: 'Newsletter + video',              lean: 'Left',                           policyDepthScore: '4', flags: '[P]' },
  { name: 'Public Notice',                   url: 'https://www.publicnotice.co',                         format: 'Newsletter',                      lean: 'Left',                           policyDepthScore: '3', flags: '[P]' },
  { name: 'HEATED',                          url: 'https://www.emilyatkin.com/heated',                   format: 'Newsletter + podcast',            lean: 'Left',                           policyDepthScore: '5', flags: '[P]' },
  { name: "Today's Edition Newsletter",      url: 'https://roberthubbell.substack.com',                  format: 'Newsletter',                      lean: 'Left',                           policyDepthScore: '3', flags: '[P]' },
  { name: 'Slow Boring',                     url: 'https://www.slowboring.com',                          format: 'Newsletter',                      lean: 'Center-left',                    policyDepthScore: '5', flags: ''    },
  { name: 'Noahpinion',                      url: 'https://www.noahpinion.blog',                         format: 'Newsletter',                      lean: 'Center-left',                    policyDepthScore: '5', flags: ''    },
  { name: 'The Preamble',                    url: 'https://sharonmcmahon.substack.com',                  format: 'Newsletter',                      lean: 'Center-left',                    policyDepthScore: '4', flags: ''    },
  { name: 'Platformer',                      url: 'https://www.platformer.news',                         format: 'Newsletter',                      lean: 'Center-left',                    policyDepthScore: '4', flags: ''    },
  { name: 'Pluralistic',                     url: 'https://pluralistic.net',                             format: 'Newsletter / blog',               lean: 'Left-libertarian',               policyDepthScore: '5', flags: ''    },
  { name: 'News Not Noise',                  url: 'https://newsnotnoisejessicayellin.substack.com',      format: 'Newsletter + video',              lean: 'Center-left',                    policyDepthScore: '4', flags: ''    },
  { name: 'Pantsuit Politics',               url: 'https://pantsuitpoliticsshow.com',                    format: 'Podcast',                         lean: 'Center-left / center',           policyDepthScore: '3', flags: ''    },
  { name: 'Persuasion',                      url: 'https://www.persuasion.community',                    format: 'Newsletter + podcast',            lean: 'Center / center-left',           policyDepthScore: '4', flags: ''    },
  { name: 'Second Rough Draft',              url: 'https://stevenawaldman.substack.com',                 format: 'Newsletter',                      lean: 'Center',                         policyDepthScore: '4', flags: ''    },
  { name: 'Silver Bulletin',                 url: 'https://www.natesilver.net',                          format: 'Newsletter',                      lean: 'Center',                         policyDepthScore: '4', flags: ''    },
  { name: 'Chuck ToddCast',                  url: 'https://thechucktoddcast.com',                        format: 'Podcast',                         lean: 'Center',                         policyDepthScore: '4', flags: ''    },
  { name: 'Home & Away',                     url: 'https://richardhaass.substack.com',                   format: 'Newsletter',                      lean: 'Center',                         policyDepthScore: '5', flags: ''    },
  { name: 'Tangled',                         url: 'https://tangle.substack.com',                         format: 'Newsletter + podcast',            lean: 'Center / nonpartisan',           policyDepthScore: '4', flags: ''    },
  { name: 'The Rest Is Politics US',         url: 'https://podcasts.apple.com/us/podcast/the-rest-is-politics-us/id1743030473', format: 'Podcast', lean: 'Center / center-right',         policyDepthScore: '4', flags: ''    },
  { name: 'Punchbowl News',                  url: 'https://punchbowl.news',                              format: 'Newsletter + podcast',            lean: 'Center',                         policyDepthScore: '4', flags: ''    },
  { name: 'Semafor',                         url: 'https://www.semafor.com',                             format: 'Newsletter + site',               lean: 'Center',                         policyDepthScore: '3', flags: ''    },
  { name: 'Lawfare',                         url: 'https://www.lawfaremedia.org',                        format: 'Blog + podcast',                  lean: 'Center',                         policyDepthScore: '5', flags: ''    },
  { name: 'Puck',                            url: 'https://puck.news',                                   format: 'Newsletter + site',               lean: 'Center',                         policyDepthScore: '4', flags: ''    },
  { name: 'Migration Policy Institute Podcasts', url: 'https://www.migrationpolicy.org/podcasts',        format: 'Podcast',                         lean: 'Center',                         policyDepthScore: '5', flags: ''    },
  { name: 'People Places Planet',            url: 'https://www.eli.org/podcast',                         format: 'Podcast',                         lean: 'Center',                         policyDepthScore: '5', flags: ''    },
  { name: 'The Weekly Dish',                 url: 'https://andrewsullivan.substack.com',                 format: 'Newsletter + podcast',            lean: 'Heterodox',                      policyDepthScore: '4', flags: ''    },
  { name: 'Racket News',                     url: 'https://racket.news',                                 format: 'Newsletter + podcast',            lean: 'Heterodox / populist',           policyDepthScore: '4', flags: '[P]' },
  { name: 'Breaking Points',                 url: 'https://breakingpoints.com',                          format: 'Video + podcast',                 lean: 'Left-populist & right-populist', policyDepthScore: '4', flags: '[P]' },
  { name: 'Glenn Loury / The Glenn Show',    url: 'https://glennloury.substack.com',                     format: 'Podcast + newsletter',            lean: 'Heterodox',                      policyDepthScore: '4', flags: ''    },
  { name: 'Conversations with Coleman',      url: 'https://colemanhughes.substack.com',                  format: 'Podcast + newsletter',            lean: 'Heterodox / center',             policyDepthScore: '4', flags: ''    },
  { name: 'Cremieux Recueil',                url: 'https://www.cremieux.xyz',                            format: 'Newsletter',                      lean: 'Heterodox / center',             policyDepthScore: '4', flags: ''    },
  { name: 'Lex Fridman',                     url: 'https://lexfridman.com',                              format: 'Podcast + video',                 lean: 'Heterodox',                      policyDepthScore: '3', flags: ''    },
  { name: 'Public',                          url: 'https://public.substack.com',                         format: 'Newsletter',                      lean: 'Heterodox',                      policyDepthScore: '4', flags: '[P]' },
  { name: 'Conversations with Tyler',        url: 'https://conversationswithtyler.com',                  format: 'Podcast',                         lean: 'Center-right / heterodox',       policyDepthScore: '4', flags: ''    },
  { name: 'The Dispatch',                    url: 'https://thedispatch.com',                             format: 'Magazine + newsletters + podcasts', lean: 'Center-right',                 policyDepthScore: '4', flags: ''    },
  { name: 'The Remnant',                     url: 'https://remnant.thedispatch.com',                     format: 'Podcast',                         lean: 'Center-right',                   policyDepthScore: '4', flags: ''    },
  { name: 'Advisory Opinions',               url: 'https://thedispatch.com/podcast/advisory-opinions',   format: 'Podcast',                         lean: 'Center-right / legal',           policyDepthScore: '5', flags: ''    },
  { name: 'The Bulwark',                     url: 'https://www.thebulwark.com',                          format: 'Newsletter + podcasts',           lean: 'Center-right',                   policyDepthScore: '4', flags: ''    },
  { name: 'Adam Kinzinger',                  url: 'https://adamkinzinger.substack.com',                  format: 'Newsletter + video',              lean: 'Center-right',                   policyDepthScore: '3', flags: ''    },
  { name: 'The Warning',                     url: 'https://steveschmidt.substack.com',                   format: 'Newsletter + video',              lean: 'Center / center-right',          policyDepthScore: '4', flags: ''    },
  { name: 'News Items',                      url: 'https://newsitems.substack.com',                      format: 'Newsletter',                      lean: 'Center-right',                   policyDepthScore: '4', flags: ''    },
  { name: 'Political News Items',            url: 'https://politicalnewsitems.substack.com',             format: 'Newsletter',                      lean: 'Center-right',                   policyDepthScore: '4', flags: ''    },
  { name: 'American Purpose',               url: 'https://www.americanpurpose.com',                      format: 'Online magazine',                 lean: 'Center-right / liberal internationalist', policyDepthScore: '4', flags: '' },
  { name: 'SmartHERNews',                    url: 'https://smarthernews.com',                            format: 'Video + podcast',                 lean: 'Center-right',                   policyDepthScore: '3', flags: ''    },
  { name: 'UnHerd',                          url: 'https://unherd.com',                                  format: 'Magazine + video',                lean: 'Heterodox / center-right',       policyDepthScore: '4', flags: ''    },
  { name: 'EconTalk',                        url: 'https://www.econtalk.org',                            format: 'Podcast',                         lean: 'Center-right / classical liberal', policyDepthScore: '5', flags: ''  },
  { name: 'Marginal Revolution',             url: 'https://marginalrevolution.com',                      format: 'Blog',                            lean: 'Center-right / libertarian',     policyDepthScore: '4', flags: ''    },
  { name: 'The Redneck Intellectual',        url: 'https://www.theredneckintellectual.com',              format: 'Newsletter',                      lean: 'Right / classical liberal',      policyDepthScore: '4', flags: '[P]' },
  { name: 'The American Conservative',       url: 'https://www.theamericanconservative.com',             format: 'Magazine + website',              lean: 'Right / traditionalist anti-interventionist', policyDepthScore: '4', flags: '[P]' },
  { name: 'Compact',                         url: 'https://compactmag.com',                              format: 'Online magazine',                 lean: 'Post-liberal / right-leaning',   policyDepthScore: '4', flags: '[P]' },
  { name: 'City Journal',                    url: 'https://www.city-journal.org',                        format: 'Magazine + podcast',              lean: 'Right / policy-focused',         policyDepthScore: '4', flags: '[P]' },
  { name: 'The Ricochet Podcast',            url: 'https://ricochet.com/podcast/ricochet-podcast/',      format: 'Podcast',                         lean: 'Right',                          policyDepthScore: '3', flags: '[P]' },
  { name: 'Antiwar.com',                     url: 'https://www.antiwar.com',                             format: 'Newsletter',                      lean: 'Right-libertarian / anti-interventionist', policyDepthScore: '4', flags: '[P]' },
  { name: 'National Review',                 url: 'https://www.nationalreview.com',                      format: 'Magazine + website + podcasts',   lean: 'Right / traditional conservative',          policyDepthScore: '4', flags: '[P]' },
  { name: 'The Ben Shapiro Show',            url: 'https://www.dailywire.com/show/the-ben-shapiro-show', format: 'Podcast + video',                 lean: 'Right / populist conservative',             policyDepthScore: '3', flags: '[P]' },
]
