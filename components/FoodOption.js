export default function FoodOption({ option }) {
    // Helper function to calculate distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; // Distance in km
        return d.toFixed(2);
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI/180)
    };

    // Get cuisine types
    const cuisines = option.types.filter(type => 
        ['cuisine', 'restaurant', 'food'].some(keyword => type.includes(keyword))
    ).map(type => type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

    // Calculate distance if user location is available
    const distance = option.userLocation ? 
        calculateDistance(
            option.userLocation.lat, 
            option.userLocation.lng, 
            option.geometry.location.lat, 
            option.geometry.location.lng
        ) : 'N/A';

    // Map price level to dollar signs
    const priceLevel = option.price_level ? '$'.repeat(option.price_level) : 'N/A';

    return (
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{option.name}</h2>
        <p className="text-gray-700 dark:text-gray-300">Cuisine: {cuisines.join(', ') || 'N/A'}</p>
        <p className="text-gray-700 dark:text-gray-300">Distance: {distance} km</p>
        <p className="text-gray-700 dark:text-gray-300">Address: {option.vicinity || 'N/A'}</p>
        <p className="text-gray-700 dark:text-gray-300">Rating: {option.rating ? `${option.rating} stars` : 'N/A'}</p>
        <p className="text-gray-700 dark:text-gray-300">Price Level: {priceLevel}</p>
      </div>
    )
  }