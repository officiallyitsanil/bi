"use client";
import { GoogleMap, useJsApiLoader, MarkerF, TrafficLayer } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { Layers, House, Building } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

export default function MapView({ center, markers, selectedMarker, onMarkerClick, zoom, mapType: externalMapType, showTraffic: externalShowTraffic, hideLayerButton = false }) {
  const mapCenter = useMemo(() => center, [center]);
  const [internalMapType, setInternalMapType] = useState("hybrid");
  const [internalShowTraffic, setInternalShowTraffic] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  
  // Use external props if provided, otherwise use internal state
  const mapType = externalMapType !== undefined ? externalMapType : internalMapType;
  const showTraffic = externalShowTraffic !== undefined ? externalShowTraffic : internalShowTraffic;

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
      {/* Layer Control Button - Only show if not hidden */}
      {!hideLayerButton && (
        <div className="absolute max-[425px]:bottom-[140px] max-[425px]:right-4 max-[425px]:top-auto max-[425px]:left-auto min-[426px]:top-4 min-[426px]:left-4 z-10">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="bg-white p-2.5 max-[425px]:p-3 rounded-lg shadow-xl hover:bg-gray-50 transition-colors"
            title="Map Layers"
          >
            <Layers className="w-5 h-5 max-[425px]:w-5.5 max-[425px]:h-5.5 text-gray-700" />
          </button>

        {/* Layer Menu */}
        {showLayerMenu && (
          <div className="absolute max-[425px]:bottom-14 max-[425px]:right-0 max-[425px]:top-auto max-[425px]:left-auto min-[426px]:top-14 min-[426px]:left-0 bg-white rounded-lg shadow-xl p-3 w-48">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Map Type</h3>
            <div className="space-y-1 mb-3">
              {mapTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    if (externalMapType === undefined) {
                      setInternalMapType(type.id);
                    }
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${mapType === type.id
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
                onClick={() => {
                  if (externalShowTraffic === undefined) {
                    setInternalShowTraffic(!showTraffic);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${showTraffic
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
      )}

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

          // Get price for display
          const getDisplayPrice = () => {
            if (marker.discountedPrice && marker.discountedPrice !== '₹XX' && marker.discountedPrice !== 'N/A') {
              // Extract just the number part (e.g., "₹250" -> "250")
              const priceMatch = marker.discountedPrice.match(/[\d.]+/);
              return priceMatch ? `₹${priceMatch[0]}` : '₹XX';
            } else if (marker.price_per_acre && marker.price_per_acre !== 'N/A') {
              const priceMatch = marker.price_per_acre.toString().match(/[\d.]+/);
              return priceMatch ? `₹${priceMatch[0]}` : '₹XX';
            } else if (marker.originalPrice && marker.originalPrice !== '₹XX' && marker.originalPrice !== 'N/A') {
              const priceMatch = marker.originalPrice.match(/[\d.]+/);
              return priceMatch ? `₹${priceMatch[0]}` : '₹XX';
            }
            return '₹XX';
          };

          const displayPrice = getDisplayPrice();

          // Create custom SVG marker icon
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
            }

            const isCommercial = markerType === 'commercial';
            const iconColor = '#1d4ed8'; // Vibrant Blue (blue-700) matching reference

            // Render Lucide icon to SVG string using renderToStaticMarkup
            const IconComponent = isCommercial ? Building : House;
            const iconSvgString = renderToStaticMarkup(
              <IconComponent
                size={20}
                color={iconColor}
                strokeWidth={2.5}
              />
            );

            // Generate unique ID for this marker's filter to avoid conflicts
            const filterId = `shadow-${marker.id}`.replace(/[^a-zA-Z0-9-]/g, '');

            // Shadow filter for the bubble
            const shadowFilter = `
            <defs>
              <filter id="${filterId}" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
              </filter>
            </defs>
          `;

            const strokeColor = isSelected ? '#1d4ed8' : 'white';
            const strokeWidth = isSelected ? 2 : 0;

            // Pill dimensions
            const pillWidth = 95;
            const pillHeight = 36;
            const pillX = 5;
            const pillY = 5;
            const cornerRadius = 18; // fully rounded ends

            // Create the complete SVG marker - EXACTLY like the reference images
            const svg = `
            <svg width="105" height="60" viewBox="0 0 105 60" xmlns="http://www.w3.org/2000/svg">
              ${shadowFilter}
              
              <!-- White pill-shaped bubble with shadow -->
              <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="url(#${filterId})"/>
              
              <!-- Blue icon on the left side, centered vertically -->
              <g transform="translate(${pillX + 10}, ${pillY + 8})">
                ${iconSvgString}
              </g>
              
              <!-- Price text on the right side, centered vertically with more right padding -->
              <text x="${pillX + pillWidth - 16}" y="${pillY + pillHeight / 2 + 1}" text-anchor="end" dominant-baseline="middle" fill="#000000" font-size="15" font-weight="700" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${displayPrice}</text>
              
              <!-- Small white circular pointer dot below the bubble -->
              <circle cx="52" cy="${pillY + pillHeight + 6}" r="5" fill="white" filter="url(#${filterId})"/>
            </svg>
          `;

            return {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
              scaledSize: new window.google.maps.Size(105, 60),
              anchor: new window.google.maps.Point(52, pillY + pillHeight + 6), // Anchor at the white dot (center bottom)
            };
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