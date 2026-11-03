import assert from 'node:assert/strict';
import test from 'node:test';
import { filterPlaces, pickRandom, sanitizeFilters } from '../lib/placeFilters.mjs';
import { hoursStatus } from '../lib/hours.mjs';
import { deliveryLinks } from '../lib/delivery.mjs';
import { FAQ } from '../lib/faq.mjs';
import {
  buildOverpassQuery,
  cacheKeyFor,
  decoratePlace,
  endpointAttemptOrder,
  fetchOverpassElements,
  OVERPASS_ENDPOINTS,
  OVERPASS_TIMEOUT_MS,
  packElement,
  resetOverpassRotation,
  searchRestaurants,
  USER_AGENT,
} from '../lib/places.mjs';

const WEDNESDAY_OPEN = new Date('2026-11-04T15:00:00Z');
const WEDNESDAY_CLOSED = new Date('2026-11-04T23:00:00Z');
const SUNDAY = new Date('2026-11-01T16:00:00Z');
const CLEVELAND = { lat: 41.5, lng: -81.69 };

function hours(value, at) {
  return hoursStatus(value, {
    ...CLEVELAND,
    at,
    timeZone: 'America/New_York',
    countryCode: 'US',
  });
}

test('open now uses opening_hours in the place timezone', () => {
  assert.equal(hours('Mo-Fr 09:00-17:00', WEDNESDAY_OPEN), 'open');
  assert.equal(hours('Mo-Fr 09:00-17:00', WEDNESDAY_CLOSED), 'closed');
  assert.equal(hours('Mo-Fr 09:00-17:00', SUNDAY), 'closed');
  assert.equal(hours('Mo-Fr 09:00-17:00; PH off', WEDNESDAY_OPEN), 'open');
  assert.equal(hours('24/7', SUNDAY), 'open');
});

test('missing and unreadable hours stay unknown', () => {
  assert.equal(hours('', WEDNESDAY_OPEN), 'unknown');
  assert.equal(hours(null, WEDNESDAY_OPEN), 'unknown');
  assert.equal(hours('not a real schedule', WEDNESDAY_OPEN), 'unknown');
  assert.equal(hoursStatus('Mo-Fr 09:00-17:00', { at: WEDNESDAY_OPEN }), 'unknown');
});

test('open now drops closed places and places with unknown hours', () => {
  const places = [
    { id: 'open-pizza', cuisineTags: ['pizza', 'italian'], hoursState: 'open' },
    { id: 'unknown-pizza', cuisineTags: ['pizza'], hoursState: 'unknown' },
    { id: 'closed-pizza', cuisineTags: ['pizza'], hoursState: 'closed' },
    { id: 'open-sushi', cuisineTags: ['sushi'], hoursState: 'open' },
  ];

  assert.deepEqual(
    filterPlaces(places, { cuisines: ['pizza'], openNow: true }).map((place) => place.id),
    ['open-pizza']
  );
  assert.deepEqual(
    filterPlaces(places, { openNow: true }).map((place) => place.id),
    ['open-pizza', 'open-sushi']
  );
  assert.equal(filterPlaces(places, { openNow: false }).length, 4);
  assert.deepEqual(
    filterPlaces(places, { cuisines: ['italian'] }).map((place) => place.id),
    ['open-pizza']
  );
  assert.deepEqual(
    filterPlaces([{ id: 'burger', cuisineTags: ['hamburger'], hoursState: 'open' }], { cuisines: ['burger'] }).map((place) => place.id),
    ['burger']
  );
});

test('a reroll stays inside the current list and can avoid the last pick', () => {
  const places = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(pickRandom(places, () => 0, 'a').id, 'b');
  assert.equal(pickRandom([{ id: 'only' }], () => 0.9, 'only').id, 'only');
  assert.equal(pickRandom([], () => 0), null);
});

