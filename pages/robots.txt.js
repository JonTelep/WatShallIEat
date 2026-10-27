import { robotsTxt } from '../lib/paths.mjs';

export default function Robots() {
  return null;
}

export function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(robotsTxt());
  res.end();
  return { props: {} };
}
