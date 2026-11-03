// Writes public/robots.txt, sitemap.xml, llms.txt and openapi.json before next build.
import fs from 'node:fs';
import { robotsTxt, sitemapXml } from '../lib/paths.mjs';
import { CITIES } from '../lib/cities.mjs';
import { meals } from '../lib/meals.mjs';
import { FAQ } from '../lib/faq.mjs';

const SITE = 'https://watshallieat.com';
const index = JSON.parse(fs.readFileSync('public/places/index.json', 'utf8'));

const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Wat Shall I Eat restaurant search',
    version: '1.0.0',
    description: `Find restaurants, cafes, and fast food places near a point in Ohio. Data: OpenStreetMap Ohio extract (${index.generated}), ${index.attribution}, ODbL. No key needed. Please keep requests light.`,
    license: { name: 'ODbL (data)', url: index.attributionUrl },
  },
  servers: [{ url: SITE }],
  paths: {
    '/api/search': {
      post: {
        operationId: 'searchRestaurants',
        summary: 'Places to eat near a location in Ohio',
        requestBody: {
          required: true,
          content: { 'application/json': {
            schema: {
              type: 'object', required: ['lat', 'lng', 'radiusMiles'],
              properties: {
                lat: { type: 'number', minimum: -90, maximum: 90, example: 41.4993 },
                lng: { type: 'number', minimum: -180, maximum: 180, example: -81.6944 },
                radiusMiles: { type: 'integer', minimum: 1, maximum: 20, example: 1, description: 'Rounded to a whole number of miles.' },
              },
            },
          } },
        },
        responses: {
          200: { description: 'Places sorted by distance, closest first.', content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              results: { type: 'array', items: { type: 'object', properties: {
                id: { type: 'string', description: 'OpenStreetMap id, for example node/123. Map: https://www.openstreetmap.org/{id}' },
                name: { type: 'string' }, lat: { type: 'number' }, lng: { type: 'number' },
                cuisineTags: { type: 'array', items: { type: 'string' } },
                cuisine: { type: ['string', 'null'] }, address: { type: ['string', 'null'] },
                hours: { type: ['string', 'null'], description: 'OpenStreetMap opening_hours value' },
                hoursState: { type: 'string', description: 'open, closed, or unknown at request time' },
                city: { type: ['string', 'null'] }, phone: { type: ['string', 'null'] },
                website: { type: ['string', 'null'] }, delivery: { type: ['string', 'null'] },
                distanceMeters: { type: 'number' },
              } } },
              capped: { type: 'boolean', description: 'True when more places matched than were returned.' },
              source: { type: 'string' },
              attribution: { type: 'string' }, attributionUrl: { type: 'string' },
            },
          } } } },
          400: { description: 'Bad location or radius.' },
          503: { description: 'Search temporarily unavailable.' },
        },
      },
    },
  },
};

const llms = `# Wat Shall I Eat

> Wat Shall I Eat (${SITE}) helps people decide what to eat. It picks one nearby restaurant in Ohio from OpenStreetMap data, or suggests a simple meal to cook at home. Free, no account. Run by Telep IO LLC, Valley City, Ohio.

Restaurant data covers Ohio only. It comes from the OpenStreetMap Ohio extract dated ${index.generated} (${index.count} places), ${index.attribution}, ODbL.

## For agents: restaurant search API

POST ${SITE}/api/search with a JSON body. No key needed. OpenAPI description: ${SITE}/openapi.json

\`\`\`
curl -X POST ${SITE}/api/search -H 'content-type: application/json' -d '{"lat":41.4993,"lng":-81.6944,"radiusMiles":1}'
\`\`\`

- lat, lng: the point to search around (numbers).
- radiusMiles: whole number from 1 to 20.
- Response: results (closest first) with name, cuisine, address, hours, hoursState (open, closed, or unknown), phone, website, distanceMeters, and an OpenStreetMap id. capped is true when the list was cut short.
- Please credit "© OpenStreetMap contributors" when you show results.

## Pages

- [Restaurant picker](${SITE}/): pick one place near you at random.
- [What to eat near me in Ohio](${SITE}/near-me): city pages.
${CITIES.map((c) => `- [What to eat near me in ${c.name}](${SITE}/near-me/${c.slug})`).join('\n')}
- [Meal ideas](${SITE}/ideas)
${meals.map((m) => `- [${m.title}](${SITE}/ideas/${m.slug}): ${m.description}`).join('\n')}
- [Weekly meal ideas email](${SITE}/newsletter)

## FAQ

${FAQ.map(([q, a]) => `### ${q}\n${a}`).join('\n\n')}
`;

fs.writeFileSync('public/robots.txt', robotsTxt());
fs.writeFileSync('public/sitemap.xml', sitemapXml());
fs.writeFileSync('public/llms.txt', llms);
fs.writeFileSync('public/openapi.json', JSON.stringify(openapi, null, 2));
console.log('static files written');
