const d = (days) =>
  new Date(Date.now() + days * 864e5).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

// Dates are generated relative to today so the demo always has future events.
// Includes: a good candidate, a repeat of it (merge demo), a subjective one and an undated one (failure cases).
export const sampleArticles = () => [
  {
    title: `Fed set to cut interest rates on ${d(9)}`,
    summary: 'Markets are pricing in a quarter-point cut at the upcoming policy meeting.',
    link: 'https://example.com/samples/fed-cut',
    publisher: 'Sample Wire',
    sourceId: 'fed',
    publishedAt: new Date(),
  },
  {
    title: `Fed expected to cut interest rates on ${d(9)}`,
    summary: 'Economists surveyed largely expect a cut.',
    link: 'https://example.com/samples/fed-cut-analysts',
    publisher: 'Sample Times',
    sourceId: 'fed',
    publishedAt: new Date(),
  },
  {
    title: `Team A to face Team B in cup final on ${d(6)}`,
    summary: 'The two sides meet at the national stadium.',
    link: 'https://example.com/samples/cup-final',
    publisher: 'Sample Sport',
    sourceId: 'bbc-sport',
    publishedAt: new Date(),
  },
  {
    title: `Acme Corp to release its best phone yet on ${d(14)}`,
    summary: 'Acme is expected to unveil its newest handset.',
    link: 'https://example.com/samples/acme-phone',
    publisher: 'Sample Tech',
    sourceId: 'bbc-business',
    publishedAt: new Date(),
  },
  {
    title: 'City council will vote on transit plan soon',
    summary: 'No date has been announced for the vote.',
    link: 'https://example.com/samples/transit',
    publisher: 'Sample Local',
    sourceId: 'bbc-business',
    publishedAt: new Date(),
  },
  {
    title: 'Markets rally after strong earnings',
    summary: 'Not a forward-looking event.',
    link: 'https://example.com/samples/rally',
    publisher: 'Sample Wire',
    sourceId: 'bbc-business',
    publishedAt: new Date(),
  },
];