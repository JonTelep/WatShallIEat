// Evaluate an OSM opening_hours tag in the place's local time.
// Missing, unreadable, or explicitly uncertain hours stay "unknown".
// This never invents a schedule.

import opening_hours from 'opening_hours';
import tzlookup from 'tz-lookup';

export function timeZoneFor(lat, lng) {
  try {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return tzlookup(lat, lng);
  } catch {
    return null;
  }
}

function countryCode(value) {
  const code = String(value || '').trim().toLowerCase();
  return /^[a-z]{2}$/.test(code) ? code : '';
}

// Build a Date whose getHours/getDay match the wall clock in timeZone.
// Cloudflare Workers report UTC from Date getters, so the raw instant would
// mark a 9:00 local opening as 9:00 UTC.
export function wallClockDate(instant, timeZone) {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(instant);
    const parts = {};
    for (const part of formatted) {
      if (part.type !== 'literal') parts[part.type] = part.value;
    }
    const year = Number(parts.year);
    const month = Number(parts.month);
    const day = Number(parts.day);
    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    const second = Number(parts.second);
    if (![year, month, day, hour, minute, second].every(Number.isFinite)) return null;
    return new Date(year, month - 1, day, hour, minute, second);
  } catch {
    return null;
  }
}

function readState(value, when, nominatim) {
  const parsed = new opening_hours(value, nominatim);
  if (parsed.getUnknown(when)) return 'unknown';
  return parsed.getState(when) ? 'open' : 'closed';
}

export function hoursStatus(openingHours, {
  lat,
  lng,
  at = new Date(),
  timeZone,
  countryCode: country,
} = {}) {
  const value = String(openingHours || '').trim();
  if (!value) return 'unknown';
  const zone = timeZone || timeZoneFor(lat, lng);
  if (!zone) return 'unknown';
  const when = wallClockDate(at, zone);
  if (!when) return 'unknown';

  const attempts = [null];
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const code = countryCode(country);
    const nominatim = { lat, lon: lng };
    if (code) nominatim.address = { country_code: code, state: '' };
    attempts.unshift(nominatim);
  }

  for (const nominatim of attempts) {
    try {
      return readState(value, when, nominatim);
    } catch {
      // Try the next location context. A value that never parses stays unknown.
    }
  }
  return 'unknown';
}
