const API_BASE_URL = '/api';

export async function searchPlaces(params) {
  try {
    console.log('Sending request to API with params:', params);
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response not OK:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);

    if (!data || !Array.isArray(data.results)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error("Error in searchPlaces:", error);
    throw error;
  }
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          reject(error);
        }
      );
    } else {
      const error = new Error("Geolocation is not supported by this browser.");
      console.error(error);
      reject(error);
    }
  });
}