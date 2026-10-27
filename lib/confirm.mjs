// GET /api/confirm?t=<signed token> : legacy confirm links. Single opt-in is the live path.
// An old pending contact that opens its link becomes active. Never re-subscribes an unsubscribed contact.
// No email is sent.
import { ACTIVE, CONFIRM_TTL_MS, isUnsubscribed, pageHtml, resend, verifyToken } from './newsletter.mjs';
import { otherSitesHtml } from './sites.mjs';

function html(title, body) {
  return pageHtml(title, body, otherSitesHtml());
}

export async function handleConfirm({ url, env, fetchFn = fetch }) {
  const token = new URL(url).searchParams.get('t');
  const email = env.NEWSLETTER_SECRET && await verifyToken(env.NEWSLETTER_SECRET, 'confirm', token, CONFIRM_TTL_MS);
  if (!email) {
    return { status: 400, html: html('Link expired', '<h1>That link did not work</h1><p><a href="/newsletter">Sign up here</a>. It takes one step.</p>') };
  }
  if (!env.RESEND_API_KEY) {
    return { status: 503, html: html('Try again', '<h1>Signup is not configured yet</h1>') };
  }
  const api = resend(env.RESEND_API_KEY, fetchFn);
  const path = `/contacts/${encodeURIComponent(email)}`;
  const got = await api('GET', path);
  if (got.ok && isUnsubscribed(got.data)) {
    return { status: 200, html: html('Unsubscribed', '<h1>You are unsubscribed</h1><p>This address stays off the weekly meal ideas list.</p>') };
  }
  const r = await api('PATCH', path, { unsubscribed: false, properties: { watshallieat_status: ACTIVE } });
  if (!r.ok) {
    return { status: 502, html: html('Try again', '<h1>Something went wrong</h1><p>Please try the link again in a minute.</p>') };
  }
  return { status: 303, redirect: '/newsletter?joined=1' };
}
