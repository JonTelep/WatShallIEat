import { parseSearchParams, searchRestaurants } from '../../lib/places.mjs';
import { OSM_ATTRIBUTION, OSM_ATTRIBUTION_URL } from '../../lib/placeFilters.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const params = parseSearchParams(req.body);
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const data = await searchRestaurants({
      ...params,
      placesBaseUrl: host ? `${proto}://${host}` : '',
    });
    return res.status(200).json({
      results: data.results,
      capped: data.capped,
      source: data.source,
      attribution: OSM_ATTRIBUTION,
      attributionUrl: OSM_ATTRIBUTION_URL,
    });
  } catch (error) {
    if (error && error.code === 'BAD_REQUEST') {
      return res.status(400).json({ message: 'Check the location and radius, then try again.' });
    }
    return res.status(503).json({
      message: 'The map search is busy right now. Please try again in a moment.',
    });
  }
}
