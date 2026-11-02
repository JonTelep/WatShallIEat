import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Filters from '../components/Filters';
import FoodOption from '../components/FoodOption';
import Map from '../components/Map';
import SiteChrome from '../components/SiteChrome';
import Seo from '../components/Seo';
import NewsletterForm from '../components/NewsletterForm';
import { meals } from '../lib/meals.mjs';
import { filterPlaces, OSM_ATTRIBUTION, OSM_ATTRIBUTION_URL, pickRandom, poolKey, sanitizeFilters } from '../lib/placeFilters.mjs';
import { searchPlaces, getUserLocation } from '../services/placeService';

const description = 'Pick one nearby place to eat from OpenStreetMap, or cook from a short list of weekly meal ideas.';
const STORAGE_KEY = 'wsie:filters:v2';

function emptyMessage(filters) {
  if (filters.openNow && filters.selectedCuisines.length) {
    return 'Nothing open with that cuisine in this radius. Clear a filter or widen the distance.';
  }
  if (filters.openNow) {
    return 'Nothing with known open hours matched. Turn off Open now or widen the distance.';
  }
  if (filters.selectedCuisines.length) {
    return 'No places with that cuisine in this radius. Clear the cuisine filter or widen the distance.';
  }
  return 'No restaurants, cafes, or fast food places in this radius. Try a wider search.';
}

export default function Home() {
  const [filters, setFilters] = useState({
    selectedCuisines: [],
    radius: 5,
    openNow: false,
  });
  const [filtersReady, setFiltersReady] = useState(false);
  const [results, setResults] = useState([]);
  const [fetchedKey, setFetchedKey] = useState('');
  const [capped, setCapped] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentOption, setCurrentOption] = useState(null);
  const [error, setError] = useState(null);
  const [locationProblem, setLocationProblem] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchLock = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved) setFilters(sanitizeFilters(saved));
    } catch {
      // Ignore unreadable saved filters and keep the defaults.
    }
    setFiltersReady(true);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeFilters(filters)));
    } catch {
      // Saved filters are a convenience. Search still works without them.
    }
  }, [filters, filtersReady]);

  useEffect(() => {
    getUserLocation()
      .then(setUserLocation)
      .catch(() => setLocationProblem(true));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!userLocation) {
      setError(locationProblem
        ? 'Unable to get your location. Enable location services and refresh the page.'
        : 'Still looking up your location. Try again in a moment.');
      return;
    }

    setError(null);
    const key = poolKey(userLocation, filters.radius);
    let pool = results;

    if (fetchedKey !== key || pool.length === 0) {
      try {
        const data = await searchPlaces({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radiusMiles: filters.radius,
        });
        pool = data.results;
        setResults(pool);
        setFetchedKey(key);
        setCapped(Boolean(data.capped));
      } catch (searchError) {
        setCurrentOption(null);
        setError(searchError.message || 'Could not reach the search right now. Please try again.');
        return;
      }
    }

    const filtered = filterPlaces(pool, {
      cuisines: filters.selectedCuisines,
      openNow: filters.openNow,
    });
    if (filtered.length === 0) {
      setCurrentOption(null);
      setError(emptyMessage(filters));
      return;
    }
    setCurrentOption(pickRandom(filtered, Math.random, currentOption && currentOption.id));
  }, [userLocation, filters, results, fetchedKey, locationProblem, currentOption]);

  const onSearchClick = async () => {
    if (searchLock.current) return;
    searchLock.current = true;
    setLoading(true);
    try {
      await handleSearch();
    } finally {
      searchLock.current = false;
      setLoading(false);
    }
  };

  return (
    <SiteChrome>
      <Seo title="What should I eat today? | Wat Shall I Eat" description={description} path="/" />
      <h1 className="text-4xl font-bold mb-4">What should I eat today?</h1>
      <p className="text-lg mb-3 max-w-3xl">
        Set a distance, choose a cuisine if you want, and tap the button. We pick one place near you from OpenStreetMap. Tap again for a different place from the same results.
      </p>
      <p className="mb-8 max-w-3xl text-gray-700 dark:text-gray-300">
        The weekly list is a short note of meal ideas, about once a week. One signup is enough. We do not send a confirmation email, and you can leave with one click.
      </p>

      <section className="mb-10" aria-labelledby="nearby-heading">
        <h2 id="nearby-heading" className="text-2xl font-semibold mb-3">Find a place nearby</h2>
        <p className="mb-4 max-w-3xl">
          Your browser shares your location only to run this search. Cuisine and open now narrow the list. A second tap uses the places already loaded for this distance.
        </p>
        <Filters filters={filters} setFilters={setFilters} />
        <button
          type="button"
          onClick={onSearchClick}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-extrabold py-6 px-4 rounded-2xl shadow-lg transition duration-150 ease-in-out disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {loading ? 'Searching' : (currentOption ? 'Try another' : 'Find me food')}
        </button>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No account needed. Filters stay on this device.</p>
        <div aria-live="polite">
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {error}
            </div>
          )}
          {currentOption && <FoodOption option={currentOption} userLocation={userLocation} />}
        </div>
        {capped && currentOption && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            This radius has more places than the search loaded. A shorter distance covers the area more evenly.
          </p>
        )}
        <div className="mt-8 w-full h-64 sm:h-96 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <Map userLocation={userLocation} currentOption={currentOption} />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <a className="underline" href={OSM_ATTRIBUTION_URL}>{OSM_ATTRIBUTION}</a>
        </p>
      </section>

      <section className="mb-10" aria-labelledby="ideas-heading">
        <h2 id="ideas-heading" className="text-2xl font-semibold mb-3">Meal ideas to cook this week</h2>
        <p className="mb-4 max-w-3xl">
          Six dinners and breakfasts you can cook with ordinary groceries. Open any idea for ingredients, steps, and how long it takes.
        </p>
        <ul className="space-y-3 mb-4">
          {meals.map((meal) => (
            <li key={meal.slug}>
              <Link href={`/ideas/${meal.slug}`} className="font-semibold underline">{meal.title}</Link>
              <span className="text-gray-700 dark:text-gray-300">. {meal.description} About {meal.time}, serves {meal.serves}.</span>
            </li>
          ))}
        </ul>
        <p><Link href="/ideas" className="underline">See all meal ideas</Link></p>
      </section>

      <NewsletterForm placement="home" />
    </SiteChrome>
  );
}
