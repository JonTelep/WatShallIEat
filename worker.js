// Cloudflare Worker entry (static assets + the same handlers as functions/ for Pages).
// The account is at its Pages project limit, so production runs as a Worker with static assets.
import * as search from './functions/api/search.js';
import * as subscribe from './functions/api/subscribe.js';
import * as unsubscribe from './functions/api/unsubscribe.js';
import * as confirm from './functions/api/confirm.js';

const routes = { '/api/search': search, '/api/subscribe': subscribe, '/api/unsubscribe': unsubscribe, '/api/confirm': confirm };

function pick(mod, method) {
  const m = 'onRequest' + method.charAt(0) + method.slice(1).toLowerCase();
  return mod[m] || mod.onRequest;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'www.watshallieat.com') {
      url.hostname = 'watshallieat.com';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/api/og') return env.ASSETS.fetch(new Request(new URL('/og.png', url), request));
    const mod = routes[url.pathname.replace(/\/$/, '')];
    if (mod) return pick(mod, request.method)({ request, env, ctx });
    return env.ASSETS.fetch(request);
  },
};
