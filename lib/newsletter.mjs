// Newsletter helpers for the weekly meal ideas list.
// Adapted from Telep-IO/good-news lib/newsletter.js.
// Signing secret NEWSLETTER_SECRET is an environment variable (never in files).
// This app stores contacts only. It does not send email.
export const SITE = 'https://watshallieat.com';
export const REPLY_TO = 'jon@telep.io';
export const ADDRESS = 'PO Box 187, Valley City, OH 44280';
export const STATUS_KEY = 'watshallieat_status';
export const CONFIRM_TTL_MS = 7 * 24 * 3600 * 1000;

const enc = new TextEncoder();
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uStr = (s) => b64u(enc.encode(s));
const unb64uStr = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
// Token: base64url(email).issuedMs.sig ; sig = HMAC(secret, action|email|issuedMs)
export async function signToken(secret, action, email, issued = Date.now()) {
  const e = b64uStr(email.toLowerCase());
  return `${e}.${issued}.${await hmac(secret, `${action}|${email.toLowerCase()}|${issued}`)}`;
}
export async function verifyToken(secret, action, token, ttlMs = 0) {
  try {
    const [e, issued, sig] = String(token || '').split('.');
    const email = unb64uStr(e);
    const expect = await hmac(secret, `${action}|${email}|${issued}`);
    if (!sig || sig.length !== expect.length) return null;
    let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expect.charCodeAt(i);
    if (diff) return null;
    if (ttlMs && Date.now() - Number(issued) > ttlMs) return null;
    return email;
  } catch { return null; }
}
export const confirmUrl = async (secret, email) => `${SITE}/api/confirm?t=${await signToken(secret, 'confirm', email)}`;
export const unsubUrl = async (secret, email) => `${SITE}/api/unsubscribe?t=${await signToken(secret, 'unsub', email, 0)}`;

export function resend(key, fetchFn = fetch) {
  return async (method, path, body) => {
    const r = await fetchFn('https://api.resend.com' + path, {
      method, headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json', 'User-Agent': 'watshallieat' },
      body: body ? JSON.stringify(body) : undefined,
    });
    let d = null; try { d = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, data: d };
  };
}
// Single opt-in. Status lives in contact property watshallieat_status: active | unsubscribed.
// Only unsubscribed === false AND watshallieat_status === 'active' counts as a subscriber.
export const ACTIVE = 'active';
export const statusOf = (c) => (c && c.properties && c.properties[STATUS_KEY] && c.properties[STATUS_KEY].value) || 'none';
export const isActive = (c) => !!c && c.unsubscribed === false && statusOf(c) === ACTIVE;
export const isUnsubscribed = (c) => !!c && (c.unsubscribed === true || statusOf(c) === 'unsubscribed');

export function emailFooterHtml(unsub) {
  return `<hr style="border:0;border-top:1px solid #ddd;margin:28px 0 12px"><p style="font:12px/1.5 Menlo,Consolas,monospace;color:#666;margin:0">Wat Shall I Eat weekly meal ideas from Telep IO LLC. ${ADDRESS}.<br>You get this because you signed up at watshallieat.com. <a href="${unsub}" style="color:#666">Unsubscribe</a></p>`;
}
export const emailFooterText = (unsub) => `\n\n--\nWat Shall I Eat weekly meal ideas from Telep IO LLC. ${ADDRESS}.\nUnsubscribe: ${unsub}\n`;
export const listUnsubHeaders = (unsub) => ({
  'List-Unsubscribe': `<${unsub}>, <mailto:${REPLY_TO}?subject=unsubscribe>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});

export function pageHtml(title, body, footer = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Wat Shall I Eat</title>
<style>body{margin:0;font:17px/1.6 Georgia,serif;color:#111;background:#f3f4f6}.w{max-width:640px;margin:0 auto;padding:48px 22px}a{color:#111}.m{font:12px/1.5 Menlo,Consolas,monospace;color:#444}</style></head>
<body><div class="w"><a href="/">Wat Shall I Eat</a>${body}<p class="m">Telep IO LLC. ${ADDRESS}.</p></div>${footer}</body></html>`;
}