test('packed places keep tagged facts and do not invent price or rating', () => {
  const place = packElement({
    type: 'node',
    id: 42,
    lat: 41.5,
    lon: -81.69,
    tags: {
      name: 'Test Pizza',
      amenity: 'restaurant',
      cuisine: 'Pizza; Italian',
      opening_hours: 'Mo-Fr 09:00-17:00',
      phone: '+1 216 555 0100',
      website: 'https://example.com/menu',
      'addr:housenumber': '1',
      'addr:street': 'Main St',
      'addr:city': 'Cleveland',
      fee: '10 USD',
    },
  });
  assert.equal(place.name, 'Test Pizza');
  assert.deepEqual(place.cuisineTags, ['pizza', 'italian']);
  assert.equal(place.cuisine, 'Pizza, Italian');
  assert.equal(place.address, '1 Main St, Cleveland');
  assert.equal(place.phone, '+1 216 555 0100');
  assert.equal(place.website, 'https://example.com/menu');
  assert.equal(Object.hasOwn(place, 'price'), false);
  assert.equal(Object.hasOwn(place, 'rating'), false);
  assert.equal(Object.hasOwn(place, 'priceLevel'), false);

  const decorated = decoratePlace(place, CLEVELAND, WEDNESDAY_OPEN);
  assert.equal(decorated.hoursState, 'open');
  assert.ok(decorated.distanceMeters < 50);

  assert.equal(packElement({ type: 'node', id: 7, lat: 1, lon: 2, tags: { amenity: 'restaurant' } }), null);
  assert.equal(packElement({
    type: 'node',
    id: 8,
    lat: 1,
    lon: 2,
    tags: { name: 'Bar', amenity: 'bar' },
  }), null);
  assert.equal(packElement({
    type: 'way',
    id: 9,
    center: { lat: 1, lon: 2 },
    tags: { name: 'Cafe', amenity: 'cafe', website: 'javascript:alert(1)' },
  }).website, null);
});

