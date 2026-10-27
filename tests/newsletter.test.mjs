import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { validateEmail, checkSyntax, isDisposable } from '../lib/validate.mjs';
import { handleSubscribe } from '../lib/subscribe.mjs';
import { handleUnsubscribe } from '../lib/unsubscribe.mjs';
import { signToken, verifyToken, ADDRESS } from '../lib/newsletter.mjs';
import { OTHER_SITES } from '../lib/sites.mjs';
import { robotsTxt, sitemapXml } from '../lib/paths.mjs';
import { meals } from '../lib/meals.mjs';

const execFileAsync = promisify(execFile);
const SECRET = 'test-newsletter-secret';
const ENV = {
  RESEND_API_KEY: 're_test',
  RESEND_SEGMENT_ID: 'seg_meals',
  NEWSLETTER_SECRET: SECRET,
};

function resendFetch(store, calls) {
  return async (url, opts = {}) => {
    const target = new URL(url);
    if (target.hostname !== 'api.resend.com') return fetch(url, opts);
    const method = opts.method || 'GET';
    const body = opts.body ? JSON.parse(opts.body) : null;
    calls.push({ method, path: target.pathname, body });
    if (target.pathname.includes('/emails')) {
      throw new Error('this app must not send email');
    }
    const parts = target.pathname.split('/').filter(Boolean);
    const email = parts[1] ? decodeURIComponent(parts[1]) : '';
    if (method === 'POST' && parts.length === 1 && parts[0] === 'contacts') {
      store.set(body.email, {
        email: body.email,
        unsubscribed: body.unsubscribed,
        properties: Object.fromEntries(Object.entries(body.properties || {}).map(([key, value]) => [key, { value }])),
        segments: body.segments || [],
      });
      return new Response(JSON.stringify({ id: 'contact_1' }), { status: 200 });
    }
    if (method === 'GET' && parts[0] === 'contacts') {
      if (!store.has(email)) return new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
      return new Response(JSON.stringify(store.get(email)), { status: 200 });
    }
    if (method === 'PATCH' && parts[0] === 'contacts') {
      if (!store.has(email)) return new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
      const current = store.get(email);
      const next = {
        ...current,
        unsubscribed: body.unsubscribed,
        properties: { ...current.properties },
      };
      for (const [key, value] of Object.entries(body.properties || {})) next.properties[key] = { value };
      store.set(email, next);
      return new Response(JSON.stringify(next), { status: 200 });
    }
    if (method === 'POST' && parts[2] === 'segments') {
      return new Response(JSON.stringify({ id: parts[3] }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: 'unexpected' }), { status: 500 });
  };
}

test('syntax and disposable checks reject bad addresses', () => {
  assert.equal(checkSyntax('not-an-email'), null);
  assert.equal(checkSyntax('a@b.co').email, 'a@b.co');
  assert.equal(isDisposable('mailinator.com'), true);
  assert.equal(isDisposable('sub.mailinator.com'), true);
  assert.equal(isDisposable('gmail.com'), false);
});

test('MX check accepts a real mail host and rejects a missing domain', async () => {
  const good = await validateEmail('person@gmail.com');
  assert.equal(good.ok, true);
  assert.equal(good.reason, 'mx');
  const missing = await validateEmail('person@no-such-domain-watshallieat.invalid');
  assert.equal(missing.ok, false);
  assert.equal(missing.reason, 'no-mx');
  const disposable = await validateEmail('person@mailinator.com');
  assert.equal(disposable.ok, false);
  assert.equal(disposable.reason, 'disposable');
});

test('signup quietly drops invalid mail and never calls Resend or sends email', async () => {
  const calls = [];
  const fetchFn = resendFetch(new Map(), calls);
  const dropped = await handleSubscribe({
    body: { email: 'person@mailinator.com', placement: 'home' },
    env: ENV,
    fetchFn,
  });
  assert.deepEqual(dropped, { status: 200, json: { ok: true } });
  assert.equal(calls.length, 0);

  const honeypot = await handleSubscribe({
    body: { email: 'person@gmail.com', website: 'https://spam.example' },
    env: ENV,
    fetchFn,
  });
  assert.equal(honeypot.json.ok, true);
  assert.equal(calls.length, 0);

  const missingSecrets = await handleSubscribe({
    body: { email: 'person@gmail.com', dryRun: false },
    env: {},
    fetchFn,
  });
  assert.equal(missingSecrets.status, 503);
  assert.equal(calls.length, 0);
});

