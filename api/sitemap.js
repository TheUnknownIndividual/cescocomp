const { getPool } = require('../lib/db');
const { BASE_URL, listPublishedCmsTranslations } = require('../lib/cms');
const { listSitemapArticles } = require('../lib/articles');

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toSitemapDate(value, fallback) {
  if (!value) return fallback;
  const text = String(value);
  const match = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (match) {
    const date = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] || 0),
      Number(match[5] || 0)
    );
    return date.toISOString();
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = BASE_URL;
    const now = new Date().toISOString();
    const [cmsTranslations, articles] = await Promise.all([
      listPublishedCmsTranslations().catch(error => {
        console.error('[api/sitemap] CMS URLs failed:', error.message);
        return [];
      }),
      listSitemapArticles({ db: getPool(), limit: 1000 })
    ]);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/news</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/solar-calculator</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/regulatory-framework</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    for (const post of cmsTranslations) {
      sitemap += `
  <url>
    <loc>${baseUrl}/${escapeXml(post.lang)}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${toSitemapDate(post.updated_at || post.published_at, now)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
    }

    for (const article of articles) {
      if (!article.slug) continue;
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${escapeXml(article.slug)}</loc>
    <lastmod>${toSitemapDate(article.published_at || article.fetched_at, now)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error('[api/sitemap]', error.message);
    return res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};
