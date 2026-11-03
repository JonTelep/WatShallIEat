// Ohio city landing pages. Centers are each city's downtown. Place lists come from the OpenStreetMap tiles at build time.
export const CITIES = [
  { slug: 'cleveland', name: 'Cleveland', lat: 41.4993, lng: -81.6944 },
  { slug: 'columbus', name: 'Columbus', lat: 39.9612, lng: -82.9988 },
  { slug: 'cincinnati', name: 'Cincinnati', lat: 39.1031, lng: -84.512 },
  { slug: 'toledo', name: 'Toledo', lat: 41.6528, lng: -83.5379 },
  { slug: 'akron', name: 'Akron', lat: 41.0814, lng: -81.519 },
  { slug: 'dayton', name: 'Dayton', lat: 39.7589, lng: -84.1916 },
  { slug: 'youngstown', name: 'Youngstown', lat: 41.0998, lng: -80.6495 },
  { slug: 'canton', name: 'Canton', lat: 40.7989, lng: -81.3784 },
];

export const getCity = (slug) => CITIES.find((city) => city.slug === slug) || null;
