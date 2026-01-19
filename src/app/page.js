"use client";
import MenuSideBar from '@/components/MenuSideBar';
import LoginModal from '@/components/LoginModal';
import { Search, X, Plus, SlidersHorizontal, Menu, List, Check, Heart, Building2, Home, MapPin, ChevronDown, ChevronRight, ChevronLeft, LayoutGrid, Map, Globe, ZoomIn, LocateFixed, Layers, Minus, Sun, Moon, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from "next/dynamic";
import { usePathname } from 'next/navigation';
import PropertyDetailModal from '@/components/PropertyDetailModal';
import VisitorTracker from '@/components/VisitorTracker';
import { getUserLocation } from '@/utils/geolocation';
import { loginUser } from '@/utils/auth';
import { indianCities } from '@/utils/indianCities';
import { useTheme } from '@/context/ThemeContext';

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

function Modal({ children, style, onClose, hideClose = false, className = "", isDark = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 md:bg-transparent z-50 pointer-events-none">
      <div
        className={`absolute rounded-xl shadow-xl pointer-events-auto ${className}`}
        style={style}
      >
        {!hideClose && (
          <button
            onClick={onClose}
            className={`absolute top-3 right-3 p-2 rounded-full z-10 hover:cursor-pointer mt-0 m-1 transition-colors ${isDark ? 'text-gray-400 bg-[#1f2229] hover:text-white hover:bg-[#3a3f4b]' : 'text-gray-500 bg-[#f2f2f2] hover:text-gray-600'}`}
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
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);



  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPropertyListVisible, setPropertyListVisible] = useState(true); // Always visible by default
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false); // Track drawer collapse state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [propertyFavorites, setPropertyFavorites] = useState({}); // Track favorites for each property

  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India as initial
  const [markers, setMarkers] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(5); // Start zoomed out to show India
  const [, setLocationError] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all'); // 'all', 'commercial', 'residential'
  const [listingTypeFilter, setListingTypeFilter] = useState('forSale'); // 'forSale', 'forRent', 'readyToMove', 'newProjects', 'verified'
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [userLocationInfo, setUserLocationInfo] = useState(null);
  const [sortBy, setSortBy] = useState('default');

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
  const [showFiltersView, setShowFiltersView] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [mapType, setMapType] = useState('hybrid'); // 'roadmap', 'satellite', 'hybrid', 'terrain'
  const [showTraffic, setShowTraffic] = useState(false);
  const [searchType, setSearchType] = useState('locality'); // 'locality', 'metro', 'travel'
  const [buildingType, setBuildingType] = useState('commercial'); // 'commercial', 'residential'
  const [showMobileList, setShowMobileList] = useState(false); // For mobile list view toggle
  const [propertyTypes, setPropertyTypes] = useState({
    officeSpace: false,
    coWorking: false,
    shop: false,
    showroom: false,
    godownWarehouse: false,
    industrialShed: false,
    industrialBuilding: false,
    otherBusiness: false,
    restaurantCafe: false,
  });
  const [budgetLumpsum, setBudgetLumpsum] = useState({ min: '', max: '' });
  const [budgetPerSeat, setBudgetPerSeat] = useState({ min: '', max: '' });

  // Handle location updates from VisitorTracker
  const handleLocationUpdate = (locationData) => {
    setMapCenter({ lat: locationData.lat, lng: locationData.lng });
    setZoomLevel(locationData.zoom);
    setUserLocationInfo({
      lat: locationData.lat,
      lng: locationData.lng,
      source: locationData.source
    });
    setIsLoadingLocation(false);
  };

  // Fetch user's location on initial load (fallback)
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const locationData = await getUserLocation();
        setUserLocationInfo(locationData);
        setMapCenter({ lat: locationData.lat, lng: locationData.lng });

        // Set zoom based on location accuracy
        if (locationData.isFallback) {
          setZoomLevel(5); // Zoomed out for India view
        } else if (locationData.isApproximate) {
          setZoomLevel(10); // City-level zoom for IP location
        } else {
          setZoomLevel(13); // Street-level zoom for exact GPS location
        }

        setIsLoadingLocation(false);
      } catch (error) {
        console.error('Error initializing location:', error);
        setLocationError(error.message);
        setIsLoadingLocation(false);
      }
    };

    initializeLocation();
  }, []);

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

  // Initialize current user from localStorage
  useEffect(() => {
    const syncUser = () => {
      try {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        setCurrentUser(null);
      }
    };

    syncUser();
    window.addEventListener('onAuthChange', syncUser);

    return () => {
      window.removeEventListener('onAuthChange', syncUser);
    };
  }, []);

  // Check favorite status for all properties
  useEffect(() => {
    const checkFavorites = async () => {
      const favoritesMap = {};
      
      // Check localStorage first
      try {
        const favourites = JSON.parse(localStorage.getItem('favorites') || '[]');
        markers.forEach(marker => {
          const propertyId = marker._id || marker.id;
          const isFavoritedLocal = favourites.some(fav => (fav._id || fav.id) === propertyId);
          if (isFavoritedLocal) {
            favoritesMap[propertyId] = true;
          }
        });
      } catch (error) {
        console.error("Failed to check favorites from localStorage:", error);
      }

      // If user is logged in, sync with database
      if (currentUser && currentUser.phoneNumber) {
        try {
          const response = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(currentUser.phoneNumber)}`);
          const data = await response.json();
          
          if (data.success && data.data) {
            markers.forEach(marker => {
              const propertyId = marker._id || marker.id;
              const isFavoritedDB = data.data.some(fav => fav.propertyId === propertyId);
              favoritesMap[propertyId] = isFavoritedDB;
            });
          }
        } catch (error) {
          console.error('Error checking favorites from database:', error);
        }
      }

      setPropertyFavorites(favoritesMap);
    };

    if (markers.length > 0) {
      checkFavorites();
    }
  }, [markers, currentUser]);

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
    const loadProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        const result = await response.json();

        console.log("API Response:", result);

        if (result.success && result.data) {
          console.log("Total properties fetched:", result.data.length);

          // Filter only confirmed properties
          const confirmedProperties = result.data.filter(property =>
            property.verificationStatus === 'confirmed'
          );

          console.log("Confirmed properties:", confirmedProperties.length);

          const properties = confirmedProperties.map((property, index) => {
            // Ensure coordinates are in the correct format
            let position = property.position || property.coordinates;
            let parsedPosition = null;

            // Handle different coordinate formats from database
            if (position && (position.latitude || position.lat)) {
              const lat = parseFloat(position.lat || position.latitude);
              const lng = parseFloat(position.lng || position.longitude);

              if (!isNaN(lat) && !isNaN(lng)) {
                parsedPosition = { lat, lng };
              }
            }

            if (!parsedPosition) {
              console.warn(`Property ${property.name || property._id} (Index: ${index}) has no valid coordinates.`);
            }

            return {
              ...property,
              id: property._id || `temp-id-${index}-${Date.now()}`,
              name: property.name || property.propertyName || 'Property Name',
              propertyType: property.propertyType || property.Category?.toLowerCase() || 'residential',
              state_name: property.state_name || property.address?.state || 'Location',
              layer_location: property.layer_location || property.address?.locality || 'Area',
              location_district: property.location_district || property.address?.district || property.address?.city || 'District',
              position: parsedPosition,
              coordinates: parsedPosition,
              images: property.images || ['/placeholder.png'],
              featuredImageUrl: property.featuredImageUrl || property.featuredImage?.url || '/placeholder.png',
              originalPrice: property.originalPrice || '₹XX',
              discountedPrice: property.discountedPrice || '₹XX',
              date_added: property.date_added || 'N/A',
              is_verified: property.is_verified || property.verificationStatus === 'confirmed' || false,
              sellerPhoneNumber: property.sellerPhoneNumber || '+91 XXXXXXXXXX',
              address: typeof property.address === 'string' ? property.address : 'Address not available',
              amenities: property.amenities || [],
              nearbyPlaces: property.nearbyPlaces || { school: [], hospital: [], hotel: [], business: [] },
              floorPlans: property.floorPlans || {},
              ratings: property.ratings || { overall: 0, totalRatings: 0, breakdown: {}, whatsGood: [], whatsBad: [] },
              reviews: property.reviews || [],
              size: property.size || property.propertySize || property.carpetArea || 'N/A',
              price_per_acre: property.price_per_acre || property.price_per_sqft || 'N/A',
              total_price: property.total_price || property.originalPrice || property.discountedPrice || 'N/A'
            };
          });

          setMarkers(properties);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setMarkers([]);
      }
    };

    loadProperties();
  }, []);

  // Location tracking is handled by VisitorTracker component

  // Generate suggestions based on search query
  const generateSuggestions = (query) => {
    // Only show suggestions if query has at least 1 character
    if (!query.trim() || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const uniqueLocations = new Map();
    const filteredSuggestions = [];

    // Indian cities and capitals database
    const indianCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat',
      'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
      'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
      'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
      'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
      'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal',
      'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack',
      'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
      'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
      'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur'
    ];

    const indianStates = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
      'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
      'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    // Check cities and states from the database
    indianCities.forEach(city => {
      if (city.toLowerCase().includes(query.toLowerCase())) {
        const key = city.toLowerCase();
        if (!uniqueLocations.has(key)) {
          uniqueLocations.set(key, true);
          filteredSuggestions.push({
            text: city,
            displayText: `${city}, India`,
            marker: null,
            isProperty: false
          });
        }
      }
    });

    indianStates.forEach(state => {
      if (state.toLowerCase().includes(query.toLowerCase())) {
        const key = state.toLowerCase();
        if (!uniqueLocations.has(key)) {
          uniqueLocations.set(key, true);
          filteredSuggestions.push({
            text: state,
            displayText: `${state}, India`,
            marker: null,
            isProperty: false
          });
        }
      }
    });

    // Also check locations from existing properties
    markers.forEach(marker => {
      // Check state name
      if (marker.state_name && marker.state_name.toLowerCase().includes(query.toLowerCase())) {
        const key = marker.state_name.toLowerCase();
        if (!uniqueLocations.has(key)) {
          uniqueLocations.set(key, true);
          filteredSuggestions.push({
            text: marker.state_name,
            displayText: `${marker.state_name}, India`,
            marker: marker,
            isProperty: false
          });
        }
      }

      // Check district
      if (marker.location_district && marker.location_district.toLowerCase().includes(query.toLowerCase())) {
        const key = marker.location_district.toLowerCase();
        if (!uniqueLocations.has(key)) {
          uniqueLocations.set(key, true);
          filteredSuggestions.push({
            text: marker.location_district,
            displayText: `${marker.location_district}, India`,
            marker: marker,
            isProperty: false
          });
        }
      }

      // Check layer location
      if (marker.layer_location && marker.layer_location.toLowerCase().includes(query.toLowerCase())) {
        const key = marker.layer_location.toLowerCase();
        if (!uniqueLocations.has(key)) {
          uniqueLocations.set(key, true);
          filteredSuggestions.push({
            text: marker.layer_location,
            displayText: `${marker.layer_location}, India`,
            marker: marker,
            isProperty: false
          });
        }
      }
    });

    const finalSuggestions = filteredSuggestions.slice(0, 5);
    setSuggestions(finalSuggestions);
    setShowSuggestions(true); // Always show dropdown when query has 1+ characters
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

  const handleLoginSuccess = (userData) => {
    const userWithPhone = {
      ...userData,
      phoneNumber: userData.phoneNumber || userData.phone || userData.userPhoneNumber || null
    };
    loginUser(userWithPhone);
    setCurrentUser(userWithPhone);
    setIsLoginModalOpen(false);
  };

  const handleFavouriteToggle = async (marker) => {
    // Check if user is logged in
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    const propertyId = marker._id || marker.id;
    const propertyType = marker.propertyType || 'commercial';
    const newFavoriteState = !propertyFavorites[propertyId];

    // Optimistically update UI
    setPropertyFavorites(prev => ({
      ...prev,
      [propertyId]: newFavoriteState
    }));

    // Update localStorage
    try {
      const favourites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (newFavoriteState) {
        // Add to favourites
        const exists = favourites.some(fav => (fav._id || fav.id) === propertyId);
        if (!exists) {
          favourites.push({ _id: propertyId, id: propertyId });
          localStorage.setItem('favorites', JSON.stringify(favourites));
        }
      } else {
        // Remove from favourites
        const updatedFavourites = favourites.filter(fav => (fav._id || fav.id) !== propertyId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavourites));
      }
    } catch (error) {
      console.error("Failed to update favourites:", error);
    }

    // Sync with database
    if (currentUser.phoneNumber) {
      try {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPhoneNumber: currentUser.phoneNumber,
            propertyId: propertyId,
            propertyType: propertyType,
            action: newFavoriteState ? 'add' : 'remove',
          }),
        });

        const data = await response.json();

        if (!data.success) {
          // Revert UI if API call failed
          setPropertyFavorites(prev => ({
            ...prev,
            [propertyId]: !newFavoriteState
          }));
          alert('Failed to update favorite. Please try again.');
        }
      } catch (error) {
        console.error('Error updating favorite:', error);
        // Revert UI if API call failed
        setPropertyFavorites(prev => ({
          ...prev,
          [propertyId]: !newFavoriteState
        }));
        alert('Failed to update favorite. Please try again.');
      }
    }
  };


  // Calculate prices based on property type (same logic as PropertyDetailModal)
  const calculatePropertyPrices = (property) => {
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
    
    // If still no price, try to use existing price fields
    if (originalPriceValue === 0) {
      if (property.originalPrice && property.originalPrice !== '₹XX' && property.originalPrice !== 'N/A') {
        const priceMatch = property.originalPrice.toString().match(/[\d,]+/);
        if (priceMatch) {
          originalPriceValue = parseFloat(priceMatch[0].replace(/,/g, '')) || 0;
        }
      } else if (property.total_price && property.total_price !== 'N/A') {
        const priceMatch = property.total_price.toString().match(/[\d,]+/);
        if (priceMatch) {
          originalPriceValue = parseFloat(priceMatch[0].replace(/,/g, '')) || 0;
        }
      }
    }
    
    // Calculate discounted price (5% off = 95% of original)
    const discountedPriceValue = originalPriceValue * 0.95;
    
    // Format prices
    const formatPrice = (price) => {
      if (price === 0) return null;
      return `₹${Math.round(price).toLocaleString('en-IN')}`;
    };
    
    return {
      originalPrice: formatPrice(originalPriceValue),
      discountedPrice: formatPrice(discountedPriceValue)
    };
  };

  const getFilteredMarkers = () => {
    let filtered = markers;

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

    return filtered;
  };

  return (
    <div className={`h-screen md:h-[87vh] flex flex-col relative transition-colors ${isDark ? 'bg-[#1f2229]' : 'bg-gray-100'}`}>
      <VisitorTracker onLocationUpdate={handleLocationUpdate} />
      
      {/* Scrollbar Styles for Mobile Modals */}
      <style dangerouslySetInnerHTML={{__html: `
        .mobile-modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .mobile-modal-scroll::-webkit-scrollbar-track {
          background: ${isDark ? '#2d3139' : '#f1f5f9'};
          border-radius: 10px;
        }
        .mobile-modal-scroll::-webkit-scrollbar-thumb {
          background: ${isDark ? '#4b5563' : '#cbd5e1'};
          border-radius: 10px;
        }
        .mobile-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#6b7280' : '#94a3b8'};
        }
      `}} />
      
      {/* Mobile Header - Only visible on screens < 480px */}
      <div className={`md:hidden sticky top-0 z-50 transition-colors ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}>
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left: Logo + India */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/logo.png" width={80} height={40} className="w-20 h-auto" alt="Logo" />
            </Link>
            <div className="flex items-center gap-1">
              <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>India</span>
            </div>
          </div>
          
          {/* Right: Theme Toggle + Menu/Profile pill */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`hover:cursor-pointer p-1.5 rounded-full transition-colors ${isDark ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {isDark ? (
                <Sun className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Moon className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
            {/* Menu + Profile Pill Button */}
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full transition-colors ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-300 bg-white'}`}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:cursor-pointer"
              >
                <Menu className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => {
                  if (currentUser) {
                    window.location.href = '/dashboard';
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="hover:cursor-pointer flex items-center justify-center"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <User className="w-4 h-4 text-blue-600" strokeWidth={2} fill="none" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Floating on map with gap from header */}
      <div className="md:hidden absolute top-20 left-0 right-0 z-40 px-3">
        <form onSubmit={handleSearch} className="relative search-container">
          <div className={`rounded-full pl-4 pr-3 py-2.5 w-full flex items-center gap-2 shadow-lg transition-colors ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}>
            <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsSearchFocused(false);
                  setShowSuggestions(false);
                }, 150);
              }}
              placeholder="Search 'Kora'"
              className={`flex-1 outline-none text-sm font-medium bg-transparent mobile-search-input-field ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-700 placeholder:text-gray-400'}`}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            />
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCitySelector(false);
                  setShowFiltersView(true);
                }}
                className={`transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFiltersView(false);
                  setShowCitySelector(true);
                }}
                className={`transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && (
            <div className={`absolute top-full left-0 right-0 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-50 border transition-colors ${isDark ? 'bg-[#282c34] border-gray-700' : 'bg-white border-gray-200'}`}>
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onMouseDown={async (e) => {
                      e.preventDefault();
                      setSearchQuery(suggestion.text);
                      setShowSuggestions(false);

                      const searchText = suggestion.text;

                      const matchingProperty = markers.find(marker =>
                        marker.state_name?.toLowerCase() === searchText.toLowerCase() ||
                        marker.layer_location?.toLowerCase() === searchText.toLowerCase() ||
                        marker.location_district?.toLowerCase() === searchText.toLowerCase()
                      );

                      if (matchingProperty && matchingProperty.position) {
                        setMapCenter(matchingProperty.position);
                        setZoomLevel(12);
                        setSearchQuery("");
                        return;
                      }

                      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchText)}&key=${apiKey}`;

                      try {
                        const res = await fetch(url);
                        const data = await res.json();

                        if (data.status === "OK" && data.results && data.results.length > 0) {
                          const { lat, lng } = data.results[0].geometry.location;
                          const pos = { lat, lng };

                          setZoomLevel(12);
                          setMapCenter(pos);
                          setSearchQuery("");
                        }
                      } catch (err) {
                        console.error("Search error:", err);
                      }
                    }}
                    className={`px-3 py-2 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${isDark ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-100 border-gray-100'}`}
                  >
                    <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{suggestion.displayText}</div>
                  </div>
                ))
              ) : (
                <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <main className="flex-1 relative flex pb-16 md:pb-0">
        <div className="hidden md:block relative">
          <div className={`${isDrawerCollapsed ? 'w-0 overflow-hidden' : 'w-[380px]'} shadow-lg flex flex-col transition-all duration-300 h-full ${isDark ? 'bg-[#1f2229]' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-20 px-4 pt-4 pb-4 ${isDrawerCollapsed ? 'hidden' : ''} ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative search-container">
                  <div className={`rounded-full pl-4 pr-3 py-3 w-full flex items-center gap-3 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <Search className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div className="flex-1 flex items-center gap-1.5 min-w-0 relative">
                      <span className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Search</span>
                      <div className="flex-1 relative min-w-0" onClick={() => {
                        if (!isSearchFocused) {
                          const input = document.querySelector('.search-input-field');
                          if (input) {
                            input.focus();
                            setIsSearchFocused(true);
                          }
                        }
                      }}>
                        {searchQuery && !isSearchFocused && (
                          <span className={`text-sm font-medium cursor-text pointer-events-none ${isDark ? 'text-white' : 'text-gray-700'}`}>"{searchQuery}"</span>
                        )}
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          onFocus={() => {
                            setIsSearchFocused(true);
                            setShowSuggestions(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setIsSearchFocused(false);
                              setShowSuggestions(false);
                            }, 150);
                          }}
                          placeholder=""
                          className={`w-full outline-none text-sm font-medium bg-transparent search-input-field ${isDark ? 'text-white' : 'text-gray-700'} ${
                            searchQuery && !isSearchFocused ? 'absolute inset-0 opacity-0' : ''
                          }`}
                          style={{ background: 'transparent', border: 'none', padding: 0 }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCitySelector(false);
                          setShowFiltersView(true);
                        }}
                        className={`transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowFiltersView(false);
                          setShowCitySelector(true);
                        }}
                        className={`transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Globe className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className={`absolute top-full left-0 right-0 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-500 border ${isDark ? 'bg-[#282c34] border-gray-700' : 'bg-white border-gray-200'}`}>
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onMouseDown={async (e) => {
                              e.preventDefault();
                              setSearchQuery(suggestion.text);
                              setShowSuggestions(false);

                              const searchText = suggestion.text;

                              const matchingProperty = markers.find(marker =>
                                marker.state_name?.toLowerCase() === searchText.toLowerCase() ||
                                marker.layer_location?.toLowerCase() === searchText.toLowerCase() ||
                                marker.location_district?.toLowerCase() === searchText.toLowerCase()
                              );

                              if (matchingProperty && matchingProperty.position) {
                                setMapCenter(matchingProperty.position);
                                setZoomLevel(12);
                                setSearchQuery("");
                                return;
                              }

                              const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                              const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchText)}&key=${apiKey}`;

                              try {
                                const res = await fetch(url);
                                const data = await res.json();

                                if (data.status === "OK" && data.results && data.results.length > 0) {
                                  const { lat, lng } = data.results[0].geometry.location;
                                  const pos = { lat, lng };

                                  setZoomLevel(12);
                                  setMapCenter(pos);
                                  setSearchQuery("");
                                }
                              } catch (err) {
                                console.error("Search error:", err);
                              }
                            }}
                            className={`px-4 py-2.5 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${isDark ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-100 border-gray-100'}`}
                          >
                            <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{suggestion.displayText}</div>
                          </div>
                        ))
                      ) : (
                        <div className={`px-4 py-2.5 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {!showFiltersView && !showCitySelector && (
                <>
                  {/* Category Filters - Segmented Control */}
                  <div className={`rounded-full p-1 flex mb-4 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <button
                      onClick={() => {
                        setPropertyTypeFilter('all');
                        setFilters(prev => ({
                          ...prev,
                          type: { commercial: false, residential: false }
                        }));
                      }}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        propertyTypeFilter === 'all'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setPropertyTypeFilter('commercial');
                        setFilters(prev => ({
                          ...prev,
                          type: { commercial: true, residential: false }
                        }));
                      }}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                        propertyTypeFilter === 'commercial'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Commercial
                    </button>
                    <button
                      onClick={() => {
                        setPropertyTypeFilter('residential');
                        setFilters(prev => ({
                          ...prev,
                          type: { commercial: false, residential: true }
                        }));
                      }}
                      className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                        propertyTypeFilter === 'residential'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      Residential
                    </button>
                  </div>

                  {/* Listing Type Filters */}
                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setListingTypeFilter('forSale')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'forSale'
                          ? 'bg-gray-800 text-white'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      onClick={() => setListingTypeFilter('forRent')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'forRent'
                          ? 'bg-gray-800 text-white'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      For Rent
                    </button>
                    <button
                      onClick={() => setListingTypeFilter('readyToMove')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'readyToMove'
                          ? 'bg-gray-800 text-white'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Ready to Move
                    </button>
                    <button
                      onClick={() => setListingTypeFilter('newProjects')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'newProjects'
                          ? 'bg-gray-800 text-white'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      New Projects
                    </button>
                  </div>

                  {/* Properties Count and Sort */}
                  <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className="text-sm">
                      <span className="text-orange-500 font-medium">{getFilteredMarkers().length} {getFilteredMarkers().length === 1 ? 'property' : 'properties'}</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}> found</span>
                    </p>
                    <button className={`flex items-center gap-1 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                      <span>Sort by</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* City Selector View */}
            {showCitySelector ? (
              <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#1f2229]' : 'bg-white'} ${isDrawerCollapsed ? 'hidden' : ''}`}>
                {/* City Selector Header */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10 ${isDark ? 'border-gray-700 bg-[#1f2229]' : 'border-gray-200 bg-white'}`}>
                  <button 
                    onClick={() => setShowCitySelector(false)}
                    className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Country/City</h2>
                </div>

                {/* Search Input */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-300 bg-white'}`}>
                    <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input 
                      type="text" 
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder="Select or type your city"
                      className={`flex-1 text-sm outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                  </div>
                </div>

                {/* Detect Location and Reset City */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={async () => {
                      try {
                        const locationData = await getUserLocation();
                        setMapCenter({ lat: locationData.lat, lng: locationData.lng });
                        if (locationData.isApproximate) {
                          setZoomLevel(10);
                        } else {
                          setZoomLevel(13);
                        }
                        setShowCitySelector(false);
                      } catch (error) {
                        console.error('Error detecting location:', error);
                      }
                    }}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Detect my location</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCity(null);
                      setSelectedMarker(null);
                      setMapCenter({ lat: 20.5937, lng: 78.9629 });
                      setZoomLevel(5);
                      setShowCitySelector(false);
                    }}
                    className={`text-sm transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Reset City
                  </button>
                </div>

                {/* Top Cities Section */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Cities</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      'Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                      'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'
                    ].filter(city => 
                      !citySearchQuery || city.toLowerCase().includes(citySearchQuery.toLowerCase())
                    ).map(city => (
                      <button
                        key={city}
                        onClick={async () => {
                          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ', India')}&key=${apiKey}`;
                          
                          try {
                            const res = await fetch(url);
                            const data = await res.json();
                            
                            if (data.status === "OK" && data.results && data.results.length > 0) {
                              const { lat, lng } = data.results[0].geometry.location;
                              setMapCenter({ lat, lng });
                              setZoomLevel(12);
                              setShowCitySelector(false);
                              setCitySearchQuery('');
                            }
                          } catch (err) {
                            console.error("Error geocoding city:", err);
                          }
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-[#282c34]' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                          <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className={`text-xs text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{city}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Cities Section */}
                <div className="px-4 py-4">
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Other Cities</h3>
                  <div className="space-y-0 max-h-[400px] overflow-y-auto">
                    {[...new Set(indianCities)]
                      .filter(city => 
                        !citySearchQuery || city.toLowerCase().includes(citySearchQuery.toLowerCase())
                      )
                      .filter(city => 
                        !['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                          'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'].includes(city)
                      )
                      .sort((a, b) => a.localeCompare(b))
                      .map(city => (
                        <button
                          key={city}
                          onClick={async () => {
                            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ', India')}&key=${apiKey}`;
                            
                            try {
                              const res = await fetch(url);
                              const data = await res.json();
                              
                              if (data.status === "OK" && data.results && data.results.length > 0) {
                                const { lat, lng } = data.results[0].geometry.location;
                                setMapCenter({ lat, lng });
                                setZoomLevel(12);
                                setShowCitySelector(false);
                                setCitySearchQuery('');
                              }
                            } catch (err) {
                              console.error("Error geocoding city:", err);
                            }
                          }}
                          className={`w-full px-0 py-3 text-left text-sm transition-colors cursor-pointer border-b last:border-b-0 ${isDark ? 'text-gray-300 hover:text-white hover:bg-[#282c34] border-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-100'}`}
                        >
                          {city}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : showFiltersView ? (
              <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#1f2229]' : 'bg-white'} ${isDrawerCollapsed ? 'hidden' : ''}`}>
                {/* Filters Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setShowFiltersView(false);
                        setShowCitySelector(false);
                      }}
                      className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filters</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchType('locality');
                      setBuildingType('commercial');
                      setPropertyTypes({
                        officeSpace: false, coWorking: false, shop: false, showroom: false,
                        godownWarehouse: false, industrialShed: false, industrialBuilding: false,
                        otherBusiness: false, restaurantCafe: false,
                      });
                      setBudgetLumpsum({ min: '', max: '' });
                      setBudgetPerSeat({ min: '', max: '' });
                    }}
                    className="text-blue-500 text-sm font-medium hover:text-blue-600 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                {/* Filters Content */}
                <div className="p-4 space-y-6">
                  {/* Search Type */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Search Type</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSearchType('locality')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          searchType === 'locality'
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Locality
                      </button>
                      <button
                        onClick={() => setSearchType('metro')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          searchType === 'metro'
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Along Metro
                      </button>
                      <button
                        onClick={() => setSearchType('travel')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          searchType === 'travel'
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Travel time
                      </button>
                    </div>
                  </div>

                  {/* Search Localities Input */}
                  <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200'}`}>
                    <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input 
                      type="text" 
                      placeholder="Search upto 3 localities or landmarks"
                      className={`flex-1 text-sm outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-600 placeholder-gray-400'}`}
                    />
                    <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>

                  {/* Building Type */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Building Type</h3>
                    <div className={`rounded-full p-1 flex ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                      <button
                        onClick={() => setBuildingType('commercial')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          buildingType === 'commercial'
                            ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                            : isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Commercial
                      </button>
                      <button
                        onClick={() => setBuildingType('residential')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          buildingType === 'residential'
                            ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                            : isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        Residential
                      </button>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Type</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'officeSpace', label: 'Office Space' },
                        { key: 'coWorking', label: 'Co-Working' },
                        { key: 'shop', label: 'Shop' },
                        { key: 'showroom', label: 'Showroom' },
                        { key: 'godownWarehouse', label: 'Godown/Warehouse' },
                        { key: 'industrialShed', label: 'Industrial Shed' },
                        { key: 'industrialBuilding', label: 'Industrial Building' },
                        { key: 'otherBusiness', label: 'Other business' },
                        { key: 'restaurantCafe', label: 'Restaurant/Cafe' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                          <div 
                            onClick={() => setPropertyTypes(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              propertyTypes[item.key] 
                                ? 'bg-blue-500 border-blue-500' 
                                : isDark ? 'border-gray-600' : 'border-gray-300'
                            }`}
                          >
                            {propertyTypes[item.key] && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget (lumsum) */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Budget (lumsum)</h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <select 
                          value={budgetLumpsum.min}
                          onChange={(e) => setBudgetLumpsum(prev => ({ ...prev, min: e.target.value }))}
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                          <option value="">Min</option>
                          <option value="5">₹5 Lac</option>
                          <option value="10">₹10 Lac</option>
                          <option value="25">₹25 Lac</option>
                          <option value="50">₹50 Lac</option>
                          <option value="100">₹1 Cr</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <select 
                          value={budgetLumpsum.max}
                          onChange={(e) => setBudgetLumpsum(prev => ({ ...prev, max: e.target.value }))}
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                          <option value="">Max</option>
                          <option value="25">₹25 Lac</option>
                          <option value="50">₹50 Lac</option>
                          <option value="100">₹1 Cr</option>
                          <option value="200">₹2 Cr</option>
                          <option value="500">₹5 Cr</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Budget (per seat) */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Budget (per seat)</h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <select 
                          value={budgetPerSeat.min}
                          onChange={(e) => setBudgetPerSeat(prev => ({ ...prev, min: e.target.value }))}
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                          <option value="">Min</option>
                          <option value="5000">₹5,000</option>
                          <option value="7500">₹7,500</option>
                          <option value="10000">₹10,000</option>
                          <option value="15000">₹15,000</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <select 
                          value={budgetPerSeat.max}
                          onChange={(e) => setBudgetPerSeat(prev => ({ ...prev, max: e.target.value }))}
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                          <option value="">Max</option>
                          <option value="10000">₹10,000</option>
                          <option value="15000">₹15,000</option>
                          <option value="20000">₹20,000</option>
                          <option value="25000">₹25,000</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply Filters Button */}
                <div className={`sticky bottom-0 p-4 border-t ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-200'}`}>
                  <button 
                    onClick={() => setShowFiltersView(false)}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            ) : !showCitySelector ? (
              /* Property List */
              <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${isDark ? 'bg-[#1f2229]' : 'bg-gray-50'} ${isDrawerCollapsed ? 'hidden' : ''}`}>
                {getFilteredMarkers().map(marker => (
                  <div 
                    key={marker.id} 
                    className={`rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow shadow-sm ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={marker.featuredImageUrl || marker.images?.[0] || '/placeholder.png'}
                          alt={marker.name || "Property Image"}
                          width={90}
                          height={90}
                          className="rounded-lg object-cover w-20 h-20"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className={`font-semibold text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {marker.name || 'Property Name'}
                            </h3>
                            {marker.is_verified && (
                              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                <path d="M12 1L14.4 4.2L18.3 3.4L18.1 7.4L21.6 9.2L19.4 12.5L21.6 15.8L18.1 17.6L18.3 21.6L14.4 20.8L12 24L9.6 20.8L5.7 21.6L5.9 17.6L2.4 15.8L4.6 12.5L2.4 9.2L5.9 7.4L5.7 3.4L9.6 4.2L12 1Z" fill="#FBBF24"/>
                                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFavouriteToggle(marker);
                              }}
                              className={`p-1 rounded-full transition-colors ${
                                propertyFavorites[marker._id || marker.id]
                                  ? 'text-red-500'
                                  : isDark ? 'text-gray-500 hover:text-red-500' : 'text-gray-300 hover:text-red-500'
                              }`}
                            >
                              <Heart 
                                className="w-4 h-4" 
                                fill={propertyFavorites[marker._id || marker.id] ? "currentColor" : "none"} 
                                strokeWidth={2} 
                              />
                            </button>
                            <a
                              href={`https://wa.me/${marker.sellerPhoneNumber?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(marker.name || 'this property')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                            </a>
                          </div>
                        </div>
                        <p className={`text-xs mb-1.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>in {marker.layer_location || marker.location_district || marker.state_name}</span>
                          {marker.location_district && marker.layer_location && marker.location_district !== marker.layer_location && (
                            <span>, {marker.location_district}</span>
                          )}
                          {marker.state_name && (
                            <span>, {marker.state_name}</span>
                          )}
                        </p>
                        {(() => {
                          const prices = calculatePropertyPrices(marker);
                          if (prices.discountedPrice) {
                            return (
                              <p className="text-sm">
                                <span className="font-bold text-orange-500">{prices.discountedPrice}</span>
                                {prices.originalPrice && prices.originalPrice !== prices.discountedPrice && (
                                  <span className={`line-through ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{prices.originalPrice}</span>
                                )}
                              </p>
                            );
                          } else if (marker.price_per_acre && marker.price_per_acre !== 'N/A') {
                            return (
                              <p className="text-sm">
                                <span className="font-bold text-orange-500">{marker.price_per_acre}</span>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/sq.ft</span>
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          
          {/* Toggle Button - positioned relative to drawer container */}
          <button
            onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
            className={`absolute ${isDrawerCollapsed ? 'left-0' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 text-white px-2 py-4 rounded-r-lg shadow-lg transition-all duration-300 cursor-pointer`}
            style={isDrawerCollapsed ? { borderRadius: '0 0.5rem 0.5rem 0' } : {}}
            aria-label={isDrawerCollapsed ? "Expand drawer" : "Collapse drawer"}
          >
            {isDrawerCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="flex-1 relative">
          <MapView
            center={mapCenter}
            markers={getFilteredMarkers()}
            selectedMarker={selectedMarker}
            onMarkerClick={handleMarkerClick}
            zoom={zoomLevel}
            mapType={mapType}
            showTraffic={showTraffic}
            hideLayerButton={true}
          />

          {/* Mobile List View Button - Bottom Left above footer */}
          <button
            onClick={() => setShowMobileList(!showMobileList)}
            className="md:hidden absolute bottom-16 left-3 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">List View</span>
          </button>

          {/* Map Controls - Vertical Panel - Same as desktop */}
          <div className="absolute bottom-16 md:bottom-6 right-3 md:right-4 z-10">
            <div className={`rounded-lg overflow-hidden shadow-xl ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
              {/* Add Property Button */}
              <button
                onClick={() => setShowAddPropertyModal(true)}
                className={`w-10 h-10 md:w-12 md:h-12 transition-colors flex items-center justify-center cursor-pointer border-b ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b] border-gray-700' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'}`}
                title="Add Your Property"
              >
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${isDark ? 'border-white' : 'border-black'}`}>
                  <Plus className={`w-3 h-3 md:w-4 md:h-4 ${isDark ? 'text-white' : 'text-black'}`} />
                </div>
              </button>

              {/* Locate Me Button */}
              <button
                onClick={async () => {
                  try {
                    const locationData = await getUserLocation();
                    setMapCenter({ lat: locationData.lat, lng: locationData.lng });
                    if (locationData.isApproximate) {
                      setZoomLevel(10);
                    } else {
                      setZoomLevel(13);
                    }
                  } catch (error) {
                    console.error('Error detecting location:', error);
                  }
                }}
                className={`w-10 h-10 md:w-12 md:h-12 transition-colors flex items-center justify-center cursor-pointer border-b ${isDark ? 'bg-[#1f2229] hover:bg-[#282c34] border-gray-700' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
                title="Locate Me"
              >
                <LocateFixed className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              </button>

              {/* Layers Button */}
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className={`w-10 h-10 md:w-12 md:h-12 transition-colors flex items-center justify-center cursor-pointer ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="Map Layers"
              >
                <Layers className={`w-4 h-4 md:w-5 md:h-5 ${isDark ? 'text-white' : 'text-black'}`} />
              </button>
            </div>

            {/* Layer Menu */}
            {showLayerMenu && (
              <div className={`absolute bottom-full right-0 mb-2 rounded-lg shadow-xl p-3 w-40 md:w-48 ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}>
                <h3 className={`text-xs md:text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Map Type</h3>
                <div className="space-y-1 mb-3">
                  {[
                    { id: "roadmap", name: "Default", icon: "🗺️" },
                    { id: "satellite", name: "Satellite", icon: "🛰️" },
                    { id: "hybrid", name: "Hybrid", icon: "🌍" },
                    { id: "terrain", name: "Terrain", icon: "⛰️" }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setMapType(type.id);
                        setShowLayerMenu(false);
                      }}
                      className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm transition-colors flex items-center gap-2 ${
                        mapType === type.id
                          ? "bg-blue-600/20 text-blue-400 font-medium"
                          : isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.name}</span>
                      {mapType === type.id && (
                        <svg className="w-3 h-3 md:w-4 md:h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className={`border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xs md:text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Layers</h3>
                  <button
                    onClick={() => {
                      setShowTraffic(!showTraffic);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm transition-colors flex items-center gap-2 ${
                      showTraffic
                        ? "bg-blue-600/20 text-blue-400 font-medium"
                        : isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>🚦</span>
                    <span>Traffic</span>
                    {showTraffic && (
                      <svg className="w-3 h-3 md:w-4 md:h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
      {showFiltersView && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setShowFiltersView(false);
            setShowCitySelector(false);
          }}></div>
          
          {/* Modal Content */}
          <div className={`relative w-full rounded-t-3xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: '90vh' }}>
            {/* Drag Handle */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>

            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto mobile-modal-scroll flex-1" 
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? '#4b5563 #2d3139' : '#cbd5e1 #f1f5f9'
              }}
            >
              {/* Filters Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setShowFiltersView(false);
                      setShowCitySelector(false);
                    }}
                    className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Filters</h2>
                </div>
                <button 
                  onClick={() => {
                    setSearchType('locality');
                    setBuildingType('commercial');
                    setPropertyTypes({
                      officeSpace: false, coWorking: false, shop: false, showroom: false,
                      godownWarehouse: false, industrialShed: false, industrialBuilding: false,
                      otherBusiness: false, restaurantCafe: false,
                    });
                    setBudgetLumpsum({ min: '', max: '' });
                    setBudgetPerSeat({ min: '', max: '' });
                  }}
                  className="text-blue-500 text-sm font-medium hover:text-blue-600 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              {/* Filters Content */}
              <div className="p-4 space-y-6 pb-24">
            {/* Search Type */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Search Type</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchType('locality')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    searchType === 'locality'
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Locality
                </button>
                <button
                  onClick={() => setSearchType('metro')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    searchType === 'metro'
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Along Metro
                </button>
                <button
                  onClick={() => setSearchType('travel')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    searchType === 'travel'
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Travel time
                </button>
              </div>
            </div>

            {/* Search Localities Input */}
            <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200'}`}>
              <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                type="text" 
                placeholder="Search upto 3 localities or landmarks"
                className={`flex-1 text-sm outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-600 placeholder-gray-400'}`}
              />
              <LocateFixed className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>

            {/* Building Type */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Building Type</h3>
              <div className={`rounded-full p-1 flex ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setBuildingType('commercial')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    buildingType === 'commercial'
                      ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Commercial
                </button>
                <button
                  onClick={() => setBuildingType('residential')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    buildingType === 'residential'
                      ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  Residential
                </button>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'officeSpace', label: 'Office Space' },
                  { key: 'coWorking', label: 'Co-Working' },
                  { key: 'shop', label: 'Shop' },
                  { key: 'showroom', label: 'Showroom' },
                  { key: 'godownWarehouse', label: 'Godown/Warehouse' },
                  { key: 'industrialShed', label: 'Industrial Shed' },
                  { key: 'industrialBuilding', label: 'Industrial Building' },
                  { key: 'otherBusiness', label: 'Other business' },
                  { key: 'restaurantCafe', label: 'Restaurant/Cafe' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <div 
                      onClick={() => setPropertyTypes(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                        propertyTypes[item.key] 
                          ? 'bg-blue-500 border-blue-500' 
                          : isDark ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      {propertyTypes[item.key] && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget (lumsum) */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Budget (lumsum)</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <select 
                    value={budgetLumpsum.min}
                    onChange={(e) => setBudgetLumpsum(prev => ({ ...prev, min: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    <option value="">Min</option>
                    <option value="5">₹5 Lac</option>
                    <option value="10">₹10 Lac</option>
                    <option value="25">₹25 Lac</option>
                    <option value="50">₹50 Lac</option>
                    <option value="100">₹1 Cr</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select 
                    value={budgetLumpsum.max}
                    onChange={(e) => setBudgetLumpsum(prev => ({ ...prev, max: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    <option value="">Max</option>
                    <option value="25">₹25 Lac</option>
                    <option value="50">₹50 Lac</option>
                    <option value="100">₹1 Cr</option>
                    <option value="200">₹2 Cr</option>
                    <option value="500">₹5 Cr</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget (per seat) */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Budget (per seat)</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <select 
                    value={budgetPerSeat.min}
                    onChange={(e) => setBudgetPerSeat(prev => ({ ...prev, min: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    <option value="">Min</option>
                    <option value="5000">₹5,000</option>
                    <option value="7500">₹7,500</option>
                    <option value="10000">₹10,000</option>
                    <option value="15000">₹15,000</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select 
                    value={budgetPerSeat.max}
                    onChange={(e) => setBudgetPerSeat(prev => ({ ...prev, max: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    <option value="">Max</option>
                    <option value="10000">₹10,000</option>
                    <option value="15000">₹15,000</option>
                    <option value="20000">₹20,000</option>
                    <option value="25000">₹25,000</option>
                  </select>
                </div>
              </div>
            </div>
            </div>
            </div>

            {/* Apply Filters Button */}
            <div className={`flex-shrink-0 p-4 pb-20 border-t ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-200'}`}>
              <button 
                onClick={() => setShowFiltersView(false)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile City Selector Modal */}
      {showCitySelector && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCitySelector(false)}></div>
          
          {/* Modal Content */}
          <div className={`relative w-full rounded-t-3xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: '90vh' }}>
            {/* Drag Handle */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>

            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto mobile-modal-scroll flex-1" 
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? '#4b5563 #2d3139' : '#cbd5e1 #f1f5f9'
              }}
            >
              {/* City Selector Header */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  onClick={() => setShowCitySelector(false)}
                  className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Country/City</h2>
                <div className="ml-auto">
                  <button
                    onClick={() => setShowCitySelector(false)}
                    className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-300 bg-white'}`}>
              <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                type="text" 
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="Select or type your city"
                className={`flex-1 text-sm outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
              />
            </div>
          </div>

          {/* Detect Location and Reset City */}
          <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={async () => {
                try {
                  const locationData = await getUserLocation();
                  setMapCenter({ lat: locationData.lat, lng: locationData.lng });
                  if (locationData.isApproximate) {
                    setZoomLevel(10);
                  } else {
                    setZoomLevel(13);
                  }
                  setShowCitySelector(false);
                } catch (error) {
                  console.error('Error detecting location:', error);
                }
              }}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <LocateFixed className="w-4 h-4" />
              <span className="text-sm font-medium">Detect my location</span>
            </button>
            <button
              onClick={() => {
                setSelectedCity(null);
                setSelectedMarker(null);
                setMapCenter({ lat: 20.5937, lng: 78.9629 });
                setZoomLevel(5);
                setShowCitySelector(false);
              }}
              className={`text-sm transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Reset City
            </button>
          </div>

          {/* Top Cities Section */}
          <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Cities</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                'Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'
              ].filter(city => 
                !citySearchQuery || city.toLowerCase().includes(citySearchQuery.toLowerCase())
              ).map(city => (
                <button
                  key={city}
                  onClick={async () => {
                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ', India')}&key=${apiKey}`;
                    
                    try {
                      const res = await fetch(url);
                      const data = await res.json();
                      
                      if (data.status === "OK" && data.results && data.results.length > 0) {
                        const { lat, lng } = data.results[0].geometry.location;
                        setMapCenter({ lat, lng });
                        setZoomLevel(12);
                        setShowCitySelector(false);
                        setCitySearchQuery('');
                      }
                    } catch (err) {
                      console.error("Error geocoding city:", err);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-[#282c34]' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <Building2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className={`text-xs text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{city}</span>
                </button>
              ))}
            </div>
          </div>

              {/* Other Cities Section */}
              <div className="px-4 py-4 pb-24">
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Other Cities</h3>
                <div className="space-y-0">
              {[...new Set(indianCities)]
                .filter(city => 
                  !citySearchQuery || city.toLowerCase().includes(citySearchQuery.toLowerCase())
                )
                .filter(city => 
                  !['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                    'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'].includes(city)
                )
                .sort((a, b) => a.localeCompare(b))
                .map(city => (
                  <button
                    key={city}
                    onClick={async () => {
                      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ', India')}&key=${apiKey}`;
                      
                      try {
                        const res = await fetch(url);
                        const data = await res.json();
                        
                        if (data.status === "OK" && data.results && data.results.length > 0) {
                          const { lat, lng } = data.results[0].geometry.location;
                          setMapCenter({ lat, lng });
                          setZoomLevel(12);
                          setShowCitySelector(false);
                          setCitySearchQuery('');
                        }
                      } catch (err) {
                        console.error("Error geocoding city:", err);
                      }
                    }}
                    className={`w-full px-0 py-3 text-left text-sm transition-colors cursor-pointer border-b last:border-b-0 ${isDark ? 'text-gray-300 hover:text-white hover:bg-[#282c34] border-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-100'}`}
                  >
                    {city}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile List View Overlay */}
        {showMobileList && (
          <div className="md:hidden fixed inset-0 z-40 flex items-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileList(false)}></div>
            
            {/* Modal Content */}
            <div className={`relative w-full rounded-t-3xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: '90vh' }}>
              {/* Drag Handle */}
              <div className="flex justify-center py-3 flex-shrink-0">
                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto mobile-modal-scroll flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#4b5563 #2d3139' : '#cbd5e1 #f1f5f9' }}>
                <div className={`sticky top-0 border-b z-10 ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-200'}`}>
                  {/* Header */}
                  <div className="px-3 py-2.5 flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Properties</h2>
                <button
                  onClick={() => setShowMobileList(false)}
                  className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filters - Segmented Control */}
              <div className="px-3 pb-3">
                <div className={`rounded-full p-1 flex mb-3 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => {
                      setPropertyTypeFilter('all');
                      setFilters(prev => ({
                        ...prev,
                        type: { commercial: false, residential: false }
                      }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      propertyTypeFilter === 'all'
                        ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setPropertyTypeFilter('commercial');
                      setFilters(prev => ({
                        ...prev,
                        type: { commercial: true, residential: false }
                      }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      propertyTypeFilter === 'commercial'
                        ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Commercial
                  </button>
                  <button
                    onClick={() => {
                      setPropertyTypeFilter('residential');
                      setFilters(prev => ({
                        ...prev,
                        type: { commercial: false, residential: true }
                      }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      propertyTypeFilter === 'residential'
                        ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    Residential
                  </button>
                </div>

                {/* Listing Type Filters */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  <button
                    onClick={() => setListingTypeFilter('forSale')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      listingTypeFilter === 'forSale'
                        ? 'bg-gray-800 text-white'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    For Sale
                  </button>
                  <button
                    onClick={() => setListingTypeFilter('forRent')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      listingTypeFilter === 'forRent'
                        ? 'bg-gray-800 text-white'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    For Rent
                  </button>
                  <button
                    onClick={() => setListingTypeFilter('readyToMove')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      listingTypeFilter === 'readyToMove'
                        ? 'bg-gray-800 text-white'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Ready to Move
                  </button>
                  <button
                    onClick={() => setListingTypeFilter('newProjects')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      listingTypeFilter === 'newProjects'
                        ? 'bg-gray-800 text-white'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    New Projects
                  </button>
                  <button
                    onClick={() => setListingTypeFilter('verified')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      listingTypeFilter === 'verified'
                        ? 'bg-gray-800 text-white'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Verified
                  </button>
                </div>

                {/* Results Summary and Sort */}
                <div className={`flex items-center justify-between pt-2 mt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className="text-sm">
                    <span className="text-orange-500 font-medium">{getFilteredMarkers().length} {getFilteredMarkers().length === 1 ? 'property' : 'properties'}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}> found</span>
                  </p>
                  <button className={`flex items-center gap-1 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                    <span>Sort by</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
                </div>
              <div className={`p-3 space-y-3 pb-24 ${isDark ? 'bg-[#1f2229]' : ''}`}>
              {getFilteredMarkers().map(marker => (
                <div 
                  key={marker.id} 
                  className={`rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow shadow-sm ${isDark ? 'bg-[#282c34]' : 'bg-white border border-gray-100'}`}
                  onClick={() => {
                    handleMarkerClick(marker);
                    setShowMobileList(false);
                  }}
                >
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={marker.featuredImageUrl || marker.images?.[0] || '/placeholder.png'}
                        alt={marker.name || "Property Image"}
                        width={90}
                        height={90}
                        className="rounded-lg object-cover w-20 h-20"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className={`font-semibold text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {marker.name || 'Property Name'}
                          </h3>
                          {marker.is_verified && (
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                              <path d="M12 1L14.4 4.2L18.3 3.4L18.1 7.4L21.6 9.2L19.4 12.5L21.6 15.8L18.1 17.6L18.3 21.6L14.4 20.8L12 24L9.6 20.8L5.7 21.6L5.9 17.6L2.4 15.8L4.6 12.5L2.4 9.2L5.9 7.4L5.7 3.4L9.6 4.2L12 1Z" fill="#FBBF24"/>
                              <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavouriteToggle(marker);
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              propertyFavorites[marker._id || marker.id]
                                ? 'text-red-500'
                                : isDark ? 'text-gray-500 hover:text-red-500' : 'text-gray-300 hover:text-red-500'
                            }`}
                          >
                            <Heart 
                              className="w-4 h-4" 
                              fill={propertyFavorites[marker._id || marker.id] ? "currentColor" : "none"} 
                              strokeWidth={2} 
                            />
                          </button>
                          <a
                            href={`https://wa.me/${marker.sellerPhoneNumber?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(marker.name || 'this property')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          >
                            <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                          </a>
                        </div>
                      </div>
                      <p className={`text-xs mb-1.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>in {marker.layer_location || marker.location_district || marker.state_name}</span>
                        {marker.location_district && marker.layer_location && marker.location_district !== marker.layer_location && (
                          <span>, {marker.location_district}</span>
                        )}
                        {marker.state_name && (
                          <span>, {marker.state_name}</span>
                        )}
                      </p>
                      {(() => {
                        const prices = calculatePropertyPrices(marker);
                        if (prices.discountedPrice) {
                          return (
                            <p className="text-sm">
                              <span className="font-bold text-orange-500">{prices.discountedPrice}</span>
                              {prices.originalPrice && prices.originalPrice !== prices.discountedPrice && (
                                <span className={`line-through ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{prices.originalPrice}</span>
                              )}
                            </p>
                          );
                        } else if (marker.price_per_acre && marker.price_per_acre !== 'N/A') {
                          return (
                            <p className="text-sm">
                              <span className="font-bold text-orange-500">{marker.price_per_acre}</span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/sq.ft</span>
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      {isMenuOpen && <MenuSideBar onClose={() => setIsMenuOpen(false)} />}

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          onProceed={handleLoginSuccess} 
        />
      )}

      {selectedCity && (
        <PropertyDetailModal
          property={selectedCity}
          onClose={closeCityModal}
          isPropertyListVisible={isPropertyListVisible}
        />
      )}

      {/* Mobile Bottom Navigation Bar - Only visible on screens < 480px */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-50 transition-colors ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-stretch">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          >
            <svg className={`w-5 h-5 ${pathname === '/' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" />
              <path d="M3 7L12 3L21 7" />
              <path d="M12 11V19" />
              <path d="M8 11V15" />
              <path d="M16 11V15" />
            </svg>
            <span className={`text-[10px] font-medium ${pathname === '/' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>Map-View</span>
          </Link>
          <Link
            href="/commercial"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          >
            <Building2 className={`w-5 h-5 ${pathname === '/commercial' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`} strokeWidth={1.5} />
            <span className={`text-[10px] font-medium ${pathname === '/commercial' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>Commercial</span>
          </Link>
          <Link
            href="/residential"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          >
            <Home className={`w-5 h-5 ${pathname === '/residential' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`} strokeWidth={1.5} />
            <span className={`text-[10px] font-medium ${pathname === '/residential' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>Residential</span>
          </Link>
          <Link
            href="/builders"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          >
            <Image 
              src="/crown.svg" 
              width={20} 
              height={20} 
              alt="Builders" 
              className={pathname === '/builders' ? 'opacity-100' : 'opacity-50'} 
            />
            <span className={`text-[10px] font-medium ${pathname === '/builders' ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>Builders</span>
          </Link>
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <Modal
          style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px'
          }}
          onClose={() => setShowAddPropertyModal(false)}
          className={`rounded-xl shadow-2xl ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}
          isDark={isDark}
        >
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add Your Property</h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>List your property for free on BuildersInfo!</p>
            <Link
              href="https://wa.me/+918151915199/?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowAddPropertyModal(false)}
              className="flex items-center gap-3 text-white font-medium px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 transition-colors justify-center w-full"
            >
              <Image src='/whatsapp.svg' alt='whatsapp' width={24} height={24} /> 
              List My Property (Free)
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}