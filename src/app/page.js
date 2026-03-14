"use client";
import MenuSideBar from '@/components/MenuSideBar';
import LoginModal from '@/components/LoginModal';
import { Search, X, Plus, SlidersHorizontal, Menu, List, Check, Heart, Building2, Home, MapPin, ChevronDown, ChevronRight, ChevronLeft, LayoutGrid, Map as MapIcon, Globe, ZoomIn, LocateFixed, Layers, Minus, Sun, Moon, User, FileText, Grid3x3, ChevronUp, Bus, Target, Clock, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from "next/dynamic";
import { usePathname } from 'next/navigation';
import PropertyDetailModal from '@/components/PropertyDetailModal';
import VisitorTracker from '@/components/VisitorTracker';
import CollapsedDrawerSearch from '@/components/CollapsedDrawerSearch';
import PlacesAutocompleteInput from '@/components/PlacesAutocompleteInput';
import { getUserLocation } from '@/utils/geolocation';
import { loginUser } from '@/utils/auth';
import { indianCities } from '@/utils/indianCities';
import { sortCitiesByDistance } from '@/utils/cityCoordinates';
import { useTheme } from '@/context/ThemeContext';
import { calculatePrices } from '@/utils/priceUtils';

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
            className={`absolute top-4 right-4 p-1 z-10 hover:cursor-pointer transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-black'}`}
          >
            <X className="w-5 h-5" strokeWidth={2} />
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
  const [globalConfig, setGlobalConfig] = useState({ isFullNavVisible: false });
  const [propertyFavorites, setPropertyFavorites] = useState({}); // Track favorites for each property

  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India as initial
  const [markers, setMarkers] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(5); // Start zoomed out to show India
  const [, setLocationError] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all'); // 'all', 'commercial', 'residential'
  const [listingTypeFilter, setListingTypeFilter] = useState('all'); // 'all', 'forSale', 'forRent', 'readyToMove', 'newProjects', 'verified', 'video'
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [userLocationInfo, setUserLocationInfo] = useState(null);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [sortBy, setSortBy] = useState('uploadedDateLatest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
  const [showLayersDeclarationModal, setShowLayersDeclarationModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedUserLocation, setDetectedUserLocation] = useState(null); // { lat, lng } when user detects location
  const [zoomingCityName, setZoomingCityName] = useState(null); // Show "Zooming on {city}" overlay
  const [isApplyingFilters, setIsApplyingFilters] = useState(false); // Show "Loading..." overlay when Apply Filters
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
  const [filterLocalitySearch, setFilterLocalitySearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState({ min: '', max: '' });
  const [furnishing, setFurnishing] = useState({ full: false, none: false, semi: false }); // checkboxes
  const [buildingTypeOptions, setBuildingTypeOptions] = useState({
    independentHouse: false,
    mall: false,
    independentShop: false,
    businessPark: false,
    standaloneBuilding: false,
  });
  const [availability, setAvailability] = useState(''); // 'immediate' | 'within15' | 'within30' | 'after30' | ''
  const [parking, setParking] = useState({ public: false, reserved: false });
  const [showOnly, setShowOnly] = useState({ withPhotos: true, removeSeen: false });
  const [amenities, setAmenities] = useState({ powerBackup: false, lift: false });
  const [floors, setFloors] = useState({
    ground: false,
    '1to3': false,
    '4to6': false,
    '7to9': false,
    '10above': false,
    custom: false,
  });
  const [propertyAge, setPropertyAge] = useState({
    lessThan1: false,
    '1to5': false,
    '5to10': false,
    moreThan10: false,
  });

  // Residential-only filters (shown when Building Type = Residential)
  const [residentialPropertyType, setResidentialPropertyType] = useState(''); // 'plot' | 'villa' | 'apartment' | 'independentHouse' | 'builderFloor' | 'penthouse' | ''
  const [residentialLocalitySearch, setResidentialLocalitySearch] = useState('');
  const [residentialLocalities, setResidentialLocalities] = useState({
    mysoreRoad: false,
    sampangiRamaNagar: false,
    hebbal: false,
    banashankari: false,
  });
  const [residentialSocieties, setResidentialSocieties] = useState({
    godrejTiara: false,
    sobhaInfinia: false,
    snnClermont: false,
    lntRaintreeBoulevard: false,
  });
  const [residentialSocietySearch, setResidentialSocietySearch] = useState('');

  // Residential Bedrooms filter (1 BHK, 1 RK, 1.5 BHK, 2 BHK, ... Studio)
  const [bedrooms, setBedrooms] = useState(''); // '1bhk' | '1rk' | '1.5bhk' | '2bhk' | '2.5bhk' | '3bhk' | '3.5bhk' | '4bhk' | '5bhk' | '6bhk' | '6plusbhk' | 'studio' | ''

  // Commercial filters (image-style: Sale Type, Construction Status, Washrooms, Floor, Facing, RERA, Offers, Furnishing Status, Posted by, Possession, Localities, Societies, Amenities)
  const [saleType, setSaleType] = useState(''); // 'new' | 'resale' | ''
  const [constructionStatus, setConstructionStatus] = useState(''); // 'readyToMove' | 'underConstruction' | ''
  const [washrooms, setWashrooms] = useState(''); // '1' | '2' | '3' | '4' | '5' | ''
  const [floorFilter, setFloorFilter] = useState(''); // 'basement' | 'ground' | '1to4' | '5to8' | '9to12' | '13to16' | '16plus' | ''
  const [facing, setFacing] = useState(''); // east, northEast, south, southWest, north, northWest, southEast, west
  const [reraRegistered, setReraRegistered] = useState(false);
  const [propertiesWithOffers, setPropertiesWithOffers] = useState(false);
  const [furnishingStatus, setFurnishingStatus] = useState(''); // 'furnished' | 'semiFurnished' | 'unfurnished' | 'gatedCommunities' | ''
  const [postedBy, setPostedBy] = useState(''); // 'owners' | 'partnerAgents' | ''
  const [possessionStatus, setPossessionStatus] = useState(''); // 'readyToMove' | 'underConstruction' | ''
  const [commercialLocalitySearch, setCommercialLocalitySearch] = useState('');
  const [commercialLocalities, setCommercialLocalities] = useState({
    mysoreRoad: false,
    sampangiRamaNagar: false,
    hebbal: false,
    banashankari: false,
  });
  const [commercialSocietySearch, setCommercialSocietySearch] = useState('');
  const [commercialSocieties, setCommercialSocieties] = useState({
    godrejTiara: false,
    sobhaInfinia: false,
    snnClermont: false,
    lntRaintreeBoulevard: false,
  });
  // Expanded amenities (image-style pill buttons): 24x7 Security, Power Backup, Visitor's Parking, etc.
  const [amenitiesPills, setAmenitiesPills] = useState({
    security24x7: false,
    powerBackup: false,
    visitorParking: false,
    attachedMarket: false,
    swimmingPool: false,
    clubhouse: false,
    centralAC: false,
    kidsPlayArea: false,
    intercom: false,
    vaastuCompliant: false,
    airConditioned: false,
    lift: false,
  });

  // Applied filters: only used for filtering when user clicks "Apply Filters" (not on every checkbox/radio change)
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Default snapshot = no filters from the panel; use when user has not clicked "Apply Filters" yet
  const getDefaultFilterSnapshot = () => ({
    buildingType: 'commercial',
    filterLocalitySearch: '',
    propertyTypeFilter: 'all',
    filters: { type: { commercial: false, residential: false }, listedBy: { owner: false, agent: false, iacre: false }, budget: [0, 30], size: [0, 50000] },
    propertyTypes: { officeSpace: false, coWorking: false, shop: false, showroom: false, godownWarehouse: false, industrialShed: false, industrialBuilding: false, otherBusiness: false, restaurantCafe: false },
    budgetLumpsum: { min: '', max: '' },
    budgetPerSeat: { min: '', max: '' },
    sizeFilter: { min: '', max: '' },
    furnishing: { full: false, none: false, semi: false },
    buildingTypeOptions: { independentHouse: false, mall: false, independentShop: false, businessPark: false, standaloneBuilding: false },
    availability: '',
    parking: { public: false, reserved: false },
    showOnly: { withPhotos: false, removeSeen: false },
    amenities: { powerBackup: false, lift: false },
    amenitiesPills: { security24x7: false, powerBackup: false, visitorParking: false, attachedMarket: false, swimmingPool: false, clubhouse: false, centralAC: false, kidsPlayArea: false, intercom: false, vaastuCompliant: false, airConditioned: false, lift: false },
    floors: { ground: false, '1to3': false, '4to6': false, '7to9': false, '10above': false, custom: false },
    propertyAge: { lessThan1: false, '1to5': false, '5to10': false, moreThan10: false },
    residentialPropertyType: '',
    residentialLocalitySearch: '',
    residentialLocalities: { mysoreRoad: false, sampangiRamaNagar: false, hebbal: false, banashankari: false },
    residentialSocietySearch: '',
    residentialSocieties: { godrejTiara: false, sobhaInfinia: false, snnClermont: false, lntRaintreeBoulevard: false },
    bedrooms: '',
    saleType: '',
    constructionStatus: '',
    washrooms: '',
    floorFilter: '',
    facing: '',
    reraRegistered: false,
    propertiesWithOffers: false,
    furnishingStatus: '',
    postedBy: '',
    possessionStatus: '',
    commercialLocalitySearch: '',
    commercialLocalities: { mysoreRoad: false, sampangiRamaNagar: false, hebbal: false, banashankari: false },
    commercialSocietySearch: '',
    commercialSocieties: { godrejTiara: false, sobhaInfinia: false, snnClermont: false, lntRaintreeBoulevard: false },
  });

  // Snapshot current filter panel state (for applying on button click)
  const getFilterSnapshot = () => ({
    buildingType,
    filterLocalitySearch,
    propertyTypeFilter,
    filters: {
      type: { ...filters.type },
      listedBy: { ...filters.listedBy },
      budget: [...filters.budget],
      size: [...filters.size],
    },
    propertyTypes: { ...propertyTypes },
    budgetLumpsum: { ...budgetLumpsum },
    budgetPerSeat: { ...budgetPerSeat },
    sizeFilter: { ...sizeFilter },
    furnishing: { ...furnishing },
    buildingTypeOptions: { ...buildingTypeOptions },
    availability,
    parking: { ...parking },
    showOnly: { ...showOnly },
    amenities: { ...amenities },
    amenitiesPills: { ...amenitiesPills },
    floors: { ...floors },
    propertyAge: { ...propertyAge },
    residentialPropertyType,
    residentialLocalitySearch,
    residentialLocalities: { ...residentialLocalities },
    residentialSocietySearch,
    residentialSocieties: { ...residentialSocieties },
    bedrooms,
    saleType,
    constructionStatus,
    washrooms,
    floorFilter,
    facing,
    reraRegistered,
    propertiesWithOffers,
    furnishingStatus,
    postedBy,
    possessionStatus,
    commercialLocalitySearch,
    commercialLocalities: { ...commercialLocalities },
    commercialSocietySearch,
    commercialSocieties: { ...commercialSocieties },
  });

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
    fetch('/api/global-config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) setGlobalConfig(data.config);
      })
      .catch(() => {});
  }, []);

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
      // Close sort dropdown when clicking outside
      if (!event.target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoadingProperties(true);
      try {
        const response = await fetch('/api/properties');
        const result = await response.json();

        console.log("API Response:", result);

        if (result.success && result.data) {
          console.log("Total properties fetched:", result.data.length);

          // Filter verified/confirmed properties (schema uses verificationStatus: "verified")
          const confirmedProperties = result.data.filter(property =>
            property.verificationStatus === 'verified' || property.verificationStatus === 'confirmed'
          );

          console.log("Confirmed properties:", confirmedProperties.length);

          const properties = confirmedProperties.map((property, index) => {
            const coord = property.coordinates || property.position;
            const lat = coord?.latitude ?? coord?.lat;
            const lng = coord?.longitude ?? coord?.lng;
            const position = lat != null && lng != null ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
            if (!position) {
              console.warn(`Property ${property.propertyName || property._id} (Index: ${index}) has no valid coordinates.`);
            }
            return {
              ...property,
              id: String(property._id || property.id || `temp-id-${index}`),
              position,
              coordinates: position ?? coord,
              isVerified: property.verificationStatus === 'verified' || property.verificationStatus === 'confirmed' || property.isVerified === true
            };
          });

          setMarkers(properties);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setMarkers([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProperties();
  }, []);

  // Location tracking is handled by VisitorTracker component

  // Generate suggestions based on search query - show property names and addresses/locations only
  const generateSuggestions = (query) => {
    // Only show suggestions if query has at least 1 character
    if (!query.trim() || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const uniqueSuggestions = new Map();
    const filteredSuggestions = [];
    const queryLower = query.toLowerCase().trim();

    // Check properties for name and location matches
    markers.forEach(marker => {
      if (marker.isSearchResult) return;

      // Check property name
      const name = marker.propertyName || marker.name || '';
      if (name && name.toLowerCase().includes(queryLower)) {
        const key = `name-${name.toLowerCase()}`;
        if (!uniqueSuggestions.has(key)) {
          uniqueSuggestions.set(key, true);
          const location = marker.address?.locality || marker.address?.district || '';
          filteredSuggestions.push({
            text: name,
            displayText: location ? `${name}, ${location}` : name,
            marker: marker,
            isProperty: true
          });
        }
      }

      // Check property location (schema: address.locality)
      const layerLocation = marker.address?.locality || marker.layerLocation || '';
      if (layerLocation && layerLocation.toLowerCase().includes(queryLower)) {
        const key = `location-${layerLocation.toLowerCase()}`;
        if (!uniqueSuggestions.has(key)) {
          uniqueSuggestions.set(key, true);
          const propertyName = marker.propertyName || marker.name || 'Property';
          filteredSuggestions.push({
            text: layerLocation,
            displayText: `${propertyName}, ${layerLocation}`,
            marker: marker,
            isProperty: true
          });
        }
      }

      // Check locationDistrict (schema: address.district)
      const locationDistrict = marker.address?.district || marker.locationDistrict || '';
      if (locationDistrict && locationDistrict.toLowerCase().includes(queryLower)) {
        const key = `district-${locationDistrict.toLowerCase()}`;
        if (!uniqueSuggestions.has(key)) {
          uniqueSuggestions.set(key, true);
          const propertyName = marker.propertyName || marker.name || 'Property';
          filteredSuggestions.push({
            text: locationDistrict,
            displayText: `${propertyName}, ${locationDistrict}`,
            marker: marker,
            isProperty: true
          });
        }
      }

      // Check address (schema: displayAddress)
      const address = marker.displayAddress || marker.addressDisplay || marker.location || '';
      if (address && address.toLowerCase().includes(queryLower)) {
        const key = `address-${address.toLowerCase()}`;
        if (!uniqueSuggestions.has(key)) {
          uniqueSuggestions.set(key, true);
          const propertyName = marker.propertyName || marker.name || 'Property';
          filteredSuggestions.push({
            text: address,
            displayText: `${propertyName}, ${address}`,
            marker: marker,
            isProperty: true
          });
        }
      }
    });

    const finalSuggestions = filteredSuggestions.slice(0, 5);
    setSuggestions(finalSuggestions);
    setShowSuggestions(finalSuggestions.length > 0);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // For country view, don't generate property suggestions
    if (!showCitySelector) {
      generateSuggestions(value);
    }
    // For country view, the search will be handled by citySearchQuery
  };



  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Clear search filter if empty
      setSearchQuery("");
      return;
    }

    setShowSuggestions(false);

    // Top search bar: consistently filter properties by name/location in ALL views (initial, filters, country)
    // The search query will be used in getFilteredMarkers to filter properties
    // If there are matching properties, zoom to show them
    const matchingProperties = markers.filter(marker => {
      if (marker.isSearchResult) return false;
      const query = searchQuery.toLowerCase().trim();
      const name = (marker.propertyName || marker.name || '').toLowerCase();
      const layerLocation = (marker.address?.locality || marker.layerLocation || '').toLowerCase();
      const locationDistrict = (marker.address?.district || marker.locationDistrict || '').toLowerCase();
      const stateName = (marker.address?.state || marker.stateName || '').toLowerCase();
      const address = (marker.displayAddress || marker.addressDisplay || marker.location || '').toLowerCase();

      return name.includes(query) ||
        layerLocation.includes(query) ||
        locationDistrict.includes(query) ||
        stateName.includes(query) ||
        address.includes(query);
    });

    if (matchingProperties.length > 0 && matchingProperties[0].position) {
      // Zoom to first matching property - less zoom so city name is visible
      setMapCenter(matchingProperties[0].position);
      setZoomLevel(10);
    }
    // The filtering will be handled by getFilteredMarkers
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

  const zoomToCity = async (cityName, options = {}) => {
    setZoomingCityName(cityName);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName + ', India')}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results?.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const offset = options.offset ?? 0.15;
        setMapCenter({ lat: lat - offset, lng });
        setZoomLevel(options.zoomLevel ?? 10);
        if (options.clearSearch) setCitySearchQuery('');
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
        if (options.closeSelector || isMobile) {
          setShowCitySelector(false);
          if (isMobile) { setSelectedMarker(null); setSelectedCity(null); }
        }
      }
      await new Promise(r => setTimeout(r, 1000)); // 1s delay so overlay is visible
    } catch (err) {
      console.error("Error geocoding city:", err);
      await new Promise(r => setTimeout(r, 1000));
    } finally {
      setZoomingCityName(null);
    }
  };

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true);
    try {
      await new Promise(r => setTimeout(r, 1000)); // 1s delay
      setAppliedFilters(getFilterSnapshot());
      setShowFiltersView(false);
      if (typeof window !== 'undefined' && window.innerWidth < 480) setShowCitySelector(false);
    } finally {
      setIsApplyingFilters(false);
    }
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


  // Helper function to get numeric price value for sorting - schema: totalPrice, discountPercent
  const getPriceValue = (marker) => {
    const prices = calculatePrices(marker);
    const p = prices.discountedPrice || marker.discountedPrice || marker.totalPrice || marker.originalPrice;
    if (!p || p === '₹XX' || p === 'N/A') return 0;
    const priceStr = String(p).replace(/[₹,]/g, '');
    return parseFloat(priceStr) || 0;
  };

  // Helper function to get numeric size value for sorting
  const getSizeValue = (marker) => {
    const raw = marker.propertySize ?? marker.size ?? 0;
    const size = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;

    // Schema: propertySize (number, sq ft in dummy) or size string; convert to square feet for comparison
    const sizeStr = String(marker.size || '');
    if (typeof raw === 'number') return size; // propertySize from schema is typically sq ft
    if (sizeStr.toLowerCase().includes('sq ft') || sizeStr.toLowerCase().includes('sqft')) return size;
    return size * 9; // Assume square yards -> square feet
  };

  // Helper function to get total price value for sorting
  const getTotalPriceValue = (marker) => {
    if (marker.totalPrice && marker.totalPrice !== 'N/A') {
      const priceStr = marker.totalPrice.toString().replace(/[₹,]/g, '');
      return parseFloat(priceStr) || 0;
    }
    // Fallback to calculated price
    return getPriceValue(marker);
  };

  // Helper: get price per seat for commercial (schema: pricePerSeat at top level or floorConfigurations)
  const getPricePerSeat = (marker) => {
    if (marker.propertyCategory === 'commercial' || marker.propertyType === 'commercial') {
      const priceStr = marker.pricePerSeat ?? marker.floorConfigurations?.[0]?.dedicatedCabin?.pricePerSeat;
      if (priceStr) {
        const m = String(priceStr).match(/(\d+)/);
        return m ? parseFloat(m[1]) || 0 : 0;
      }
    }
    return 0;
  };

  const getFilteredMarkers = () => {
    let filtered = markers.filter(marker => !marker.isSearchResult); // Exclude search result markers

    // Use applied filters only when user has clicked "Apply Filters"; otherwise no panel filters apply
    const baseFilters = appliedFilters !== null ? appliedFilters : getDefaultFilterSnapshot();
    // Left drawer filters (property type: All/Commercial/Residential) are always live - use current state when no applied snapshot
    const f = appliedFilters !== null ? baseFilters : { ...baseFilters, propertyTypeFilter };

    // Apply search query filter - consistently filter properties in ALL views (initial, filters, country)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(marker => {
        const name = (marker.propertyName || marker.name || '').toLowerCase();
        const layerLocation = (marker.address?.locality || marker.layerLocation || '').toLowerCase();
        const locationDistrict = (marker.address?.district || marker.locationDistrict || '').toLowerCase();
        const stateName = (marker.address?.state || marker.stateName || '').toLowerCase();
        const address = (marker.displayAddress || marker.addressDisplay || marker.location || '').toLowerCase();

        return name.includes(query) ||
          layerLocation.includes(query) ||
          locationDistrict.includes(query) ||
          stateName.includes(query) ||
          address.includes(query);
      });
    }
    // Apply filter panel locality search (additional AND filter)
    if (f.filterLocalitySearch && f.filterLocalitySearch.trim()) {
      const locQuery = f.filterLocalitySearch.toLowerCase().trim();
      filtered = filtered.filter(marker => {
        const name = (marker.propertyName || marker.name || '').toLowerCase();
        const layerLocation = (marker.address?.locality || marker.layerLocation || '').toLowerCase();
        const locationDistrict = (marker.address?.district || marker.locationDistrict || '').toLowerCase();
        const address = (marker.displayAddress || marker.addressDisplay || marker.location || '').toLowerCase();
        return name.includes(locQuery) || layerLocation.includes(locQuery) ||
          locationDistrict.includes(locQuery) || address.includes(locQuery);
      });
    }

    // Apply building type filter (Commercial/Residential) - schema uses propertyCategory
    if (f.propertyTypeFilter !== 'all') {
      filtered = filtered.filter(marker => {
        const markerType = marker.propertyCategory || marker.propertyType || 'residential';
        return markerType === f.propertyTypeFilter;
      });
    }

    // Apply listing type filter (For Sale, For Rent, Ready to Move, New Projects, Verified, Video)
    if (listingTypeFilter && listingTypeFilter !== 'all') {
      filtered = filtered.filter(marker => {
        const markerListingType = marker.listingType || '';
        // Map filter values to property values
        const filterMapping = {
          'forSale': 'For Sale',
          'forRent': 'For Rent',
          'readyToMove': 'Ready to Move',
          'newProjects': 'New Projects',
          'verified': 'Verified'
        };
        const expectedValue = filterMapping[listingTypeFilter] || listingTypeFilter;
        if (listingTypeFilter === 'verified') return marker.isVerified || marker.verificationStatus === 'verified' || marker.verificationStatus === 'confirmed';
        if (listingTypeFilter === 'video') return !!(marker.video_url || marker.video || marker.has_video);
        return markerListingType === expectedValue;
      });
    }

    // Residential-only filter flags (used when Building Type = Residential)
    const hasResidentialSaleTypeFilter = f.saleType && f.saleType !== '';
    const hasResidentialConstructionStatusFilter = f.constructionStatus && f.constructionStatus !== '';
    const hasResidentialWashroomsFilter = f.washrooms && f.washrooms !== '';
    const hasResidentialFloorFilter = f.floorFilter && f.floorFilter !== '';
    const hasResidentialFacingFilter = f.facing && f.facing !== '';
    const hasResidentialReraFilter = f.reraRegistered === true;
    const hasResidentialOffersFilter = f.propertiesWithOffers === true;
    const hasResidentialFurnishingStatusFilter = f.furnishingStatus && f.furnishingStatus !== '';
    const hasResidentialPostedByFilter = f.postedBy && f.postedBy !== '';
    const hasResidentialPossessionStatusFilter = f.possessionStatus && f.possessionStatus !== '';
    const hasResidentialAmenitiesPillsFilter = f.amenitiesPills && Object.values(f.amenitiesPills).some(v => v === true);
    const hasResidentialBedroomsFilter = f.bedrooms && f.bedrooms !== '';

    // Apply residential-only filters (when Building Type = Residential)
    if (f.propertyTypeFilter === 'residential') {
      if (f.residentialPropertyType) {
        const resTypeMap = {
          plot: 'Plot',
          villa: 'Villa',
          apartment: 'Apartment',
          independentHouse: 'Independent House',
          builderFloor: 'Builder Floor',
          penthouse: 'Penthouse',
        };
        const expectedResType = resTypeMap[f.residentialPropertyType] || f.residentialPropertyType;
        filtered = filtered.filter(marker => {
          const mType = (marker.propertyCategoryType || marker.propertyType || '').toString();
          if (!mType) return true;
          return mType.toLowerCase().includes(expectedResType.toLowerCase());
        });
      }
      const hasResidentialLocality = Object.values(f.residentialLocalities).some(v => v === true) || (f.residentialLocalitySearch && f.residentialLocalitySearch.trim());
      if (hasResidentialLocality) {
        const localityLabels = {
          mysoreRoad: 'Mysore Road',
          sampangiRamaNagar: 'Sampangi Rama Nagar',
          hebbal: 'Hebbal',
          banashankari: 'Banashankari',
        };
        const selectedLocalities = Object.entries(f.residentialLocalities)
          .filter(([, sel]) => sel)
          .map(([key]) => (localityLabels[key] || '').toLowerCase());
        const searchTerm = (f.residentialLocalitySearch || '').trim().toLowerCase();
        filtered = filtered.filter(marker => {
          const loc = (marker.address?.locality || marker.address?.district || marker.displayAddress || marker.layerLocation || marker.locationDistrict || marker.location || '').toLowerCase();
          if (searchTerm && loc.includes(searchTerm)) return true;
          if (selectedLocalities.length === 0) return true;
          return selectedLocalities.some(s => loc.includes(s));
        });
      }
      // Apply residential Societies filter
      const hasResidentialSociety = Object.values(f.residentialSocieties || {}).some(v => v === true) || (f.residentialSocietySearch && f.residentialSocietySearch.trim());
      if (hasResidentialSociety && f.residentialSocieties) {
        const societyLabels = {
          godrejTiara: 'Godrej Tiara',
          sobhaInfinia: 'Sobha Infinia',
          snnClermont: 'SNN Clermont',
          lntRaintreeBoulevard: 'LnT Raintree Boulevard',
        };
        const selectedSocieties = Object.entries(f.residentialSocieties)
          .filter(([, sel]) => sel)
          .map(([key]) => (societyLabels[key] || '').toLowerCase());
        const searchTerm = (f.residentialSocietySearch || '').trim().toLowerCase();
        filtered = filtered.filter(marker => {
          const loc = (marker.address?.locality || marker.address?.district || marker.displayAddress || marker.layerLocation || marker.locationDistrict || marker.location || marker.society || marker.propertyName || '').toLowerCase();
          if (searchTerm && loc.includes(searchTerm)) return true;
          if (selectedSocieties.length === 0) return true;
          return selectedSocieties.some(s => loc.includes(s));
        });
      }

      // Apply residential Bedrooms filter
      if (hasResidentialBedroomsFilter) {
        const bedroomsMap = {
          '1bhk': ['1 bhk', '1bhk', '1 bhk'],
          '1rk': ['1 rk', '1rk', 'rk', 'studio'],
          '1.5bhk': ['1.5 bhk', '1.5bhk'],
          '2bhk': ['2 bhk', '2bhk'],
          '2.5bhk': ['2.5 bhk', '2.5bhk'],
          '3bhk': ['3 bhk', '3bhk'],
          '3.5bhk': ['3.5 bhk', '3.5bhk'],
          '4bhk': ['4 bhk', '4bhk'],
          '5bhk': ['5 bhk', '5bhk'],
          '6bhk': ['6 bhk', '6bhk'],
          '6plusbhk': ['6+ bhk', '6+ bhk', '7 bhk', '8 bhk'],
          'studio': ['studio', '1 rk', '1rk', 'rk'],
        };
        const expectedTerms = bedroomsMap[f.bedrooms] || [f.bedrooms];
        filtered = filtered.filter(marker => {
          const config = (marker.bedrooms || marker.bhk || marker.configuration || marker.config || '').toString().toLowerCase().replace(/\s/g, '');
          if (!config) return true;
          return expectedTerms.some(term => config.includes(term.replace(/\s/g, '')));
        });
      }

      // Apply residential-only filters: Sale Type, Construction Status, Washrooms, Floor, Facing, RERA, Offers, Furnishing Status, Posted by, Possession Status, Amenities pills
      if (hasResidentialSaleTypeFilter) {
        filtered = filtered.filter(marker => {
          const sale = (marker.saleType || marker.listingType || '').toLowerCase();
          if (!sale) return true;
          if (f.saleType === 'new') return sale.includes('new') || sale.includes('primary');
          if (f.saleType === 'resale') return sale.includes('resale') || sale.includes('secondary');
          return true;
        });
      }
      if (hasResidentialConstructionStatusFilter || hasResidentialPossessionStatusFilter) {
        const statusFilter = f.constructionStatus || f.possessionStatus;
        if (statusFilter) {
          filtered = filtered.filter(marker => {
            const status = (marker.constructionStatus || marker.possessionStatus || marker.readyToMove || '').toLowerCase();
            if (!status) return true;
            if (statusFilter === 'readyToMove') return status.includes('ready') || status.includes('move') || status.includes('completed');
            if (statusFilter === 'underConstruction') return status.includes('under') || status.includes('construction') || status.includes('ongoing');
            return true;
          });
        }
      }
      if (hasResidentialWashroomsFilter) {
        const minWash = parseInt(f.washrooms, 10) || 0;
        filtered = filtered.filter(marker => {
          const w = parseInt(marker.washrooms || marker.bathrooms || '0', 10) || 0;
          return w >= minWash;
        });
      }
      if (hasResidentialFloorFilter) {
        const floorMap = {
          basement: [-1, -1],
          ground: [0, 0],
          '1to4': [1, 4],
          '5to8': [5, 8],
          '9to12': [9, 12],
          '13to16': [13, 16],
          '16plus': [17, 999],
        };
        const range = floorMap[f.floorFilter];
        if (range) {
          filtered = filtered.filter(marker => {
            const floorNum = parseInt(marker.floor || marker.floors || '0', 10) || 0;
            return floorNum >= range[0] && floorNum <= range[1];
          });
        }
      }
      if (hasResidentialFacingFilter) {
        const facingLabels = { east: 'east', northEast: 'north-east', south: 'south', southWest: 'south-west', north: 'north', northWest: 'north-west', southEast: 'south-east', west: 'west' };
        const expectedFacing = (facingLabels[f.facing] || f.facing || '').toLowerCase();
        filtered = filtered.filter(marker => {
          const mFacing = (marker.facing || '').toLowerCase();
          if (!mFacing) return true;
          return mFacing.includes(expectedFacing);
        });
      }
      if (hasResidentialReraFilter) {
        filtered = filtered.filter(marker => !!(marker.reraRegistered || marker.rera_registered || marker.isRera));
      }
      if (hasResidentialOffersFilter) {
        filtered = filtered.filter(marker => !!(marker.hasOffers || marker.offers || marker.discount));
      }
      if (hasResidentialFurnishingStatusFilter) {
        filtered = filtered.filter(marker => {
          if (f.furnishingStatus === 'gatedCommunities') {
            const amenities = (marker.amenities || marker.amenitiesList || '').toString().toLowerCase();
            const name = (marker.propertyName || marker.name || '').toLowerCase();
            const desc = (marker.description || '').toLowerCase();
            return amenities.includes('gated') || name.includes('gated') || desc.includes('gated') ||
              amenities.includes('gated community') || name.includes('gated community') || desc.includes('gated community');
          }
          const mFurn = (marker.furnishingLevel || marker.furnishing || '').toLowerCase();
          if (!mFurn) return true;
          if (f.furnishingStatus === 'furnished') return mFurn.includes('full') || mFurn.includes('furnished');
          if (f.furnishingStatus === 'semiFurnished') return mFurn.includes('semi');
          if (f.furnishingStatus === 'unfurnished') return mFurn.includes('none') || mFurn.includes('unfurnished');
          return true;
        });
      }
      if (hasResidentialPostedByFilter) {
        filtered = filtered.filter(marker => {
          const listedBy = (marker.listed_by || marker.listedBy || '').toLowerCase();
          if (f.postedBy === 'owners') return listedBy.includes('owner');
          if (f.postedBy === 'partnerAgents') return listedBy.includes('agent') || listedBy.includes('partner');
          return true;
        });
      }
      if (hasResidentialAmenitiesPillsFilter && f.amenitiesPills) {
        const amenityKeywords = {
          security24x7: ['security', '24x7', '24/7'],
          powerBackup: ['power', 'backup', 'generator'],
          visitorParking: ['visitor', 'parking'],
          attachedMarket: ['market', 'mall'],
          swimmingPool: ['swimming', 'pool'],
          clubhouse: ['clubhouse', 'club'],
          centralAC: ['central', 'ac', 'air conditioning'],
          kidsPlayArea: ['kids', 'play', 'playground'],
          intercom: ['intercom'],
          vaastuCompliant: ['vaastu', 'vastu'],
          airConditioned: ['ac', 'air condition', 'air conditioned'],
          lift: ['lift', 'elevator'],
        };
        filtered = filtered.filter(marker => {
          const mAmenities = (marker.amenities || marker.amenitiesList || '').toString().toLowerCase();
          if (!mAmenities) return true;
          return Object.entries(f.amenitiesPills).every(([key, sel]) => {
            if (!sel) return true;
            const keywords = amenityKeywords[key] || [];
            return keywords.some(kw => mAmenities.includes(kw));
          });
        });
      }
    }

    // Check if any modal filters are applied (from applied snapshot) - commercial only
    const hasTypeFilters = f.filters.type.commercial || f.filters.type.residential;
    const hasListedByFilters = f.filters.listedBy.owner || f.filters.listedBy.agent || f.filters.listedBy.iacre;
    const hasBudgetFilters = !(f.filters.budget[0] === 0 && f.filters.budget[1] === 30);
    const hasSizeFilters = !(f.filters.size[0] === 0 && f.filters.size[1] === 50000);
    const hasPropertyTypeFilters = Object.values(f.propertyTypes).some(v => v === true);
    const hasBudgetLumpsumFilters = f.budgetLumpsum.min !== '' || f.budgetLumpsum.max !== '';
    const hasBudgetPerSeatFilters = f.budgetPerSeat.min !== '' || f.budgetPerSeat.max !== '';

    const hasSizeFilterDropdown = f.sizeFilter.min !== '' || f.sizeFilter.max !== '';
    const hasBuildingTypeOptions = Object.values(f.buildingTypeOptions).some(v => v === true);
    const hasFloorsFilter = Object.values(f.floors).some(v => v === true);
    const hasPropertyAgeFilter = Object.values(f.propertyAge).some(v => v === true);

    const hasFurnishingFilter = Object.values(f.furnishing).some(v => v === true);
    const hasCommercialLocality = Object.values(f.commercialLocalities || {}).some(v => v === true) || (f.commercialLocalitySearch && f.commercialLocalitySearch.trim());
    const hasCommercialSociety = Object.values(f.commercialSocieties || {}).some(v => v === true) || (f.commercialSocietySearch && f.commercialSocietySearch.trim());
    const hasAnyModalFilters = hasTypeFilters || hasListedByFilters || hasBudgetFilters ||
      hasSizeFilters || hasPropertyTypeFilters || hasBudgetLumpsumFilters ||
      hasBudgetPerSeatFilters || hasSizeFilterDropdown || hasFurnishingFilter ||
      hasBuildingTypeOptions || f.availability !== '' || f.parking.public || f.parking.reserved ||
      f.amenities.powerBackup || f.amenities.lift || hasFloorsFilter || hasPropertyAgeFilter ||
      f.showOnly.withPhotos || f.showOnly.removeSeen ||
      hasCommercialLocality || hasCommercialSociety;

    // Apply commercial modal filters only when not in residential mode
    if (f.propertyTypeFilter !== 'residential' && hasAnyModalFilters) {
      // Apply type filters (commercial/residential from modal)
      if (hasTypeFilters) {
        filtered = filtered.filter(marker => {
          const markerType = marker.propertyCategory || marker.propertyType || 'residential';
          return (
            (f.filters.type.commercial && markerType === 'commercial') ||
            (f.filters.type.residential && markerType === 'residential')
          );
        });
      }

      // Apply commercial locality filter
      if (hasCommercialLocality && f.propertyTypeFilter === 'commercial') {
        const localityLabels = {
          mysoreRoad: 'Mysore Road',
          sampangiRamaNagar: 'Sampangi Rama Nagar',
          hebbal: 'Hebbal',
          banashankari: 'Banashankari',
        };
        const selectedLocalities = Object.entries(f.commercialLocalities || {})
          .filter(([, sel]) => sel)
          .map(([key]) => (localityLabels[key] || '').toLowerCase());
        const searchTerm = (f.commercialLocalitySearch || '').trim().toLowerCase();
        filtered = filtered.filter(marker => {
          const loc = (marker.address?.locality || marker.address?.district || marker.displayAddress || marker.layerLocation || marker.locationDistrict || marker.location || '').toLowerCase();
          if (searchTerm && loc.includes(searchTerm)) return true;
          if (selectedLocalities.length === 0) return true;
          return selectedLocalities.some(s => loc.includes(s));
        });
      }

      // Apply commercial society filter
      if (hasCommercialSociety && f.propertyTypeFilter === 'commercial' && f.commercialSocieties) {
        const societyLabels = {
          godrejTiara: 'Godrej Tiara',
          sobhaInfinia: 'Sobha Infinia',
          snnClermont: 'SNN Clermont',
          lntRaintreeBoulevard: 'LnT Raintree Boulevard',
        };
        const selectedSocieties = Object.entries(f.commercialSocieties)
          .filter(([, sel]) => sel)
          .map(([key]) => (societyLabels[key] || '').toLowerCase());
        const searchTerm = (f.commercialSocietySearch || '').trim().toLowerCase();
        filtered = filtered.filter(marker => {
          const loc = (marker.address?.locality || marker.address?.district || marker.displayAddress || marker.layerLocation || marker.locationDistrict || marker.location || marker.society || marker.propertyName || '').toLowerCase();
          if (searchTerm && loc.includes(searchTerm)) return true;
          if (selectedSocieties.length === 0) return true;
          return selectedSocieties.some(s => loc.includes(s));
        });
      }

      // Apply property category type filters (Office Space, Co-Working, etc.)
      if (hasPropertyTypeFilters) {
        filtered = filtered.filter(marker => {
          const categoryType = marker.propertyCategoryType || '';
          const categoryMapping = {
            'officeSpace': 'Office Space',
            'coWorking': 'Co-Working',
            'shop': 'Shop',
            'showroom': 'Showroom',
            'godownWarehouse': 'Godown/Warehouse',
            'industrialShed': 'Industrial Shed',
            'industrialBuilding': 'Industrial Building',
            'otherBusiness': 'Other business',
            'restaurantCafe': 'Restaurant/Cafe'
          };

          // Check if any selected property type matches
          return Object.entries(f.propertyTypes).some(([key, isSelected]) => {
            if (!isSelected) return false;
            const expectedCategory = categoryMapping[key];
            return categoryType === expectedCategory;
          });
        });
      }

      // Apply listed by filter
      if (hasListedByFilters) {
        filtered = filtered.filter(marker => {
          const raw = (marker.listed_by || marker.listedBy || '').toLowerCase();
          const tag = (marker.agentDetails?.tag || '').toLowerCase();
          const listedBy = raw || (tag.includes('builderinfo') ? 'buildersinfo' : 'agent');
          return (
            (f.filters.listedBy.owner && listedBy === 'owner') ||
            (f.filters.listedBy.agent && listedBy === 'agent') ||
            (f.filters.listedBy.iacre && listedBy === 'buildersinfo')
          );
        });
      }

      // Apply budget lumpsum filter
      if (hasBudgetLumpsumFilters) {
        filtered = filtered.filter(marker => {
          const priceValue = marker.discountedPrice
            ? parseFloat(marker.discountedPrice.toString().replace(/[₹,]/g, '')) || 0
            : getPriceValue(marker);

          const minBudget = f.budgetLumpsum.min ? parseFloat(f.budgetLumpsum.min) * 100000 : 0; // Convert lacs to actual price
          const maxBudget = f.budgetLumpsum.max ? parseFloat(f.budgetLumpsum.max) * 100000 : Infinity;

          if (f.budgetLumpsum.min && priceValue < minBudget) return false;
          if (f.budgetLumpsum.max && priceValue > maxBudget) return false;
          return true;
        });
      }

      // Apply budget per seat filter
      if (hasBudgetPerSeatFilters) {
        filtered = filtered.filter(marker => {
          const pricePerSeat = getPricePerSeat(marker);
          if (pricePerSeat === 0) return false; // Skip if no price per seat available

          const minPrice = f.budgetPerSeat.min ? parseFloat(f.budgetPerSeat.min) : 0;
          const maxPrice = f.budgetPerSeat.max ? parseFloat(f.budgetPerSeat.max) : Infinity;

          return pricePerSeat >= minPrice && pricePerSeat <= maxPrice;
        });
      }

      // Apply budget filter (old filter - in crores)
      if (hasBudgetFilters) {
        filtered = filtered.filter(marker => {
          const priceValue = marker.discountedPrice
            ? parseFloat(marker.discountedPrice.toString().replace(/[₹,]/g, '')) || 0
            : getPriceValue(marker);
          const minBudget = f.filters.budget[0] * 10000000; // Convert crores to actual price (1 crore = 10,000,000)
          const maxBudget = f.filters.budget[1] * 10000000;
          return priceValue >= minBudget && priceValue <= maxBudget;
        });
      }

      // Apply size filter
      if (hasSizeFilters) {
        filtered = filtered.filter(marker => {
          const raw = marker.propertySize ?? marker.size ?? 0;
          const size = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
          const sizeStr = String(marker.size || '');
          const isSqFt = typeof raw === 'number' || sizeStr.toLowerCase().includes('sq ft') || sizeStr.toLowerCase().includes('sqft');
          const minSize = f.filters.size[0];
          const maxSize = f.filters.size[1];

          let sizeInFilterUnit = size;
          if (isSqFt) {
            if (sizeUnit === 'Square Yards') sizeInFilterUnit = size / 9;
          } else {
            if (sizeUnit === 'Square Feet') sizeInFilterUnit = size * 9;
          }
          return sizeInFilterUnit >= minSize && sizeInFilterUnit <= maxSize;
        });
      }

      // Apply size filter (Min/Max dropdown in sq ft)
      if (hasSizeFilterDropdown) {
        filtered = filtered.filter(marker => {
          const sizeNum = getSizeValue(marker); // in sq ft
          if (sizeNum === 0) return true; // include if no size data
          const minSqft = f.sizeFilter.min ? parseFloat(f.sizeFilter.min) : 0;
          const maxSqft = f.sizeFilter.max ? parseFloat(f.sizeFilter.max) : Infinity;
          return sizeNum >= minSqft && sizeNum <= maxSqft;
        });
      }

      // Apply furnishing filter (multi-select checkboxes)
      if (hasFurnishingFilter) {
        filtered = filtered.filter(marker => {
          const mFurnishing = (marker.furnishingLevel || marker.furnishing || '').toLowerCase().replace(/\s/g, '');
          if (!mFurnishing) return true;
          const fMap = { full: 'full', none: 'none', semi: 'semi' };
          return Object.entries(f.furnishing).some(([key, sel]) => sel && mFurnishing.includes(fMap[key]));
        });
      }

      // Apply building type options (Independent House, Mall, etc.)
      if (hasBuildingTypeOptions) {
        const buildingLabels = {
          independentHouse: 'Independent House',
          mall: 'Mall',
          independentShop: 'Independent shop',
          businessPark: 'Business Park',
          standaloneBuilding: 'Standalone building',
        };
        filtered = filtered.filter(marker => {
          const mType = (marker.building_type || marker.buildingType || '').toLowerCase();
          if (!mType) return true;
          return Object.entries(f.buildingTypeOptions).some(([key, sel]) => sel && mType.includes((buildingLabels[key] || '').toLowerCase()));
        });
      }

      // Apply availability filter
      if (f.availability) {
        filtered = filtered.filter(marker => {
          const mAvail = (marker.availability || '').toLowerCase();
          if (!mAvail) return true;
          const aMap = { immediate: 'immediate', within30: '30', within15: '15', after30: 'after' };
          return mAvail.includes(aMap[f.availability]) || (f.availability === 'immediate' && mAvail.includes('immediate'));
        });
      }

      // Apply parking filter
      if (f.parking.public || f.parking.reserved) {
        filtered = filtered.filter(marker => {
          const mParking = (marker.parking || '').toLowerCase();
          if (!mParking) return true;
          if (f.parking.public && mParking.includes('public')) return true;
          if (f.parking.reserved && mParking.includes('reserved')) return true;
          return false;
        });
      }

      // Apply show only: With Photos
      if (f.showOnly.withPhotos) {
        filtered = filtered.filter(marker => {
          const hasImg = !!(marker.featuredImageUrl || (marker.images && marker.images.length > 0));
          return hasImg;
        });
      }
      // Remove Seen Properties - no-op if no seen tracking (include all)
      if (f.showOnly.removeSeen) {
        // Dummy: exclude nothing; could integrate with a "seen" list later
      }

      // Apply amenities filter
      if (f.amenities.powerBackup || f.amenities.lift) {
        filtered = filtered.filter(marker => {
          const mAmenities = (marker.amenities || marker.amenitiesList || '').toString().toLowerCase();
          if (!mAmenities) return true;
          const needPower = f.amenities.powerBackup && mAmenities.includes('power');
          const needLift = f.amenities.lift && mAmenities.includes('lift');
          if (f.amenities.powerBackup && !needPower) return false;
          if (f.amenities.lift && !needLift) return false;
          return true;
        });
      }

      // Apply floors filter
      if (hasFloorsFilter) {
        const floorRanges = {
          ground: [0, 0],
          '1to3': [1, 3],
          '4to6': [4, 6],
          '7to9': [7, 9],
          '10above': [10, 999],
          custom: null,
        };
        filtered = filtered.filter(marker => {
          const floorNum = parseInt(marker.floor || marker.floors || '0', 10) || 0;
          if (isNaN(floorNum)) return true;
          return Object.entries(f.floors).some(([key, sel]) => {
            if (!sel) return false;
            const range = floorRanges[key];
            if (!range) return true; // custom: include
            return floorNum >= range[0] && floorNum <= range[1];
          });
        });
      }

      // Apply property age filter
      if (hasPropertyAgeFilter) {
        filtered = filtered.filter(marker => {
          const age = (marker.propertyAge || marker.age || '').toLowerCase();
          if (!age) return true;
          const ageMap = {
            lessThan1: ['less', '1 year', 'new'],
            '1to5': ['1 to 5', '1-5'],
            '5to10': ['5 to 10', '5-10'],
            moreThan10: ['10', 'old', 'more than'],
          };
          return Object.entries(f.propertyAge).some(([key, sel]) => {
            if (!sel) return false;
            const terms = ageMap[key] || [];
            return terms.some(t => age.includes(t));
          });
        });
      }

    }

    // Apply sorting
    if (sortBy && sortBy !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'uploadedDateLatest':
            // Sort by uploaded date - latest first
            const dateA = a.uploadedDate ? new Date(a.uploadedDate).getTime() : 0;
            const dateB = b.uploadedDate ? new Date(b.uploadedDate).getTime() : 0;
            return dateB - dateA; // Latest first (descending)

          case 'priceLow':
            const priceA = getPriceValue(a);
            const priceB = getPriceValue(b);
            return priceA - priceB; // Low to high

          case 'priceHigh':
            const priceA2 = getPriceValue(a);
            const priceB2 = getPriceValue(b);
            return priceB2 - priceA2; // High to low

          case 'sizeLow':
            const sizeA = getSizeValue(a);
            const sizeB = getSizeValue(b);
            return sizeA - sizeB; // Low to high

          case 'sizeHigh':
            const sizeA2 = getSizeValue(a);
            const sizeB2 = getSizeValue(b);
            return sizeB2 - sizeA2; // High to low

          case 'totalPriceLow':
            const totalPriceA = getTotalPriceValue(a);
            const totalPriceB = getTotalPriceValue(b);
            return totalPriceA - totalPriceB; // Low to high

          case 'totalPriceHigh':
            const totalPriceA2 = getTotalPriceValue(a);
            const totalPriceB2 = getTotalPriceValue(b);
            return totalPriceB2 - totalPriceA2; // High to low

          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  return (
    <div className={`h-screen md:h-[87vh] flex flex-col relative transition-colors ${isDark ? 'bg-[#1f2229]' : 'bg-gray-100'}`}>
      <VisitorTracker onLocationUpdate={handleLocationUpdate} />

      {/* Scrollbar Styles for Mobile Modals */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
        /* Left drawer – thin scrollbar */
        .drawer-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .drawer-scroll::-webkit-scrollbar-thumb {
          background: ${isDark ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
        }
        .drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#6b7280' : '#94a3b8'};
        }
        .drawer-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#4b5563 #1f2229' : '#cbd5e1 transparent'};
        }
        /* Left drawer – smaller font sizes */
        .left-drawer-panel { font-size: 0.8125rem; }
        .left-drawer-panel .text-sm { font-size: 0.75rem !important; }
        .left-drawer-panel .text-lg { font-size: 0.875rem !important; }
        .left-drawer-panel .text-base { font-size: 0.8125rem !important; }
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
            {/* Menu + Profile Pill Button - same as desktop: whole unit, opens right drawer */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-full transition-colors cursor-pointer ${isDark
                ? 'border-gray-600 bg-[#282c34] hover:bg-white/10'
                : 'border-gray-300 bg-white hover:bg-gray-100'
                }`}
            >
              <Menu className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} strokeWidth={1.5} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <User className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} fill="none" />
              </div>
            </button>
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
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(suggestion.text);
                      setShowSuggestions(false);
                      if (typeof window !== 'undefined' && window.innerWidth < 480) {
                        setShowFiltersView(false);
                        setShowCitySelector(false);
                      }

                      // If suggestion has a marker (property), zoom to it
                      if (suggestion.marker && suggestion.marker.position) {
                        setMapCenter(suggestion.marker.position);
                        setZoomLevel(10); // Less zoom so city name is visible
                        setSearchQuery(suggestion.text);
                        if (typeof window !== 'undefined' && window.innerWidth < 480) setSelectedMarker(null);
                        return;
                      }

                      // If no marker, just set the search query to filter properties
                      setSearchQuery(suggestion.text);
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

      <main className="flex-1 relative flex pb-20 max-[525px]:pb-24 md:pb-0 min-h-0">
        <div className="hidden md:flex md:shrink-0 relative h-full min-h-0 overflow-hidden" style={{ maxWidth: isDrawerCollapsed ? 0 : 328, transition: 'max-width 300ms ease-in-out' }}>
          <div className={`left-drawer-panel w-[328px] shadow-lg flex flex-col h-full min-h-0 overflow-hidden shrink-0 ${isDark ? 'bg-[#1f2229]' : 'bg-gray-50'} ${isLoadingProperties ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className={`flex-shrink-0 z-20 px-3 pt-3 ${showFiltersView || showCitySelector ? 'pb-0' : 'pb-3'} ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}>
              <form onSubmit={handleSearch} className={showFiltersView || showCitySelector ? 'mb-2' : 'mb-3'}>
                <div className="relative search-container">
                  <div className={`rounded-lg pl-3 pr-2.5 py-2.5 w-full flex items-center gap-2 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div
                      className="flex-1 flex items-center gap-1.5 min-w-0 relative cursor-text"
                      onClick={() => {
                        if (!isSearchFocused) {
                          const input = document.querySelector('.search-input-field');
                          if (input) {
                            input.focus();
                            setIsSearchFocused(true);
                          }
                        }
                      }}
                    >
                      <span className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Search</span>
                      <div className="flex-1 relative min-w-0">
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
                          disabled={isLoadingProperties}
                          className={`w-full outline-none text-sm font-medium bg-transparent search-input-field ${isDark ? 'text-white' : 'text-gray-700'} ${searchQuery && !isSearchFocused ? 'absolute inset-0 opacity-0' : ''
                            } ${isLoadingProperties ? 'cursor-not-allowed' : ''}`}
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
                        disabled={isLoadingProperties}
                        className={`transition-colors ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowFiltersView(false);
                          setShowCitySelector(true);
                        }}
                        disabled={isLoadingProperties}
                        className={`transition-colors ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Globe className="w-4 h-4" />
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
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(suggestion.text);
                              setShowSuggestions(false);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }

                              // If suggestion has a marker (property), zoom to it
                              if (suggestion.marker && suggestion.marker.position) {
                                setMapCenter(suggestion.marker.position);
                                setZoomLevel(10); // Less zoom so city name is visible
                                setSearchQuery(suggestion.text);
                                return;
                              }

                              setSearchQuery(suggestion.text);
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
                  <div className={`rounded-lg p-0.5 flex mb-3 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <button
                      onClick={() => {
                        setPropertyTypeFilter('all');
                        setFilters(prev => ({
                          ...prev,
                          type: { commercial: false, residential: false }
                        }));
                      }}
                      disabled={isLoadingProperties}
                      className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${propertyTypeFilter === 'all'
                        ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
                      disabled={isLoadingProperties}
                      className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${propertyTypeFilter === 'commercial'
                        ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
                      disabled={isLoadingProperties}
                      className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${propertyTypeFilter === 'residential'
                        ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      Residential
                    </button>
                  </div>

                  {/* Listing Type Filters */}
                  <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setListingTypeFilter(listingTypeFilter === 'forSale' ? 'all' : 'forSale')}
                      disabled={isLoadingProperties}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'forSale'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      For Sale
                    </button>
                    <button
                      onClick={() => setListingTypeFilter(listingTypeFilter === 'forRent' ? 'all' : 'forRent')}
                      disabled={isLoadingProperties}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'forRent'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      For Rent
                    </button>
                    <button
                      onClick={() => setListingTypeFilter(listingTypeFilter === 'readyToMove' ? 'all' : 'readyToMove')}
                      disabled={isLoadingProperties}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'readyToMove'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      Ready to Move
                    </button>
                    <button
                      onClick={() => setListingTypeFilter(listingTypeFilter === 'newProjects' ? 'all' : 'newProjects')}
                      disabled={isLoadingProperties}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'newProjects'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      New Projects
                    </button>
                    <button
                      onClick={() => setListingTypeFilter(listingTypeFilter === 'verified' ? 'all' : 'verified')}
                      disabled={isLoadingProperties}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'verified'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => setListingTypeFilter(listingTypeFilter === 'video' ? 'all' : 'video')}
                      disabled={isLoadingProperties}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'video'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                        : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                        } ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      Video
                    </button>
                  </div>

                  {/* Properties Count and Sort */}
                  {getFilteredMarkers().length > 0 && (
                    <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className="text-sm">
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{getFilteredMarkers().length} {getFilteredMarkers().length === 1 ? 'property' : 'properties'}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}> found</span>
                      </p>
                      <div className="relative sort-dropdown-container">
                        <button
                          onClick={() => setShowSortDropdown(!showSortDropdown)}
                          disabled={isLoadingProperties}
                          className={`flex items-center gap-1 text-sm transition-colors px-2 py-1 rounded ${isDark ? 'text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-900'} ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          <span>Sort by</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showSortDropdown && (
                          <div className={`absolute right-0 top-full mt-1 w-40 rounded shadow-lg z-50 border text-xs ${isDark ? 'bg-[#282c34] border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="py-0.5">
                              <button
                                onClick={() => {
                                  setSortBy('uploadedDateLatest');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'uploadedDateLatest' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Uploaded Date (Latest)
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('priceLow');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'priceLow' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Price (low to high)
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('priceHigh');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'priceHigh' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Price (high to low)
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('sizeLow');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'sizeLow' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Size (low to high)
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('sizeHigh');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'sizeHigh' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Size (high to low)
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('totalPriceLow');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'totalPriceLow' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Total Price (low to high)
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('totalPriceHigh');
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'totalPriceHigh' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                              >
                                Total Price (high to low)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* City Selector View */}
            {showCitySelector ? (
              <div className={`flex-1 min-h-0 overflow-y-auto drawer-scroll ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}>
                {/* City Selector Header */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10 -mt-2 ${isDark ? 'border-gray-700 bg-[#1f2229]' : 'border-gray-200 bg-white'}`}>
                  <button
                    onClick={() => setShowCitySelector(false)}
                    className={`cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Country/City</h2>
                </div>

                {/* Search Input - Google Places Autocomplete for cities */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <PlacesAutocompleteInput
                    value={citySearchQuery}
                    onChange={setCitySearchQuery}
                    onSelect={({ description, lat, lng }) => {
                      setMapCenter({ lat, lng });
                      setZoomLevel(10);
                      setCitySearchQuery(description.split(',')[0].trim());
                      if (typeof window !== 'undefined' && window.innerWidth < 480) {
                        setShowFiltersView(false);
                        setShowCitySelector(false);
                      }
                    }}
                    placeholder="Select or type your city"
                    mapCenter={mapCenter}
                    type="city"
                    isDark={isDark}
                    iconLeft={Search}
                  />
                </div>

                {/* Detect Location and Reset City - same logic as Locate Me (bottom right) */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={async () => {
                      if (isDetectingLocation || isLoadingProperties) return;

                      setIsDetectingLocation(true);
                      try {
                        const loc = await getUserLocation();
                        // Core behavior: same as Locate Me - center map and zoom
                        setMapCenter({ lat: loc.lat, lng: loc.lng });
                        setZoomLevel(loc.isFallback ? 5 : loc.isApproximate ? 10 : 13);
                        setDetectedUserLocation({ lat: loc.lat, lng: loc.lng });
                        if (typeof window !== 'undefined' && window.innerWidth < 480) setShowCitySelector(false);

                        // Optional: reverse geocode to show city name in search
                        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                        if (apiKey) {
                          try {
                            const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lng}&key=${apiKey}`;
                            const geocodeRes = await fetch(reverseGeocodeUrl);
                            const geocodeData = await geocodeRes.json();

                            let cityName = null;
                            if (geocodeData.status === "OK" && geocodeData.results?.length > 0) {
                              const addressComponents = geocodeData.results[0].address_components;
                              for (const component of addressComponents) {
                                if (component.types.includes('locality')) {
                                  cityName = component.long_name;
                                  break;
                                } else if (component.types.includes('administrative_area_level_2')) {
                                  cityName = component.long_name;
                                }
                              }
                            }
                            if (cityName) setCitySearchQuery(cityName);
                            else setCitySearchQuery('');
                          } catch {
                            setCitySearchQuery('');
                          }
                        } else {
                          setCitySearchQuery('');
                        }
                      } catch (error) {
                        console.error('Error detecting location:', error);
                      } finally {
                        setIsDetectingLocation(false);
                      }
                    }}
                    disabled={isLoadingProperties || isDetectingLocation}
                    className={`flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors ${(isLoadingProperties || isDetectingLocation) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                    <span className="text-sm font-medium">{isDetectingLocation ? 'Detecting...' : 'Detect my location'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCity(null);
                      setSelectedMarker(null);
                      setMapCenter({ lat: 20.5937, lng: 78.9629 });
                      setZoomLevel(5);
                      setCitySearchQuery('');
                      setDetectedUserLocation(null);
                    }}
                    disabled={isLoadingProperties}
                    className={`text-sm transition-colors ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Reset City
                  </button>
                </div>

                {/* Closer Cities - shown when user has detected their location */}
                {detectedUserLocation && (
                  <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Closer Cities</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {sortCitiesByDistance(
                        [...new Set(indianCities)],
                        detectedUserLocation.lat,
                        detectedUserLocation.lng,
                        6
                      ).map(city => (
                        <button
                          key={city}
                          onClick={() => zoomToCity(city, { clearSearch: true })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-[#282c34]' : 'hover:bg-gray-50'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                            <MapPin className="w-6 h-6 text-blue-500" />
                          </div>
                          <span className={`text-xs text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Cities Section - always visible for quick selection */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Cities</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      'Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                      'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'
                    ].map(city => (
                      <button
                        key={city}
                        onClick={() => zoomToCity(city, { clearSearch: true })}
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
                    {(() => {
                      const filtered = [...new Set(indianCities)].filter(city =>
                        !citySearchQuery || city.toLowerCase().includes(citySearchQuery.toLowerCase())
                      ).filter(city =>
                        !['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                          'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'].includes(city)
                      );
                      const list = filtered.length > 0 ? filtered : [...new Set(indianCities)].filter(city =>
                        !['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                          'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'].includes(city)
                      );
                      return list.sort((a, b) => a.localeCompare(b));
                    })()
                      .map(city => (
                        <button
                          key={city}
                          onClick={() => zoomToCity(city, { offset: 0, zoomLevel: 12, clearSearch: true, closeSelector: false })}
                          className={`w-full px-0 py-3 text-left text-sm transition-colors cursor-pointer border-b last:border-b-0 ${isDark ? 'text-gray-300 hover:text-white hover:bg-[#282c34] border-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-100'}`}
                        >
                          {city}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : showFiltersView ? (
              <div className={`flex-1 min-h-0 overflow-y-auto drawer-scroll ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}>
                {/* Filters Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10 -mt-2 ${isDark ? 'border-gray-700 bg-[#1f2229]' : 'border-gray-200 bg-white'}`}>
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
                      setPropertyTypeFilter('all');
                      setFilters(prev => ({
                        ...prev,
                        type: { commercial: false, residential: false }
                      }));
                      setPropertyTypes({
                        officeSpace: false, coWorking: false, shop: false, showroom: false,
                        godownWarehouse: false, industrialShed: false, industrialBuilding: false,
                        otherBusiness: false, restaurantCafe: false,
                      });
                      setBudgetLumpsum({ min: '', max: '' });
                      setBudgetPerSeat({ min: '', max: '' });
                      setFilterLocalitySearch('');
                      setSizeFilter({ min: '', max: '' });
                      setFurnishing({ full: false, none: false, semi: false });
                      setBuildingTypeOptions({
                        independentHouse: false,
                        mall: false,
                        independentShop: false,
                        businessPark: false,
                        standaloneBuilding: false,
                      });
                      setAvailability('');
                      setParking({ public: false, reserved: false });
                      setShowOnly({ withPhotos: true, removeSeen: false });
                      setAmenities({ powerBackup: false, lift: false });
                      setFloors({
                        ground: false,
                        '1to3': false,
                        '4to6': false,
                        '7to9': false,
                        '10above': false,
                        custom: false,
                      });
                      setPropertyAge({
                        lessThan1: false,
                        '1to5': false,
                        '5to10': false,
                        moreThan10: false,
                      });
                      setResidentialPropertyType('');
                      setResidentialLocalitySearch('');
                      setResidentialLocalities({ mysoreRoad: false, sampangiRamaNagar: false, hebbal: false, banashankari: false });
                      setResidentialSocietySearch('');
                      setResidentialSocieties({ godrejTiara: false, sobhaInfinia: false, snnClermont: false, lntRaintreeBoulevard: false });
                      setBedrooms('');
                      setSaleType('');
                      setConstructionStatus('');
                      setWashrooms('');
                      setFloorFilter('');
                      setFacing('');
                      setReraRegistered(false);
                      setPropertiesWithOffers(false);
                      setFurnishingStatus('');
                      setPostedBy('');
                      setPossessionStatus('');
                      setCommercialLocalitySearch('');
                      setCommercialLocalities({ mysoreRoad: false, sampangiRamaNagar: false, hebbal: false, banashankari: false });
                      setCommercialSocietySearch('');
                      setCommercialSocieties({ godrejTiara: false, sobhaInfinia: false, snnClermont: false, lntRaintreeBoulevard: false });
                      setAmenitiesPills({ security24x7: false, powerBackup: false, visitorParking: false, attachedMarket: false, swimmingPool: false, clubhouse: false, centralAC: false, kidsPlayArea: false, intercom: false, vaastuCompliant: false, airConditioned: false, lift: false });
                      setAppliedFilters(null); // list will use current (cleared) snapshot
                    }}
                    className="text-blue-500 text-sm font-medium hover:text-blue-600 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                {/* Filters Content */}
                <div className="p-4 space-y-6">
                  {/* Search Type - segmented control (single bar, selected segment highlighted) */}
                  <div>
                    <h3 className={`text-xs font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Search Type</h3>
                    <div className={`flex rounded-lg p-0.5 ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
                      <button
                        onClick={() => setSearchType('locality')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-all ${searchType === 'locality'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        Locality
                      </button>
                      <button
                        onClick={() => setSearchType('metro')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-all ${searchType === 'metro'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        Along Metro
                      </button>
                      <button
                        onClick={() => setSearchType('travel')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-all ${searchType === 'travel'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        Travel time
                      </button>
                    </div>
                  </div>

                  {/* Search Localities Input - Google Places Autocomplete */}
                  <PlacesAutocompleteInput
                    value={filterLocalitySearch}
                    onChange={setFilterLocalitySearch}
                    onSelect={({ lat, lng }) => {
                      setMapCenter({ lat, lng });
                      setZoomLevel(14);
                      if (typeof window !== 'undefined' && window.innerWidth < 480) {
                        setShowFiltersView(false);
                        setShowCitySelector(false);
                      }
                    }}
                    placeholder={searchType === 'locality' ? 'Search upto 3 localities or landmarks' : searchType === 'metro' ? 'Search metro stations' : 'Search office or destination'}
                    mapCenter={mapCenter}
                    type={searchType === 'locality' ? 'locality' : searchType === 'metro' ? 'metro' : 'travel'}
                    isDark={isDark}
                    iconLeft={MapPin}
                    iconRight={Target}
                    disabled={isLoadingProperties}
                  />

                  {/* Building Type */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Building Type</h3>
                    <div className={`rounded-full p-1 flex ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                      <button
                        onClick={() => {
                          setBuildingType('commercial');
                          setPropertyTypeFilter('commercial');
                          setFilters(prev => ({
                            ...prev,
                            type: { commercial: true, residential: false }
                          }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${buildingType === 'commercial'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Commercial
                      </button>
                      <button
                        onClick={() => {
                          setBuildingType('residential');
                          setPropertyTypeFilter('residential');
                          setFilters(prev => ({
                            ...prev,
                            type: { commercial: false, residential: true }
                          }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${buildingType === 'residential'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        Residential
                      </button>
                    </div>
                  </div>

                  {/* Commercial-only filters */}
                  {buildingType === 'commercial' && (
                    <>
                      {/* Property Type (Commercial) */}
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
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${propertyTypes[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
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

                      {/* Size */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Size</h3>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <select
                              value={sizeFilter.min}
                              onChange={(e) => setSizeFilter(prev => ({ ...prev, min: e.target.value }))}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                              <option value="">Min</option>
                              <option value="500">500 sq ft</option>
                              <option value="1000">1000 sq ft</option>
                              <option value="2000">2000 sq ft</option>
                              <option value="5000">5000 sq ft</option>
                              <option value="10000">10000 sq ft</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <select
                              value={sizeFilter.max}
                              onChange={(e) => setSizeFilter(prev => ({ ...prev, max: e.target.value }))}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                              <option value="">Max</option>
                              <option value="1000">1000 sq ft</option>
                              <option value="2000">2000 sq ft</option>
                              <option value="5000">5000 sq ft</option>
                              <option value="10000">10000 sq ft</option>
                              <option value="50000">50000 sq ft</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Furnishing - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Furnishing</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'full', label: 'Full' },
                            { key: 'none', label: 'None' },
                            { key: 'semi', label: 'Semi' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setFurnishing(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${furnishing[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {furnishing[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Building Type - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Building Type</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'independentHouse', label: 'Independent House' },
                            { key: 'mall', label: 'Mall' },
                            { key: 'independentShop', label: 'Independent shop' },
                            { key: 'businessPark', label: 'Business Park' },
                            { key: 'standaloneBuilding', label: 'Standalone building' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setBuildingTypeOptions(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${buildingTypeOptions[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {buildingTypeOptions[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Availability - radio, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Availability</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { value: 'immediate', label: 'Immediate' },
                            { value: 'within30', label: 'Within 30 Days' },
                            { value: 'within15', label: 'Within 15 Days' },
                            { value: 'after30', label: 'After 30 Days' },
                          ].map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                              <span className="relative inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-blue-500 flex-shrink-0 cursor-pointer">
                                <input
                                  type="radio"
                                  name="availability"
                                  checked={availability === opt.value}
                                  onChange={() => setAvailability(prev => prev === opt.value ? '' : opt.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {availability === opt.value && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 pointer-events-none" />
                                )}
                              </span>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Parking - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Parking</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'public', label: 'Public' },
                            { key: 'reserved', label: 'Reserved' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setParking(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${parking[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {parking[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Show Only - vertical list (With Photos, Remove Seen + New) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Show Only</h3>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => setShowOnly(prev => ({ ...prev, withPhotos: !prev.withPhotos }))}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${showOnly.withPhotos
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-blue-500'
                                }`}
                            >
                              {showOnly.withPhotos && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>With Photos</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => setShowOnly(prev => ({ ...prev, removeSeen: !prev.removeSeen }))}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${showOnly.removeSeen
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-blue-500'
                                }`}
                            >
                              {showOnly.removeSeen && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Remove Seen Properties</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">New</span>
                          </label>
                        </div>
                      </div>

                      {/* Amenities - checkboxes side by side on one row */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Amenities</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          {[
                            { key: 'powerBackup', label: 'Power Backup' },
                            { key: 'lift', label: 'Lift' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setAmenities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${amenities[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {amenities[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Floors - pill buttons, 2 rows x 3 columns */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Floors</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'ground', label: 'Ground' },
                            { key: '1to3', label: '1 to 3' },
                            { key: '4to6', label: '4 to 6' },
                            { key: '7to9', label: '7 to 9' },
                            { key: '10above', label: '10 & above' },
                            { key: 'custom', label: 'Custom' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFloors(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${floors[item.key]
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Property Age - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Age</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'lessThan1', label: 'Less than a Year' },
                            { key: '5to10', label: '5 to 10 year' },
                            { key: '1to5', label: '1 to 5 year' },
                            { key: 'moreThan10', label: 'More than 10 year' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setPropertyAge(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${propertyAge[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {propertyAge[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Localities (Commercial) - Google Places Autocomplete */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Localities</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={commercialLocalitySearch}
                            onChange={setCommercialLocalitySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search localities"
                            mapCenter={mapCenter}
                            type="locality"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'mysoreRoad', label: 'Mysore Road' },
                            { key: 'sampangiRamaNagar', label: 'Sampangi Rama Nagar' },
                            { key: 'hebbal', label: 'Hebbal' },
                            { key: 'banashankari', label: 'Banashankari' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setCommercialLocalities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${commercialLocalities[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'}`}
                              >
                                {commercialLocalities[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Societies (Commercial) - Google Places Autocomplete */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Societies</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={commercialSocietySearch}
                            onChange={setCommercialSocietySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search societies"
                            mapCenter={mapCenter}
                            type="society"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'godrejTiara', label: 'Godrej Tiara' },
                            { key: 'sobhaInfinia', label: 'Sobha Infinia' },
                            { key: 'snnClermont', label: 'SNN Clermont' },
                            { key: 'lntRaintreeBoulevard', label: 'LnT Raintree Boulevard' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setCommercialSocieties(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${commercialSocieties[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'}`}
                              >
                                {commercialSocieties[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Residential-only filters */}
                  {buildingType === 'residential' && (
                    <>
                      {/* Property Type (Residential) - pills, smaller font, exactly like image */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Type</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'plot', label: 'Plot' },
                            { key: 'villa', label: 'Villa' },
                            { key: 'apartment', label: 'Apartment' },
                            { key: 'independentHouse', label: 'Independent House' },
                            { key: 'builderFloor', label: 'Builder Floor' },
                            { key: 'penthouse', label: 'Penthouse' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setResidentialPropertyType(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border ${residentialPropertyType === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {residentialPropertyType === item.key && (
                                <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                              )}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Localities (Residential) - search + checkboxes */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Localities</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={residentialLocalitySearch}
                            onChange={setResidentialLocalitySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search localities"
                            mapCenter={mapCenter}
                            type="locality"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'mysoreRoad', label: 'Mysore Road' },
                            { key: 'sampangiRamaNagar', label: 'Sampangi Rama Nagar' },
                            { key: 'hebbal', label: 'Hebbal' },
                            { key: 'banashankari', label: 'Banashankari' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setResidentialLocalities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${residentialLocalities[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'
                                  }`}
                              >
                                {residentialLocalities[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Societies (Residential) - search + checkboxes (image-style) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Societies</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={residentialSocietySearch}
                            onChange={setResidentialSocietySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search societies"
                            mapCenter={mapCenter}
                            type="society"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'godrejTiara', label: 'Godrej Tiara' },
                            { key: 'sobhaInfinia', label: 'Sobha Infinia' },
                            { key: 'snnClermont', label: 'SNN Clermont' },
                            { key: 'lntRaintreeBoulevard', label: 'LnT Raintree Boulevard' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setResidentialSocieties(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${residentialSocieties[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'
                                  }`}
                              >
                                {residentialSocieties[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Bedrooms - pill buttons grid (residential only) - 3 cols x 4 rows */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Bedrooms</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: '1bhk', label: '1 BHK' },
                            { key: '1rk', label: '1 RK' },
                            { key: '1.5bhk', label: '1.5 BHK' },
                            { key: '2bhk', label: '2 BHK' },
                            { key: '2.5bhk', label: '2.5 BHK' },
                            { key: '3bhk', label: '3 BHK' },
                            { key: '3.5bhk', label: '3.5 BHK' },
                            { key: '4bhk', label: '4 BHK' },
                            { key: '5bhk', label: '5 BHK' },
                            { key: '6bhk', label: '6 BHK' },
                            { key: '6plusbhk', label: '6+ BHK' },
                            { key: 'studio', label: 'Studio' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setBedrooms(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${bedrooms === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {bedrooms === item.key && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sale Type - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Sale Type</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'new', label: 'New' },
                            { key: 'resale', label: 'Resale' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setSaleType(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${saleType === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {saleType === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Construction Status - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Construction Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'readyToMove', label: 'Ready To Move' },
                            { key: 'underConstruction', label: 'Under Construction' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setConstructionStatus(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${constructionStatus === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {constructionStatus === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number of washrooms - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Number of washrooms</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {['1', '2', '3', '4', '5'].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setWashrooms(prev => prev === n ? '' : n)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${washrooms === n
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {washrooms === n && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>+{n}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Floor - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Floor</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { key: 'basement', label: 'Basement' },
                            { key: 'ground', label: 'Ground' },
                            { key: '1to4', label: '1-4' },
                            { key: '5to8', label: '5-8' },
                            { key: '9to12', label: '9-12' },
                            { key: '13to16', label: '13-16' },
                            { key: '16plus', label: '16+' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFloorFilter(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${floorFilter === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {floorFilter === item.key && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Facing - 8 directions (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Facing</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'east', label: 'East' },
                            { key: 'northEast', label: 'North-East' },
                            { key: 'south', label: 'South' },
                            { key: 'southWest', label: 'South-West' },
                            { key: 'north', label: 'North' },
                            { key: 'northWest', label: 'North-West' },
                            { key: 'southEast', label: 'South-East' },
                            { key: 'west', label: 'West' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFacing(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${facing === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {facing === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* RERA Registered Properties - toggle (residential only) */}
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>RERA Registered Properties</h3>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={reraRegistered}
                          onClick={() => setReraRegistered(prev => !prev)}
                          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${reraRegistered ? 'bg-blue-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${reraRegistered ? 'left-5' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Properties with Offers - toggle (residential only) */}
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Properties with Offers</h3>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={propertiesWithOffers}
                          onClick={() => setPropertiesWithOffers(prev => !prev)}
                          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${propertiesWithOffers ? 'bg-blue-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${propertiesWithOffers ? 'left-5' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Furnishing Status - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Furnishing Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'furnished', label: 'Furnished' },
                            { key: 'semiFurnished', label: 'Semi-Furnished' },
                            { key: 'unfurnished', label: 'Unfurnished' },
                            { key: 'gatedCommunities', label: 'Gated Communities' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFurnishingStatus(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${furnishingStatus === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {furnishingStatus === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Posted by - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Posted by</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'owners', label: 'Owners' },
                            { key: 'partnerAgents', label: 'Partner Agents' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setPostedBy(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${postedBy === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {postedBy === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Possession Status - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Possession Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'readyToMove', label: 'Ready To Move' },
                            { key: 'underConstruction', label: 'Under Construction' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setPossessionStatus(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${possessionStatus === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {possessionStatus === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Amenities - pill buttons (residential only) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Amenities</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'security24x7', label: '24 x 7 Security' },
                            { key: 'powerBackup', label: 'Power Backup' },
                            { key: 'visitorParking', label: "Visitor's Parking" },
                            { key: 'attachedMarket', label: 'Attached Market' },
                            { key: 'swimmingPool', label: 'Swimming Pool' },
                            { key: 'clubhouse', label: 'Clubhouse' },
                            { key: 'centralAC', label: 'Central AC' },
                            { key: 'kidsPlayArea', label: 'Kids Play Area' },
                            { key: 'intercom', label: 'Intercom' },
                            { key: 'vaastuCompliant', label: 'Vaastu Compliant' },
                            { key: 'airConditioned', label: 'Air Conditioned' },
                            { key: 'lift', label: 'Lift' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setAmenitiesPills(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${amenitiesPills[item.key]
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {amenitiesPills[item.key] && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Apply Filters Button - only apply filter data when clicked, not on every checkbox/radio change */}
                <div className={`sticky bottom-0 p-4 border-t ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-200'}`}>
                  <button
                    onClick={handleApplyFilters}
                    disabled={isApplyingFilters}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            ) : !showCitySelector ? (
              /* Property List */
              <div className={`flex-1 min-h-0 overflow-y-auto drawer-scroll p-2.5 space-y-2 ${isDark ? 'bg-[#1f2229]' : 'bg-gray-50'}`}>
                {getFilteredMarkers().length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
                      <Search className={`w-7 h-7 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-medium text-sm mb-0.5">No property found</p>
                    <p className="text-xs">Try changing your search or filters.</p>
                  </div>
                ) : getFilteredMarkers().map((marker, index) => {
                  const isActive = selectedCity && (String(marker._id || marker.id) === String(selectedCity._id || selectedCity.id));
                  return (
                  <div
                    key={`${marker.id}-${marker.propertyCategory || 'c'}-${index}`}
                    className={`rounded-lg p-2 cursor-pointer transition-all shadow-sm ${isActive ? 'border-2 border-blue-500' : 'border border-transparent'} ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-white hover:bg-[#fff3c5] hover:shadow-md'}`}
                    onClick={() => handleMarkerClick(marker)}
                  >
                    <div className="flex gap-2">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={marker.featuredImageUrl || marker.images?.[0] || '/placeholder.png'}
                          alt={marker.propertyName || "Property Image"}
                          width={56}
                          height={56}
                          className="rounded-md object-cover w-14 h-14"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1 min-w-0">
                            <h3 className={`font-semibold text-xs leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {marker.propertyName || 'Property Name'}
                            </h3>
                            {marker.isVerified && (
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                <path d="M12 1L14.4 4.2L18.3 3.4L18.1 7.4L21.6 9.2L19.4 12.5L21.6 15.8L18.1 17.6L18.3 21.6L14.4 20.8L12 24L9.6 20.8L5.7 21.6L5.9 17.6L2.4 15.8L4.6 12.5L2.4 9.2L5.9 7.4L5.7 3.4L9.6 4.2L12 1Z" fill="#FBBF24" />
                                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFavouriteToggle(marker);
                              }}
                              className={`p-0.5 rounded-full transition-colors ${propertyFavorites[marker._id || marker.id]
                                ? 'text-red-500'
                                : isDark ? 'text-gray-500 hover:text-red-500' : 'text-gray-300 hover:text-red-500'
                                }`}
                            >
                              <Heart
                                className="w-3.5 h-3.5"
                                fill={propertyFavorites[marker._id || marker.id] ? "currentColor" : "none"}
                                strokeWidth={2}
                              />
                            </button>
                            <a
                              href={`https://wa.me/${(marker.agentDetails?.phone || marker.sellerPhoneNumber)?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(marker.propertyName || 'this property')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`p-0.5 rounded-full transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <Image src="/whatsapp.svg" alt="WhatsApp" width={14} height={14} />
                            </a>
                          </div>
                        </div>
                        <p className={`text-[10px] mb-0.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>in {marker.address?.locality || marker.address?.district || marker.address?.state}</span>
                          {marker.address?.district && marker.address?.locality && marker.address.district !== marker.address.locality && (
                            <span>, {marker.address.district}</span>
                          )}
                          {marker.address?.state && (
                            <span>, {marker.address.state}</span>
                          )}
                        </p>
                        {(() => {
                          const markerPrices = calculatePrices(marker);
                          if (markerPrices.discountedPrice && markerPrices.discountedPrice !== '₹XX') {
                            return (
                              <p className="text-xs">
                                <span className="font-bold text-blue-500">{markerPrices.discountedPrice}</span>
                                {markerPrices.originalPrice && markerPrices.originalPrice !== markerPrices.discountedPrice && (
                                  <span className={`line-through ml-1 text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{markerPrices.originalPrice}</span>
                                )}
                              </p>
                            );
                          } else if (marker.pricePerAcre && marker.pricePerAcre !== 'N/A') {
                            return (
                              <p className="text-xs">
                                <span className="font-bold text-orange-500">{marker.pricePerAcre}</span>
                                <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/sq.ft</span>
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Compact search bar when collapsed - same position as drawer search (top left) */}
          {isDrawerCollapsed && (
            <div className="hidden md:block absolute top-0 left-0 z-20 pointer-events-auto">
              <CollapsedDrawerSearch
                searchQuery={searchQuery}
                onSearchChange={handleSearchInputChange}
                onSearch={handleSearch}
                onSuggestionSelect={(suggestion) => {
                  setSearchQuery(suggestion.text);
                  setShowSuggestions(false);
                  if (typeof window !== 'undefined' && window.innerWidth < 480) {
                    setShowFiltersView(false);
                    setShowCitySelector(false);
                  }
                  if (suggestion.marker?.position) {
                    setMapCenter(suggestion.marker.position);
                    setZoomLevel(10);
                  }
                }}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
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
                isSearchFocused={isSearchFocused}
                onFilterClick={() => {
                  setShowCitySelector(false);
                  setShowFiltersView(true);
                  setIsDrawerCollapsed(false);
                }}
                onGlobeClick={() => {
                  setShowFiltersView(false);
                  setShowCitySelector(true);
                  setIsDrawerCollapsed(false);
                }}
                isDark={isDark}
                isLoadingProperties={isLoadingProperties}
              />
            </div>
          )}
        </div>

        {/* Toggle Button - outside overflow-hidden so it stays visible when collapsed */}
        <button
          onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 text-white px-2 py-4 rounded-r-lg shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
          style={{ left: isDrawerCollapsed ? 0 : 328, transition: 'left 300ms ease-in-out' }}
          aria-label={isDrawerCollapsed ? "Expand drawer" : "Collapse drawer"}
        >
          {isDrawerCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

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
            isDark={isDark}
          />

          {/* Locate Me loading overlay */}
          {isLocating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className={`flex flex-col items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-[#1f2937]' : 'bg-white'} shadow-xl`}>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Locating...</span>
              </div>
            </div>
          )}

          {/* Detect my location loading overlay (city section in drawer) */}
          {isDetectingLocation && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className={`flex flex-col items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-[#1f2937]' : 'bg-white'} shadow-xl`}>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Detecting...</span>
              </div>
            </div>
          )}

          {/* Zooming to city overlay */}
          {zoomingCityName && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className={`flex flex-col items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-[#1f2937]' : 'bg-white'} shadow-xl`}>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Zooming on {zoomingCityName}</span>
              </div>
            </div>
          )}

          {/* Apply Filters loading overlay */}
          {isApplyingFilters && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className={`flex flex-col items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-[#1f2937]' : 'bg-white'} shadow-xl`}>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Loading...</span>
              </div>
            </div>
          )}

          {/* Mobile List View Button - Bottom Left above footer */}
          <button
            onClick={() => setShowMobileList(!showMobileList)}
            className="md:hidden absolute bottom-16 left-3 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">List View</span>
          </button>

          {/* Property Detail Modal - bottom-aligned, horizontally centered in map area */}
          {selectedCity && (
            <div className="absolute inset-0 flex items-end justify-center z-40 pointer-events-none">
              <div className="pointer-events-auto">
                <PropertyDetailModal
                  property={selectedCity}
                  onClose={closeCityModal}
                  onViewDetailsClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 480) closeCityModal(); }}
                  isPropertyListVisible={isPropertyListVisible}
                  centerInMapArea
                />
              </div>
            </div>
          )}

          {/* Map Controls - Vertical Panel - Same as desktop; move to top when property modal open */}
          <div className={`absolute right-3 md:right-4 z-10 ${selectedCity ? 'top-3 md:top-4' : 'bottom-20 md:bottom-12'}`}>
            <div className={`rounded-xl overflow-hidden shadow-xl ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
              {/* Add Property Button */}
              <button
                onClick={() => setShowAddPropertyModal(true)}
                className={`p-2.5 md:p-3 transition-colors flex items-center justify-center cursor-pointer border-b ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b] border-gray-700' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'}`}
                title="Add Your Property"
              >
                <div className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center ${isDark ? 'border-white' : 'border-black'}`}>
                  <Plus className={`w-2 h-2 ${isDark ? 'text-white' : 'text-black'}`} />
                </div>
              </button>

              {/* Locate Me Button - zoom to user location */}
              <button
                onClick={async () => {
                  if (isLocating) return;
                  if (typeof window !== 'undefined' && window.innerWidth < 480) {
                    setSelectedMarker(null);
                    setSelectedCity(null);
                  }
                  setIsLocating(true);
                  try {
                    const loc = await getUserLocation();
                    setMapCenter({ lat: loc.lat, lng: loc.lng });
                    setZoomLevel(loc.isFallback ? 5 : loc.isApproximate ? 10 : 13);
                  } catch (e) {
                    console.error('Locate failed:', e);
                  } finally {
                    setIsLocating(false);
                  }
                }}
                disabled={isLocating}
                className={`p-2.5 md:p-3 transition-colors flex items-center justify-center border-b ${isLocating ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isDark ? 'bg-[#1f2229] hover:bg-[#282c34] border-gray-700' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
                title="Locate Me"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
                ) : (
                  <LocateFixed className="w-3 h-3 text-red-500" />
                )}
              </button>

              {/* Layers Button - first declaration modal, then layer menu on Proceed; if menu open, close it */}
              <button
                onClick={() => {
                  if (showLayerMenu) {
                    setShowLayerMenu(false);
                  } else {
                    setShowLayersDeclarationModal(true);
                  }
                }}
                className={`p-2.5 md:p-3 transition-colors flex items-center justify-center cursor-pointer ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="Map Layers"
              >
                <Layers className={`w-3 h-3 ${isDark ? 'text-white' : 'text-black'}`} />
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
                      className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm transition-colors flex items-center gap-2 ${mapType === type.id
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
                    className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm transition-colors flex items-center gap-2 ${showTraffic
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
            <div className={`relative w-full rounded-t-3xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: 'min(90vh, 90svh)' }}>
              {/* Drag Handle */}
              <div className="flex justify-center py-3 flex-shrink-0">
                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              </div>

              {/* Scrollable Content */}
              <div
                className="overflow-y-auto mobile-modal-scroll flex-1 min-h-0"
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
                      setPropertyTypeFilter('all');
                      setFilters(prev => ({
                        ...prev,
                        type: { commercial: false, residential: false }
                      }));
                      setPropertyTypes({
                        officeSpace: false, coWorking: false, shop: false, showroom: false,
                        godownWarehouse: false, industrialShed: false, industrialBuilding: false,
                        otherBusiness: false, restaurantCafe: false,
                      });
                      setBudgetLumpsum({ min: '', max: '' });
                      setBudgetPerSeat({ min: '', max: '' });
                      setFilterLocalitySearch('');
                      setSizeFilter({ min: '', max: '' });
                      setFurnishing({ full: false, none: false, semi: false });
                      setBuildingTypeOptions({
                        independentHouse: false,
                        mall: false,
                        independentShop: false,
                        businessPark: false,
                        standaloneBuilding: false,
                      });
                      setAvailability('');
                      setParking({ public: false, reserved: false });
                      setShowOnly({ withPhotos: true, removeSeen: false });
                      setAmenities({ powerBackup: false, lift: false });
                      setFloors({
                        ground: false,
                        '1to3': false,
                        '4to6': false,
                        '7to9': false,
                        '10above': false,
                        custom: false,
                      });
                      setPropertyAge({
                        lessThan1: false,
                        '1to5': false,
                        '5to10': false,
                        moreThan10: false,
                      });
                      setResidentialPropertyType('');
                      setResidentialLocalitySearch('');
                      setResidentialLocalities({ mysoreRoad: false, sampangiRamaNagar: false, hebbal: false, banashankari: false });
                      setResidentialSocietySearch('');
                      setResidentialSocieties({ godrejTiara: false, sobhaInfinia: false, snnClermont: false, lntRaintreeBoulevard: false });
                      setBedrooms('');
                      setSaleType('');
                      setConstructionStatus('');
                      setWashrooms('');
                      setFloorFilter('');
                      setFacing('');
                      setReraRegistered(false);
                      setPropertiesWithOffers(false);
                      setFurnishingStatus('');
                      setPostedBy('');
                      setPossessionStatus('');
                      setCommercialLocalitySearch('');
                      setCommercialLocalities({ mysoreRoad: false, sampangiRamaNagar: false, hebbal: false, banashankari: false });
                      setCommercialSocietySearch('');
                      setCommercialSocieties({ godrejTiara: false, sobhaInfinia: false, snnClermont: false, lntRaintreeBoulevard: false });
                      setAmenitiesPills({ security24x7: false, powerBackup: false, visitorParking: false, attachedMarket: false, swimmingPool: false, clubhouse: false, centralAC: false, kidsPlayArea: false, intercom: false, vaastuCompliant: false, airConditioned: false, lift: false });
                      setAppliedFilters(null); // list will use current (cleared) snapshot
                    }}
                    className="text-blue-500 text-sm font-medium hover:text-blue-600 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                {/* Filters Content */}
                <div className="p-4 space-y-6 pb-32 max-[525px]:pb-36">
                  {/* Search Type - segmented control (single bar, selected segment highlighted) */}
                  <div>
                    <h3 className={`text-xs font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Search Type</h3>
                    <div className={`flex rounded-lg p-0.5 ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
                      <button
                        onClick={() => setSearchType('locality')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-all ${searchType === 'locality'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        Locality
                      </button>
                      <button
                        onClick={() => setSearchType('metro')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-all ${searchType === 'metro'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        Along Metro
                      </button>
                      <button
                        onClick={() => setSearchType('travel')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-all ${searchType === 'travel'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        Travel time
                      </button>
                    </div>
                  </div>

                  <PlacesAutocompleteInput
                    value={filterLocalitySearch}
                    onChange={setFilterLocalitySearch}
                    onSelect={({ lat, lng }) => {
                      setMapCenter({ lat, lng });
                      setZoomLevel(14);
                      if (typeof window !== 'undefined' && window.innerWidth < 480) {
                        setShowFiltersView(false);
                        setShowCitySelector(false);
                      }
                    }}
                    placeholder={searchType === 'locality' ? 'Search upto 3 localities or landmarks' : searchType === 'metro' ? 'Search metro stations' : 'Search office or destination'}
                    mapCenter={mapCenter}
                    type={searchType === 'locality' ? 'locality' : searchType === 'metro' ? 'metro' : 'travel'}
                    isDark={isDark}
                    iconLeft={MapPin}
                    iconRight={Target}
                    disabled={isLoadingProperties}
                  />

                  {/* Building Type */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Building Type</h3>
                    <div className={`rounded-full p-1 flex ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                      <button
                        onClick={() => {
                          setBuildingType('commercial');
                          setPropertyTypeFilter('commercial');
                          setFilters(prev => ({
                            ...prev,
                            type: { commercial: true, residential: false }
                          }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${buildingType === 'commercial'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Commercial
                      </button>
                      <button
                        onClick={() => {
                          setBuildingType('residential');
                          setPropertyTypeFilter('residential');
                          setFilters(prev => ({
                            ...prev,
                            type: { commercial: false, residential: true }
                          }));
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${buildingType === 'residential'
                          ? isDark ? 'bg-[#3a3f4b] text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                          : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        Residential
                      </button>
                    </div>
                  </div>

                  {/* Commercial-only filters (mobile) */}
                  {buildingType === 'commercial' && (
                    <>
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
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${propertyTypes[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
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

                      {/* Size */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Size</h3>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <select
                              value={sizeFilter.min}
                              onChange={(e) => setSizeFilter(prev => ({ ...prev, min: e.target.value }))}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                              <option value="">Min</option>
                              <option value="500">500 sq ft</option>
                              <option value="1000">1000 sq ft</option>
                              <option value="2000">2000 sq ft</option>
                              <option value="5000">5000 sq ft</option>
                              <option value="10000">10000 sq ft</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <select
                              value={sizeFilter.max}
                              onChange={(e) => setSizeFilter(prev => ({ ...prev, max: e.target.value }))}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer ${isDark ? 'bg-[#282c34] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                              <option value="">Max</option>
                              <option value="1000">1000 sq ft</option>
                              <option value="2000">2000 sq ft</option>
                              <option value="5000">5000 sq ft</option>
                              <option value="10000">10000 sq ft</option>
                              <option value="50000">50000 sq ft</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Furnishing - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Furnishing</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'full', label: 'Full' },
                            { key: 'none', label: 'None' },
                            { key: 'semi', label: 'Semi' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setFurnishing(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${furnishing[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {furnishing[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Building Type - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Building Type</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'independentHouse', label: 'Independent House' },
                            { key: 'mall', label: 'Mall' },
                            { key: 'independentShop', label: 'Independent shop' },
                            { key: 'businessPark', label: 'Business Park' },
                            { key: 'standaloneBuilding', label: 'Standalone building' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setBuildingTypeOptions(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${buildingTypeOptions[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {buildingTypeOptions[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Availability - radio, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Availability</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { value: 'immediate', label: 'Immediate' },
                            { value: 'within30', label: 'Within 30 Days' },
                            { value: 'within15', label: 'Within 15 Days' },
                            { value: 'after30', label: 'After 30 Days' },
                          ].map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                              <span className="relative inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-blue-500 flex-shrink-0 cursor-pointer">
                                <input
                                  type="radio"
                                  name="availability-mobile"
                                  checked={availability === opt.value}
                                  onChange={() => setAvailability(prev => prev === opt.value ? '' : opt.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {availability === opt.value && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 pointer-events-none" />
                                )}
                              </span>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Parking - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Parking</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'public', label: 'Public' },
                            { key: 'reserved', label: 'Reserved' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setParking(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${parking[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {parking[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Show Only - vertical list */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Show Only</h3>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => setShowOnly(prev => ({ ...prev, withPhotos: !prev.withPhotos }))}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${showOnly.withPhotos
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-blue-500'
                                }`}
                            >
                              {showOnly.withPhotos && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>With Photos</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => setShowOnly(prev => ({ ...prev, removeSeen: !prev.removeSeen }))}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${showOnly.removeSeen
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-blue-500'
                                }`}
                            >
                              {showOnly.removeSeen && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Remove Seen Properties</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">New</span>
                          </label>
                        </div>
                      </div>

                      {/* Amenities - checkboxes side by side on one row */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Amenities</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          {[
                            { key: 'powerBackup', label: 'Power Backup' },
                            { key: 'lift', label: 'Lift' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setAmenities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${amenities[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {amenities[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Floors - pill buttons, 2 rows x 3 columns */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Floors</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'ground', label: 'Ground' },
                            { key: '1to3', label: '1 to 3' },
                            { key: '4to6', label: '4 to 6' },
                            { key: '7to9', label: '7 to 9' },
                            { key: '10above', label: '10 & above' },
                            { key: 'custom', label: 'Custom' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFloors(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${floors[item.key]
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Property Age - checkboxes, 2 columns side by side */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Age</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { key: 'lessThan1', label: 'Less than a Year' },
                            { key: '5to10', label: '5 to 10 year' },
                            { key: '1to5', label: '1 to 5 year' },
                            { key: 'moreThan10', label: 'More than 10 year' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setPropertyAge(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${propertyAge[item.key]
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-blue-500'
                                  }`}
                              >
                                {propertyAge[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Localities (Commercial) - Google Places Autocomplete (mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Localities</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={commercialLocalitySearch}
                            onChange={setCommercialLocalitySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search localities"
                            mapCenter={mapCenter}
                            type="locality"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'mysoreRoad', label: 'Mysore Road' },
                            { key: 'sampangiRamaNagar', label: 'Sampangi Rama Nagar' },
                            { key: 'hebbal', label: 'Hebbal' },
                            { key: 'banashankari', label: 'Banashankari' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setCommercialLocalities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${commercialLocalities[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'}`}
                              >
                                {commercialLocalities[item.key] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Societies (Commercial) - Google Places Autocomplete (mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Societies</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={commercialSocietySearch}
                            onChange={setCommercialSocietySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search societies"
                            mapCenter={mapCenter}
                            type="society"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'godrejTiara', label: 'Godrej Tiara' },
                            { key: 'sobhaInfinia', label: 'Sobha Infinia' },
                            { key: 'snnClermont', label: 'SNN Clermont' },
                            { key: 'lntRaintreeBoulevard', label: 'LnT Raintree Boulevard' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setCommercialSocieties(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${commercialSocieties[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'}`}
                              >
                                {commercialSocieties[item.key] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Residential-only filters (mobile) */}
                  {buildingType === 'residential' && (
                    <>
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Property Type</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'plot', label: 'Plot' },
                            { key: 'villa', label: 'Villa' },
                            { key: 'apartment', label: 'Apartment' },
                            { key: 'independentHouse', label: 'Independent House' },
                            { key: 'builderFloor', label: 'Builder Floor' },
                            { key: 'penthouse', label: 'Penthouse' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setResidentialPropertyType(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border ${residentialPropertyType === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {residentialPropertyType === item.key && (
                                <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                              )}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Localities</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={residentialLocalitySearch}
                            onChange={setResidentialLocalitySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search localities"
                            mapCenter={mapCenter}
                            type="locality"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'mysoreRoad', label: 'Mysore Road' },
                            { key: 'sampangiRamaNagar', label: 'Sampangi Rama Nagar' },
                            { key: 'hebbal', label: 'Hebbal' },
                            { key: 'banashankari', label: 'Banashankari' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setResidentialLocalities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${residentialLocalities[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'
                                  }`}
                              >
                                {residentialLocalities[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Societies (Residential) - search + checkboxes (mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Societies</h3>
                        <div className="mb-3">
                          <PlacesAutocompleteInput
                            value={residentialSocietySearch}
                            onChange={setResidentialSocietySearch}
                            onSelect={({ lat, lng }) => {
                              setMapCenter({ lat, lng });
                              setZoomLevel(14);
                              if (typeof window !== 'undefined' && window.innerWidth < 480) {
                                setShowFiltersView(false);
                                setShowCitySelector(false);
                              }
                            }}
                            placeholder="Search societies"
                            mapCenter={mapCenter}
                            type="society"
                            isDark={isDark}
                            iconLeft={Search}
                            disabled={isLoadingProperties}
                          />
                        </div>
                        <div className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-gray-600 bg-[#282c34]' : 'border-gray-200 bg-white'}`}>
                          {[
                            { key: 'godrejTiara', label: 'Godrej Tiara' },
                            { key: 'sobhaInfinia', label: 'Sobha Infinia' },
                            { key: 'snnClermont', label: 'SNN Clermont' },
                            { key: 'lntRaintreeBoulevard', label: 'LnT Raintree Boulevard' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => setResidentialSocieties(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${residentialSocieties[item.key] ? 'bg-blue-500 border-blue-500' : 'border-blue-500'
                                  }`}
                              >
                                {residentialSocieties[item.key] && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Bedrooms - pill buttons grid (residential mobile) - 3 cols */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Bedrooms</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: '1bhk', label: '1 BHK' },
                            { key: '1rk', label: '1 RK' },
                            { key: '1.5bhk', label: '1.5 BHK' },
                            { key: '2bhk', label: '2 BHK' },
                            { key: '2.5bhk', label: '2.5 BHK' },
                            { key: '3bhk', label: '3 BHK' },
                            { key: '3.5bhk', label: '3.5 BHK' },
                            { key: '4bhk', label: '4 BHK' },
                            { key: '5bhk', label: '5 BHK' },
                            { key: '6bhk', label: '6 BHK' },
                            { key: '6plusbhk', label: '6+ BHK' },
                            { key: 'studio', label: 'Studio' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setBedrooms(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${bedrooms === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {bedrooms === item.key && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sale Type - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Sale Type</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'new', label: 'New' },
                            { key: 'resale', label: 'Resale' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setSaleType(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${saleType === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {saleType === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Construction Status - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Construction Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'readyToMove', label: 'Ready To Move' },
                            { key: 'underConstruction', label: 'Under Construction' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setConstructionStatus(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${constructionStatus === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {constructionStatus === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number of washrooms - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Number of washrooms</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {['1', '2', '3', '4', '5'].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setWashrooms(prev => prev === n ? '' : n)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${washrooms === n
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {washrooms === n && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>+{n}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Floor - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Floor</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { key: 'basement', label: 'Basement' },
                            { key: 'ground', label: 'Ground' },
                            { key: '1to4', label: '1-4' },
                            { key: '5to8', label: '5-8' },
                            { key: '9to12', label: '9-12' },
                            { key: '13to16', label: '13-16' },
                            { key: '16plus', label: '16+' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFloorFilter(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${floorFilter === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {floorFilter === item.key && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Facing - 8 directions (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Facing</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'east', label: 'East' },
                            { key: 'northEast', label: 'North-East' },
                            { key: 'south', label: 'South' },
                            { key: 'southWest', label: 'South-West' },
                            { key: 'north', label: 'North' },
                            { key: 'northWest', label: 'North-West' },
                            { key: 'southEast', label: 'South-East' },
                            { key: 'west', label: 'West' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFacing(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${facing === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {facing === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* RERA & Properties with Offers - toggles (residential mobile) */}
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>RERA Registered Properties</h3>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={reraRegistered}
                          onClick={() => setReraRegistered(prev => !prev)}
                          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${reraRegistered ? 'bg-blue-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${reraRegistered ? 'left-5' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Properties with Offers</h3>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={propertiesWithOffers}
                          onClick={() => setPropertiesWithOffers(prev => !prev)}
                          className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${propertiesWithOffers ? 'bg-blue-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${propertiesWithOffers ? 'left-5' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Furnishing Status - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Furnishing Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'furnished', label: 'Furnished' },
                            { key: 'semiFurnished', label: 'Semi-Furnished' },
                            { key: 'unfurnished', label: 'Unfurnished' },
                            { key: 'gatedCommunities', label: 'Gated Communities' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setFurnishingStatus(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${furnishingStatus === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {furnishingStatus === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Posted by - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Posted by</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'owners', label: 'Owners' },
                            { key: 'partnerAgents', label: 'Partner Agents' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setPostedBy(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${postedBy === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {postedBy === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Possession Status - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Possession Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'readyToMove', label: 'Ready To Move' },
                            { key: 'underConstruction', label: 'Under Construction' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setPossessionStatus(prev => prev === item.key ? '' : item.key)}
                              className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${possessionStatus === item.key
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {possessionStatus === item.key && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Amenities - pill buttons (residential mobile) */}
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Amenities</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'security24x7', label: '24 x 7 Security' },
                            { key: 'powerBackup', label: 'Power Backup' },
                            { key: 'visitorParking', label: "Visitor's Parking" },
                            { key: 'attachedMarket', label: 'Attached Market' },
                            { key: 'swimmingPool', label: 'Swimming Pool' },
                            { key: 'clubhouse', label: 'Clubhouse' },
                            { key: 'centralAC', label: 'Central AC' },
                            { key: 'kidsPlayArea', label: 'Kids Play Area' },
                            { key: 'intercom', label: 'Intercom' },
                            { key: 'vaastuCompliant', label: 'Vaastu Compliant' },
                            { key: 'airConditioned', label: 'Air Conditioned' },
                            { key: 'lift', label: 'Lift' },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setAmenitiesPills(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${amenitiesPills[item.key]
                                ? 'bg-blue-500 text-white border-blue-500'
                                : isDark ? 'border-gray-600 bg-[#282c34] text-gray-400 hover:bg-[#3a3f4b]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {amenitiesPills[item.key] && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Apply Filters Button - only apply filter data when clicked, not on every checkbox/radio change */}
              <div className={`flex-shrink-0 p-4 pb-24 max-[525px]:pb-28 border-t ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={handleApplyFilters}
                  disabled={isApplyingFilters}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
            <div className={`relative w-full rounded-t-3xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: 'min(90vh, 90svh)' }}>
              {/* Drag Handle */}
              <div className="flex justify-center py-3 flex-shrink-0">
                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              </div>

              {/* Scrollable Content */}
              <div
                className="overflow-y-auto mobile-modal-scroll flex-1 min-h-0"
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

                {/* Search Input - Google Places Autocomplete for cities */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <PlacesAutocompleteInput
                    value={citySearchQuery}
                    onChange={setCitySearchQuery}
                    onSelect={({ description, lat, lng }) => {
                      setMapCenter({ lat, lng });
                      setZoomLevel(10);
                      setCitySearchQuery(description.split(',')[0].trim());
                      if (typeof window !== 'undefined' && window.innerWidth < 480) {
                        setShowFiltersView(false);
                        setShowCitySelector(false);
                      }
                    }}
                    placeholder="Select or type your city"
                    mapCenter={mapCenter}
                    type="city"
                    isDark={isDark}
                    iconLeft={Search}
                  />
                </div>

                {/* Detect Location and Reset City - same logic as Locate Me (bottom right) */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={async () => {
                      if (isDetectingLocation || isLoadingProperties) return;

                      setIsDetectingLocation(true);
                      try {
                        const loc = await getUserLocation();
                        // Core behavior: same as Locate Me - center map and zoom
                        setMapCenter({ lat: loc.lat, lng: loc.lng });
                        setZoomLevel(loc.isFallback ? 5 : loc.isApproximate ? 10 : 13);
                        setDetectedUserLocation({ lat: loc.lat, lng: loc.lng });
                        if (typeof window !== 'undefined' && window.innerWidth < 480) setShowCitySelector(false);

                        // Optional: reverse geocode to show city name in search
                        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                        if (apiKey) {
                          try {
                            const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lng}&key=${apiKey}`;
                            const geocodeRes = await fetch(reverseGeocodeUrl);
                            const geocodeData = await geocodeRes.json();

                            let cityName = null;
                            if (geocodeData.status === "OK" && geocodeData.results?.length > 0) {
                              const addressComponents = geocodeData.results[0].address_components;
                              for (const component of addressComponents) {
                                if (component.types.includes('locality')) {
                                  cityName = component.long_name;
                                  break;
                                } else if (component.types.includes('administrative_area_level_2')) {
                                  cityName = component.long_name;
                                }
                              }
                            }
                            if (cityName) setCitySearchQuery(cityName);
                            else setCitySearchQuery('');
                          } catch {
                            setCitySearchQuery('');
                          }
                        } else {
                          setCitySearchQuery('');
                        }
                      } catch (error) {
                        console.error('Error detecting location:', error);
                      } finally {
                        setIsDetectingLocation(false);
                      }
                    }}
                    disabled={isLoadingProperties || isDetectingLocation}
                    className={`flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors ${(isLoadingProperties || isDetectingLocation) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                    <span className="text-sm font-medium">{isDetectingLocation ? 'Detecting...' : 'Detect my location'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCity(null);
                      setSelectedMarker(null);
                      setMapCenter({ lat: 20.5937, lng: 78.9629 });
                      setZoomLevel(5);
                      setCitySearchQuery('');
                      setDetectedUserLocation(null);
                    }}
                    disabled={isLoadingProperties}
                    className={`text-sm transition-colors ${isLoadingProperties ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Reset City
                  </button>
                </div>

                {/* Closer Cities - shown when user has detected their location */}
                {detectedUserLocation && (
                  <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Closer Cities</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {sortCitiesByDistance(
                        [...new Set(indianCities)],
                        detectedUserLocation.lat,
                        detectedUserLocation.lng,
                        6
                      ).map(city => (
                        <button
                          key={city}
                          onClick={() => zoomToCity(city, { offset: 0.08, clearSearch: true })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-[#282c34]' : 'hover:bg-gray-50'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                            <MapPin className="w-6 h-6 text-blue-500" />
                          </div>
                          <span className={`text-xs text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Cities Section - always visible for quick selection */}
                <div className={`px-4 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Cities</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      'Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                      'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'
                    ].map(city => (
                      <button
                        key={city}
                        onClick={() => zoomToCity(city, { offset: 0.08, clearSearch: true })}
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
                <div className="px-4 py-4 pb-32 max-[525px]:pb-36">
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Other Cities</h3>
                  <div className="space-y-0">
                    {(() => {
                      const filtered = [...new Set(indianCities)].filter(city =>
                        !citySearchQuery || city.toLowerCase().includes(citySearchQuery.toLowerCase())
                      ).filter(city =>
                        !['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                          'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'].includes(city)
                      );
                      const list = filtered.length > 0 ? filtered : [...new Set(indianCities)].filter(city =>
                        !['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Kolkata',
                          'Lucknow', 'Mumbai', 'Navi Mumbai', 'Noida', 'Pune', 'Thane'].includes(city)
                      );
                      return list.sort((a, b) => a.localeCompare(b));
                    })()
                      .map(city => (
                        <button
                          key={city}
                          onClick={() => zoomToCity(city, { offset: 0, zoomLevel: 12, clearSearch: true, closeSelector: false })}
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
            <div className={`relative w-full rounded-t-3xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: 'min(90vh, 90svh)' }}>
              {/* Drag Handle */}
              <div className="flex justify-center py-3 flex-shrink-0">
                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto mobile-modal-scroll flex-1 min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#4b5563 #2d3139' : '#cbd5e1 #f1f5f9' }}>
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
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${propertyTypeFilter === 'all'
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
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${propertyTypeFilter === 'commercial'
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
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${propertyTypeFilter === 'residential'
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
                        onClick={() => setListingTypeFilter(listingTypeFilter === 'forSale' ? 'all' : 'forSale')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'forSale'
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                          }`}
                      >
                        For Sale
                      </button>
                      <button
                        onClick={() => setListingTypeFilter(listingTypeFilter === 'forRent' ? 'all' : 'forRent')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'forRent'
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                          }`}
                      >
                        For Rent
                      </button>
                      <button
                        onClick={() => setListingTypeFilter(listingTypeFilter === 'readyToMove' ? 'all' : 'readyToMove')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'readyToMove'
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                          }`}
                      >
                        Ready to Move
                      </button>
                      <button
                        onClick={() => setListingTypeFilter(listingTypeFilter === 'newProjects' ? 'all' : 'newProjects')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'newProjects'
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                          }`}
                      >
                        New Projects
                      </button>
                      <button
                        onClick={() => setListingTypeFilter(listingTypeFilter === 'verified' ? 'all' : 'verified')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'verified'
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                          }`}
                      >
                        Verified
                      </button>
                      <button
                        onClick={() => setListingTypeFilter(listingTypeFilter === 'video' ? 'all' : 'video')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${listingTypeFilter === 'video'
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-400 text-black'
                          : isDark ? 'bg-[#282c34] text-gray-400 border border-gray-600 hover:border-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-yellow-100 hover:text-yellow-900'
                          }`}
                      >
                        Video
                      </button>
                    </div>

                    {/* Results Summary and Sort */}
                    {getFilteredMarkers().length > 0 && (
                      <div className={`flex items-center justify-between pt-2 mt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <p className="text-sm">
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{getFilteredMarkers().length} {getFilteredMarkers().length === 1 ? 'property' : 'properties'}</span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}> found</span>
                        </p>
                        <div className="relative sort-dropdown-container">
                          <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className={`flex items-center gap-1 text-sm transition-colors px-2 py-1 rounded ${isDark ? 'text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-900'}`}
                          >
                            <span>Sort by</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                          </button>

                          {showSortDropdown && (
                            <div className={`absolute right-0 top-full mt-1 w-40 rounded shadow-lg z-50 border text-xs ${isDark ? 'bg-[#282c34] border-gray-700' : 'bg-white border-gray-200'}`}>
                              <div className="py-0.5">
                                <button
                                  onClick={() => {
                                    setSortBy('uploadedDateLatest');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'uploadedDateLatest' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Uploaded Date (Latest)
                                </button>
                                <button
                                  onClick={() => {
                                    setSortBy('priceLow');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'priceLow' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Price (low to high)
                                </button>
                                <button
                                  onClick={() => {
                                    setSortBy('priceHigh');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'priceHigh' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Price (high to low)
                                </button>
                                <button
                                  onClick={() => {
                                    setSortBy('sizeLow');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'sizeLow' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Size (low to high)
                                </button>
                                <button
                                  onClick={() => {
                                    setSortBy('sizeHigh');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'sizeHigh' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Size (high to low)
                                </button>
                                <button
                                  onClick={() => {
                                    setSortBy('totalPriceLow');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'totalPriceLow' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Total Price (low to high)
                                </button>
                                <button
                                  onClick={() => {
                                    setSortBy('totalPriceHigh');
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 transition-colors ${sortBy === 'totalPriceHigh' ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-900')}`}
                                >
                                  Total Price (high to low)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-3 space-y-3 pb-32 max-[525px]:pb-36 ${isDark ? 'bg-[#1f2229]' : ''}`}>
                  {getFilteredMarkers().length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
                        <Search className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <p className="font-medium text-base mb-1">No property found</p>
                      <p className="text-sm">Try changing your search or filters.</p>
                    </div>
                  ) : getFilteredMarkers().map((marker, index) => {
                    const isActiveMobile = selectedCity && (String(marker._id || marker.id) === String(selectedCity._id || selectedCity.id));
                    return (
                    <div
                      key={`${marker.id}-${marker.propertyCategory || 'c'}-${index}`}
                      className={`rounded-xl p-3 cursor-pointer transition-all shadow-sm ${isActiveMobile ? 'border-2 border-blue-500' : isDark ? '' : 'border border-gray-100'} ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-white hover:bg-[#fff3c5] hover:shadow-md'}`}
                      onClick={() => {
                        handleMarkerClick(marker);
                        setShowMobileList(false);
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={marker.featuredImageUrl || marker.images?.[0] || '/placeholder.png'}
                            alt={marker.propertyName || "Property Image"}
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
                                {marker.propertyName || 'Property Name'}
                              </h3>
                              {marker.isVerified && (
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 1L14.4 4.2L18.3 3.4L18.1 7.4L21.6 9.2L19.4 12.5L21.6 15.8L18.1 17.6L18.3 21.6L14.4 20.8L12 24L9.6 20.8L5.7 21.6L5.9 17.6L2.4 15.8L4.6 12.5L2.4 9.2L5.9 7.4L5.7 3.4L9.6 4.2L12 1Z" fill="#FBBF24" />
                                  <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavouriteToggle(marker);
                                }}
                                className={`p-1 rounded-full transition-colors ${propertyFavorites[marker._id || marker.id]
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
                                href={`https://wa.me/${(marker.agentDetails?.phone || marker.sellerPhoneNumber)?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(marker.propertyName || 'this property')}`}
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
                            <span>in {marker.address?.locality || marker.address?.district || marker.address?.state}</span>
                            {marker.address?.district && marker.address?.locality && marker.address.district !== marker.address.locality && (
                              <span>, {marker.address.district}</span>
                            )}
                            {marker.address?.state && (
                              <span>, {marker.address.state}</span>
                            )}
                          </p>
                          {(() => {
                            const markerPrices = calculatePrices(marker);
                            if (markerPrices.discountedPrice && markerPrices.discountedPrice !== '₹XX') {
                              return (
                                <p className="text-sm">
                                  <span className="font-bold text-blue-500">{markerPrices.discountedPrice}</span>
                                  {markerPrices.originalPrice && markerPrices.originalPrice !== markerPrices.discountedPrice && (
                                    <span className={`line-through ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{markerPrices.originalPrice}</span>
                                  )}
                                </p>
                              );
                            } else if (marker.pricePerAcre && marker.pricePerAcre !== 'N/A') {
                              return (
                                <p className="text-sm">
                                  <span className="font-bold text-orange-500">{marker.pricePerAcre}</span>
                                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/sq.ft</span>
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                  })}
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
          {globalConfig.isFullNavVisible && (
            <>
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
            </>
          )}
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
            maxWidth: '450px'
          }}
          onClose={() => setShowAddPropertyModal(false)}
          className={`rounded-3xl shadow-2xl ${isDark ? 'bg-[#1f2937]' : 'bg-white'}`}
          isDark={isDark}
        >
          <div className="p-6">
            {/* Logo Section - Centered */}
            <div className="mb-5 flex justify-center">
              <Image src="/logo.png" width={140} height={45} className="h-10 w-auto" alt="BuildersInfo Logo" />
            </div>

            {/* Main Heading - Smaller */}
            <h2 className={`text-xl font-bold mb-3 leading-tight text-center ${isDark ? 'text-white' : 'text-black'}`}>
              List your property for free
            </h2>

            {/* Descriptive Text - Smaller Gray */}
            <p className={`text-sm mb-6 leading-relaxed text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Reach thousands of potential buyers by listing your property on BuildersInfo. Our team will help you get started.
            </p>

            {/* WhatsApp Button - Number from globalConfig only (dummy/JSON now, DB later) */}
            {(() => {
              const raw = globalConfig?.whatsappNo != null ? String(globalConfig.whatsappNo).replace(/\D/g, '') : '';
              const num = raw.length === 10 ? '91' + raw : raw.startsWith('91') ? raw : raw;
              const waUrl = num ? `https://wa.me/${num}?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo.` : null;
              return waUrl ? (
                <div className="flex justify-center">
                  <Link
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowAddPropertyModal(false)}
                    className="flex items-center gap-3 text-white font-medium px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] transition-colors justify-center min-w-[300px]"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Image src='/whatsapp.svg' alt='whatsapp' width={20} height={20} />
                    </div>
                    <span className="text-sm">Contact on WhatsApp</span>
                  </Link>
                </div>
              ) : null;
            })()}
          </div>
        </Modal>
      )}

      {/* Layers Declaration Modal - shown before opening layer menu */}
      {showLayersDeclarationModal && (
        <Modal
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            maxWidth: '280px'
          }}
          onClose={() => setShowLayersDeclarationModal(false)}
          className={`rounded-lg shadow-2xl ${isDark ? 'bg-[#1f2937]' : 'bg-white'}`}
          isDark={isDark}
        >
          <div className="p-3">
            <h2 className={`text-xs font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-black'}`}>
              Layers Declaration
            </h2>

            <div className={`mb-3 text-[10px] leading-tight space-y-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>
                Disclaimer: The map layers on buildersinfo.in are created using publicly available data and are intended for general informational purposes only.
              </p>
              <p>
                While we&apos;ve made best efforts to ensure accuracy by referencing sources like HMDA.gov.in, Bhuvan-ISRO, and others, limitations such as outdated records, digitisation errors, satellite distortions, and missing cadastral data may affect the accuracy of the visual overlays.
              </p>
              <p>
                These maps are not substitutes for official government surveys or legal verification. Users are advised to independently verify all details with the appropriate authorities before making any land or investment decisions.
              </p>
              <p>
                By using these layers, you acknowledge and accept these limitations. Click on info icon (in layers section) to know more about individual layers.
              </p>
            </div>

            <button
              onClick={() => {
                setShowLayersDeclarationModal(false);
                setShowLayerMenu(true);
              }}
              className="w-full bg-[#FFA500] hover:bg-[#FF8C00] text-black font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px]"
            >
              Proceed
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}