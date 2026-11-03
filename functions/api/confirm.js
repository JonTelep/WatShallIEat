import { handleConfirm } from '../../lib/confirm.mjs';

export async function onRequestGet({ request, env }) {
  const result = await handleConfirm({ url: request.url, env });
  if (result.redirect) {
    return new Response(null, { status: result.status, headers: { Location: result.redirect, 'cache-control': 'no-store' } });
  }
  return new Response(result.html, {
    status: result.status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function onRequest() {
  return new Response('Method not allowed.', { status: 405, headers: { Allow: 'GET' } });
}
