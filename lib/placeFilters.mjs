// Client-safe filters for places already fetched from OpenStreetMap.
// Opening hours are evaluated on the server. This module only reads the result.

export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
export const OSM_ATTRIBUTION_URL = 'https://www.openstreetmap.org/copyright';

export const CUISINES = [
  ['american', 'American'],
  ['barbecue', 'Barbecue'],
  ['breakfast', 'Breakfast'],
  ['burger', 'Burger'],
  ['chicken', 'Chicken'],
  ['chinese', 'Chinese'],
  ['coffee', 'Coffee'],
  ['greek', 'Greek'],
  ['ice_cream', 'Ice cream'],
  ['indian', 'Indian'],
  ['italian', 'Italian'],
  ['japanese', 'Japanese'],
  ['korean', 'Korean'],
  ['mediterranean', 'Mediterranean'],
  ['mexican', 'Mexican'],
  ['pizza', 'Pizza'],
  ['sandwich', 'Sandwich'],
  ['seafood', 'Seafood'],
  ['sushi', 'Sushi'],
  ['thai', 'Thai'],
  ['vegan', 'Vegan'],
  ['vegetarian', 'Vegetarian'],
  ['vietnamese', 'Vietnamese'],
];

const CUISINE_IDS = new Set(CUISINES.map(([id]) => id));

// Extra OSM cuisine tokens that mean the same choice. These are still real tags.
const CUISINE_ALIASES = {
  barbecue: ['bbq'],
  burger: ['hamburger'],
  coffee: ['coffee_shop'],
};

function cuisineMatches(tags, id) {
  if (tags.includes(id)) return true;
  const aliases = CUISINE_ALIASES[id] || [];
  return aliases.some((alias) => tags.includes(alias));
}

export function sanitizeFilters(value) {
  const source = value && typeof value === 'object' ? value : {};
  const radius = Number(source.radius);
  const selected = Array.isArray(source.selectedCuisines) ? source.selectedCuisines : [];
  return {
    radius: Number.isFinite(radius) ? Math.min(20, Math.max(1, Math.round(radius))) : 5,
    selectedCuisines: selected.filter((id) => CUISINE_IDS.has(id)),
    openNow: Boolean(source.openNow),
  };
}

export function filterPlaces(places, { cuisines = [], openNow = false } = {}) {
  const wanted = cuisines.map((id) => String(id).trim().toLowerCase()).filter(Boolean);
  return places.filter((place) => {
    if (openNow && place.hoursState !== 'open') return false;
    if (!wanted.length) return true;
    const tags = Array.isArray(place.cuisineTags) ? place.cuisineTags : [];
    return wanted.some((id) => cuisineMatches(tags, id));
  });
}

export function pickRandom(places, random = Math.random, avoidId) {
  if (!places.length) return null;
  let pool = places;
  if (avoidId && places.length > 1) {
    const rest = places.filter((place) => place.id !== avoidId);
    if (rest.length) pool = rest;
  }
  const index = Math.floor(random() * pool.length);
  return pool[Math.min(pool.length - 1, Math.max(0, index))];
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return null;
  const miles = meters / 1609.344;
  if (miles < 0.1) return 'Under 0.1 miles';
  return `${miles.toFixed(1)} miles`;
}

export function directionsUrl(place, userLocation) {
  const lat = Number(place && place.lat);
  const lng = Number(place && place.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const fromLat = Number(userLocation && userLocation.lat);
  const fromLng = Number(userLocation && userLocation.lng);
  if (Number.isFinite(fromLat) && Number.isFinite(fromLng)) {
    const route = `${fromLat},${fromLng};${lat},${lng}`;
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(route)}`;
  }
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export function poolKey(location, radiusMiles) {
  const lat = Number(location && location.lat);
  const lng = Number(location && location.lng);
  const miles = Math.round(Number(radiusMiles));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(miles)) return '';
  return `${lat.toFixed(3)}|${lng.toFixed(3)}|${miles}`;
}
