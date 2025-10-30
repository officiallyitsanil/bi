"use client";
import { GoogleMap, useJsApiLoader, MarkerF, TrafficLayer } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { Layers } from "lucide-react";

export default function MapView({ center, markers, selectedMarker, onMarkerClick, zoom }) {
  const mapCenter = useMemo(() => center, [center]);
  const [mapType, setMapType] = useState("hybrid");
  const [showTraffic, setShowTraffic] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    language: 'en',
    region: 'US',
    version: 'weekly',
  });

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  const mapOptions = useMemo(() => ({
    mapTypeId: mapType,
    disableDefaultUI: true,
    mapTypeControl: false,
    restriction: {
      latLngBounds: {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
      },
    },
    styles: [
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.attraction",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.government",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.medical",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.park",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.place_of_worship",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.school",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi.sports_complex",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "transit",
        stylers: [{ visibility: "off" }]
      }
    ]
  }), [mapType]);


  if (loadError) return <div>Error loading maps.</div>;

  if (!isLoaded) return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200">
        <p className="text-gray-500">Loading Map...</p>
      </div>
    );

  const mapTypes = [
    { id: "roadmap", name: "Default", icon: "🗺️" },
    { id: "satellite", name: "Satellite", icon: "🛰️" },
    { id: "hybrid", name: "Hybrid", icon: "🌍" },
    { id: "terrain", name: "Terrain", icon: "⛰️" }
  ];

  return (
    <div className="relative w-full h-full">
      {/* Layer Control Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="bg-white p-2.5 rounded-lg shadow-xl hover:bg-gray-50 transition-colors"
          title="Map Layers"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>

        {/* Layer Menu */}
        {showLayerMenu && (
          <div className="absolute top-14 left-0 bg-white rounded-lg shadow-xl p-3 w-48">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Map Type</h3>
            <div className="space-y-1 mb-3">
              {mapTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setMapType(type.id);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                    mapType === type.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                  {mapType === type.id && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t pt-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Layers</h3>
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                  showTraffic
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>🚦</span>
                <span>Traffic</span>
                {showTraffic && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        options={{
          ...mapOptions,
          language: 'en',
          region: 'US'
        }}
      >
      {showTraffic && <TrafficLayer />}
      
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
          if (marker.isSearchResult) {
            // Red circle for search result markers (locations not in properties)
            return {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              fillColor: '#FF0000',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 8,
            };
          } else if (isSelected) {
            // Highlighted circle for selected property marker
            return {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              fillColor: markerType === 'commercial' ? '#0861b4' : '#fee123',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 8,
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
    </div>
  );
}