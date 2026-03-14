"use client";

import { useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Places type presets for different search contexts:
 * - locality: localities, landmarks, establishments
 * - metro: transit stations (metro, subway)
 * - travel: geocode (office, destination, addresses)
 * - society: establishments (housing societies, buildings)
 * - city: cities and localities
 */
const PLACES_TYPES = {
  locality: "establishment",
  metro: "transit_station",
  travel: "geocode",
  society: "establishment",
  city: "(cities)",
};

export default function PlacesAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Search",
  mapCenter = { lat: 20.5937, lng: 78.9629 },
  type = "locality",
  isDark = false,
  className = "",
  inputClassName = "",
  iconLeft: IconLeft = null,
  iconRight: IconRight = null,
  disabled = false,
}) {
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const placesServiceRef = useRef(null);

  const debouncedValue = useDebounce(value, 300);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
    language: "en",
  });

  // Initialize PlacesService (needs a div) for getDetails
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    const div = document.createElement("div");
    placesServiceRef.current = new window.google.maps.places.PlacesService(div);
  }, [isLoaded]);

  const fetchPredictions = useCallback(async () => {
    if (!isLoaded || !window.google || !debouncedValue.trim()) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    const service = new window.google.maps.places.AutocompleteService();
    const placeType = PLACES_TYPES[type] || "establishment";

    const request = {
      input: debouncedValue.trim(),
      types: [placeType],
      componentRestrictions: { country: "in" },
      language: "en",
    };

    // Bias results toward current map center (nearest to view)
    if (mapCenter?.lat != null && mapCenter?.lng != null && type !== "city") {
      request.location = new window.google.maps.LatLng(mapCenter.lat, mapCenter.lng);
      request.radius = 50000; // 50km
    }

    service.getPlacePredictions(request, (results, status) => {
      setIsLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPredictions(results);
        setSelectedIndex(-1);
      } else {
        setPredictions([]);
      }
    });
  }, [isLoaded, debouncedValue, type, mapCenter?.lat, mapCenter?.lng]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const getPlaceDetails = useCallback(
    (placeId, description) => {
      if (!placesServiceRef.current || !placeId) {
        // Fallback: geocode the description
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(description)}&key=${apiKey}`
        )
          .then((r) => r.json())
          .then((data) => {
            if (data.status === "OK" && data.results?.[0]) {
              const { lat, lng } = data.results[0].geometry.location;
              onSelect?.({ description, lat, lng });
            }
          })
          .catch(() => {});
        return;
      }

      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ["geometry", "formatted_address"],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const desc = place.formatted_address || description;
            onSelect?.({ description: desc, lat, lng });
          } else {
            // Fallback to geocode
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(description)}&key=${apiKey}`
            )
              .then((r) => r.json())
              .then((data) => {
                if (data.status === "OK" && data.results?.[0]) {
                  const { lat, lng } = data.results[0].geometry.location;
                  onSelect?.({ description, lat, lng });
                }
              })
              .catch(() => {});
          }
        }
      );
    },
    [onSelect]
  );

  const handleSelect = useCallback(
    (prediction) => {
      const desc = prediction.description || prediction.structured_formatting?.main_text || "";
      onChange?.(desc);
      setShowDropdown(false);
      setPredictions([]);
      getPlaceDetails(prediction.place_id, desc);
    },
    [onChange, getPlaceDetails]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!showDropdown || predictions.length === 0) {
        if (e.key === "Escape") setShowDropdown(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i < predictions.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : predictions.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0 && predictions[selectedIndex]) {
        e.preventDefault();
        handleSelect(predictions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    },
    [showDropdown, predictions, selectedIndex, handleSelect]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowDropdown(false), 200);
  }, []);

  const handleClear = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onChange?.("");
      setShowDropdown(false);
      setPredictions([]);
    },
    [onChange]
  );

  const hasValue = value && String(value).trim().length > 0;

  if (!isLoaded) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg ${isDark ? "border-gray-600 bg-[#282c34]" : "border-gray-200"} ${className}`}>
        {IconLeft && <IconLeft className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} />}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 text-sm outline-none bg-transparent min-w-0 ${isDark ? "text-white placeholder-gray-500" : "text-gray-600 placeholder-gray-400"} ${inputClassName}`}
        />
        {hasValue ? (
          <button
            type="button"
            onMouseDown={handleClear}
            className={`p-0.5 rounded hover:opacity-70 transition-opacity flex-shrink-0 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        ) : (
          IconRight && <IconRight className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg ${isDark ? "border-gray-600 bg-[#282c34]" : "border-gray-200"} ${showDropdown && predictions.length ? "rounded-b-none border-b-0" : ""}`}
      >
        {IconLeft && <IconLeft className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} />}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => value && setShowDropdown(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`flex-1 text-sm outline-none bg-transparent min-w-0 ${isDark ? "text-white placeholder-gray-500" : "text-gray-600 placeholder-gray-400"} ${inputClassName}`}
        />
        {hasValue ? (
          <button
            type="button"
            onClick={handleClear}
            onMouseDown={handleClear}
            className={`p-0.5 rounded hover:opacity-70 transition-opacity flex-shrink-0 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        ) : (
          IconRight && <IconRight className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
        )}
      </div>

      {showDropdown && (predictions.length > 0 || isLoading) && (
        <div
          className={`absolute top-full left-0 right-0 z-[600] rounded-b-lg border shadow-xl max-h-48 overflow-y-auto border-t-0 ${isDark ? "bg-[#282c34] border-gray-600" : "bg-white border-gray-200"}`}
        >
          {isLoading ? (
            <div className={`px-4 py-3 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading...</div>
          ) : (
            predictions.map((p, i) => (
              <button
                key={p.place_id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(p);
                }}
                className={`w-full text-left px-4 py-2.5 border-b last:border-b-0 transition-colors ${i === selectedIndex ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""} ${isDark ? "border-gray-600 hover:bg-gray-700 text-gray-200" : "border-gray-100 hover:bg-gray-50 text-gray-800"}`}
              >
                <span className="text-sm">{p.description}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
