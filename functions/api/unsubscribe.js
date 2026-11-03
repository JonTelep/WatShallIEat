import { handleUnsubscribe } from '../../lib/unsubscribe.mjs';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response('Error', { status: 405, headers: { Allow: 'GET, POST' } });
  }
  const result = await handleUnsubscribe({ method: request.method, url: request.url, env });
  const headers = new Headers(result.headers || {});
  if (headers.has('Location')) return new Response(null, { status: result.status, headers });
  return new Response(result.body || '', { status: result.status, headers });
}
