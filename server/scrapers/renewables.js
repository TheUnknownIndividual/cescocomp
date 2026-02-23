const axios = require('axios');

const CATEGORIES = [
  'https://renewables.az/az/category/Azerbaycan/news',
  'https://renewables.az/az/category/Region/news', 
  'https://renewables.az/az/category/dunya/news',
  'https://renewables.az/az/category/gunes/news',
  'https://renewables.az/az/category/kulek/news',
  'https://renewables.az/az/category/hidro/news'
];

async function tryUrl(url) {
  const { data: html } = await axios.get(url, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cescocomp-bot/1.0)' }
  });

  const results = [];
  const cardRegex = /<div class="col-lg-4 col-md-4 col-sm-6 col-12">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const cardHtml = match[0];
    
    // Extract link
    const linkMatch = cardHtml.match(/<a href="(https:\/\/renewables\.az\/az\/news\/[^"]+)"/); 
    const link = linkMatch ? linkMatch[1] : null;
    
    // Extract image  
    const imgMatch = cardHtml.match(/<img src="(https:\/\/renewables\.az\/storage\/news_images\/[^"]+)"/);
    const image = imgMatch ? imgMatch[1] : null;
    
    // Extract date
    const dateMatch = cardHtml.match(/<i class="icofont-calendar"><\/i>\s*([^<]+)/);
    const date = dateMatch ? dateMatch[1].trim() : null;
    
    // Extract title
    const titleMatch = cardHtml.match(/<h3>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h3>/);
    let title = titleMatch ? titleMatch[1].trim() : null;
    if (title) title = title.replace(/\s+/g, ' ').trim();
    
    if (link && title) {
      results.push({
        title,
        excerpt: '', // Will be filled later if needed
        image,
        link,
        source: 'renewables.az',
        published_at: date
      });
    }
  }

  return results;
}

module.exports = async function scrapeRenewables() {
  const allItems = [];
  for (const url of CATEGORIES) {
    try {
      const items = await tryUrl(url);
      allItems.push(...items);
      console.log(`[renewables] scraped ${items.length} articles from ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
    } catch (e) {
      console.warn(`[renewables] failed ${url}: ${e.message}`);
    }
  }
  
  // Remove duplicates by link
  const unique = Array.from(new Map(allItems.map(item => [item.link, item])).values());
  console.log(`[renewables] total unique articles: ${unique.length}`);
  return unique;
};
