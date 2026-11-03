import { meals } from './meals.mjs';
import { SITE } from './newsletter.mjs';
import { CITIES } from './cities.mjs';

export const PUBLIC_PATHS = [
  '/',
  '/ideas',
  '/newsletter',
  '/near-me',
  ...CITIES.map((city) => `/near-me/${city.slug}`),
  ...meals.map((meal) => `/ideas/${meal.slug}`),
];

export function absoluteUrl(path) {
  return path === '/' ? `${SITE}/` : `${SITE}${path}`;
}

export function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_PATHS.map((path) => `<url><loc>${absoluteUrl(path)}</loc><lastmod>${today}</lastmod></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

const AI_AGENTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'Bingbot', 'CCBot', 'meta-externalagent', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'cohere-ai'];

export function robotsTxt() {
  const ai = AI_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /\n`).join('\n');
  return `User-agent: *\nAllow: /\nAllow: /api/search\nDisallow: /api/subscribe\nDisallow: /api/unsubscribe\nDisallow: /api/confirm\n\n${ai}\nSitemap: ${SITE}/sitemap.xml\n# LLM guide: ${SITE}/llms.txt\n# API description: ${SITE}/openapi.json\n`;
}
