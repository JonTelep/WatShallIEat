import { useState, useEffect } from 'react';

export default function FoodOption({ option, userLocation }) {
  const [travelInfo, setTravelInfo] = useState(null);

  useEffect(() => {
    if (window.google && userLocation && option.geometry) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: option.geometry.location,
          travelMode: 'DRIVING'
        },
        (result, status) => {
          if (status === 'OK') {
            setTravelInfo({
              distance: result.routes[0].legs[0].distance.text,
              duration: result.routes[0].legs[0].duration.text
            });
          }
        }
      );
    }
  }, [option, userLocation]);

  // Get rating stars
  const renderStars = (rating) => {
    if (!rating) return 'No ratings yet';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <span className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'text-yellow-500' : (i === fullStars && hasHalf ? 'text-yellow-500' : 'text-gray-300')}>
            {i < fullStars ? '★' : (i === fullStars && hasHalf ? '★' : '☆')}
          </span>
        ))}
        <span className="ml-1 text-gray-600 dark:text-gray-400">({rating})</span>
      </span>
    );
  };

  // Get price level
  const renderPrice = (level) => {
    if (!level) return <span className="text-gray-500">Price N/A</span>;
    return (
      <span className="text-green-600 dark:text-green-400 font-semibold">
        {'$'.repeat(level)}
        <span className="text-gray-300 dark:text-gray-600">{'$'.repeat(4 - level)}</span>
      </span>
    );
  };

  // Open status
  const isOpen = option.opening_hours?.open_now;

  // Google Maps link
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(option.vicinity || option.name)}&destination_place_id=${option.place_id}`;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 animate-fadeIn">
      {/* Photo */}
      {option.photos && option.photos[0] && (
        <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${option.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
            alt={option.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {option.name}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isOpen 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {isOpen ? '🟢 Open' : '🔴 Closed'}
          </span>
        </div>

        {/* Rating & Price */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>{renderStars(option.rating)}</div>
          <div>{renderPrice(option.price_level)}</div>
          {option.user_ratings_total && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({option.user_ratings_total} reviews)
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          📍 {option.vicinity || 'Address not available'}
        </p>

        {/* Travel Info */}
        {travelInfo && (
          <div className="flex gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{travelInfo.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drive time</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{travelInfo.duration}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors duration-200"
          >
            🗺️ Directions
          </a>
          {option.place_id && (
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${option.place_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg text-center transition-colors duration-200"
            >
              ℹ️ More Info
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
