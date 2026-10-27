// GET or POST /api/unsubscribe?t=<signed token>
// POST supports List-Unsubscribe one click (RFC 8058). No email is sent.
import { listUnsubHeaders, pageHtml, resend, verifyToken } from './newsletter.mjs';
import { otherSitesHtml } from './sites.mjs';

export async function handleUnsubscribe({ method, url, env, fetchFn = fetch }) {
  const current = new URL(url);
  const token = current.searchParams.get('t');
  const email = env.NEWSLETTER_SECRET && await verifyToken(env.NEWSLETTER_SECRET, 'unsub', token);
  const headers = {
    'cache-control': 'no-store',
    ...listUnsubHeaders(current.href),
  };
  if (!email) {
    return {
      status: 400,
      headers: { ...headers, 'content-type': method === 'POST' ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8' },
      body: method === 'POST'
        ? 'Error'
        : pageHtml('Unsubscribe', '<h1>That link did not work</h1><p>We did not change your subscription.</p>', otherSitesHtml()),
    };
  }
  if (!env.RESEND_API_KEY) {
    return { status: 503, headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' }, body: 'Error' };
  }
  const r = await resend(env.RESEND_API_KEY, fetchFn)('PATCH', `/contacts/${encodeURIComponent(email)}`, {
    unsubscribed: true,
    properties: { watshallieat_status: 'unsubscribed' },
  });
  const ok = r.ok || r.status === 404;
  if (!ok) {
    return { status: 502, headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' }, body: 'Error' };
  }
  if (method === 'POST') {
    return { status: 200, headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' }, body: 'Unsubscribed' };
  }
  const dest = new URL('/newsletter/unsubscribed', current.origin);
  return { status: 303, headers: { ...headers, Location: dest.href }, body: '' };
}
