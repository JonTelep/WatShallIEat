import { directionsUrl, formatDistance } from '../lib/placeFilters.mjs';

function hoursLine(option) {
  if (!option.hours) return 'Hours unknown';
  if (option.hoursState === 'open') return `${option.hours} (open now)`;
  if (option.hoursState === 'closed') return `${option.hours} (closed now)`;
  return `${option.hours} (hours unknown)`;
}

export default function FoodOption({ option, userLocation }) {
  const distance = formatDistance(option.distanceMeters);
  const directions = directionsUrl(option, userLocation);

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{option.name}</h2>
      <p className="text-gray-700 dark:text-gray-300">Cuisine: {option.cuisine || 'Not listed'}</p>
      {distance && <p className="text-gray-700 dark:text-gray-300">Distance: {distance}</p>}
      {option.address && <p className="text-gray-700 dark:text-gray-300">Address: {option.address}</p>}
      <p className="text-gray-700 dark:text-gray-300">Hours: {hoursLine(option)}</p>
      {option.phone && (
        <p className="text-gray-700 dark:text-gray-300">
          Phone: <a className="underline" href={`tel:${option.phone}`}>{option.phone}</a>
        </p>
      )}
      {option.website && (
        <p className="text-gray-700 dark:text-gray-300">
          Website: <a className="underline" href={option.website} target="_blank" rel="noopener noreferrer">{option.website}</a>
        </p>
      )}
      {directions && (
        <p className="mt-2">
          <a className="text-blue-600 dark:text-blue-400 underline" href={directions} target="_blank" rel="noopener noreferrer">
            Directions
          </a>
        </p>
      )}
    </div>
  );
}
