// Configurable public sources. resolutionSource is the official page a market on
// this source's events would resolve against (null = reviewer must supply one).
export const SOURCES = [
  {
    id: 'fed',
    name: 'Federal Reserve Press Releases',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    category: 'Economy',
    resolutionSource: 'https://www.federalreserve.gov/newsevents/pressreleases.htm',
  },
  {
    id: 'bbc-business',
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Economy',
    resolutionSource: null,
  },
  {
    id: 'bbc-sport',
    name: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/rss.xml',
    category: 'Sports',
    resolutionSource: null,
  },
];