test('signup stores a single opt-in contact and will not revive an unsubscribed one', async () => {
  const store = new Map();
  const calls = [];
  const fetchFn = resendFetch(store, calls);
  const created = await handleSubscribe({
    body: { email: 'Person@gmail.com', placement: 'newsletter-page', ref: 'menu' },
    env: ENV,
    fetchFn,
  });
  assert.equal(created.status, 200);
  assert.equal(created.json.ok, true);
  const saved = store.get('person@gmail.com');
  assert.equal(saved.unsubscribed, false);
  assert.equal(saved.properties.watshallieat_status.value, 'active');
  assert.deepEqual(saved.segments, [{ id: 'seg_meals' }]);
  assert.equal(calls.some((call) => call.path.includes('/emails')), false);

  store.set('gone@gmail.com', {
    email: 'gone@gmail.com',
    unsubscribed: true,
    properties: { watshallieat_status: { value: 'unsubscribed' } },
  });
  const again = await handleSubscribe({
    body: { email: 'gone@gmail.com', placement: 'home' },
    env: ENV,
    fetchFn,
  });
  assert.equal(again.json.ok, true);
  assert.equal(again.json.already, undefined);
  assert.equal(store.get('gone@gmail.com').unsubscribed, true);
  assert.equal(calls.filter((call) => call.method === 'PATCH' && call.path.includes('gone')).length, 0);
});

test('signed one click unsubscribe POST returns 200 and marks the contact unsubscribed', async () => {
  const email = 'diner@gmail.com';
  const store = new Map([[email, {
    email,
    unsubscribed: false,
    properties: { watshallieat_status: { value: 'active' } },
  }]]);
  const calls = [];
  const fetchFn = resendFetch(store, calls);
  const token = await signToken(SECRET, 'unsub', email, 0);
  assert.equal(await verifyToken(SECRET, 'unsub', token), email);
  assert.equal(await verifyToken(SECRET, 'unsub', `${token}x`), null);

  const server = createServer(async (req, res) => {
    const port = server.address().port;
    const result = await handleUnsubscribe({
      method: req.method,
      url: `http://127.0.0.1:${port}${req.url}`,
      env: ENV,
      fetchFn,
    });
    res.writeHead(result.status, result.headers || {});
    res.end(result.body || '');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const target = `http://127.0.0.1:${port}/api/unsubscribe?t=${encodeURIComponent(token)}`;
  try {
    const { stdout } = await execFileAsync('curl', [
      '-sS', '-X', 'POST',
      '-H', 'Content-Type: application/x-www-form-urlencoded',
      '-D', '-',
      '--data', 'List-Unsubscribe=One-Click',
      '-w', '\nCODE:%{http_code}',
      target,
    ]);
    assert.match(stdout, /CODE:200/);
    assert.match(stdout, /Unsubscribed/);
    assert.match(stdout, /list-unsubscribe-post:\s*List-Unsubscribe=One-Click/i);
    assert.equal(store.get(email).unsubscribed, true);
    assert.equal(store.get(email).properties.watshallieat_status.value, 'unsubscribed');

    const bad = await execFileAsync('curl', [
      '-sS', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST',
      `http://127.0.0.1:${port}/api/unsubscribe?t=not-a-token`,
    ]);
    assert.equal(bad.stdout, '400');

    const page = await execFileAsync('curl', ['-sS', '-D', '-', '-o', '/dev/null', target]);
    assert.match(page.stdout, /303/);
    assert.match(page.stdout, /\/newsletter\/unsubscribed/);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('sitemap, robots, footer anchors, address, and copy dashes', () => {
  const xml = sitemapXml();
  assert.match(xml, /https:\/\/watshallieat.com\/</);
  assert.match(xml, /https:\/\/watshallieat.com\/ideas</);
  assert.match(xml, /https:\/\/watshallieat.com\/newsletter</);
  for (const meal of meals) {
    assert.match(xml, new RegExp(`https://watshallieat.com/ideas/${meal.slug}<`));
  }
  assert.doesNotMatch(xml, /unsubscribe/);
  const robots = robotsTxt();
  assert.match(robots, /Sitemap: https:\/\/watshallieat.com\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/api\//);
  assert.equal(ADDRESS, 'PO Box 187, Valley City, OH 44280');

  const anchors = OTHER_SITES.map(([, , text]) => text);
  assert.deepEqual(anchors, [
    'telep.io websites for small businesses',
    'Bloomer News, positive AI news',
    'StarterLoot, free AI tools for game devs',
    'Publaish, AI search visibility tracker',
    'OpenMedina, open government for Medina County',
    "Let's Talk Statistics, official figures with sources",
    'minesSwept, shared giant minesweeper',
    'telep.io memes',
    'white.telep.io, filming light and camera test',
    'AskMentions, see if AI answers mention you',
  ]);

  const subscribeSource = readFileSync(new URL('../lib/subscribe.mjs', import.meta.url), 'utf8');
  assert.equal(subscribeSource.includes('/emails'), false);

  const root = new URL('..', import.meta.url).pathname;
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '.git' || name === '.next' || name === 'package-lock.json') continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(js|mjs|css|md|svg|txt|json)$/.test(name)) files.push(path);
    }
  };
  walk(root);
  const dashes = [];
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    if (/[\u2013\u2014]/.test(text)) dashes.push(path);
  }
  assert.deepEqual(dashes, []);
});
