import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';
import Seo from '../../components/Seo';
import { CITIES } from '../../lib/cities.mjs';
import { siteGraph } from '../../lib/faq.mjs';

export default function NearMeIndex({ totals }) {
  const description = 'Restaurants, cafes, and fast food places near downtown in Ohio cities, from OpenStreetMap: Cleveland, Columbus, Cincinnati, Toledo, Akron, Dayton, Youngstown, and Canton.';
  return (
    <SiteChrome>
      <Seo title="What to eat near me in Ohio | Wat Shall I Eat" description={description} path="/near-me" jsonLd={siteGraph()} />
      <h1 className="text-4xl font-bold mb-4">What to eat near me in Ohio</h1>
      <p className="mb-6 max-w-3xl">Pick a city to see places to eat within 2 miles of downtown, from OpenStreetMap. For a pick near where you are right now, use the <Link href="/" className="underline">restaurant picker</Link>.</p>
      <ul className="list-disc pl-6 space-y-1">
        {CITIES.map((c) => (
          <li key={c.slug}><Link href={`/near-me/${c.slug}`} className="underline">What to eat near me in {c.name}</Link> ({totals[c.slug]} places)</li>
        ))}
      </ul>
    </SiteChrome>
  );
}

export async function getStaticProps() {
  const { cityPlaces } = await import('../../lib/cityPlaces.mjs');
  const totals = {};
  for (const c of CITIES) totals[c.slug] = (await cityPlaces(c, 0)).total;
  return { props: { totals } };
}
