import { meals } from './meals.mjs';
import { SITE } from './newsletter.mjs';

export const PUBLIC_PATHS = [
  '/',
  '/ideas',
  '/newsletter',
  ...meals.map((meal) => `/ideas/${meal.slug}`),
];

export function absoluteUrl(path) {
  return path === '/' ? `${SITE}/` : `${SITE}${path}`;
}

export function sitemapXml() {
  const urls = PUBLIC_PATHS.map((path) => `<url><loc>${absoluteUrl(path)}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`;
}
