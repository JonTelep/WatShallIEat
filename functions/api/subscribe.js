import { handleSubscribe } from '../../lib/subscribe.mjs';

function wantsHtml(request) {
  const accept = request.headers.get('accept') || '';
  const mode = request.headers.get('sec-fetch-mode') || '';
  const type = request.headers.get('content-type') || '';
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

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json().catch(() => ({}));
  const form = await request.formData().catch(() => null);
  return form ? Object.fromEntries(form) : {};
}

export async function onRequestPost({ request, env }) {
  const result = await handleSubscribe({ body: await readBody(request), env });
  if (wantsHtml(request)) {
    return new Response(null, { status: 303, headers: { Location: redirectFor(result) } });
  }
  return Response.json(result.json, { status: result.status });
}

export function onRequest() {
  return Response.json({ ok: false, error: 'Method not allowed.' }, { status: 405, headers: { Allow: 'POST' } });
}
