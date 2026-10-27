// Anchor text matches /workspace/xl/foot.py (plain visible links).
export const OTHER_SITES = [
  ['telep.io', 'https://telep.io/', 'telep.io websites for small businesses'],
  ['bloomer.news', 'https://bloomer.news/', 'Bloomer News, positive AI news'],
  ['starterloot.com', 'https://starterloot.com/', 'StarterLoot, free AI tools for game devs'],
  ['publaish.com', 'https://publaish.com/', 'Publaish, AI search visibility tracker'],
  ['openmedina.org', 'https://openmedina.org/', 'OpenMedina, open government for Medina County'],
  ['letstalkstatistics.com', 'https://letstalkstatistics.com/', "Let's Talk Statistics, official figures with sources"],
  ['minesswept.com', 'https://minesswept.com/', 'minesSwept, shared giant minesweeper'],
  ['memes.telep.io', 'https://memes.telep.io/', 'telep.io memes'],
  ['white.telep.io', 'https://white.telep.io/', 'white.telep.io, filming light and camera test'],
  ['seo.telep.io', 'https://seo.telep.io/', 'AskMentions, see if AI answers mention you'],
];

export function otherSitesHtml(self = 'watshallieat.com', color = 'inherit') {
  const a = OTHER_SITES
    .filter(([domain]) => domain !== self)
    .map(([, url, text]) => `<a href="${url}" style="color:inherit">${text.replaceAll("'", '&#x27;')}</a>`)
    .join(' &middot; ');
  return `<footer class="other-sites" style="font-size:12px;opacity:.65;text-align:center;padding:16px 8px;line-height:1.8;color:${color}">Our other sites: ${a}</footer>`;
}
