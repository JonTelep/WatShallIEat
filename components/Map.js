import { useEffect, useRef, useState } from 'react'

export default function Map({ userLocation, currentOption }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setGoogleMapsLoaded(true)
      document.head.appendChild(script)
    } else {
      setGoogleMapsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && (userLocation || currentOption)) {
      const center = currentOption?.geometry?.location || userLocation
      
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 14,
        })
      } else {
        mapInstanceRef.current.setCenter(center)
      }

      // Clear existing markers
      if (mapInstanceRef.current.markers) {
        mapInstanceRef.current.markers.forEach(marker => marker.setMap(null))
      }
      mapInstanceRef.current.markers = []

      // Add marker for current option if available
      if (currentOption && currentOption.geometry) {
        const marker = new window.google.maps.Marker({
          position: currentOption.geometry.location,
          map: mapInstanceRef.current,
          title: currentOption.name
        })
        mapInstanceRef.current.markers.push(marker)
      }

      // Add marker for user location
      if (userLocation) {
        const userMarker = new window.google.maps.Marker({
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
        mapInstanceRef.current.markers.push(userMarker)
      }
    }
  }, [userLocation, currentOption, googleMapsLoaded])

  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}