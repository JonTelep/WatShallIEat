// Builds DoorDash and Uber Eats search links for one chosen place.
// The links open a search. They do not place an order.

function encodeBase64(value) {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(value)));
  }
  return Buffer.from(value, 'utf8').toString('base64');
}

function cityFromPlace(place) {
  const explicit = String(place.city || '').trim();
  if (explicit) return explicit;
  const parts = String(place.address || place.vicinity || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function coordinates(place) {
  const geometry = place.geometry && place.geometry.location;
  const lat = Number(place.lat != null ? place.lat : geometry && geometry.lat);
  const lng = Number(place.lng != null ? place.lng : geometry && geometry.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function deliveryLinks(place) {
  if (!place || !place.name) {
    return { ok: false, reason: 'We do not have a restaurant to look up yet.' };
  }
  if (place.delivery === 'no') {
    return {
      ok: false,
      reason: `${place.name} is listed as not offering delivery. Run the search again for another option.`,
    };
  }
  const point = coordinates(place);
  const address = String(place.address || place.vicinity || '').trim();
  const city = cityFromPlace(place);
  if (!address && !point) {
    return {
      ok: false,
      reason: `We do not have an address or location for ${place.name}, so we cannot build a delivery link.`,
    };
  }
  const name = String(place.name).trim();
  const query = city ? `${name} ${city}` : name;
  const doorDash = `https://www.doordash.com/search/store/${encodeURIComponent(query)}/`;
  const uber = new URL('https://www.ubereats.com/search');
  uber.searchParams.set('q', name);
  if (point) {
    const payload = JSON.stringify({
      address: address || city || name,
      latitude: point.lat,
      longitude: point.lng,
    });
    uber.searchParams.set('pl', encodeBase64(payload));
  }
  return {
    ok: true,
    links: [
      { label: 'Search DoorDash', service: 'doordash', href: doorDash },
      { label: 'Search Uber Eats', service: 'ubereats', href: uber.toString() },
    ],
  };
}
