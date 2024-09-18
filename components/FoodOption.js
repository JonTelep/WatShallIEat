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
                    } else {
                        console.error('Directions request failed due to ' + status);
                    }
                }
            );
        }
    }, [option, userLocation]);

    // Get cuisine types
    const cuisines = option.types.filter(type => 
        ['cuisine', 'restaurant', 'food'].some(keyword => type.includes(keyword))
    ).map(type => type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

    // Map price level to dollar signs
    const priceLevel = option.price_level ? '$'.repeat(option.price_level) : 'N/A';

    return (
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{option.name}</h2>
        <p className="text-gray-700 dark:text-gray-300">Cuisine: {cuisines.join(', ') || 'N/A'}</p>
        {travelInfo && (
          <>
            <p className="text-gray-700 dark:text-gray-300">Distance: {travelInfo.distance}</p>
            <p className="text-gray-700 dark:text-gray-300">Travel Time: {travelInfo.duration}</p>
          </>
        )}
        <p className="text-gray-700 dark:text-gray-300">Address: {option.vicinity || 'N/A'}</p>
        <p className="text-gray-700 dark:text-gray-300">Rating: {option.rating ? `${option.rating} stars` : 'N/A'}</p>
        <p className="text-gray-700 dark:text-gray-300">Price Level: {priceLevel}</p>
      </div>
    )
}