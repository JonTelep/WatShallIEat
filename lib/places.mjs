// Server-side OpenStreetMap search via the public Overpass API.
// https://dev.overpass-api.de/overpass-doc/en/preface/commons.html
// Identify the app, set a timeout, cache briefly, and fall back to a second public instance.

import { hoursStatus } from './hours.mjs';

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export const USER_AGENT = 'WatShallIEat/1.0 (+https://watshallieat.com; restaurant search; contact: jon@telep.io)';

const CACHE_TTL_MS = 3 * 60 * 1000;
const RESULT_LIMIT = 400;
const MILES_TO_METERS = 1609.344;
const memoryCache = new Map();
const inflight = new Map();

function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export function roundQuery(lat, lng, radiusMiles) {
  const miles = Math.min(20, Math.max(1, Math.round(Number(radiusMiles))));
  return {
    lat: Math.round(Number(lat) * 1000) / 1000,
    lng: Math.round(Number(lng) * 1000) / 1000,
    radiusMiles: miles,
  };
}

export function cacheKeyFor(lat, lng, radiusMiles) {
  const rounded = roundQuery(lat, lng, radiusMiles);
  return `${rounded.lat.toFixed(3)},${rounded.lng.toFixed(3)},${rounded.radiusMiles}`;
}

export function parseSearchParams(input) {
  const body = input && typeof input === 'object' ? input : {};
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const radiusMiles = Math.round(Number(body.radiusMiles));
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    const error = new Error('invalid location');
    error.code = 'BAD_REQUEST';
    throw error;
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    const error = new Error('invalid location');
    error.code = 'BAD_REQUEST';
    throw error;
  }
  if (!Number.isFinite(radiusMiles) || radiusMiles < 1 || radiusMiles > 20) {
    const error = new Error('invalid radius');
    error.code = 'BAD_REQUEST';
    throw error;
  }
  return { lat, lng, radiusMiles };
}

export function buildOverpassQuery(lat, lng, radiusMeters) {
  const radius = Math.max(1, Math.round(radiusMeters));
  const around = `${radius},${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  const amenity = '["amenity"~"^(restaurant|fast_food|cafe)$"]';
  return `[out:json][timeout:15];
(
  node${amenity}(around:${around});
  way${amenity}(around:${around});
  relation${amenity}(around:${around});
);
out center tags ${RESULT_LIMIT};`;
}

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function cuisineTokens(value) {
  return String(value || '')
    .split(';')
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, '_'))
    .filter(Boolean);
}

export function cuisineLabel(token) {
  return String(token)
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatAddress(tags) {
  const full = String(tags['addr:full'] || '').trim();
  if (full) return full;
  const street = [tags['addr:housenumber'], tags['addr:street']].map((part) => String(part || '').trim()).filter(Boolean).join(' ');
  const cityLine = [tags['addr:city'], tags['addr:state']].map((part) => String(part || '').trim()).filter(Boolean).join(', ');
  const postcode = String(tags['addr:postcode'] || '').trim();
  const parts = [street, [cityLine, postcode].filter(Boolean).join(' ')].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function httpUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : (raw.startsWith('www.') ? `https://${raw}` : '');
  if (!withScheme) return null;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function elementPoint(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

export function packElement(element) {
  const tags = element && element.tags ? element.tags : {};
  const name = String(tags.name || '').trim();
  const point = element ? elementPoint(element) : null;
  if (!name || !point) return null;
  if (!['restaurant', 'fast_food', 'cafe'].includes(tags.amenity)) return null;
  const cuisineTags = cuisineTokens(tags.cuisine);
  const phone = String(tags.phone || tags['contact:phone'] || '').trim();
  return {
    id: `${element.type || 'node'}/${element.id}`,
    name,
    lat: point.lat,
    lng: point.lng,
    amenity: tags.amenity,
    cuisineTags,
    cuisine: cuisineTags.length ? cuisineTags.map(cuisineLabel).join(', ') : null,
    address: formatAddress(tags),
    hours: String(tags.opening_hours || '').trim() || null,
    countryCode: tags['addr:country'] || null,
    phone: phone || null,
    website: httpUrl(tags.website || tags['contact:website'] || tags.url),
  };
}

export function decoratePlace(place, origin, at = new Date()) {
  return {
    ...place,
    hoursState: hoursStatus(place.hours, {
      lat: place.lat,
      lng: place.lng,
      at,
      countryCode: place.countryCode,
    }),
    distanceMeters: haversineMeters(origin.lat, origin.lng, place.lat, place.lng),
  };
}

async function readEdgeCache(key) {
  if (typeof caches === 'undefined' || !caches.default) return null;
  try {
    const hit = await caches.default.match(new Request(cacheRequestUrl(key)));
    if (!hit) return null;
    const body = await hit.json();
    if (!body || !Array.isArray(body.places) || !(body.expiresAt > Date.now())) return null;
    return body;
  } catch {
    return null;
  }
}

async function writeEdgeCache(key, payload) {
  if (typeof caches === 'undefined' || !caches.default) return;
  try {
    await caches.default.put(new Request(cacheRequestUrl(key)), new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=180',
      },
    }));
  } catch {
    // The search still returns. Edge cache is best effort.
  }
}

