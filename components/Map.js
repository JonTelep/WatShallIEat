import { useEffect, useRef, useState } from 'react';

export default function Map({ userLocation, currentOption }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && userLocation) {
      if (!mapInstanceRef.current) {
        // Create map with custom styling
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 14,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }]
            },
            {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi.government',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#f97316',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        });
        directionsRendererRef.current.setMap(mapInstanceRef.current);
      }

      // Update or create user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(userLocation);
      } else {
        userMarkerRef.current = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstanceRef.current,
          title: 'You are here',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#ffffff',
          },
          zIndex: 1000,
        });
      }
    }
  }, [userLocation, googleMapsLoaded]);

  // Show directions when option is selected
  useEffect(() => {
    if (googleMapsLoaded && mapInstanceRef.current && userLocation && currentOption) {
      const destination = currentOption.geometry.location;

      // Hide user marker when showing directions (directions renderer shows its own)
      if (userMarkerRef.current) {
        userMarkerRef.current.setVisible(false);
      }

      directionsServiceRef.current.route(
        {
          origin: userLocation,
          destination: destination,
          travelMode: 'DRIVING',
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(result);
            
            // Fit bounds to show entire route
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(userLocation);
            bounds.extend(destination);
            mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
          } else {
            console.error('Directions request failed:', status);
            // If directions fail, at least center on the destination
            mapInstanceRef.current.setCenter(destination);
            mapInstanceRef.current.setZoom(15);
          }
        }
      );
    } else if (googleMapsLoaded && mapInstanceRef.current && userLocation && !currentOption) {
      // Clear directions and show user marker again
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] });
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setVisible(true);
      }
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
    }
  }, [userLocation, currentOption, googleMapsLoaded]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
}
