"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
  const cityParam = searchParams.get('city') || '';

  // State for filters
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState('');
  const [selectedFloorsOffered, setSelectedFloorsOffered] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedSortBy, setSelectedSortBy] = useState('');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Favorites state
  const [favorites, setFavorites] = useState([]);

  // Properties state
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [mongodbId, setMongodbId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Capitalize city name
  const capitalizeCity = (city) => {
    if (!city) return '';
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  };

  // Fetch property from MongoDB and replicate
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Base property from MongoDB
        const baseProperty = {
          "_id": "690956881f32787e946737f2",
          "propertyType": "commercial",
          "state_name": "Telangana",
          "city": "Mumbai",
          "coordinates": { "lat": 17.4065, "lng": 78.4772 },
          "name": "Premium Business Hub",
          "originalPrice": "₹95,00,000",
          "discountedPrice": "₹90,00,000",
          "additionalPrice": "₹5,00,000",
          "images": [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop"
          ],
          "featuredImageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
          "date_added": "10 December 2024",
          "is_verified": true,
          "sellerPhoneNumber": "+91 8884886822",
          "layer_location": "Madhapur",
          "location_district": "Hyderabad",
          "address": "Madhapur, Hyderabad, Telangana 500081, India",
          "amenities": [
            { "name": "OC Certificate", "image": "/property-details/amenties/oc.png" },
            { "name": "SEZ Approved", "image": "/property-details/amenties/sez.png" },
            { "name": "Fire NOC", "image": "/property-details/amenties/fire-noc.png" },
            { "name": "Water Supply", "image": "/property-details/amenties/water-supply.png" },
            { "name": "HVAC", "image": "/property-details/amenties/hvac.png" },
            { "name": "Electricity", "image": "/property-details/amenties/electricity.png" },
            { "name": "Elevators", "image": "/property-details/amenties/elevator.png" },
            { "name": "Parking", "image": "/property-details/amenties/parking.png" }
          ],
          "facilities": ["Parking", "Conference Room", "Elevator", "Gym"],
          "floors_available": ["First Floor", "Second Floor", "Top Floor"],
          "ratings": { "overall": 3.7, "totalRatings": 11 },
          "price_per_desk": 6000,
          "price_per_sqft": 70,
          "no_of_seats": 56,
          "category": "rent",
          "badge": "new"
        };

        // Store the MongoDB ID
        setMongodbId(baseProperty._id);

        // Replicate the property 7 times with different values
        const replicatedProperties = [
          {
            ...baseProperty,
            badge: "new",
            propertyType: "commercial",
            facilities: ["Parking", "Conference Room"],
            floors_available: ["First Floor", "Second Floor"],
            name: "Premium Business Hub",
            discountedPrice: "₹90,00,000",
            date_added: "10 December 2024",
          },
          {
            ...baseProperty,
            badge: "premium",
            propertyType: "residential",
            facilities: ["Gym", "Elevator"],
            floors_available: ["Ground Floor", "First Floor"],
            name: "Luxury Apartment Complex",
            discountedPrice: "₹1,20,00,000",
            date_added: "5 November 2024",
          },
          {
            ...baseProperty,
            badge: "new",
            propertyType: "commercial",
            facilities: ["Parking", "Cafeteria"],
            floors_available: ["Second Floor", "Third Floor"],
            name: "Modern Office Space",
            discountedPrice: "₹75,00,000",
            date_added: "20 October 2024",
          },
          {
            ...baseProperty,
            badge: "premium",
            propertyType: "commercial",
            facilities: ["Conference Room", "Elevator"],
            floors_available: ["Top Floor"],
            name: "Executive Business Center",
            discountedPrice: "₹1,50,00,000",
            date_added: "15 September 2024",
          },
          {
            ...baseProperty,
            badge: "new",
            propertyType: "residential",
            facilities: ["Parking", "Gym"],
            floors_available: ["First Floor"],
            name: "Cozy Family Home",
            discountedPrice: "₹85,00,000",
            date_added: "1 December 2024",
          },
          {
            ...baseProperty,
            badge: "premium",
            propertyType: "commercial",
            facilities: ["Parking", "Conference Room", "Elevator"],
            floors_available: ["Ground Floor", "First Floor", "Second Floor"],
            name: "Corporate Tower",
            discountedPrice: "₹2,00,00,000",
            date_added: "25 August 2024",
          },
          {
            ...baseProperty,
            badge: "new",
            propertyType: "residential",
            facilities: ["Elevator", "Gym"],
            floors_available: ["Second Floor", "Top Floor"],
            name: "Skyline Residency",
            discountedPrice: "₹95,00,000",
            date_added: "18 November 2024",
          },
          {
            ...baseProperty,
            badge: "premium",
            propertyType: "commercial",
            facilities: ["Parking", "Cafeteria", "Conference Room"],
            floors_available: ["First Floor", "Second Floor", "Third Floor"],
            name: "Tech Park Plaza",
            discountedPrice: "₹1,80,00,000",
            date_added: "12 July 2024",
          }
        ];

        setAllProperties(replicatedProperties);
        setFilteredProperties(replicatedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter options
  const badges = ["new", "premium"];
  const propertyTypes = ["commercial", "residential"];
  const facilities = ["Parking", "Conference Room", "Elevator", "Cafeteria", "Gym"];
  const floorsOffered = ["Ground Floor", "First Floor", "Second Floor", "Third Floor", "Top Floor"];
  const amenities = [
    { value: "guest_checkin", label: "Guest Checkin" },
    { value: "delivery_notification", label: "Delivery Notification" },
    { value: "package_notification", label: "Package Notification" },
    { value: "keycard_access", label: "Keycard Access" },
    { value: "video_surveillance", label: "Video Surveillance" },
    { value: "tea", label: "Tea" },
    { value: "coffee", label: "Coffee" },
    { value: "water", label: "Water" },
    { value: "milk_sweeteners", label: "Milk Sweeteners" },
    { value: "cups_mugs", label: "Cups & Mugs" },
    { value: "food_vendor", label: "Food Vendor" },
    { value: "pantry_24x7", label: "Pantry 24x7" },
    { value: "daily_upkeep", label: "Daily Upkeep" },
    { value: "nightly_trash", label: "Nightly Trash" },
    { value: "deep_clean_weekly", label: "Deep Clean Weekly" },
    { value: "pest_control", label: "Pest Control" },
    { value: "general_clean_24x7", label: "General Clean 24x7" },
    { value: "high_speed_wifi", label: "High Speed WiFi" },
    { value: "tape_paper_clips", label: "Tape & Paper Clips" }
  ];
  const sortByOptions = ["Price: Low to High", "Price: High to Low", "Newest First", "Oldest First"];

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allProperties];

    // Badge filter
    if (selectedBadge) {
      filtered = filtered.filter(prop => prop.badge === selectedBadge);
    }

    // Property type filter
    if (selectedPropertyType) {
      filtered = filtered.filter(prop => prop.propertyType === selectedPropertyType);
    }

    // Facilities filter
    if (selectedFacilities) {
      filtered = filtered.filter(prop =>
        Array.isArray(prop.facilities) && prop.facilities.includes(selectedFacilities)
      );
    }

    // Floors offered filter
    if (selectedFloorsOffered) {
      filtered = filtered.filter(prop =>
        Array.isArray(prop.floors_available) && prop.floors_available.includes(selectedFloorsOffered)
      );
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(prop =>
        Array.isArray(prop.amenities) && selectedAmenities.every(amenity =>
          prop.amenities.some(a => a.name && a.name.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // Sorting
    if (selectedSortBy) {
      const parsePrice = (priceStr) => {
        return parseInt(priceStr.replace(/[₹,]/g, ''));
      };

      if (selectedSortBy === "Price: Low to High") {
        filtered.sort((a, b) => parsePrice(a.discountedPrice) - parsePrice(b.discountedPrice));
      } else if (selectedSortBy === "Price: High to Low") {
        filtered.sort((a, b) => parsePrice(b.discountedPrice) - parsePrice(a.discountedPrice));
      } else if (selectedSortBy === "Newest First") {
        filtered.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
      } else if (selectedSortBy === "Oldest First") {
        filtered.sort((a, b) => new Date(a.date_added) - new Date(b.date_added));
      }
    }

    setFilteredProperties(filtered);
  }, [selectedBadge, selectedPropertyType, selectedFacilities, selectedFloorsOffered, selectedAmenities, selectedSortBy, allProperties]);

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

  // Toggle amenity selection
  const toggleAmenity = (amenityValue) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityValue)
        ? prev.filter(a => a !== amenityValue)
        : [...prev, amenityValue]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBadge('');
    setSelectedPropertyType('');
    setSelectedFacilities('');
    setSelectedFloorsOffered('');
    setSelectedAmenities([]);
    setSelectedSortBy('');
  };

  // Toggle favorite
  const toggleFavorite = (propertyId) => {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
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

            {/* Property Type Dropdown */}
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

            {/* Amenities Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown('amenities'); }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full hover:bg-gray-50 flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap ${selectedAmenities.length > 0 ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 text-gray-600'}`}
              >
                {selectedAmenities.length > 0 ? `Amenities (${selectedAmenities.length})` : 'Amenities'}
              </button>
              {openDropdown === 'amenities' && (
                <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {amenities.map(amenity => (
                      <label
                        key={amenity.value}
                        className="flex items-center px-2 sm:px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-xs sm:text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.value)}
                          onChange={() => toggleAmenity(amenity.value)}
                          className="mr-2 sm:mr-3 w-3.5 h-3.5 sm:w-4 sm:h-4"
                        />
                        {amenity.label}
                      </label>
                    ))}
                  </div>
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
              onClick={() => window.open(`/property-details?id=${mongodbId}&type=commercial`, '_blank')}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative cursor-pointer"
            >
              {/* Badge */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 z-10 shadow-md">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase">{property.badge}</span>
              </div>

              {/* Favorite Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(index);
                }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white p-1.5 sm:p-2 rounded-full shadow-md z-10 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${favorites.includes(index) ? 'text-red-500' : 'text-gray-700'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
                    {property.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] sm:text-[10px] font-medium rounded-md border border-green-200 whitespace-nowrap">
                    {property.ratings?.overall ? `${property.ratings.overall} ⭐` : 'No ratings yet'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 sm:mt-4">
                  <span className="text-sm sm:text-base font-bold text-gray-900">{property.discountedPrice}</span>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-green-50 text-green-600 text-[10px] sm:text-xs font-semibold rounded-md border border-green-200 uppercase">
                    {property.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-12 text-center">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-2">No Properties Found</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Try adjusting your filters to see more results</p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
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
