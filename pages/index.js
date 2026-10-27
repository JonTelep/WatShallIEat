import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Filters from '../components/Filters';
import FoodOption from '../components/FoodOption';
import Map from '../components/Map';
import SiteChrome from '../components/SiteChrome';
import Seo from '../components/Seo';
import NewsletterForm from '../components/NewsletterForm';
import { meals } from '../lib/meals.mjs';
import { searchPlaces, getUserLocation } from '../services/placeService';

const description = 'Pick a nearby place to eat, or cook from a short list of weekly meal ideas. Delivery, takeout, or a meal at home.';

export default function Home() {
  const [filters, setFilters] = useState({
    selectedCuisines: [],
    radius: 5,
    selectedOrderOptions: []
  });
  const [results, setResults] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentOption, setCurrentOption] = useState(null);
  const [error, setError] = useState(null);
  const [locationProblem, setLocationProblem] = useState(false);
  const [lastSearchRadius, setLastSearchRadius] = useState(null);

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
    let pool = results;

    if (lastSearchRadius !== filters.radius || pool.length === 0) {
      try {
        const data = await searchPlaces({
          location: userLocation,
          radius: filters.radius * 1609.34,
          cuisines: filters.selectedCuisines,
          orderOptions: filters.selectedOrderOptions
        });

        if (data.results.length === 0) {
          setResults([]);
          setError('No results found. Try expanding your search criteria.');
          return;
        }

        pool = data.results;
        setResults(data.results);
        setLastSearchRadius(filters.radius);
      } catch (searchError) {
        setError(`Error fetching results: ${searchError.message}`);
        return;
      }
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentOption(pool[randomIndex]);
  }, [userLocation, filters, results, lastSearchRadius, locationProblem]);

  const handleRadiusChange = (newRadius) => {
    setFilters(prev => ({ ...prev, radius: newRadius }));
  };

  return (
    <SiteChrome>
      <Seo title="Wat Shall I Eat" description={description} path="/" />
      <h1 className="text-4xl font-bold mb-4">Wat Shall I Eat</h1>
      <p className="text-lg mb-3 max-w-3xl">
        Wat Shall I Eat helps you decide the next meal. Set how far you want to go, choose delivery or takeout, and ask for one nearby option. If you would rather cook, use the meal ideas below. Each one is a full dinner or breakfast with a short shopping list.
      </p>
      <p className="mb-8 max-w-3xl text-gray-700 dark:text-gray-300">
        The weekly list is a short note of meal ideas, about once a week. One signup is enough. We do not send a confirmation email, and you can leave with one click.
      </p>

      <section className="mb-10" aria-labelledby="nearby-heading">
        <h2 id="nearby-heading" className="text-2xl font-semibold mb-3">Find a place nearby</h2>
        <p className="mb-4 max-w-3xl">
          Use your location to see one restaurant within the radius you set. Delivery and takeout filters narrow the list. The map shows the drive from where you are.
        </p>
        <Filters
          filters={filters}
          setFilters={setFilters}
          onRadiusChange={handleRadiusChange}
        />
        <button
          onClick={handleSearch}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Get Food Option
        </button>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            {error}
          </div>
        )}
        {currentOption && <FoodOption option={currentOption} userLocation={userLocation} />}
        <div className="mt-8 w-full h-64 sm:h-96 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <Map userLocation={userLocation} currentOption={currentOption} />
        </div>
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
