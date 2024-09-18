export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { location, radius, cuisines, orderOptions } = req.body;
  
    try {
      console.log('API received request:', req.body);
  
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      url.searchParams.append('location', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius);
      url.searchParams.append('type', 'restaurant');
      url.searchParams.append('keyword', cuisines.join('|'));
      url.searchParams.append('key', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  
      console.log('Sending request to Google Places API:', url.toString());
  
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error('Google Places API response not OK:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Google Places API response:', data);
  
      let filteredResults = data.results.filter(place => {
        // Exclude gas stations and convenience stores
        if (place.types.includes('gas_station') || place.types.includes('convenience_store')) {
          return false;
        }
  
        // Include only desired types
        return place.types.some(type => 
          ['bar', 'restaurant', 'food'].includes(type)
        );
      });
  
      // Apply order options filtering if necessary
      if (orderOptions && orderOptions.length > 0) {
        filteredResults = filteredResults.filter(place => {
          return orderOptions.every(option => {
            switch (option) {
              case 'Delivery':
                return place.business_status === 'OPERATIONAL' && place.types.includes('meal_delivery');
              case 'Takeout':
                return place.business_status === 'OPERATIONAL';
              default:
                return true;
            }
          });
        });
      }
  
      console.log('Filtered results:', filteredResults);
  
      res.status(200).json({ results: filteredResults });
    } catch (error) {
      console.error('Error in API route:', error);
      res.status(500).json({ message: 'Error fetching places', error: error.message });
    }
  }