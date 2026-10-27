import { handleSubscribe } from '../../lib/subscribe.mjs';

function wantsHtml(req) {
  const accept = String(req.headers.accept || '');
  const mode = String(req.headers['sec-fetch-mode'] || '');
  const type = String(req.headers['content-type'] || '');
  if (accept.includes('application/json')) return false;
  if (mode === 'navigate') return true;
  return type.includes('application/x-www-form-urlencoded') && accept.includes('text/html');
}

function redirectFor(result) {
  if (result.status === 200 && result.json && result.json.ok) return '/newsletter?joined=1';
  if (result.status === 400) return '/newsletter?error=invalid';
  if (result.status === 503) return '/newsletter?error=unavailable';
  return '/newsletter?error=failed';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }
  const result = await handleSubscribe({ body: req.body, env: process.env });
  if (wantsHtml(req)) {
    res.redirect(303, redirectFor(result));
    return;
  }
  return res.status(result.status).json(result.json);
}
