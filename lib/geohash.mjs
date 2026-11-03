// Geohash helpers for tiling restaurant extracts. No dependency.

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function geohashEncode(lat, lon, precision = 4) {
  let hash = '';
  let bit = 0;
  let value = 0;
  let even = true;
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  const latitude = Math.min(90, Math.max(-90, Number(lat)));
  const longitude = Math.min(180, Math.max(-180, Number(lon)));
  while (hash.length < precision) {
    if (even) {
      const mid = (lonMin + lonMax) / 2;
      if (longitude >= mid) {
        value = value * 2 + 1;
        lonMin = mid;
      } else {
        value *= 2;
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        value = value * 2 + 1;
        latMin = mid;
      } else {
        value *= 2;
        latMax = mid;
      }
    }
    even = !even;
    bit += 1;
    if (bit === 5) {
      hash += BASE32[value];
      bit = 0;
      value = 0;
    }
  }
  return hash;
}

export function geohashBounds(hash) {
  let even = true;
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  for (const char of String(hash)) {
    const value = BASE32.indexOf(char);
    if (value < 0) break;
    for (let mask = 16; mask > 0; mask >>= 1) {
      if (even) {
        const mid = (lonMin + lonMax) / 2;
        if (value & mask) lonMin = mid;
        else lonMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (value & mask) latMin = mid;
        else latMax = mid;
      }
      even = !even;
    }
  }
  return { latMin, latMax, lonMin, lonMax };
}

// Every geohash cell that intersects the circle's bounding box.
export function geohashesCovering(lat, lon, radiusMeters, precision = 4) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  const radius = Math.max(0, Number(radiusMeters) || 0);
  const center = geohashEncode(latitude, longitude, precision);
  const cell = geohashBounds(center);
  const latStep = Math.max((cell.latMax - cell.latMin) * 0.5, 1e-6);
  const lonStep = Math.max((cell.lonMax - cell.lonMin) * 0.5, 1e-6);
  const latPad = radius / 110540;
  const lonDenom = Math.max(0.01, Math.cos(latitude * Math.PI / 180));
  const lonPad = radius / (111320 * lonDenom);
  const latMin = Math.max(-90, latitude - latPad);
  const latMax = Math.min(90, latitude + latPad);
  const lonMin = Math.max(-180, longitude - lonPad);
  const lonMax = Math.min(180, longitude + lonPad);
  const hashes = new Set([center]);
  for (let la = latMin; la <= latMax + latStep * 0.01; la += latStep) {
    for (let lo = lonMin; lo <= lonMax + lonStep * 0.01; lo += lonStep) {
      hashes.add(geohashEncode(la, lo, precision));
    }
  }
  hashes.add(geohashEncode(latMin, lonMin, precision));
  hashes.add(geohashEncode(latMin, lonMax, precision));
  hashes.add(geohashEncode(latMax, lonMin, precision));
  hashes.add(geohashEncode(latMax, lonMax, precision));
  return [...hashes];
}
