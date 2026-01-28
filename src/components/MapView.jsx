"use client";
import { GoogleMap, useJsApiLoader, MarkerF, TrafficLayer } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { Layers, House, Building } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

export default function MapView({ center, markers, selectedMarker, onMarkerClick, zoom, mapType: externalMapType, showTraffic: externalShowTraffic, hideLayerButton = false, isDark = false }) {
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

          // Format price to compact format (₹300, ₹450, ₹30K, etc.) - max 3 chars + ₹
          const formatCompactPrice = (priceValue) => {
            // Check for invalid values
            if (!priceValue || 
                priceValue === '₹XX' || 
                priceValue === 'XX' ||
                priceValue === 'N/A' || 
                priceValue === '' ||
                (typeof priceValue === 'string' && priceValue.trim() === '')) {
              return null;
            }

            // Extract numeric value from string (handles formats like "₹250", "250", "₹2.5L", etc.)
            let numericValue = 0;
            
            // Check if it's already a number
            if (typeof priceValue === 'number' && !isNaN(priceValue) && priceValue > 0) {
              numericValue = priceValue;
            } else {
              // Extract number from string
              const priceStr = priceValue.toString().trim();
              
              // Check for Lakhs (L) or Crores (C) in the string
              if (priceStr.toLowerCase().includes('l') || priceStr.toLowerCase().includes('lakh')) {
                const numMatch = priceStr.match(/[\d.]+/);
                if (numMatch && numMatch[0]) {
                  numericValue = parseFloat(numMatch[0]) * 100000; // Convert lakhs to actual number
                }
              } else if (priceStr.toLowerCase().includes('c') || priceStr.toLowerCase().includes('crore')) {
                const numMatch = priceStr.match(/[\d.]+/);
                if (numMatch && numMatch[0]) {
                  numericValue = parseFloat(numMatch[0]) * 10000000; // Convert crores to actual number
                }
              } else if (priceStr.toLowerCase().includes('k') || priceStr.toLowerCase().includes('thousand')) {
                const numMatch = priceStr.match(/[\d.]+/);
                if (numMatch && numMatch[0]) {
                  numericValue = parseFloat(numMatch[0]) * 1000; // Convert thousands to actual number
                }
              } else {
                // Regular number extraction - remove currency symbols, commas, and spaces
                const cleanedStr = priceStr.replace(/[₹,\s]/g, '');
                const numMatch = cleanedStr.match(/[\d.]+/);
                if (numMatch && numMatch[0]) {
                  numericValue = parseFloat(numMatch[0]);
                }
              }
            }

            if (!numericValue || isNaN(numericValue) || numericValue <= 0) {
              return null;
            }

            // Format to compact 3-character format (digits + letter) with ₹ prefix
            let formatted = '';
            if (numericValue >= 10000000) {
              // Crores: show as ₹3C, ₹4C, ₹45C, etc. (max 3 chars + ₹)
              const crores = numericValue / 10000000;
              if (crores >= 100) {
                formatted = `${Math.round(crores)}C`; // e.g., 100C, 250C
              } else if (crores >= 10) {
                formatted = `${Math.round(crores)}C`; // e.g., 10C, 45C
              } else {
                // For single digit crores, show with 1 decimal if needed, but keep max 3 chars
                const rounded = Math.round(crores * 10) / 10;
                if (rounded % 1 === 0) {
                  formatted = `${Math.round(rounded)}C`; // e.g., 3C, 5C
                } else {
                  formatted = `${rounded.toFixed(1)}C`; // e.g., 3.5C, 4.2C
                }
              }
            } else if (numericValue >= 100000) {
              // Lakhs: show as ₹30L, ₹45L, ₹3.5L, etc. (max 3 chars + ₹)
              const lakhs = numericValue / 100000;
              if (lakhs >= 100) {
                formatted = `${Math.round(lakhs)}L`; // e.g., 100L, 250L
              } else if (lakhs >= 10) {
                formatted = `${Math.round(lakhs)}L`; // e.g., 10L, 45L
              } else {
                const rounded = Math.round(lakhs * 10) / 10;
                if (rounded % 1 === 0) {
                  formatted = `${Math.round(rounded)}L`; // e.g., 3L, 5L
                } else {
                  formatted = `${rounded.toFixed(1)}L`; // e.g., 3.5L, 4.2L
                }
              }
            } else if (numericValue >= 1000) {
              // Thousands: show as ₹30K, ₹45K, ₹3.5K, etc. (max 3 chars + ₹)
              const thousands = numericValue / 1000;
              if (thousands >= 100) {
                formatted = `${Math.round(thousands)}K`; // e.g., 100K, 250K
              } else if (thousands >= 10) {
                formatted = `${Math.round(thousands)}K`; // e.g., 10K, 45K
              } else {
                const rounded = Math.round(thousands * 10) / 10;
                if (rounded % 1 === 0) {
                  formatted = `${Math.round(rounded)}K`; // e.g., 3K, 5K
                } else {
                  formatted = `${rounded.toFixed(1)}K`; // e.g., 3.5K, 4.2K
                }
              }
            } else {
              // Less than 1000: show as ₹300, ₹450, etc. - max 3 digits + ₹
              const rounded = Math.round(numericValue);
              formatted = rounded.toString(); // e.g., 300, 450, 999
            }

            return formatted ? `₹${formatted}` : null;
          };

          // Calculate price from property data (similar to PropertyDetailModal)
          const calculatePriceFromProperty = (property) => {
            let originalPriceValue = 0;
            
            if (property.propertyType === 'residential') {
              // For residential: use expectedRent
              const expectedRent = property.expectedRent || '0';
              originalPriceValue = parseFloat(expectedRent.toString().replace(/[₹,]/g, '')) || 0;
            } else if (property.propertyType === 'commercial') {
              // For commercial: calculate from floorConfigurations
              if (property.floorConfigurations && property.floorConfigurations.length > 0) {
                const firstFloor = property.floorConfigurations[0];
                if (firstFloor.dedicatedCabin && firstFloor.dedicatedCabin.seats && firstFloor.dedicatedCabin.pricePerSeat) {
                  // Extract lower values from ranges like "70 - 90" and "6000-8000"
                  const seatsStr = firstFloor.dedicatedCabin.seats.toString();
                  const pricePerSeatStr = firstFloor.dedicatedCabin.pricePerSeat.toString();
                  
                  const seatsMatch = seatsStr.match(/(\d+)/);
                  const pricePerSeatMatch = pricePerSeatStr.match(/(\d+)/);
                  
                  if (seatsMatch && pricePerSeatMatch) {
                    const seatsLower = parseFloat(seatsMatch[1]);
                    const pricePerSeatLower = parseFloat(pricePerSeatMatch[1]);
                    originalPriceValue = seatsLower * pricePerSeatLower;
                  }
                }
              }
            }
            
            // Calculate discounted price (5% off = 95% of original) - same as PropertyDetailModal
            const discountedPriceValue = originalPriceValue * 0.95;
            
            return discountedPriceValue;
          };

          // Get price for display - check ALL possible price fields
          const getDisplayPrice = () => {
            // First, try to calculate DISCOUNTED price from property data (for commercial/residential)
            const calculatedDiscountedPrice = calculatePriceFromProperty(marker);
            if (calculatedDiscountedPrice > 0) {
              const formatted = formatCompactPrice(calculatedDiscountedPrice);
              if (formatted && formatted !== '₹XX') return formatted;
            }

            // List of all possible price fields to check (in priority order)
            const priceFields = [
              'discountedPrice',
              'total_price',
              'expectedRent',
              'price_per_acre',
              'price_per_sqft',
              'price_per_desk',
              'originalPrice',
              'additionalPrice'
            ];

            // Try each field in priority order
            for (const field of priceFields) {
              const priceValue = marker[field];
              
              // Skip if null, undefined
              if (priceValue === null || priceValue === undefined) continue;
              
              // Convert to string for checking
              const priceStr = String(priceValue).trim();
              
              // Skip if it's a placeholder value
              if (priceStr === '₹XX' || 
                  priceStr === 'XX' || 
                  priceStr === 'N/A' || 
                  priceStr === '' ||
                  priceStr.toLowerCase() === 'na' ||
                  priceStr.toLowerCase() === 'null' ||
                  priceStr.toLowerCase() === 'undefined') {
                continue;
              }

              // Check if it's already a valid number
              if (typeof priceValue === 'number' && !isNaN(priceValue) && priceValue > 0) {
                const formatted = formatCompactPrice(priceValue);
                if (formatted && formatted !== '₹XX') return formatted;
                continue;
              }

              // Try to extract number from string - be more aggressive
              // Remove all non-numeric characters except dots, L, C, K
              let cleaned = priceStr.replace(/[₹,\s]/g, '');
              
              // Check for Lakhs/Crores/Thousands indicators
              let multiplier = 1;
              if (cleaned.toLowerCase().includes('l') || cleaned.toLowerCase().includes('lakh')) {
                multiplier = 100000;
                cleaned = cleaned.replace(/[^0-9.]/g, '');
              } else if (cleaned.toLowerCase().includes('c') || cleaned.toLowerCase().includes('crore')) {
                multiplier = 10000000;
                cleaned = cleaned.replace(/[^0-9.]/g, '');
              } else if (cleaned.toLowerCase().includes('k') || cleaned.toLowerCase().includes('thousand')) {
                multiplier = 1000;
                cleaned = cleaned.replace(/[^0-9.]/g, '');
              } else {
                // Remove all non-numeric except dots
                cleaned = cleaned.replace(/[^0-9.]/g, '');
              }
              
              // Try to extract number
              const numMatch = cleaned.match(/[\d.]+/);
              
              if (numMatch && numMatch[0]) {
                const numValue = parseFloat(numMatch[0]);
                if (!isNaN(numValue) && numValue > 0) {
                  const finalValue = numValue * multiplier;
                  const formatted = formatCompactPrice(finalValue);
                  if (formatted && formatted !== '₹XX') return formatted;
                }
              }
            }

            // Last resort: check if marker has any numeric field that might be a price
            // Look for fields with "price" or "rent" in the name
            for (const key in marker) {
              if (key.toLowerCase().includes('price') || 
                  key.toLowerCase().includes('rent') ||
                  key.toLowerCase().includes('cost')) {
                const value = marker[key];
                if (value && typeof value === 'number' && value > 0) {
                  const formatted = formatCompactPrice(value);
                  if (formatted && formatted !== '₹XX') return formatted;
                }
              }
            }

            // If nothing found, return ₹XX
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
                strokeWeight: 1.5,
                scale: 6,
              };
            }

            const isCommercial = markerType === 'commercial';
            // Use brighter blue in dark mode for better visibility, darker blue in light mode
            const iconColor = isDark ? '#60a5fa' : '#1d4ed8'; // Light blue (blue-400) in dark mode, darker blue (blue-700) in light mode

            // Render Lucide icon to SVG string using renderToStaticMarkup
            const IconComponent = isCommercial ? Building : House;
            const iconSvgString = renderToStaticMarkup(
              <IconComponent
                size={16}
                color={iconColor}
                strokeWidth={2}
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

            // Pill dimensions - reduced size with less padding
            const pillWidth = 65;
            const pillHeight = 28;
            const pillX = 4;
            const pillY = 4;
            const cornerRadius = 14; // fully rounded ends

            // SVG dimensions - reduced size
            const svgWidth = 75;
            const svgHeight = 50;
            const centerX = svgWidth / 2;

            // Dark mode colors - match the dark theme used in the app
            const pillBackgroundColor = isDark ? '#282c34' : 'white';
            const priceTextColor = isDark ? '#FFFFFF' : '#000000';
            const pointerDotColor = isDark ? '#282c34' : 'white';

            // Create the complete SVG marker - smaller size with less spacing
            const svg = `
            <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
              ${shadowFilter}
              
              <!-- Pill-shaped bubble with shadow (black in dark mode, white in light mode) -->
              <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${pillBackgroundColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="url(#${filterId})"/>
              
              <!-- Blue icon on the left side, centered vertically (color stays the same) -->
              <g transform="translate(${pillX + 6}, ${pillY + 6})">
                ${iconSvgString}
              </g>
              
              <!-- Price text on the right side, centered vertically with less padding (white in dark mode, black in light mode) -->
              <text x="${pillX + pillWidth - 8}" y="${pillY + pillHeight / 2 + 1}" text-anchor="end" dominant-baseline="middle" fill="${priceTextColor}" font-size="12" font-weight="700" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${displayPrice}</text>
              
              <!-- Small circular pointer dot below the bubble (black in dark mode, white in light mode) -->
              <circle cx="${centerX}" cy="${pillY + pillHeight + 5}" r="4" fill="${pointerDotColor}" filter="url(#${filterId})"/>
            </svg>
          `;

            return {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
              scaledSize: new window.google.maps.Size(svgWidth, svgHeight),
              anchor: new window.google.maps.Point(centerX, pillY + pillHeight + 5), // Anchor at the white dot (center bottom)
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