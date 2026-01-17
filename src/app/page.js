"use client";
import MenuSideBar from '@/components/MenuSideBar';
import LoginModal from '@/components/LoginModal';
import { Search, X, Plus, Share2, SlidersHorizontal, Copy, CopyCheck, Menu, List, Check, Heart, Building2, Home, MapPin, ChevronDown, ChevronRight, ChevronLeft, LayoutGrid, Map, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from "next/dynamic";
import PropertyDetailModal from '@/components/PropertyDetailModal';
import VisitorTracker from '@/components/VisitorTracker';
import { getUserLocation } from '@/utils/geolocation';
import { loginUser } from '@/utils/auth';

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
  const [searchType, setSearchType] = useState('locality'); // 'locality', 'metro', 'travel'
  const [buildingType, setBuildingType] = useState('commercial'); // 'commercial', 'residential'
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

  const addBtnRef = useRef(null);
  const shareBtnRef = useRef(null);

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
      <VisitorTracker onLocationUpdate={handleLocationUpdate} />
      <main className="flex-1 relative flex">
        <div className="hidden md:block relative">
          <div className={`${isDrawerCollapsed ? 'w-0 overflow-hidden' : 'w-[380px]'} bg-gray-50 shadow-lg flex flex-col transition-all duration-300 h-full`}>
            <div className={`sticky top-0 bg-white z-20 px-4 pt-4 pb-4 ${isDrawerCollapsed ? 'hidden' : ''}`}>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative search-container">
                  <div className="bg-gray-100 rounded-full pl-4 pr-3 py-3 w-full flex items-center gap-3">
                    <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 flex items-center gap-1.5 min-w-0 relative">
                      <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Search</span>
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
                          <span className="text-gray-700 text-sm font-medium cursor-text pointer-events-none">"{searchQuery}"</span>
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
                          className={`w-full outline-none text-gray-700 text-sm font-medium bg-transparent search-input-field ${
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
                          setShowFiltersView(true);
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      >
                        <Globe className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-500 border border-gray-200">
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
                            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
                          >
                            <div className="text-gray-800 text-sm">{suggestion.displayText}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2.5 text-gray-500 text-sm">
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {!showFiltersView && (
                <>
                  {/* Category Filters - Segmented Control */}
                  <div className="bg-gray-100 rounded-full p-1 flex mb-4">
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
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
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
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
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
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
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
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      onClick={() => setListingTypeFilter('forRent')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'forRent'
                          ? 'bg-gray-800 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      For Rent
                    </button>
                    <button
                      onClick={() => setListingTypeFilter('readyToMove')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'readyToMove'
                          ? 'bg-gray-800 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Ready to Move
                    </button>
                    <button
                      onClick={() => setListingTypeFilter('newProjects')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        listingTypeFilter === 'newProjects'
                          ? 'bg-gray-800 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      New Projects
                    </button>
                  </div>

                  {/* Properties Count and Sort */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-sm">
                      <span className="text-orange-500 font-medium">{getFilteredMarkers().length} {getFilteredMarkers().length === 1 ? 'property' : 'properties'}</span>
                      <span className="text-gray-500"> found</span>
                    </p>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                      <span>Sort by</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Filters View */}
            {showFiltersView ? (
              <div className={`flex-1 overflow-y-auto bg-white ${isDrawerCollapsed ? 'hidden' : ''}`}>
                {/* Filters Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowFiltersView(false)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
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
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Search Type</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSearchType('locality')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          searchType === 'locality'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Travel time
                      </button>
                    </div>
                  </div>

                  {/* Search Localities Input */}
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search upto 3 localities or landmarks"
                      className="flex-1 text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent"
                    />
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Building Type */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Building Type</h3>
                    <div className="bg-gray-100 rounded-full p-1 flex">
                      <button
                        onClick={() => setBuildingType('commercial')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          buildingType === 'commercial'
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-600'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Commercial
                      </button>
                      <button
                        onClick={() => setBuildingType('residential')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          buildingType === 'residential'
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-600'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        Residential
                      </button>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Property Type</h3>
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
                                : 'border-gray-300'
                            }`}
                          >
                            {propertyTypes[item.key] && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget (lumsum) */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Budget (lumsum)</h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <select 
                          value={budgetLumpsum.min}
                          onChange={(e) => setBudgetLumpsum(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white appearance-none cursor-pointer"
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
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white appearance-none cursor-pointer"
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
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Budget (per seat)</h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <select 
                          value={budgetPerSeat.min}
                          onChange={(e) => setBudgetPerSeat(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white appearance-none cursor-pointer"
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
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white appearance-none cursor-pointer"
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
                <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
                  <button 
                    onClick={() => setShowFiltersView(false)}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Property List */
              <div className={`flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 ${isDrawerCollapsed ? 'hidden' : ''}`}>
                {getFilteredMarkers().map(marker => (
                  <div 
                    key={marker.id} 
                    className="bg-white rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow shadow-sm"
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
                            <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
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
                                  : 'text-gray-300 hover:text-red-500'
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
                              className="p-1 rounded-full hover:bg-gray-50 transition-colors"
                            >
                              <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                            </a>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5 truncate">
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
                                  <span className="text-gray-400 line-through ml-2 text-xs">{prices.originalPrice}</span>
                                )}
                              </p>
                            );
                          } else if (marker.price_per_acre && marker.price_per_acre !== 'N/A') {
                            return (
                              <p className="text-sm">
                                <span className="font-bold text-orange-500">{marker.price_per_acre}</span>
                                <span className="text-gray-500 text-xs">/sq.ft</span>
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
            )}
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