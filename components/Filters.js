import { useState, useEffect } from 'react';

export default function Filters({ filters, setFilters, onRadiusChange }) {
  const [selectedCuisines, setSelectedCuisines] = useState(filters.selectedCuisines || []);
  const [selectedOrderOptions, setSelectedOrderOptions] = useState(filters.selectedOrderOptions || []);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      selectedCuisines,
      selectedOrderOptions
    }));
  }, [selectedCuisines, selectedOrderOptions, setFilters]);

  const handleCuisineChange = (cuisine) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const handleOrderOptionChange = (option) => {
    setSelectedOrderOptions(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleRadiusChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newRadius = value ? parseInt(value, 10) : '';
    setFilters(prev => ({ ...prev, radius: newRadius }));
    onRadiusChange(newRadius); // Call this function to trigger a new search
  };

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Filters</h2>
      {/* Cuisines */}
      <div className="mb-2">
{/*         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuisines:</label>
        {filters.cuisines && filters.cuisines.length > 0 ? (
          filters.cuisines.map((cuisine) => (
            <label key={cuisine} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={selectedCuisines.includes(cuisine)}
                onChange={() => handleCuisineChange(cuisine)}
                className="form-checkbox"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{cuisine}</span>
            </label>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No cuisines available</p>
        )} */}
      </div>
      {/* Radius */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Radius: <span className="text-gray-900 dark:text-gray-100">{filters.radius} miles</span>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={filters.radius}
          onChange={handleRadiusChange}
          className="w-full"
        />
      </div>
      {/* Order Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Options:</label>
        {['Delivery', 'Takeout'].map((option) => (
          <label key={option} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={selectedOrderOptions.includes(option)}
              onChange={() => handleOrderOptionChange(option)}
              className="form-checkbox"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}