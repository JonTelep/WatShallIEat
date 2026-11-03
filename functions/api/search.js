import { parseSearchParams, searchRestaurants } from '../../lib/places.mjs';
import { OSM_ATTRIBUTION, OSM_ATTRIBUTION_URL } from '../../lib/placeFilters.mjs';
const json = (b, s = 200) => Response.json(b, { status: s, headers: { 'cache-control': 'no-store' } });
const ORIGIN = 'https://watshallieat.internal';
let assets = null;
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const u = typeof input === 'string' ? input : input && input.url;
  if (assets && u && u.startsWith(ORIGIN + '/places/')) return assets.fetch(new Request(u, init));
  return realFetch(input, init);
};
export async function onRequestPost({ request, env }) {
  assets = env.ASSETS;
  let body;
  try { body = await request.json(); } catch { return json({ message: 'Check the location and radius, then try again.' }, 400); }
  try {
    const params = parseSearchParams(body);
    const data = await searchRestaurants({ ...params, placesBaseUrl: ORIGIN });
    return json({ results: data.results, capped: data.capped, source: data.source, attribution: OSM_ATTRIBUTION, attributionUrl: OSM_ATTRIBUTION_URL });
  } catch (error) {
    if (error && error.code === 'BAD_REQUEST') return json({ message: 'Check the location and radius, then try again.' }, 400);
    return json({ message: 'The map search is busy right now. Please try again in a moment.' }, 503);
  }
}
export function onRequest() { return json({ message: 'Method not allowed.' }, 405); }
