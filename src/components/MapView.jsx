"use client";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useMemo } from "react";

export default function MapView({ center, markers, selectedMarker, onMarkerClick, zoom }) {
  const mapCenter = useMemo(() => center, [center]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  const mapOptions = useMemo(() => ({
    mapTypeId: "hybrid",
    disableDefaultUI: true,
    mapTypeControl: false,
  }), []);


  if (loadError) return <div>Error loading maps.</div>;

  if (!isLoaded) return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200">
        <p className="text-gray-500">Loading Map...</p>
      </div>
    );

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={zoom}
      options={mapOptions}
    >
      {markers && markers.map((marker) => {
        // Validate marker position - ensure lat and lng are valid numbers
        if (!marker.position || 
            typeof marker.position.lat !== 'number' || 
            typeof marker.position.lng !== 'number' ||
            isNaN(marker.position.lat) || 
            isNaN(marker.position.lng)) {
          return null; // Skip invalid markers
        }

        const isSelected = selectedMarker && selectedMarker.id === marker.id;
        const markerType = marker.propertyType || 'residential';
        
        // Create colored circle icon
        const getMarkerIcon = () => {
          if (isSelected) {
            // Red circle for selected marker
            return {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              fillColor: '#FF0000',
              fillOpacity: 1,
              strokeColor: 'transparent',
              strokeWeight: 0,
              scale: 6,
            };
          } else {
            // Blue for commercial, yellow for residential
            const color = markerType === 'commercial' ? '#0861b4' : '#fee123';
            return {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: 'transparent',
              strokeWeight: 0,
              scale: 6,
            };
          }
        };

        return (
          <MarkerF
            key={marker.id}
            position={marker.position}
            onClick={() => onMarkerClick(marker)}
            icon={getMarkerIcon()}
          />
        );
      }).filter(Boolean)}
    </GoogleMap>
  );
}