// POST /api/subscribe : single opt-in. A valid submitted email is consent: the contact is
// added as active (unsubscribed:false, watshallieat_status=active) in the meal ideas segment.
// Invalid addresses (syntax, disposable domain, no MX) are dropped quietly: the user sees success,
// and no contact is made. Unsubscribed contacts are never re-subscribed.
// This route never sends email.
import { ACTIVE, isActive, isUnsubscribed, resend } from './newsletter.mjs';
import { validateEmail } from './validate.mjs';
import { PLACEMENTS, bump } from './funnel.mjs';

export async function handleSubscribe({ body, env, fetchFn = fetch }) {
  const data = body || {};
  if (data.website) return { status: 200, json: { ok: true } };
  const raw = String(data.email || '').trim().toLowerCase();
  if (!raw || !raw.includes('@')) {
    return { status: 400, json: { ok: false, error: 'Please enter a valid email address.' } };
  }
  const placement = PLACEMENTS.includes(String(data.placement)) ? String(data.placement) : 'other';
  const ref = String(data.ref || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'direct';
  const v = await validateEmail(raw, fetchFn);
  if (!v.ok) {
    await bump(env, 'signup_rejected', placement);
    return { status: 200, json: { ok: true } };
  }
  const email = v.email;
  if (data.dryRun) return { status: 200, json: { ok: true, dryRun: true } };
  const seg = env.RESEND_SEGMENT_ID;
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_SECRET || !seg) {
    return { status: 503, json: { ok: false, error: 'Signup is not configured yet.' } };
  }

  const api = resend(env.RESEND_API_KEY, fetchFn);
  const path = `/contacts/${encodeURIComponent(email)}`;
  const got = await api('GET', path);
  if (got.ok && isActive(got.data)) return { status: 200, json: { ok: true, already: true } };
  if (got.ok && isUnsubscribed(got.data)) return { status: 200, json: { ok: true } };
  const props = { watshallieat_status: ACTIVE, ...(got.ok ? {} : { signup_source: placement, watshallieat_ref: ref }) };
  const active = { unsubscribed: false, properties: props };
  const w = got.ok
    ? await api('PATCH', path, active)
    : await api('POST', '/contacts', { email, ...active, segments: [{ id: seg }] });
  if (!w.ok) {
    return { status: 502, json: { ok: false, error: 'Could not subscribe right now. Please try again later.' } };
  }
  if (got.ok) await api('POST', `${path}/segments/${seg}`);
  await bump(env, 'signup_active', placement);
  return { status: 200, json: { ok: true } };
}
