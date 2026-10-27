import { sitemapXml } from '../lib/paths.mjs';

export default function Sitemap() {
  return null;
}

export function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(sitemapXml());
  res.end();
  return { props: {} };
}
