import { OTHER_SITES } from '../lib/sites.mjs';

export default function OtherSites({ self = 'watshallieat.com' }) {
  const links = OTHER_SITES.filter(([domain]) => domain !== self);
  return (
    <footer className="other-sites" style={{ fontSize: 12, opacity: 0.85, textAlign: 'center', padding: '16px 8px', lineHeight: 1.8 }}>
      Our other sites: {links.map(([domain, url, text], index) => (
        <span key={domain}>
          {index > 0 ? ' · ' : null}
          <a href={url} style={{ color: 'inherit' }}>{text}</a>
        </span>
      ))}
    </footer>
  );
}
