import { useState, useEffect, useCallback } from 'react';
import Filters from '../components/Filters';
import FoodOption from '../components/FoodOption';
import Map from '../components/Map';
import DarkModeToggle from '../components/DarkModeToggle';
import { searchPlaces, getUserLocation } from '../services/placeService';

export default function Home() {
  const [filters, setFilters] = useState({
    selectedCuisines: [],
    cuisines: ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese'], // Add more cuisines as needed
    radius: 5,
    selectedOrderOptions: []
  });
  const [results, setResults] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentOption, setCurrentOption] = useState(null);
  const [error, setError] = useState(null);
  const [lastSearchRadius, setLastSearchRadius] = useState(null);

  useEffect(() => {
    async function fetchUserLocation() {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        setError("Unable to get user location. Please enable location services and refresh the page.");
      }
    }
    fetchUserLocation();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!userLocation) {
      setError("User location not available");
      return;
    }

    setError(null);

    // Only perform a new search if the radius has changed or it's the first search
    if (lastSearchRadius !== filters.radius) {
      try {
        console.log('Initiating search with params:', {
          location: userLocation,
          radius: filters.radius * 1609.34,
          cuisines: filters.selectedCuisines,
          orderOptions: filters.selectedOrderOptions
        });

        const data = await searchPlaces({
          location: userLocation,
          radius: filters.radius * 1609.34, // Convert miles to meters
          cuisines: filters.selectedCuisines,
          orderOptions: filters.selectedOrderOptions
        });

        console.log('Search results:', data);

        if (data.results.length === 0) {
          setError("No results found. Try expanding your search criteria.");
          return;
        }

        setResults(data.results);
        setLastSearchRadius(filters.radius);
      } catch (error) {
        console.error("Search error:", error);
        setError(`Error fetching results: ${error.message}`);
        return;
      }
    }

    if (results.length > 0) {
      const randomIndex = Math.floor(Math.random() * results.length);
      console.log(`Selecting random result at index ${randomIndex} from ${results.length} results`);
      setCurrentOption(results[randomIndex]);
    } else {
      setError("No results available. Try performing a new search.");
    }
  }, [userLocation, filters, results, lastSearchRadius]);

  const handleRadiusChange = (newRadius) => {
    setFilters(prev => ({ ...prev, radius: newRadius }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">Wat Shall I Eat</h1>
          <DarkModeToggle />
        </div>
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
        {currentOption && <FoodOption option={currentOption} />}
        <div className="mt-8 w-full h-64 sm:h-96 rounded-lg overflow-hidden">
          <Map userLocation={userLocation} currentOption={currentOption} />
        </div>
      </main>
    </div>
  );
}