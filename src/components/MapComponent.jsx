import { GoogleMap } from '@react-google-maps/api'
import React from 'react'

export default function MapComponent({center, map,setMap, normalDirectionsResponse, directionsResponse  }) {
  return (
    <GoogleMap
    center={center}
    zoom={16}
    mapContainerStyle={{ width: "100%", height: "100%" }}
    options={{
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    }}
    onLoad={(map) => setMap(map)}
  >
    {normalDirectionsResponse && (
      <DirectionsRenderer directions={normalDirectionsResponse} />
    )}
    {directionsResponse && (
      <DirectionsRenderer directions={directionsResponse} />
    )}
  </GoogleMap>
  )
}
