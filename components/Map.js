import { useEffect, useRef, useState } from 'react'

export default function Map({ userLocation, currentOption }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const directionsServiceRef = useRef(null)
  const directionsRendererRef = useRef(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) return
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setGoogleMapsLoaded(true)
      document.head.appendChild(script)
    } else {
      setGoogleMapsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && userLocation) {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 14,
        })
        directionsServiceRef.current = new window.google.maps.DirectionsService()
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer()
        directionsRendererRef.current.setMap(mapInstanceRef.current)
      }

      // Add marker for user location
      new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        }
      })
    }
  }, [userLocation, googleMapsLoaded])

  useEffect(() => {
    if (googleMapsLoaded && mapInstanceRef.current && userLocation && currentOption) {
      const destination = currentOption.geometry.location
      
      directionsServiceRef.current.route(
        {
          origin: userLocation,
          destination: destination,
          travelMode: 'DRIVING'
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(result)
          } else {
            console.error('Directions request failed due to ' + status)
          }
        }
      )
    }
  }, [userLocation, currentOption, googleMapsLoaded])

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full rounded-lg flex items-center justify-center p-4 text-center text-sm text-gray-600 dark:text-gray-300">
        The map loads when a Google Maps key is configured. Meal ideas on this site do not need it.
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}