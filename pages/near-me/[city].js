import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';
import Seo from '../../components/Seo';
import { CITIES, getCity } from '../../lib/cities.mjs';
import { siteGraph } from '../../lib/faq.mjs';

export default function CityPage({ city, data, generated }) {
  const title = `What to eat near me in ${city.name}, Ohio | Wat Shall I Eat`;
  const description = `${data.total} restaurants, cafes, and fast food places within ${data.radiusMiles} miles of downtown ${city.name}, Ohio, from OpenStreetMap. Pick one at random or browse the list.`;
  const url = `https://watshallieat.com/near-me/${city.slug}`;
  const jsonLd = [
    ...siteGraph(),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://watshallieat.com/' },
        { '@type': 'ListItem', position: 2, name: 'Ohio cities', item: 'https://watshallieat.com/near-me' },
        { '@type': 'ListItem', position: 3, name: city.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Places to eat near downtown ${city.name}, Ohio`,
      numberOfItems: data.places.length,
      itemListElement: data.places.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Restaurant',
          name: p.name,
          ...(p.address ? { address: p.address } : {}),
          ...(p.cuisine ? { servesCuisine: p.cuisine } : {}),
          ...(p.website ? { url: p.website } : {}),
        },
      })),
    },
  ];
  return (
    <SiteChrome>
      <Seo title={title} description={description} path={`/near-me/${city.slug}`} jsonLd={jsonLd} />
      <nav className="mb-3 text-sm" aria-label="Breadcrumb"><Link href="/" className="underline">Home</Link> / <Link href="/near-me" className="underline">Ohio cities</Link> / {city.name}</nav>
      <h1 className="text-4xl font-bold mb-4">What to eat near me in {city.name}, Ohio</h1>
      <p className="mb-3 max-w-3xl">
        OpenStreetMap lists {data.total} restaurants, cafes, and fast food places within {data.radiusMiles} miles of downtown {city.name}. The {data.places.length} closest to downtown are below. Not sure? <Link href="/" className="underline">Let Wat Shall I Eat pick one near you</Link>.
      </p>
      {data.cuisines.length ? (
        <>
          <h2 className="text-2xl font-semibold mb-2">Most common cuisines tagged</h2>
          <ul className="list-disc pl-6 mb-6">
            {data.cuisines.map((c) => <li key={c.name}>{c.name}: {c.count}</li>)}
          </ul>
        </>
      ) : null}
      <h2 className="text-2xl font-semibold mb-2">Places to eat near downtown {city.name}</h2>
      <ol className="list-decimal pl-6 mb-6 space-y-1">
        {data.places.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>
            {p.cuisine ? `, ${p.cuisine}` : ''}
            {p.address ? `, ${p.address}` : ''}
            {`, ${p.miles} mi from downtown`}
            {' '}<a className="underline text-sm" href={`https://www.openstreetmap.org/${p.id}`} rel="nofollow">map</a>
          </li>
        ))}
      </ol>
      <p className="mb-6 text-sm max-w-3xl">
        Data from OpenStreetMap (Ohio extract, {generated}). Hours and listings can change, so check with the place before you go. <a className="underline" href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, ODbL.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Other Ohio cities</h2>
      <ul className="flex flex-wrap gap-3 mb-6">
        {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
          <li key={c.slug}><Link href={`/near-me/${c.slug}`} className="underline">{c.name}</Link></li>
        ))}
      </ul>
    </SiteChrome>
  );
}

export function getStaticPaths() {
  return { paths: CITIES.map((c) => ({ params: { city: c.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const city = getCity(params.city);
  if (!city) return { notFound: true };
  const { cityPlaces } = await import('../../lib/cityPlaces.mjs');
  const fs = await import('node:fs');
  const index = JSON.parse(fs.readFileSync('public/places/index.json', 'utf8'));
  return { props: { city, data: await cityPlaces(city), generated: index.generated } };
}
