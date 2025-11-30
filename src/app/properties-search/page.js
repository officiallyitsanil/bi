"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import LoginModal from "../../components/LoginModal";
import { loginUser } from "../../utils/auth";

// Helper function to safely display database values
const safeDisplay = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
    // Handle arrays and objects
    if (Array.isArray(value) && value.length === 0) {
        return fallback;
    }
    if (typeof value === "object" && Object.keys(value).length === 0) {
        return fallback;
    }
    return value;
};

// Skeleton Loader Component
function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-200 to-gray-300 relative">
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gray-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full w-16 h-6"></div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gray-300 p-1.5 sm:p-2 rounded-full w-8 h-8"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-5 bg-gray-300 rounded w-12"></div>
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-4">
          <div className="h-5 bg-gray-300 rounded w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Bar Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 animate-pulse">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 bg-gray-300 rounded-full w-24"></div>
            <div className="h-8 bg-gray-300 rounded-full w-8"></div>
            <div className="h-8 bg-gray-300 rounded-full w-28"></div>
            <div className="h-8 bg-gray-300 rounded-full w-32"></div>
            <div className="h-8 bg-gray-300 rounded-full w-24"></div>
            <div className="h-8 bg-gray-300 rounded-full w-32"></div>
            <div className="h-8 bg-gray-300 rounded-full w-28"></div>
            <div className="h-8 bg-gray-300 rounded-full w-20 ml-auto"></div>
          </div>
        </div>

        {/* Results Header Skeleton */}
        <div className="text-center mb-4 sm:mb-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2"></div>
          <div className="w-20 sm:w-24 h-1 bg-gray-300 mx-auto mt-2"></div>
        </div>

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertiesSearchContent() {
  const searchParams = useSearchParams();
  const cityParam = useMemo(() => searchParams.get('city') || '', [searchParams]);
  const typeParam = useMemo(() => searchParams.get('type') || '', [searchParams]);
  const preferencesParam = useMemo(() => searchParams.get('preferences') || '', [searchParams]);
  const pricePerDeskParam = useMemo(() => searchParams.get('pricePerDesk') || '', [searchParams]);
  const pricePerSqftParam = useMemo(() => searchParams.get('pricePerSqft') || '', [searchParams]);
  const noOfSeatsParam = useMemo(() => searchParams.get('noOfSeats') || '', [searchParams]);
  const categoryParam = useMemo(() => searchParams.get('Category') || '', [searchParams]); // Category: commercial or residential
  const propertyTypeParam = useMemo(() => searchParams.get('propertyType') || '', [searchParams]); // This will be used for DB filtering (techpark, standalone, villa, rent, sale, etc.)

  // State for filters
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState('');
  const [selectedFloorsOffered, setSelectedFloorsOffered] = useState('');
  const [selectedSortBy, setSelectedSortBy] = useState('');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Favorites state - using property IDs
  const [favorites, setFavorites] = useState([]);

  // Login state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Properties state
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [mongodbId, setMongodbId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check login status
  useEffect(() => {
    const syncUser = () => {
      const userJson = localStorage.getItem('currentUser');
      setCurrentUser(userJson ? JSON.parse(userJson) : null);
    };

    syncUser();
    window.addEventListener('onAuthChange', syncUser);

    return () => {
      window.removeEventListener('onAuthChange', syncUser);
    };
  }, []);

  // Load favorites from localStorage and sync with DB
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Load from localStorage
        const favoritesLocal = JSON.parse(localStorage.getItem('favorites') || '[]');
        const favoriteIds = favoritesLocal.map(fav => fav._id || fav.id).filter(Boolean);
        setFavorites(favoriteIds);

        // If user is logged in, sync with database
        if (currentUser && currentUser.phoneNumber) {
          try {
            const response = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(currentUser.phoneNumber)}`);
            const data = await response.json();
            
            if (data.success) {
              const dbFavoriteIds = data.data.map(fav => fav.propertyId);
              setFavorites(dbFavoriteIds);
              
              // Update localStorage to match DB
              const updatedFavorites = dbFavoriteIds.map(id => ({ _id: id, id: id }));
              localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            }
          } catch (error) {
            console.error('Error loading favorites from DB:', error);
          }
        }
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
    };

    loadFavorites();
  }, [currentUser]);

  // Capitalize city name
  const capitalizeCity = (city) => {
    if (!city) return '';
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  };

  // Determine Category (commercial/residential) from Category parameter or type parameter
  const determineCategory = () => {
    if (categoryParam) return categoryParam.toLowerCase();
    
    // Fallback: Determine from type parameter
    if (typeParam) {
      const commercialTypes = ['Managed Space', 'Unmanaged Space', 'Coworking Dedicated', 'Coworking Shared', 'Price Per Desk', 'Price Per Sqft', 'No. Of Seats'];
      if (commercialTypes.includes(typeParam)) {
        return 'commercial';
      }
      const residentialTypes = ['Rent', 'Sale', 'PG/Hostel', 'Flatmates'];
      if (residentialTypes.includes(typeParam)) {
        return 'residential';
      }
    }
    
    return '';
  };
  
  // Get Property Type filter options based on Category
  const getPropertyTypeOptions = () => {
    const category = determineCategory();
    if (category === 'commercial') {
      return ['Techpark', 'Standalone', 'Villa'];
    } else if (category === 'residential') {
      return ['Rent', 'Sale', 'PG/Hostel', 'Flatmates'];
    }
    return [];
  };

  // Fetch properties from MongoDB API with filters
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      // Map selectedPropertyType display names to DB values
      const mapPropertyTypeToDBValue = (displayName) => {
        if (!displayName) return '';
        const lower = displayName.toLowerCase();
        // Map display names to DB values
        const mapping = {
          'techpark': 'techpark',
          'standalone': 'standalone',
          'villa': 'villa',
          'rent': 'rent',
          'sale': 'sale',
          'pg/hostel': 'pg',  // DB might store as "pg" or "pg/hostel"
          'flatmates': 'flatmates'
        };
        return mapping[lower] || lower;
      };
      
      try {
        // Build query parameters for filtered API
        const params = new URLSearchParams();
        if (cityParam) params.append('city', cityParam);
        if (typeParam) params.append('type', typeParam);
        if (preferencesParam) params.append('preferences', preferencesParam);
        if (pricePerDeskParam) params.append('pricePerDesk', pricePerDeskParam);
        if (pricePerSqftParam) params.append('pricePerSqft', pricePerSqftParam);
        if (noOfSeatsParam) params.append('noOfSeats', noOfSeatsParam);
        
        // Pass Category (commercial/residential)
        const category = determineCategory();
        if (category) params.append('Category', category);
        
        // Pass selectedPropertyType as propertyType (for DB filtering: techpark, standalone, villa, rent, sale, etc.)
        if (selectedPropertyType) {
          const dbPropertyType = mapPropertyTypeToDBValue(selectedPropertyType);
          if (dbPropertyType) params.append('propertyType', dbPropertyType);
        }
        
        // Pass selectedFloorsOffered for filtering by selectedFloors array in DB
        if (selectedFloorsOffered) {
          params.append('floorsOffered', selectedFloorsOffered);
        }
        
        // Pass selectedFacilities for filtering by facilities array in DB
        if (selectedFacilities) {
          params.append('facilities', selectedFacilities);
        }
        
        const timestamp = new Date().getTime();
        params.append('_t', timestamp);
        
        const response = await fetch(`/api/properties-filtered?${params.toString()}`);

        const result = await response.json();

        if (result.success && result.data) {

          // Calculate prices based on property category
          const calculatePrices = (property) => {
            let originalPriceValue = 0;
            const category = determineCategory();
            
            if (category === 'residential') {
              // For residential: use expectedRent
              const expectedRent = property.expectedRent || '0';
              originalPriceValue = parseFloat(expectedRent.toString().replace(/[₹,]/g, '')) || 0;
            } else if (category === 'commercial') {
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
            
            // Calculate discounted price (5% off = 95% of original)
            const discountedPriceValue = originalPriceValue * 0.95;
            
            // Format prices
            const formatPrice = (price) => {
              if (price === 0) return '₹XX';
              return `₹${Math.round(price).toLocaleString('en-IN')}`;
            };
            
            return {
              originalPrice: formatPrice(originalPriceValue),
              discountedPrice: formatPrice(discountedPriceValue)
            };
          };

          // Calculate badge based on isPremium and isNew
          const calculateBadge = (property) => {
            // First check isPremium
            if (property.isPremium === true) {
              return 'premium';
            }
            // Then check isNew
            if (property.isNew === true) {
              return 'new';
            }
            // If both are false, return empty string (no badge)
            return '';
          };

          const properties = result.data.map(property => {
            const prices = calculatePrices(property);
            const badge = calculateBadge(property);
            return {
              ...property,
              _id: property._id || property.id,
              id: property._id || property.id,
              originalPrice: prices.originalPrice,
              discountedPrice: prices.discountedPrice,
              badge: badge,
            };
          });

          setAllProperties(properties);
          setFilteredProperties(properties);

          // Store first property ID if available
          if (properties.length > 0) {
            setMongodbId(properties[0]._id);
          }
        } else {
          console.error('❌ API returned no data or failed:', result);
          setAllProperties([]);
          setFilteredProperties([]);
        }
      } catch (error) {
        console.error('💥 Error fetching properties:', error);
        console.error('Error details:', error.message);
        setAllProperties([]);
        setFilteredProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [cityParam, typeParam, preferencesParam, pricePerDeskParam, pricePerSqftParam, noOfSeatsParam, categoryParam, selectedPropertyType, selectedFloorsOffered, selectedFacilities]);

  // Filter options
  const badges = ["new", "premium"];
  const propertyTypes = getPropertyTypeOptions(); // Dynamic based on Category
  const facilities = ["Parking", "4W Parking", "2W Parking", "Conference Room", "Elevator", "Cafeteria", "Gym"];
  // Generate floor options: 1st, 2nd, 3rd, ... 12th
  const floorsOffered = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    if (num === 1) return '1st';
    if (num === 2) return '2nd';
    if (num === 3) return '3rd';
    return `${num}th`;
  });
  const sortByOptions = ["Price: Low to High", "Price: High to Low", "Newest First"];

  // Apply sorting only (filtering is done by API)
  useEffect(() => {
    let filtered = [...allProperties];

    // Sorting
    if (selectedSortBy) {
      const parsePrice = (priceStr) => {
        if (!priceStr || priceStr === '₹XX') return 0;
        return parseInt(priceStr.replace(/[₹,]/g, '')) || 0;
      };

      if (selectedSortBy === "Price: Low to High") {
        filtered.sort((a, b) => parsePrice(a.discountedPrice) - parsePrice(b.discountedPrice));
      } else if (selectedSortBy === "Price: High to Low") {
        filtered.sort((a, b) => parsePrice(b.discountedPrice) - parsePrice(a.discountedPrice));
      } else if (selectedSortBy === "Newest First") {
        filtered.sort((a, b) => {
          const dateA = a.date_added ? new Date(a.date_added) : new Date(0);
          const dateB = b.date_added ? new Date(b.date_added) : new Date(0);
          return dateB - dateA;
        });
      }
    }

    setFilteredProperties(filtered);
  }, [selectedSortBy, allProperties]);

  // Toggle dropdown
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBadge('');
    setSelectedPropertyType('');
    setSelectedFacilities('');
    setSelectedFloorsOffered('');
    setSelectedSortBy('');
  };

  // Toggle favorite
  const toggleFavorite = async (e, property) => {
    e.stopPropagation();
    
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    const propertyId = property._id || property.id;
    const propertyType = property.propertyType || 'commercial';
    const isCurrentlyFavorite = favorites.includes(propertyId);
    const newFavoriteState = !isCurrentlyFavorite;

    // Optimistically update UI
    setFavorites(prev =>
      isCurrentlyFavorite
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );

    // Update localStorage
    try {
      const favoritesLocal = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (newFavoriteState) {
        // Add to favorites
        const exists = favoritesLocal.some(fav => (fav._id || fav.id) === propertyId);
        if (!exists) {
          favoritesLocal.push({ _id: propertyId, id: propertyId });
          localStorage.setItem('favorites', JSON.stringify(favoritesLocal));
        }
      } else {
        // Remove from favorites
        const updatedFavorites = favoritesLocal.filter(fav => (fav._id || fav.id) !== propertyId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
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
          setFavorites(prev =>
            newFavoriteState
              ? prev.filter(id => id !== propertyId)
              : [...prev, propertyId]
          );
          alert('Failed to update favorite. Please try again.');
        }
      } catch (error) {
        console.error('Error updating favorite:', error);
        // Revert UI if API call failed
        setFavorites(prev =>
          newFavoriteState
            ? prev.filter(id => id !== propertyId)
            : [...prev, propertyId]
        );
        alert('Failed to update favorite. Please try again.');
      }
    }
  };

  // Handle login success
  const handleLoginSuccess = (userData) => {
    loginUser(userData);
    setIsLoginOpen(false);
  };

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <SearchPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* All Filter Button */}
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-blue-600 rounded-full hover:bg-blue-50 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-blue-600"
            >
              All Filter
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            {/* Cross Button */}
            <button
              onClick={clearAllFilters}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear all filters"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Select Badge Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown('badge'); }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-50 flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap ${selectedBadge ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 text-gray-600'}`}
              >
                {selectedBadge || 'Select Badge'}
              </button>
              {openDropdown === 'badge' && (
                <div className="absolute top-full left-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {badges.map(badge => (
                    <div
                      key={badge}
                      onClick={() => { setSelectedBadge(badge); setOpenDropdown(null); }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type Dropdown - Only show if Category is available */}
            {propertyTypes.length > 0 && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDropdown('propertyType'); }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-50 flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap ${selectedPropertyType ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 text-gray-600'}`}
                >
                  {selectedPropertyType || 'Property Type'}
                </button>
                {openDropdown === 'propertyType' && (
                  <div className="absolute top-full left-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {propertyTypes.map(type => (
                      <div
                        key={type}
                        onClick={() => { setSelectedPropertyType(type); setOpenDropdown(null); }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Facilities Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown('facilities'); }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-50 flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap ${selectedFacilities ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 text-gray-600'}`}
              >
                {selectedFacilities || 'Facilities'}
              </button>
              {openDropdown === 'facilities' && (
                <div className="absolute top-full left-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {facilities.map(facility => (
                    <div
                      key={facility}
                      onClick={() => { setSelectedFacilities(facility); setOpenDropdown(null); }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                    >
                      {facility}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floors Offered Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown('floors'); }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-50 flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap ${selectedFloorsOffered ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 text-gray-600'}`}
              >
                {selectedFloorsOffered || 'Floors Offered'}
              </button>
              {openDropdown === 'floors' && (
                <div className="absolute top-full left-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {floorsOffered.map(floor => (
                    <div
                      key={floor}
                      onClick={() => { setSelectedFloorsOffered(floor); setOpenDropdown(null); }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                    >
                      {floor}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative w-full sm:w-auto sm:ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown('sortBy'); }}
                className={`w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap ${selectedSortBy ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 text-gray-600'}`}
              >
                Sort By
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              {openDropdown === 'sortBy' && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {sortByOptions.map(option => (
                    <div
                      key={option}
                      onClick={() => { setSelectedSortBy(option); setOpenDropdown(null); }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Showing spaces {cityParam ? `in ${capitalizeCity(cityParam)}` : ''}
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-yellow-400 mx-auto mt-2"></div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProperties.map((property, index) => (
            <div
              key={index}
              onClick={() => window.open(`/property-details?id=${property._id || property.id}&type=${property.propertyType || typeParam || 'commercial'}`, '_blank')}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative cursor-pointer"
            >
              {/* Badge */}
              {property.badge && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 z-10 shadow-md">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase">{property.badge}</span>
                </div>
              )}

              {/* Favorite Icon */}
              <button
                onClick={(e) => toggleFavorite(e, property)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white p-1.5 sm:p-2 rounded-full shadow-md z-10 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${favorites.includes(property._id || property.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`}
                  fill={favorites.includes(property._id || property.id) ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={favorites.includes(property._id || property.id) ? 0 : 2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>

              {/* Property Image */}
              <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-300 to-blue-500 relative overflow-hidden">
                <img
                  src={property.featuredImageUrl || property.images?.[0] || '/property-icon.svg'}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Property Details */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {safeDisplay(property.name)}
                  </h3>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] sm:text-[10px] font-medium rounded-md border border-green-200 whitespace-nowrap">
                    {property.ratings?.overall ? `${safeDisplay(property.ratings.overall)} ⭐` : 'No ratings yet'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 sm:mt-4">
                  <span className="text-sm sm:text-base font-bold text-gray-900">{safeDisplay(property.discountedPrice)}</span>
                  {property.badge && (
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-green-50 text-green-600 text-[10px] sm:text-xs font-semibold rounded-md border border-green-200 uppercase">
                      {safeDisplay(property.badge)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results - Only show when not loading and no properties found */}
        {!isLoading && filteredProperties.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-12 text-center">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-2">No Properties Found</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Try adjusting your filters to see more results</p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onProceed={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default function PropertiesSearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <PropertiesSearchContent />
    </Suspense>
  );
}
