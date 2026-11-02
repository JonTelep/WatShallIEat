export default function Map({ userLocation, currentOption }) {
  const point = currentOption
    ? { lat: Number(currentOption.lat), lng: Number(currentOption.lng) }
    : (userLocation ? { lat: Number(userLocation.lat), lng: Number(userLocation.lng) } : null);

  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
    return (
      <div className="w-full h-full rounded-lg flex items-center justify-center p-4 text-center text-sm text-gray-600 dark:text-gray-300">
        Allow location access to see places near you on the map.
      </div>
    );
  }

  const pad = 0.02;
  const bbox = [point.lng - pad, point.lat - pad, point.lng + pad, point.lat + pad].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${point.lat}%2C${point.lng}`;

  return (
    <iframe
      title={currentOption ? `Map of ${currentOption.name}` : 'Map of your location'}
      className="w-full h-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
    />
  );
}
