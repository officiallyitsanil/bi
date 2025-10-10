"use client";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useMemo } from "react";

export default function MapView({ center, markers, onMarkerClick, zoom }) {
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
    mapTypeControlOptions: {
      style: window.google?.maps?.MapTypeControlStyle.HORIZONTAL_BAR,
      position: window.google?.maps?.ControlPosition.TOP_LEFT,
    },
  }), [isLoaded]);


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
      {markers && markers.map((marker) => (
        <MarkerF
          key={marker.id}
          position={marker.position}
          onClick={() => onMarkerClick(marker)}
          icon={{
            url: "/property-icon.svg",
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
      ))}
    </GoogleMap>
  );
}