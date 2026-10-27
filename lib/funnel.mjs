// Cookie-free funnel counters. Daily counters keyed "YYYY-MM-DD:event:placement" in the KV namespace
// bound to this Pages project as FUNNEL. Count is stored as the value and in metadata (so one list call reads all).
// No FUNNEL binding: events are accepted and dropped (no-op), the site keeps working.
export const PLACEMENTS = ['home','home-bottom','story-inline','slide-in','sticky','newsletter-page','newsletter-sample','starter-pack','article-footer','launch-inline','other'];
export const EVENTS = ['form_view','form_focus','form_submit','form_success','signup_pending','signup_active','signup_rejected'];
export async function bump(env, event, placement) {
  if (!env.FUNNEL || !EVENTS.includes(event) || !PLACEMENTS.includes(placement)) return false;
  const key = `${new Date().toISOString().slice(0, 10)}:${event}:${placement}`;
  try {
    const n = (Number(await env.FUNNEL.get(key)) || 0) + 1; // not atomic; fine at this traffic
    await env.FUNNEL.put(key, String(n), { metadata: { n }, expirationTtl: 400 * 86400 });
    return true;
  } catch { return false; }
}
