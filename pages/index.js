import { useState, useEffect, useCallback } from 'react';
import Filters from '../components/Filters';
import FoodOption from '../components/FoodOption';
import Map from '../components/Map';
import DarkModeToggle from '../components/DarkModeToggle';
import SpinWheel from '../components/SpinWheel';
import { searchPlaces, getUserLocation } from '../services/placeService';

export default function Home() {
  const [filters, setFilters] = useState({
    foodTypes: [],
    radius: 5,
    priceLevel: [],
    openNow: true,
  });
  const [results, setResults] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentOption, setCurrentOption] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    async function fetchUserLocation() {
      try {
        setLocationLoading(true);
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        setError("📍 Enable location services to find food near you!");
      } finally {
        setLocationLoading(false);
      }
    }
    fetchUserLocation();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!userLocation) {
      setError("📍 Location not available. Please enable location services.");
      return;
    }

    setError(null);
    setLoading(true);
    setCurrentOption(null);

    try {
      const data = await searchPlaces({
        location: userLocation,
        radius: filters.radius * 1609.34,
        foodTypes: filters.foodTypes,
        priceLevel: filters.priceLevel,
        openNow: filters.openNow,
      });

      if (data.results.length === 0) {
        setError("🍽️ No restaurants found. Try expanding your radius or changing filters!");
        setLoading(false);
        return;
      }

      setResults(data.results);
      
      // Start spinning animation
      setSpinning(true);
      
      // Pick random after spin animation
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        setCurrentOption(data.results[randomIndex]);
        setSpinning(false);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error("Search error:", error);
      setError(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  }, [userLocation, filters]);

  const handleShuffle = () => {
    if (results.length > 1) {
      setSpinning(true);
      setTimeout(() => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * results.length);
        } while (results[newIndex] === currentOption && results.length > 1);
        setCurrentOption(results[newIndex]);
        setSpinning(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            🍔 Wat Shall I Eat
          </h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Location Status */}
        {locationLoading && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-center">
            <div className="animate-pulse">📍 Finding your location...</div>
          </div>
        )}

        {/* Filters */}
        <Filters filters={filters} setFilters={setFilters} />

        {/* Main Action Button */}
        <button 
          onClick={handleSearch}
          disabled={loading || locationLoading || !userLocation}
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
        >
          {loading ? '🔄 Finding...' : '🎲 Pick My Food!'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Spinning Wheel Animation */}
        {spinning && <SpinWheel />}

        {/* Result Card */}
        {currentOption && !spinning && (
          <>
            <FoodOption option={currentOption} userLocation={userLocation} />
            
            {/* Shuffle Button */}
            {results.length > 1 && (
              <button
                onClick={handleShuffle}
                disabled={spinning}
                className="w-full mt-4 bg-white dark:bg-gray-800 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                🔀 Not feeling it? Pick again! ({results.length} options)
              </button>
            )}
          </>
        )}

        {/* Map */}
        {userLocation && (
          <div className="mt-6 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="h-64 sm:h-80">
              <Map userLocation={userLocation} currentOption={currentOption} />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 pb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Made with 🍕 by Telep IO
        </footer>
      </main>
    </div>
  );
}
