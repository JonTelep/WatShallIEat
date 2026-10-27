import { handleConfirm } from '../../lib/confirm.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed.');
  }
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const result = await handleConfirm({
    url: `${proto}://${host}${req.url}`,
    env: process.env,
  });
  res.setHeader('cache-control', 'no-store');
  if (result.redirect) {
    res.redirect(result.status, result.redirect);
    return;
  }
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.status(result.status).send(result.html);
}
