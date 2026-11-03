// Build-time only: read the OpenStreetMap tiles for a city page.
import path from 'node:path';
import { searchLocalPlaces } from './placeTiles.mjs';
import { haversineMeters } from './places.mjs';

const RADIUS_MILES = 2;

export async function cityPlaces(city, limit = 40) {
  const root = path.join(process.cwd(), 'public', 'places');
  const { places } = await searchLocalPlaces({ lat: city.lat, lng: city.lng, radiusMiles: RADIUS_MILES, root });
  const within = places
    .map((p) => ({ ...p, distanceMeters: haversineMeters(city.lat, city.lng, p.lat, p.lng) }))
    .filter((p) => p.distanceMeters <= RADIUS_MILES * 1609.344)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  const counts = {};
  for (const p of within) for (const c of (p.cuisine ? p.cuisine.split(', ') : [])) counts[c] = (counts[c] || 0) + 1;
  const cuisines = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
  const list = within.slice(0, limit).map((p) => ({
    id: p.id, name: p.name, cuisine: p.cuisine || null, address: p.address || null,
    website: p.website || null, miles: Math.round((p.distanceMeters / 1609.344) * 10) / 10,
  }));
  return { total: within.length, radiusMiles: RADIUS_MILES, cuisines, places: list };
}
