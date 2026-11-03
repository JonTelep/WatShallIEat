// Download free Geofabrik state extracts and write compact restaurant tiles.
// Requires osmium-tool (apt install osmium-tool). No paid data service.
//
//   npm run places:build
//   node scripts/build-places.mjs --pbf-dir /tmp/osm-build
//   node scripts/build-places.mjs --state pennsylvania
//
// Output: public/places/index.json and public/places/tiles/<geohash>.json
// Fields: OSM id, name, lat, lon, cuisine, opening_hours, plus address,
// phone, website, and delivery when the extract has them.

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { geohashEncode } from '../lib/geohash.mjs';
import { TILE_PRECISION, compactFoodPlace } from '../lib/placeTiles.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'places');
const UA = 'WatShallIEat/1.0 (+https://watshallieat.com; OSM extract for restaurant search)';

// Default build is Ohio only. Add one other state with --state, and only if it stays small.
const REQUIRED = ['ohio'];
const MAX_STATE_BYTES = 8 * 1024 * 1024;

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code}`));
    });
  });
}

async function download(url, dest) {
  try {
    const info = await stat(dest);
    if (info.size > 1000000) {
      console.log(`have ${path.basename(dest)}`);
      return;
    }
  } catch {
    // Download it.
  }
  console.log(`download ${url}`);
  await run('curl', ['-fL', '--retry', '3', '-A', UA, '-o', dest, url]);
}

function pointFromGeometry(geometry) {
  if (!geometry || !geometry.type) return null;
  if (geometry.type === 'Point') {
    const [lon, lat] = geometry.coordinates;
    return { lat, lon };
  }
  let coords = null;
  if (geometry.type === 'LineString') coords = geometry.coordinates;
  else if (geometry.type === 'Polygon') coords = geometry.coordinates[0];
  else if (geometry.type === 'MultiPolygon') coords = geometry.coordinates[0] && geometry.coordinates[0][0];
  if (!coords || !coords.length) return null;
  let lat = 0;
  let lon = 0;
  let count = 0;
  for (const pair of coords) {
    const lo = Number(pair[0]);
    const la = Number(pair[1]);
    if (!Number.isFinite(lo) || !Number.isFinite(la)) continue;
    lon += lo;
    lat += la;
    count += 1;
  }
  if (!count) return null;
  return { lat: lat / count, lon: lon / count };
}

function rowBytes(row) {
  return Buffer.byteLength(JSON.stringify(row)) + 1;
}

async function ingestState(pbfPath, byId) {
  const work = await mkdtemp(path.join(tmpdir(), 'wsie-osm-'));
  const filtered = path.join(work, 'food.osm.pbf');
  const configPath = path.join(work, 'export.json');
  await writeFile(configPath, JSON.stringify({
    attributes: {
      type: true,
      id: true,
      version: false,
      changeset: false,
      timestamp: false,
      uid: false,
      user: false,
      way_nodes: false,
    },
    linear_tags: true,
    area_tags: true,
    exclude_tags: [],
    include_tags: [
      'name', 'amenity', 'cuisine', 'opening_hours', 'addr:full', 'addr:housenumber',
      'addr:street', 'addr:city', 'addr:state', 'addr:postcode', 'phone', 'contact:phone',
      'website', 'contact:website', 'url', 'delivery',
    ],
  }));
  await run('osmium', [
    'tags-filter', '--overwrite', '-o', filtered, pbfPath,
    'n/amenity=restaurant,fast_food,cafe',
    'w/amenity=restaurant,fast_food,cafe',
  ]);
  let added = 0;
  const child = spawn('osmium', [
    'export', '-c', configPath, '-f', 'geojsonseq',
    '--geometry-types=point,linestring,polygon', filtered,
  ], { stdio: ['ignore', 'pipe', 'inherit'] });
  const exited = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`osmium export exited ${code}`));
    });
  });
  const lines = readline.createInterface({ input: child.stdout });
  for await (const line of lines) {
    const text = String(line).replace(/^\u001e/, '').trim();
    if (!text) continue;
    let feature;
    try {
      feature = JSON.parse(text);
    } catch {
      continue;
    }
    const props = feature.properties || {};
    const point = pointFromGeometry(feature.geometry);
    if (!point) continue;
    const row = compactFoodPlace({
      type: props['@type'],
      id: props['@id'],
      tags: props,
      lat: point.lat,
      lon: point.lon,
    });
    if (!row) continue;
    const previous = byId.get(row.i);
    if (previous && Object.keys(previous).length >= Object.keys(row).length) continue;
    byId.set(row.i, row);
    added += 1;
  }
  await exited;
  await rm(work, { recursive: true, force: true });
  return { added };
}

async function main() {
  const pbfDir = argValue('--pbf-dir') || path.join(ROOT, 'data', 'pbf');
  await mkdir(pbfDir, { recursive: true });
  const byId = new Map();
  const usedStates = [];
  let totalBytes = 0;

  async function take(state, required) {
    const dest = path.join(pbfDir, `${state}-latest.osm.pbf`);
    const url = `https://download.geofabrik.de/north-america/us/${state}-latest.osm.pbf`;
    await download(url, dest);
    const before = totalBytes;
    const snapshot = new Map(byId);
    const { added } = await ingestState(dest, byId);
    totalBytes = [...byId.values()].reduce((sum, row) => sum + rowBytes(row), 0);
    const addedBytes = totalBytes - before;
    if (!required && addedBytes > MAX_STATE_BYTES) {
      byId.clear();
      for (const [id, row] of snapshot) byId.set(id, row);
      totalBytes = before;
      console.log(`skip ${state}: ${Math.round(addedBytes / 1024)} KB is over the ${Math.round(MAX_STATE_BYTES / 1024)} KB limit for one state`);
      return false;
    }
    usedStates.push(state);
    console.log(`${state}: ${byId.size} places, about ${Math.round(totalBytes / 1024)} KB, ${added} rows seen`);
    return true;
  }

  for (const state of REQUIRED) {
    await take(state, true);
  }
  const extra = argValue('--state');
  if (extra && !REQUIRED.includes(extra)) {
    const kept = await take(extra, false);
    if (!kept) process.exitCode = 2;
  }

  const tiles = new Map();
  for (const row of byId.values()) {
    const hash = geohashEncode(row.a, row.o, TILE_PRECISION);
    if (!tiles.has(hash)) tiles.set(hash, []);
    tiles.get(hash).push(row);
  }
  await rm(path.join(OUT_DIR, 'tiles'), { recursive: true, force: true });
  await mkdir(path.join(OUT_DIR, 'tiles'), { recursive: true });
  const names = [...tiles.keys()].sort();
  for (const hash of names) {
    const rows = tiles.get(hash).sort((a, b) => (a.i < b.i ? -1 : 1));
    await writeFile(path.join(OUT_DIR, 'tiles', `${hash}.json`), JSON.stringify(rows));
  }
  const index = {
    precision: TILE_PRECISION,
    generated: new Date().toISOString().slice(0, 10),
    states: usedStates,
    count: byId.size,
    license: 'ODbL',
    attribution: '© OpenStreetMap contributors',
    attributionUrl: 'https://www.openstreetmap.org/copyright',
    source: 'https://download.geofabrik.de/north-america/us.html',
    tiles: names,
  };
  await writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(index));
  const cleveland = [...byId.values()].filter((row) => Math.abs(row.a - 41.4993) < 0.02 && Math.abs(row.o + 81.6944) < 0.02);
  console.log(`wrote ${names.length} tiles, ${byId.size} places, ${usedStates.length} states`);
  console.log(`downtown Cleveland sample ${cleveland.length}: ${cleveland.slice(0, 8).map((row) => row.n).join(', ')}`);
  const files = await readdir(path.join(OUT_DIR, 'tiles'));
  if (!files.length || cleveland.length < 5) {
    throw new Error('tile build did not find downtown Cleveland restaurants');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
