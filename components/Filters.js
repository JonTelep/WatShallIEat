import { useState } from 'react';

const FOOD_TYPES = [
  { id: 'fast_food', label: '🍟 Fast Food', keyword: 'fast food' },
  { id: 'pizza', label: '🍕 Pizza', keyword: 'pizza' },
  { id: 'mexican', label: '🌮 Mexican', keyword: 'mexican' },
  { id: 'chinese', label: '🥡 Chinese', keyword: 'chinese' },
  { id: 'italian', label: '🍝 Italian', keyword: 'italian' },
  { id: 'japanese', label: '🍣 Japanese', keyword: 'japanese sushi' },
  { id: 'indian', label: '🍛 Indian', keyword: 'indian' },
  { id: 'thai', label: '🍜 Thai', keyword: 'thai' },
  { id: 'american', label: '🍔 American', keyword: 'american burger' },
  { id: 'seafood', label: '🦐 Seafood', keyword: 'seafood' },
  { id: 'korean', label: '🥘 Korean', keyword: 'korean' },
  { id: 'mediterranean', label: '🥙 Mediterranean', keyword: 'mediterranean' },
  { id: 'breakfast', label: '🥞 Breakfast', keyword: 'breakfast brunch' },
  { id: 'cafe', label: '☕ Cafe', keyword: 'cafe coffee' },
  { id: 'dessert', label: '🍰 Dessert', keyword: 'dessert bakery' },
  { id: 'healthy', label: '🥗 Healthy', keyword: 'salad healthy' },
];

const PRICE_LEVELS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

export default function Filters({ filters, setFilters }) {
  const [expanded, setExpanded] = useState(true);

  const toggleFoodType = (typeId) => {
    setFilters(prev => ({
      ...prev,
      foodTypes: prev.foodTypes.includes(typeId)
        ? prev.foodTypes.filter(t => t !== typeId)
        : [...prev.foodTypes, typeId]
    }));
  };

  const togglePriceLevel = (level) => {
    setFilters(prev => ({
      ...prev,
      priceLevel: prev.priceLevel.includes(level)
        ? prev.priceLevel.filter(l => l !== level)
        : [...prev.priceLevel, level]
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      foodTypes: [],
      priceLevel: [],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
      >
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          🎯 Filters {filters.foodTypes.length > 0 && `(${filters.foodTypes.length} selected)`}
        </span>
        <span className="text-gray-500 transform transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* Food Types */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What are you craving?
              </label>
              {filters.foodTypes.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-orange-500 hover:text-orange-600"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {FOOD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleFoodType(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.foodTypes.includes(type.id)
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {filters.foodTypes.length === 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                No filter = surprise me with anything! 🎲
              </p>
            )}
          </div>

          {/* Radius Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📍 Distance: <span className="text-orange-500 font-bold">{filters.radius} miles</span>
            </label>
            <input
              type="range"
              min="1"
              max="25"
              value={filters.radius}
              onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 mi</span>
              <span>25 mi</span>
            </div>
          </div>

          {/* Price Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💰 Price Range
            </label>
            <div className="flex gap-2">
              {PRICE_LEVELS.map((price) => (
                <button
                  key={price.value}
                  onClick={() => togglePriceLevel(price.value)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filters.priceLevel.includes(price.value)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {price.label}
                </button>
              ))}
            </div>
            {filters.priceLevel.length === 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Any price range
              </p>
            )}
          </div>

          {/* Open Now Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🕐 Open Now Only
            </label>
            <button
              onClick={() => setFilters(prev => ({ ...prev, openNow: !prev.openNow }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                filters.openNow ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  filters.openNow ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export food types for use in API
export { FOOD_TYPES };
