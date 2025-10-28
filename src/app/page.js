"use client";
import MenuSideBar from '@/components/MenuSideBar';
import FiltersModal from '@/components/FiltersModal';
import { Search, X, Plus, Share2, SlidersHorizontal, Copy, CopyCheck, Menu, List } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from "next/dynamic";
import PropertyDetailModal from '@/components/PropertyDetailModal';
import VisitorTracker from '@/components/VisitorTracker';
import { propertiesData } from '@/data/properties';

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

function Modal({ children, style, onClose, hideClose = false, className = "" }) {
  return (
    <div className="fixed inset-0 bg-black/50 md:bg-transparent z-50 pointer-events-none">
      <div
        className={`absolute rounded-xl shadow-xl pointer-events-auto ${className}`}
        style={style}
      >
        {!hideClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 bg-[#f2f2f2] p-2 rounded-full hover:text-gray-600 z-10 hover:cursor-pointer mt-0 m-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalPos, setModalPos] = useState({ top: 0, right: 0 });
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);



  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPropertyListVisible, setPropertyListVisible] = useState(false);

  const [mapCenter, setMapCenter] = useState({ lat: 17.4200, lng: 78.4867 });
  const [markers, setMarkers] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(11);
  const [, setLocationError] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all'); // 'all', 'commercial', 'residential'

  const [filters, setFilters] = useState({
    type: {
      commercial: false,
      residential: false,
    },
    listedBy: {
      owner: false,
      agent: false,
      iacre: false,
    },
    budget: [0, 30],
    size: [0, 50000],
  });

  const [sizeUnit, setSizeUnit] = useState('Square Yards');

  // Sync propertyTypeFilter with filters.type
  useEffect(() => {
    if (filters.type.commercial && filters.type.residential) {
      setPropertyTypeFilter('all');
    } else if (filters.type.commercial && !filters.type.residential) {
      setPropertyTypeFilter('commercial');
    } else if (!filters.type.commercial && filters.type.residential) {
      setPropertyTypeFilter('residential');
    } else {
      setPropertyTypeFilter('all'); // If none selected, show all
    }
  }, [filters.type]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadProperties = () => {
      console.log('Loading properties:', propertiesData.length);
      console.log('Properties data:', propertiesData.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        coordinates: p.coordinates
      })));
      setMarkers(propertiesData);
    };

    loadProperties();
  }, []);

  // Get user's location on mount (optional - only if user allows)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      console.log('Requesting location access...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success - user allowed location access
          console.log('Location access granted:', position.coords);
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(userLocation);
          setZoomLevel(13);
          setLocationError(null);
        },
        (error) => {
          // Error or user denied - just use default location
          if (error.code === 1) {
            console.log('User denied location access. Using default location.');
          } else if (error.code === 2) {
            console.warn('Location unavailable. Using default location.');
          } else if (error.code === 3) {
            console.warn('Location request timeout. Using default location.');
          }
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation not supported by browser');
      setLocationError('Geolocation not supported');
    }
  }, []);

  const filtersBtnRef = useRef(null);
  const addBtnRef = useRef(null);
  const shareBtnRef = useRef(null);

  // Generate suggestions based on search query
  const generateSuggestions = (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const uniqueLocations = new Set();
    const filteredSuggestions = [];

    markers.forEach(marker => {
      const locations = [
        marker.state_name,
        marker.layer_location,
        marker.location_district
      ].filter(Boolean);

      locations.forEach(location => {
        if (location && location.toLowerCase().includes(query.toLowerCase()) && !uniqueLocations.has(location.toLowerCase())) {
          uniqueLocations.add(location.toLowerCase());
          filteredSuggestions.push({
            text: location,
            marker: marker
          });
        }
      });
    });

    const finalSuggestions = filteredSuggestions.slice(0, 5);
    setSuggestions(finalSuggestions); // Limit to 5 suggestions
    setShowSuggestions(true);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    generateSuggestions(value);
  };



  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setShowSuggestions(false);

    // First check if the search query matches any property location
    const matchingProperty = markers.find(marker =>
      marker.state_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.layer_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.location_district?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingProperty && matchingProperty.position) {
      // If found in properties, zoom to that location
      setMapCenter(matchingProperty.position);
      setZoomLevel(14);
      handleMarkerClick(matchingProperty);
      setSearchQuery("");
      return;
    }

    // If not found in properties, use Google Geocoding API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const pos = { lat, lng };

        // Create a red marker for searched location (not in properties)
        const searchMarker = {
          id: `search-${Date.now()}`,
          layer_location: data.results[0].formatted_address,
          popup_text: 'This is the location you searched for.',
          position: pos,
          isSearchResult: true, // Flag to identify search result markers
        };

        setZoomLevel(14);
        setMapCenter(pos);

        // Remove previous search markers and add new one
        setMarkers(prevMarkers => [
          ...prevMarkers.filter(marker => !marker.isSearchResult),
          searchMarker
        ]);
        setSearchQuery("");
      } else {
        console.error("Geocoding failed:", data.status, data.error_message);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleMarkerClick = (marker) => {
    if (marker.position) {
      setMapCenter(marker.position);
    }
    setSelectedMarker(marker);
    setSelectedCity(marker);
  };

  const closeCityModal = () => {
    setSelectedCity(null);
    setSelectedMarker(null);
  };



  const getFilteredMarkers = () => {
    let filtered = markers;
    console.log('Original markers count:', markers.length);
    console.log('Markers being filtered:', markers.map(m => ({ id: m.id, position: m.position })));

    // Check if any filters are applied
    const hasTypeFilters = filters.type.commercial || filters.type.residential;
    const hasListedByFilters = filters.listedBy.owner || filters.listedBy.agent || filters.listedBy.iacre;
    const hasBudgetFilters = !(filters.budget[0] === 0 && filters.budget[1] === 30);
    const hasSizeFilters = !(filters.size[0] === 0 && filters.size[1] === 50000);

    const hasAnyFilters = hasTypeFilters || hasListedByFilters || hasBudgetFilters || hasSizeFilters;

    // If no filters are applied, show all markers
    if (!hasAnyFilters) {
      return filtered;
    }

    // Apply property type filter (Commercial/Residential buttons) - this is separate from modal filters
    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter(marker => {
        const markerType = marker.propertyType || 'residential';
        return markerType === propertyTypeFilter;
      });
    }

    // Apply modal filters (type, listedBy, budget, size)
    // Apply type filters
    if (hasTypeFilters) {
      filtered = filtered.filter(marker => {
        const markerType = marker.propertyType || 'residential';
        return (
          (filters.type.commercial && markerType === 'commercial') ||
          (filters.type.residential && markerType === 'residential')
        );
      });
    }

    // Apply listed by filter
    if (hasListedByFilters) {
      filtered = filtered.filter(marker => {
        const listedBy = marker.listed_by?.toLowerCase() || 'agent';
        return (
          (filters.listedBy.owner && listedBy === 'owner') ||
          (filters.listedBy.agent && listedBy === 'agent') ||
          (filters.listedBy.iacre && listedBy === 'buildersinfo')
        );
      });
    }

    // Apply budget filter
    if (hasBudgetFilters) {
      filtered = filtered.filter(marker => {
        const priceStr = marker.total_price || '0';
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
        const minBudget = filters.budget[0] * 10000000; // Convert crores to actual price (1 crore = 10,000,000)
        const maxBudget = filters.budget[1] * 10000000;
        return price >= minBudget && price <= maxBudget;
      });
    }

    // Apply size filter
    if (hasSizeFilters) {
      filtered = filtered.filter(marker => {
        const sizeStr = marker.size || '0';
        const size = parseFloat(sizeStr.replace(/[^0-9.]/g, '')) || 0;
        const minSize = filters.size[0];
        const maxSize = filters.size[1];

        // Handle different size units based on the selected unit in the filter
        let sizeInFilterUnit = size;
        if (sizeStr.toLowerCase().includes('sq ft') || sizeStr.toLowerCase().includes('sqft')) {
          // Data is in square feet, convert to filter unit
          if (sizeUnit === 'Square Yards') {
            sizeInFilterUnit = size / 9; // Convert square feet to square yards
          }
          // If filter unit is also square feet, no conversion needed
        } else {
          // Data is in square yards, convert to filter unit
          if (sizeUnit === 'Square Feet') {
            sizeInFilterUnit = size * 9; // Convert square yards to square feet
          }
          // If filter unit is also square yards, no conversion needed
        }

        return sizeInFilterUnit >= minSize && sizeInFilterUnit <= maxSize;
      });
    }

    console.log('Filtered markers count:', filtered.length);
    return filtered;
  };

  const openModal = (modalType, ref) => {
    if (!ref.current) return;

    if (activeModal === modalType) {
      setActiveModal(null);
      return;
    }

    setActiveModal(null);
    setTimeout(() => {
      const rect = ref.current.getBoundingClientRect();
      let pos = { top: rect.bottom + window.scrollY + 8, right: window.innerWidth - rect.right - window.scrollX };

      if (modalType === "add") {
        pos = { top: rect.top + window.scrollY, right: window.innerWidth - rect.left - window.scrollX + 8 };
      } else if (modalType === "share") {
        const addRect = addBtnRef.current?.getBoundingClientRect();
        if (addRect) pos = { top: addRect.top + window.scrollY, right: window.innerWidth - addRect.left - window.scrollX + 8 };
      }

      setModalPos(pos);
      setActiveModal(modalType);
      if (modalType !== "share") setCopied(false);
    }, 150);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://buildersinfo.in/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[90vh] md:h-[87vh] bg-[#1f2229] flex flex-col">
      <VisitorTracker />
      <main className="flex-1 relative flex">
        {isPropertyListVisible && (
          <div className="hidden md:block w-[380px] bg-white shadow-lg overflow-y-auto">
            <div className="p-4 sticky top-0 bg-white z-10 border-b">
              <h2 className="text-xl font-bold text-gray-800">Properties</h2>
              <p className="text-sm text-gray-500">{markers.length} lands found</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {markers.map(marker => (
                <li key={marker.id} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleMarkerClick(marker)}>
                  <div className="flex gap-4">
                    <Image
                      src={marker.images[0] || '/placeholder.png'}
                      alt="Property Image"
                      width={100}
                      height={80}
                      className="rounded-md object-cover w-28 h-20"
                      unoptimized
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{marker.size} in {marker.state_name}</p>
                      <p className="text-sm text-gray-600">{marker.price_per_acre} / Acre</p>
                      <p className="text-sm text-gray-600">Total: {marker.total_price}</p>
                      <p className="text-xs text-gray-400 mt-1">Added on: {marker.date_added}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 relative">
          <form
            onSubmit={handleSearch}
            className="flex absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-10 w-full px-4 md:px-0 md:w-auto"
          >
            <div className="relative w-full md:min-w-80 search-container">
              <div className="bg-white rounded-full pl-5 pr-3 py-1 md:py-2.5 shadow-xl w-full flex items-center gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click events to fire
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  placeholder="Search Location"
                  className="flex-1 outline-none text-gray-700 text-[0.9rem] font-medium placeholder-gray-400"
                />
                <Search
                  className="hidden md:block text-gray-500 w-5 h-5 hover:text-gray-950 hover:cursor-pointer"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      const fakeEvent = { preventDefault: () => { } };
                      handleSearch(fakeEvent);
                    }
                  }}
                />
                <button
                  type="button"
                  className="block md:hidden p-2 rounded-md hover:cursor-pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="w-6 h-6 text-gray-800" />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-20 border border-gray-200">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onMouseDown={async (e) => {
                          e.preventDefault();
                          setSearchQuery(suggestion.text);
                          setShowSuggestions(false);

                          // Automatically trigger search with the suggestion text
                          const searchText = suggestion.text;

                          // First check if the search query matches any property location
                          const matchingProperty = markers.find(marker =>
                            marker.state_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                            marker.layer_location?.toLowerCase().includes(searchText.toLowerCase()) ||
                            marker.location_district?.toLowerCase().includes(searchText.toLowerCase())
                          );

                          if (matchingProperty && matchingProperty.position) {
                            // If found in properties, zoom to that location
                            setMapCenter(matchingProperty.position);
                            setZoomLevel(14);
                            handleMarkerClick(matchingProperty);
                            return;
                          }

                          // If not found in properties, use Google Geocoding API
                          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchText)}&key=${apiKey}`;

                          try {
                            const res = await fetch(url);
                            const data = await res.json();

                            if (data.status === "OK" && data.results && data.results.length > 0) {
                              const { lat, lng } = data.results[0].geometry.location;
                              const pos = { lat, lng };

                              // Create a red marker for searched location (not in properties)
                              const searchMarker = {
                                id: `search-${Date.now()}`,
                                layer_location: data.results[0].formatted_address,
                                popup_text: 'This is the location you searched for.',
                                position: pos,
                                isSearchResult: true,
                              };

                              setZoomLevel(14);
                              setMapCenter(pos);

                              // Remove previous search markers and add new one
                              setMarkers(prevMarkers => [
                                ...prevMarkers.filter(marker => !marker.isSearchResult),
                                searchMarker
                              ]);
                            }
                          } catch (err) {
                            console.error("Search error:", err);
                          }
                        }}
                        className="px-4 py-3 hover:bg-gray-800 hover:text-white cursor-pointer border-b border-gray-100 last:border-b-0 text-gray-700 text-sm transition-all duration-200"
                      >
                        {suggestion.text}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No suggestions for this location
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          <div className="flex absolute top-20 w-full md:w-auto md:top-8 md:right-4 z-10 justify-between md:gap-3 px-5 md:px-0">
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  const newFilter = propertyTypeFilter === 'commercial' ? 'all' : 'commercial';
                  setPropertyTypeFilter(newFilter);

                  // Update filters.type to sync with modal
                  if (newFilter === 'all') {
                    setFilters(prev => ({
                      ...prev,
                      type: { commercial: false, residential: false }
                    }));
                  } else if (newFilter === 'commercial') {
                    setFilters(prev => ({
                      ...prev,
                      type: { commercial: true, residential: false }
                    }));
                  }
                }}
                className="bg-white px-2 py-1 rounded-full shadow-xl flex items-center gap-1.5 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                {propertyTypeFilter === 'commercial' ? (
                  <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 border border-gray-300 rounded"></div>
                )}
                <span className='text-[0.75rem]'>Commercial</span>
              </button>
              <button
                onClick={() => {
                  const newFilter = propertyTypeFilter === 'residential' ? 'all' : 'residential';
                  setPropertyTypeFilter(newFilter);

                  // Update filters.type to sync with modal
                  if (newFilter === 'all') {
                    setFilters(prev => ({
                      ...prev,
                      type: { commercial: false, residential: false }
                    }));
                  } else if (newFilter === 'residential') {
                    setFilters(prev => ({
                      ...prev,
                      type: { commercial: false, residential: true }
                    }));
                  }
                }}
                className="bg-white px-2 py-1 rounded-full shadow-xl flex items-center gap-1.5 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                {propertyTypeFilter === 'residential' ? (
                  <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 border border-gray-300 rounded"></div>
                )}
                <span className='text-[0.75rem]'>Residential</span>
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                ref={filtersBtnRef}
                onClick={() => openModal("filters", filtersBtnRef)}
                className="bg-white px-2 py-1 rounded-full shadow-xl flex items-center gap-1.5 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className='text-[0.75rem]'>Filters</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setPropertyListVisible(!isPropertyListVisible)}
            className="hidden md:flex bg-white p-2.5 rounded-lg shadow-xl absolute bottom-24 left-4 z-10 items-center gap-2 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
          >
            <List className="w-5 h-5" />
          </button>

          <MapView
            center={mapCenter}
            markers={getFilteredMarkers()}
            selectedMarker={selectedMarker}
            onMarkerClick={handleMarkerClick}
            zoom={zoomLevel}
          />

          <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-10">
            <button
              ref={addBtnRef}
              onClick={() => openModal("add", addBtnRef)}
              className="bg-[#ffdd57] hover:cursor-pointer text-slate-800 p-2.5 rounded-lg shadow-xl"
            >
              {activeModal === "add" ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
            <button
              ref={shareBtnRef}
              onClick={() => openModal("share", shareBtnRef)}
              className="bg-white hover:cursor-pointer text-slate-800 p-2.5 rounded-lg shadow-xl transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>

      {isMenuOpen && <MenuSideBar onClose={() => setIsMenuOpen(false)} />}

      {selectedCity && (
        <PropertyDetailModal property={selectedCity} onClose={closeCityModal} />
      )}

      {activeModal === "filters" && (
        <Modal
          style={{ top: modalPos.top + 10, maxWidth: window.innerWidth <= 425 ? 450 : 370, maxHeight: 'calc(100vh - 120px)', "--filters-modal-right": `${((modalPos.right ?? 0))}px`, }}
          onClose={() => setActiveModal(null)}
          className={`p-4 pr-0 bg-white bottom-0 w-full left-0 right-0 max-[425px]:!w-full max-[425px]:!left-0 max-[425px]:!right-0 md:right-[var(--filters-modal-right)] md:w-[90%] md:left-auto md:bottom-auto`}
        >
          <FiltersModal
            filters={filters}
            setFilters={setFilters}
            sizeUnit={sizeUnit}
            setSizeUnit={setSizeUnit}
            onApply={() => setActiveModal(null)}
          />
        </Modal>
      )}



      {activeModal === "add" && (
        <Modal
          style={{ top: modalPos.top + 2, right: modalPos.right, width: 200 }}
          onClose={() => setActiveModal(null)}
          hideClose={true}
          className="bg-[#dddedf]"
        >
          <Link
            href="https://wa.me/+918151915199/?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo."
            className="flex items-center gap-3 text-gray-700 font-medium px-1 py-3 rounded-lg align-middle justify-center bg-[#dddedf] text-[0.9rem]"
          >
            <Image src='/whatsapp.svg' alt='whatsapp' width={24} height={24} /> List My Land (Free)
          </Link>
        </Modal>
      )}

      {activeModal === "share" && (
        <Modal
          style={{ top: modalPos.top - 4, right: modalPos.right + 2 }}
          onClose={() => setActiveModal(null)}
          hideClose={true}
          className="bg-[#dddedf] w-52 md:w-[270px] p-1 md:p-2.5"
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-gray-800 font-medium mb-2 p-2 rounded-sm justify-between w-full text-sm md:text-[0.9rem] hover:cursor-pointer"
          >
            Copy Link
            {copied ? <CopyCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          <Link
            href="https://wa.me/?text=Check%20Verified%20Lands%20on%20Map%20View%3A%20%0A%20https%3A%2F%2Fwww.buildersinfo.in%2F%3Fcenter_lng%3D79.17%26center_lat%3D18.73%26zoom%3D18"
            className="flex items-center text-sm md:text-[0.9rem] gap-2 text-gray-800 font-medium p-2 rounded justify-between"
          >
            Share via WhatsApp <Image src='/whatsapp.svg' alt="whatsapp" width={24} height={24} />
          </Link>
        </Modal>
      )}
    </div>
  );
}