function cacheRequestUrl(key) {
  return `https://watshallieat.com/overpass-cache?q=${encodeURIComponent(key)}`;
}

function readMemoryCache(key) {
  const hit = memoryCache.get(key);
  if (!hit || !(hit.expiresAt > Date.now())) return null;
  return hit;
}

function writeMemoryCache(key, payload) {
  if (memoryCache.size > 40) memoryCache.clear();
  memoryCache.set(key, payload);
}

async function interpretOverpass(response) {
  if (!response || !response.ok) {
    const error = new Error('overpass unavailable');
    error.code = 'OVERPASS';
    throw error;
  }
  let data;
  try {
    data = await response.json();
  } catch {
    const error = new Error('overpass unavailable');
    error.code = 'OVERPASS';
    throw error;
  }
  if (!data || !Array.isArray(data.elements)) {
    const error = new Error('overpass unavailable');
    error.code = 'OVERPASS';
    throw error;
  }
  return data.elements;
}

export async function fetchOverpassElements(lat, lng, radiusMeters, fetchFn = fetch) {
  const query = buildOverpassQuery(lat, lng, radiusMeters);
  const body = new URLSearchParams({ data: query }).toString();
  let lastError = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': USER_AGENT,
        },
        body,
        signal: timeoutSignal(20000),
      });
      return await interpretOverpass(response);
    } catch (error) {
      lastError = error;
    }
  }
  const error = new Error('overpass unavailable');
  error.code = 'OVERPASS';
  error.cause = lastError;
  throw error;
}

async function loadPacked(lat, lng, radiusMiles, fetchFn) {
  const rounded = roundQuery(lat, lng, radiusMiles);
  const key = cacheKeyFor(lat, lng, radiusMiles);
  const cached = await readEdgeCache(key) || readMemoryCache(key);
  if (cached) return cached;
  if (inflight.has(key)) return inflight.get(key);

  const job = (async () => {
    const radiusMeters = rounded.radiusMiles * MILES_TO_METERS;
    const elements = await fetchOverpassElements(rounded.lat, rounded.lng, radiusMeters, fetchFn);
    const payload = {
      places: elements.map(packElement).filter(Boolean),
      capped: elements.length >= RESULT_LIMIT,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    await writeEdgeCache(key, payload);
    writeMemoryCache(key, payload);
    return payload;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

export async function searchRestaurants({ lat, lng, radiusMiles, fetchFn = fetch, now = new Date() }) {
  const packed = await loadPacked(lat, lng, radiusMiles, fetchFn);
  const allowed = radiusMiles * MILES_TO_METERS + 200;
  const results = packed.places
    .map((place) => {
      const decorated = decoratePlace(place, { lat, lng }, now);
      delete decorated.countryCode;
      return decorated;
    })
    .filter((place) => place.distanceMeters <= allowed)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return { results, capped: Boolean(packed.capped) };
}
