import { handleUnsubscribe } from '../../lib/unsubscribe.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Error');
  }
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const result = await handleUnsubscribe({
    method: req.method,
    url: `${proto}://${host}${req.url}`,
    env: process.env,
  });
  Object.entries(result.headers || {}).forEach(([key, value]) => res.setHeader(key, value));
  res.status(result.status);
  if (result.headers && result.headers.Location) {
    res.end();
    return;
  }
  res.send(result.body || '');
}
