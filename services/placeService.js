export async function searchPlaces(params) {
  let response;
  try {
    response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(params),
    });
  } catch {
    throw new Error('Could not reach the search right now. Please try again.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error((data && data.message) || 'Could not reach the search right now. Please try again.');
  }
  if (!data || !Array.isArray(data.results)) {
    throw new Error('Could not reach the search right now. Please try again.');
  }
  return data;
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        reject(new Error('Location was denied.'));
      }
    );
  });
}
