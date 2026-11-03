import { CUISINES } from '../lib/placeFilters.mjs';

export default function Filters({ filters, setFilters }) {
  const toggleCuisine = (id) => {
    setFilters((prev) => {
      const selected = prev.selectedCuisines.includes(id)
        ? prev.selectedCuisines.filter((item) => item !== id)
        : [...prev.selectedCuisines, id];
      return { ...prev, selectedCuisines: selected };
    });
  };

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Filters</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="radius">
          Distance: <span className="text-gray-900 dark:text-gray-100">{filters.radius} miles</span>
        </label>
        <input
          id="radius"
          type="range"
          min="1"
          max="20"
          value={filters.radius}
          onChange={(event) => {
            const radius = Number(event.target.value);
            setFilters((prev) => ({ ...prev, radius }));
          }}
          className="w-full"
        />
      </div>
      <fieldset className="mb-3">
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuisine</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {CUISINES.map(([id, label]) => (
            <label key={id} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={filters.selectedCuisines.includes(id)}
                onChange={() => toggleCuisine(id)}
                className="form-checkbox"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Leave these clear to include every cuisine.</p>
      </fieldset>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={(event) => setFilters((prev) => ({ ...prev, openNow: event.target.checked }))}
          className="form-checkbox"
        />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Open now</span>
      </label>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Places with no hours are marked hours unknown and left out while Open now is on.
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Prices and ratings are not shown. OpenStreetMap does not have a reliable price or rating tag.
      </p>
    </div>
  );
}
