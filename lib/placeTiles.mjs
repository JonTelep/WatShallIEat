// Read precomputed OpenStreetMap restaurant tiles.
// Tiles are static JSON written by scripts/build-places.mjs.
// A search loads only the geohash cells that touch the requested circle.

import path from 'node:path';
import { geohashEncode, geohashesCovering } from './geohash.mjs';
import { cuisineLabel, cuisineTokens } from './places.mjs';

export const TILE_PRECISION = 4;

const indexCache = new Map();
const tileCache = new Map();

function defaultRoot() {
  return path.join(process.cwd(), 'public', 'places');
}

function plain(value) {
  return String(value || '').replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}

function roundCoord(value) {
  return Math.round(Number(value) * 1e5) / 1e5;
}

function formatAddress(tags) {
  const full = plain(tags['addr:full']);
  if (full) return full;
  const street = [tags['addr:housenumber'], tags['addr:street']].map((part) => plain(part)).filter(Boolean).join(' ');
  const cityLine = [tags['addr:city'], tags['addr:state']].map((part) => plain(part)).filter(Boolean).join(', ');
  const postcode = plain(tags['addr:postcode']);
  const parts = [street, [cityLine, postcode].filter(Boolean).join(' ')].filter(Boolean);
  return parts.length ? parts.join(', ') : '';
}

function httpUrl(value) {
  const raw = plain(value);
  if (!raw) return '';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : (raw.startsWith('www.') ? `https://${raw}` : '');
  if (!withScheme) return '';
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function compactFoodPlace({ type, id, tags, lat, lon }) {
  const amenity = String(tags.amenity || '');
  if (!['restaurant', 'fast_food', 'cafe'].includes(amenity)) return null;
  const name = plain(tags.name);
  if (!name || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return null;
  const kind = type === 'way' ? 'way' : 'node';
  const row = {
    i: `${kind}/${id}`,
    n: name,
    a: roundCoord(lat),
    o: roundCoord(lon),
  };
  const cuisine = plain(tags.cuisine);
  const hours = plain(tags.opening_hours);
  const address = formatAddress(tags);
  const city = plain(tags['addr:city']);
  const phone = plain(tags.phone || tags['contact:phone']);
  const website = httpUrl(tags.website || tags['contact:website'] || tags.url);
  const delivery = plain(tags.delivery).toLowerCase();
  if (cuisine) row.c = cuisine;
  if (hours) row.h = hours;
  if (address) row.d = address;
  if (city) row.y = city;
  if (phone) row.p = phone;
  if (website) row.w = website;
  if (delivery === 'yes' || delivery === 'no' || delivery === 'only') row.v = delivery;
  return row;
}

export function expandPlace(row) {
  if (!row || !row.i || !row.n) return null;
  const lat = Number(row.a);
  const lng = Number(row.o);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const cuisineTags = cuisineTokens(row.c);
  return {
    id: String(row.i),
    name: String(row.n),
    lat,
    lng,
    cuisineTags,
    cuisine: cuisineTags.length ? cuisineTags.map(cuisineLabel).join(', ') : null,
    address: row.d || null,
    hours: row.h || null,
    city: row.y || null,
    phone: row.p || null,
    website: row.w || null,
    delivery: row.v || null,
    countryCode: 'US',
  };
}

async function readJson(root, relativeName, baseUrl) {
  const base = String(baseUrl || process.env.PLACES_BASE_URL || '').replace(/\/$/, '');
  const relativeUrl = relativeName.split(path.sep).join('/');
  if (!baseUrl) try {
    const { readFile } = await import('node:fs/promises');
    return JSON.parse(await readFile(path.join(root, relativeName), 'utf8'));
  } catch (error) {
    const missing = error && (error.code === 'ENOENT' || error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND');
    if (!base) {
      if (missing) return null;
      throw error;
    }
    if (!missing) throw error;
  }
  const response = await fetch(`${base}/places/${relativeUrl}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    const failure = new Error('places unavailable');
    failure.code = 'PLACES';
    throw failure;
  }
  return response.json();
}

async function loadIndex(root, baseUrl) {
  const key = `${root}|${baseUrl || ''}`;
  if (indexCache.has(key)) return indexCache.get(key);
  const data = await readJson(root, 'index.json', baseUrl);
  const tiles = new Set(Array.isArray(data && data.tiles) ? data.tiles : []);
  const index = {
    tiles,
    precision: Number(data && data.precision) || TILE_PRECISION,
  };
  indexCache.set(key, index);
  return index;
}

async function loadTile(root, hash, baseUrl) {
  const key = `${root}|${hash}`;
  if (tileCache.has(key)) return tileCache.get(key);
  if (tileCache.size > 80) tileCache.clear();
  const data = await readJson(root, path.posix.join('tiles', `${hash}.json`), baseUrl);
  const rows = Array.isArray(data) ? data : [];
  tileCache.set(key, rows);
  return rows;
}

export async function searchLocalPlaces({ lat, lng, radiusMiles, root, baseUrl } = {}) {
  const placesRoot = root || defaultRoot();
  const index = await loadIndex(placesRoot, baseUrl);
  if (!index.tiles.size) return { covered: false, places: [] };
  const precision = index.precision || TILE_PRECISION;
  const radiusMeters = Number(radiusMiles) * 1609.344;
  const hashes = geohashesCovering(lat, lng, radiusMeters, precision);
  const coveredHashes = hashes.filter((hash) => index.tiles.has(hash));
  if (!coveredHashes.length) {
    const center = geohashEncode(Number(lat), Number(lng), precision);
    if (!index.tiles.has(center)) return { covered: false, places: [] };
  }
  const seen = new Set();
  const places = [];
  for (const hash of coveredHashes) {
    const rows = await loadTile(placesRoot, hash, baseUrl);
    for (const row of rows) {
      const place = expandPlace(row);
      if (!place || seen.has(place.id)) continue;
      seen.add(place.id);
      places.push(place);
    }
  }
  return { covered: true, places };
}
