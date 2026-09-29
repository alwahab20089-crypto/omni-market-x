import Parser from 'rss-parser';

const parser = new Parser({ timeout: 10_000 });

export async function fetchFeed(source) {
  const feed = await parser.parseURL(source.url);
  return feed.items
    .slice(0, 30)
    .map((i) => ({
      title: (i.title || '').trim(),
      summary: (i.contentSnippet || i.content || '').trim(),
      link: i.link,
      publishedAt: i.isoDate ? new Date(i.isoDate) : new Date(),
      publisher: source.name,
      sourceId: source.id,
    }))
    .filter((a) => a.title && a.link);
}