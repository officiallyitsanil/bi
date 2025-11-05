"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { KeyRound, BadgeDollarSign, Hotel, UsersRound } from "lucide-react";

export default function SearchSection() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("Rent");
  const [location, setLocation] = useState("");
  const [managedSpace, setManagedSpace] = useState("");
  const [preferences, setPreferences] = useState("");
  const [pricePerDesk, setPricePerDesk] = useState("Any");
  const [pricePerSqft, setPricePerSqft] = useState("Any");
  const [noOfSeats, setNoOfSeats] = useState("Any");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const preferencesRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (preferencesRef.current && !preferencesRef.current.contains(event.target)) {
        setIsPreferencesOpen(false);
      }
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Popular cities for suggestions
  const popularCities = [
    "Mumbai", "Hyderabad", "Bangalore", "Chennai", "Pune", "Noida",
    "Delhi", "Indore", "Ahmedabad", "Jaipur", "Kerala", "Chandigarh",
    "Kolkata", "Goa", "Bhubaneswar", "Uttar Pradesh", "Lucknow"
  ];

  const filterOptions = [
    {
      id: "rent",
      name: "Rent",
      icon: KeyRound,
      active: true
    },
    {
      id: "sale",
      name: "Sale",
      icon: BadgeDollarSign,
      active: false
    },
    {
      id: "pg-hostel",
      name: "PG/Hostel",
      icon: Hotel,
      active: false
    },
    {
      id: "flatmates",
      name: "Flatmates",
      icon: UsersRound,
      active: false
    },
    {
      id: "price-desk",
      name: "Price Per Desk",
      icon: "/commercial/price-desk.png",
      active: false
    },
    {
      id: "price-sqft",
      name: "Price Per Sqft",
      icon: "/commercial/price-sqft.png",
      active: false
    },
    {
      id: "seats",
      name: "No. Of Seats",
      icon: "/commercial/seats.png",
      active: false
    }
  ];

  const handleFilterClick = (filterName) => {
    setSelectedFilter(filterName);
    setManagedSpace("");
    setPreferences("");
    setPricePerDesk("Any");
    setPricePerSqft("Any");
    setNoOfSeats("Any");
  };

  // Generate suggestions based on search query
  const generateSuggestions = (query) => {
    if (!query.trim() || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filteredSuggestions = popularCities
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(city => ({
        text: city,
        displayText: query.trim().length >= 3 ? `${city}, India` : city
      }));

    setSuggestions(filteredSuggestions);
    setShowSuggestions(true);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    generateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.text);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    // Validate location is required
    if (!location || !location.trim()) {
      alert('Please enter a location to search');
      return;
    }

    // Build URL parameters
    const params = new URLSearchParams();

    if (location) params.append('city', location);
    if (selectedFilter) params.append('type', selectedFilter);
    if (managedSpace) params.append('propertyType', managedSpace);
    if (preferences) params.append('preferences', preferences);
    if (pricePerDesk && pricePerDesk !== 'Any') params.append('pricePerDesk', pricePerDesk);
    if (pricePerSqft && pricePerSqft !== 'Any') params.append('pricePerSqft', pricePerSqft);
    if (noOfSeats && noOfSeats !== 'Any') params.append('noOfSeats', noOfSeats);

    // Redirect to properties-search with parameters
    router.push(`/properties-search?${params.toString()}`);
  };

  // Get dropdown options based on selected filter
  const getPropertyTypeOptions = () => {
    return [
      { value: "rent", label: "Rent" },
      { value: "sale", label: "Sale" },
      { value: "pg-hostel", label: "PG/Hostel" },
      { value: "flatmates", label: "Flatmates" }
    ];
  };

  const getPreferencesOptions = () => {
    if (selectedFilter === "Price Per Desk" || selectedFilter === "Price Per Sqft") {
      return [
        { value: "< 5000", label: "< ₹5,000" },
        { value: "5000-8000", label: "₹5,000 - ₹8,000" },
        { value: "8000-11000", label: "₹8,000 - ₹11,000" },
        { value: "11000+", label: "₹11,000+" },
        { value: "see-all", label: "See All" }
      ];
    } else if (selectedFilter === "No. Of Seats") {
      return [
        { value: "1-10", label: "1-10 Seats" },
        { value: "11-50", label: "11-50 Seats" },
        { value: "51-100", label: "51-100 Seats" },
        { value: "100+", label: "100+ Seats" }
      ];
    } else {
      return [
        { value: "near-metro", label: "Near Metro" },
        { value: "parking", label: "Parking Available" },
        { value: "cafeteria", label: "Cafeteria" },
        { value: "gym", label: "Gym" }
      ];
    }
  };

  const getPreferencesLabel = () => {
    if (selectedFilter === "Price Per Desk" || selectedFilter === "Price Per Sqft" || selectedFilter === "No. Of Seats") {
      return "Select Range";
    } else {
      return "Preferences";
    }
  };

  const getPricePerDeskOptions = () => {
    return [
      { value: "any", label: "Any" },
      { value: "< 5000", label: "< ₹5,000" },
      { value: "5000-8000", label: "₹5,000 - ₹8,000" },
      { value: "8000-11000", label: "₹8,000 - ₹11,000" },
      { value: "11000+", label: "₹11,000+" }
    ];
  };

  const getPricePerSqftOptions = () => {
    return [
      { value: "any", label: "Any" },
      { value: "< 50", label: "< ₹50" },
      { value: "50-100", label: "₹50 - ₹100" },
      { value: "100-150", label: "₹100 - ₹150" },
      { value: "150+", label: "₹150+" }
    ];
  };

  const getNoOfSeatsOptions = () => {
    return [
      { value: "any", label: "Any" },
      { value: "1-10", label: "1-10" },
      { value: "11-50", label: "11-50" },
      { value: "51-100", label: "51-100" },
      { value: "100+", label: "100+" }
    ];
  };

  return (
    <div className="relative py-16 md:py-24 bg-cover bg-center bg-no-repeat z-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop')`
      }}>

      {/* Centered Content Container */}
      <div className="w-full max-w-6xl px-4 md:px-6 mx-auto relative z-10">

        {/* Hero Text */}
        <div className="text-center mb-4 md:mb-6 flex justify-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white animate-slideInLeft hover:scale-105 transition-transform duration-300 cursor-default px-2 md:whitespace-nowrap">
            Embrace The Era of{" "}
            <span className="text-yellow-400">Brokerage Free Real</span> Estate
          </h1>
        </div>

        {/* Search Component - Two Separate Boxes */}
        <div className="w-full space-y-3 flex flex-col items-center">

          {/* Top Box - Filter Options */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 w-full max-w-4xl animate-slideDown">
            <div className="flex overflow-x-auto gap-2 md:gap-3 md:grid md:grid-cols-7 scrollbar-hide pb-1">
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                const isLucideIcon = typeof option.icon !== 'string';

                return (
                  <div
                    key={option.id}
                    onClick={() => handleFilterClick(option.name)}
                    className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 w-20 md:w-auto md:aspect-square ${selectedFilter === option.name
                        ? "bg-blue-50 border-2 border-blue-500 rounded-xl p-1 md:p-2"
                        : "hover:bg-gray-50 rounded-xl p-1 md:p-2 border border-gray-100"
                      }`}
                  >
                    <div className="w-10 h-10 md:w-14 md:h-14 mb-1 flex items-center justify-center flex-shrink-0">
                      {isLucideIcon ? (
                        <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                      ) : (
                        <Image
                          src={option.icon}
                          alt={option.name}
                          width={56}
                          height={56}
                          className="object-contain"
                        />
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-gray-700 text-center leading-tight">
                      {option.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Box - Search Inputs - RESPONSIVE */}
          <div className="bg-white shadow-2xl p-2 w-11/12 max-w-3xl group/container mt-1 animate-slideDown animation-delay-200 rounded-full max-[425px]:rounded-3xl md:rounded-3xl search-container relative">
            {/* Mobile View (425px and below) - Simple search with icon */}
            <div className="flex items-center gap-2 max-[425px]:flex md:hidden">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Location"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => location && setShowSuggestions(true)}
                  className="w-full px-4 py-2.5 border-0 focus:outline-none focus:ring-0 text-gray-700 text-sm bg-transparent rounded-full cursor-pointer"
                />

                {/* Mobile Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl mt-2 max-h-60 overflow-y-auto z-50 border border-gray-200">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
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
              <button
                onClick={handleSearch}
                style={{ backgroundColor: '#fdc700' }}
                className="hover:opacity-90 text-white p-3 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Desktop View (above 425px) - Full search with dropdowns */}
            <div className="hidden max-[425px]:hidden md:flex flex-col md:flex-row gap-0 items-center">
              {/* Location Input */}
              <div className="flex-[2.5] w-full relative">
                <input
                  type="text"
                  placeholder="Search by Location"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => location && setShowSuggestions(true)}
                  className="w-full px-3 py-2.5 border-0 focus:outline-none focus:ring-0 text-gray-700 text-sm transition-all cursor-pointer"
                />

                {/* Desktop Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-50 border border-gray-200">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
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

              {/* Divider */}
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>

              {/* Property Type Dropdown */}
              <div className="flex-[1.3] w-full border-t md:border-t-0 md:border-l-0">
                <div className="relative">
                  <select
                    value={managedSpace}
                    onChange={(e) => setManagedSpace(e.target.value)}
                    className="w-full px-3 py-2.5 border-0 focus:outline-none focus:ring-0 text-gray-700 appearance-none bg-white pr-8 text-sm transition-all"
                  >
                    <option value="">{selectedFilter}</option>
                    {getPropertyTypeOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>

              {/* Preferences Dropdown - Custom for all space types */}
              {(selectedFilter === "Rent" || selectedFilter === "Sale" || selectedFilter === "PG/Hostel" || selectedFilter === "Flatmates") ? (
                <div className="flex-[1] w-full relative border-t md:border-t-0" ref={preferencesRef}>
                  <div
                    onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
                    className="w-full px-3 py-2.5 border-0 focus:outline-none focus:ring-0 text-gray-700 bg-white text-sm transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Preferences</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Custom Dropdown Panel - Compact size */}
                  {isPreferencesOpen && (
                    <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 bg-white rounded-lg shadow-2xl py-3 px-4 w-[calc(100vw-2rem)] max-w-[380px] z-[9999] border border-gray-200">
                      {/* Price per Desk */}
                      <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Price per Desk</h3>
                          <p className="text-xs text-gray-400">Select your budget</p>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <select
                            value={pricePerDesk}
                            onChange={(e) => setPricePerDesk(e.target.value)}
                            className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm appearance-none bg-white"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1rem'
                            }}
                          >
                            {getPricePerDeskOptions().map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Price per Sqft */}
                      <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Price per Sqft</h3>
                          <p className="text-xs text-gray-400">Select your budget</p>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <select
                            value={pricePerSqft}
                            onChange={(e) => setPricePerSqft(e.target.value)}
                            className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm appearance-none bg-white"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1rem'
                            }}
                          >
                            {getPricePerSqftOptions().map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* No. of Seats */}
                      <div className="flex items-center justify-between py-2.5">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">No. of Seats</h3>
                          <p className="text-xs text-gray-400">How many people?</p>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <select
                            value={noOfSeats}
                            onChange={(e) => setNoOfSeats(e.target.value)}
                            className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm appearance-none bg-white"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1rem'
                            }}
                          >
                            {getNoOfSeatsOptions().map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Single Preferences Dropdown for other filters */
                <div className="flex-[1] w-full border-t md:border-t-0">
                  <div className="relative">
                    <select
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      className="w-full px-3 py-2.5 border-0 focus:outline-none focus:ring-0 text-gray-700 appearance-none bg-white pr-8 text-sm transition-all"
                    >
                      <option value="">{getPreferencesLabel()}</option>
                      {getPreferencesOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={handleSearch}
                style={{ backgroundColor: '#fdc700' }}
                className="hover:opacity-90 text-white px-3 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm overflow-hidden w-full md:w-auto mt-2 md:mt-0 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="md:max-w-0 md:group-hover/container:max-w-xs transition-all duration-300 overflow-hidden whitespace-nowrap">
                  Search
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