test('overpass query asks for restaurants, fast food, and cafes', () => {
  const query = buildOverpassQuery(41.499, -81.694, 1609);
  assert.match(query, /restaurant\|fast_food\|cafe/);
  assert.match(query, /\[timeout:5\]/);
  assert.match(query, /node\[/);
  assert.match(query, /way\[/);
  assert.match(query, /relation\[/);
  assert.match(query, /\["name"\]/);
  assert.equal(cacheKeyFor(41.4994, -81.6944, 5.2), '41.499,-81.694,5');
  assert.ok(OVERPASS_TIMEOUT_MS <= 10000);
  assert.ok(OVERPASS_ENDPOINTS.some((url) => url.includes('overpass-api.de')));
  assert.ok(OVERPASS_ENDPOINTS.some((url) => url.includes('overpass.kumi.systems')));
  assert.ok(OVERPASS_ENDPOINTS.some((url) => url.includes('overpass.private.coffee')));
});

test('overpass rotates the starting endpoint and retries the first one', () => {
  resetOverpassRotation();
  const first = endpointAttemptOrder();
  const second = endpointAttemptOrder();
  assert.equal(first.length, OVERPASS_ENDPOINTS.length + 1);
  assert.equal(first[0], OVERPASS_ENDPOINTS[0]);
  assert.equal(first[first.length - 1], OVERPASS_ENDPOINTS[0]);
  assert.equal(second[0], OVERPASS_ENDPOINTS[1]);
  assert.equal(second[second.length - 1], OVERPASS_ENDPOINTS[1]);
  resetOverpassRotation();
});

test('overpass falls back to the next public endpoint', async () => {
  resetOverpassRotation();
  const calls = [];
  const fetchFn = async (url, options) => {
    calls.push({ url, userAgent: options.headers['User-Agent'], timeout: options.signal });
    if (url.includes('overpass-api.de')) {
      return new Response('busy', { status: 429 });
    }
    return new Response(JSON.stringify({
      elements: [{
        type: 'node',
        id: 1,
        lat: 41.5,
        lon: -81.69,
        tags: { name: 'Backup Cafe', amenity: 'cafe' },
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const elements = await fetchOverpassElements(41.5, -81.69, 1609, fetchFn, { delayMs: 0 });
  assert.equal(elements.length, 1);
  assert.equal(elements[0].tags.name, 'Backup Cafe');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].userAgent, USER_AGENT);
  assert.ok(calls[0].timeout);
  assert.match(calls[0].url, /overpass-api\.de/);
  assert.match(calls[1].url, /overpass\.kumi\.systems/);
});

test('overpass retries after every endpoint fails once', async () => {
  resetOverpassRotation();
  const calls = [];
  const fetchFn = async (url) => {
    calls.push(url);
    if (calls.length <= OVERPASS_ENDPOINTS.length) {
      return new Response('busy', { status: 504 });
    }
    return new Response(JSON.stringify({
      elements: [{
        type: 'node',
        id: 2,
        lat: 41.5,
        lon: -81.69,
        tags: { name: 'Retry Diner', amenity: 'restaurant' },
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const elements = await fetchOverpassElements(41.51, -81.7, 1609, fetchFn, { delayMs: 0 });
  assert.equal(elements[0].tags.name, 'Retry Diner');
  assert.equal(calls.length, OVERPASS_ENDPOINTS.length + 1);
  assert.equal(calls[0], OVERPASS_ENDPOINTS[0]);
  assert.equal(calls[calls.length - 1], OVERPASS_ENDPOINTS[0]);
  assert.ok(calls.some((url) => url.includes('overpass.private.coffee')));
});

test('a repeated search reuses the short cache', async () => {
  let calls = 0;
  const fetchFn = async () => {
    calls += 1;
    return new Response(JSON.stringify({
      elements: [{
        type: 'node',
        id: 99,
        lat: 12.3456,
        lon: 23.4567,
        tags: { name: 'Cached Cafe', amenity: 'cafe', opening_hours: '24/7' },
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const first = await searchRestaurants({ lat: 12.3456, lng: 23.4567, radiusMiles: 2, fetchFn, now: WEDNESDAY_OPEN });
  const second = await searchRestaurants({ lat: 12.34561, lng: 23.45671, radiusMiles: 2, fetchFn, now: WEDNESDAY_OPEN });
  assert.equal(calls, 1);
  assert.equal(first.results[0].name, 'Cached Cafe');
  assert.equal(second.results[0].name, 'Cached Cafe');
  assert.equal(second.results[0].hoursState, 'open');
});

test('delivery links search DoorDash and Uber Eats for the chosen place', () => {
  const links = deliveryLinks({
    name: 'Test Pizza',
    lat: 41.5,
    lng: -81.69,
    address: '1 Main St, Cleveland',
    city: 'Cleveland',
  });
  assert.equal(links.ok, true);
  assert.match(links.links[0].href, /^https:\/\/www\.doordash\.com\/search\/store\/Test%20Pizza%20Cleveland\/$/);
  assert.equal(links.links[0].label, 'Search DoorDash');
  const uber = new URL(links.links[1].href);
  assert.equal(uber.origin + uber.pathname, 'https://www.ubereats.com/search');
  assert.equal(uber.searchParams.get('q'), 'Test Pizza');
  const payload = JSON.parse(Buffer.from(uber.searchParams.get('pl'), 'base64').toString('utf8'));
  assert.equal(payload.address, '1 Main St, Cleveland');
  assert.equal(payload.latitude, 41.5);
  assert.equal(payload.longitude, -81.69);

  const declined = deliveryLinks({ name: 'Closed Kitchen', lat: 1, lng: 2, delivery: 'no' });
  assert.equal(declined.ok, false);
  assert.match(declined.reason, /not offering delivery/);
  assert.match(deliveryLinks(null).reason, /restaurant to look up/);
  assert.match(deliveryLinks({ name: 'Nameless Spot' }).reason, /address or location/);
});

test('faq names OpenStreetMap and keeps the delivery question', () => {
  const text = FAQ.map((entry) => entry.join(' ')).join('\n');
  assert.match(text, /OpenStreetMap/);
  assert.doesNotMatch(text, /Google Places/);
  assert.match(text, /Want it delivered\?/);
  assert.match(text, /DoorDash or Uber Eats/);
  assert.equal(FAQ.length, 5);
});

test('saved filters ignore unknown cuisine ids', () => {
  assert.deepEqual(sanitizeFilters({
    radius: 28,
    selectedCuisines: ['pizza', 'delivery', 'thai'],
    openNow: true,
  }), {
    radius: 20,
    selectedCuisines: ['pizza', 'thai'],
    openNow: true,
  });
});
