// Food type to keyword mapping
const FOOD_TYPE_KEYWORDS = {
  fast_food: 'fast food burger mcdonalds wendys',
  pizza: 'pizza',
  mexican: 'mexican taco burrito',
  chinese: 'chinese',
  italian: 'italian pasta',
  japanese: 'japanese sushi ramen',
  indian: 'indian curry',
  thai: 'thai',
  american: 'american burger grill',
  seafood: 'seafood fish',
  korean: 'korean bbq',
  mediterranean: 'mediterranean greek',
  breakfast: 'breakfast brunch',
  cafe: 'cafe coffee',
  dessert: 'dessert bakery ice cream',
  healthy: 'salad healthy vegan',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { location, radius, foodTypes = [], priceLevel = [], openNow = true } = req.body;

  if (!location || !location.lat || !location.lng) {
    return res.status(400).json({ message: 'Location is required' });
  }

  try {
    // Build keyword string from selected food types
    let keyword = '';
    if (foodTypes.length > 0) {
      keyword = foodTypes
        .map(type => FOOD_TYPE_KEYWORDS[type] || type)
        .join(' ');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${location.lat},${location.lng}`);
    url.searchParams.append('radius', Math.min(radius, 50000)); // Max 50km
    url.searchParams.append('type', 'restaurant');
    if (keyword) {
      url.searchParams.append('keyword', keyword);
    }
    if (openNow) {
      url.searchParams.append('opennow', 'true');
    }
    url.searchParams.append('key', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

    console.log('Google Places API request:', url.toString().replace(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, '[REDACTED]'));

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('Google Places API error:', response.status);
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API status:', data.status, data.error_message);
      throw new Error(data.error_message || `API returned status: ${data.status}`);
    }

    // Filter results
    let filteredResults = (data.results || []).filter(place => {
      // Exclude unwanted place types
      const excludedTypes = ['gas_station', 'convenience_store', 'lodging', 'car_wash', 'car_repair'];
      if (place.types.some(type => excludedTypes.includes(type))) {
        return false;
      }

      // Must be food-related
      const foodTypes = ['restaurant', 'food', 'cafe', 'bakery', 'bar', 'meal_delivery', 'meal_takeaway'];
      if (!place.types.some(type => foodTypes.includes(type))) {
        return false;
      }

      // Price level filter
      if (priceLevel.length > 0 && place.price_level) {
        if (!priceLevel.includes(place.price_level)) {
          return false;
        }
      }

      return true;
    });

    // Sort by rating (higher first), then by number of reviews
    filteredResults.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
    });

    console.log(`Found ${filteredResults.length} results after filtering`);

    res.status(200).json({ 
      results: filteredResults,
      total: filteredResults.length 
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      message: 'Error fetching places', 
      error: error.message 
    });
  }
}
