"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function SearchSection() {
  const [selectedFilter, setSelectedFilter] = useState("Managed Space");
  const [location, setLocation] = useState("");
  const [managedSpace, setManagedSpace] = useState("");
  const [preferences, setPreferences] = useState("");
  const [pricePerDesk, setPricePerDesk] = useState("Any");
  const [pricePerSqft, setPricePerSqft] = useState("Any");
  const [noOfSeats, setNoOfSeats] = useState("Any");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const preferencesRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (preferencesRef.current && !preferencesRef.current.contains(event.target)) {
        setIsPreferencesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterOptions = [
    {
      id: "managed-space",
      name: "Managed Space",
      icon: "/commercial/managed-space.png",
      active: true
    },
    {
      id: "unmanaged-space",
      name: "Unmanaged Space", 
      icon: "/commercial/unmanaged-space.png",
      active: false
    },
    {
      id: "coworking-dedicated",
      name: "Coworking Dedicated",
      icon: "/commercial/coworking-dedicated.png",
      active: false
    },
    {
      id: "coworking-shared",
      name: "Coworking Shared",
      icon: "/commercial/coworking-shared.png",
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

  const handleSearch = () => {
    // Handle search functionality
    console.log("Search:", { 
      location, 
      managedSpace, 
      preferences, 
      selectedFilter,
      pricePerDesk,
      pricePerSqft,
      noOfSeats
    });
  };

  // Get dropdown options based on selected filter
  const getPropertyTypeOptions = () => {
    return [
      { value: "managed-space", label: "Managed Space" },
      { value: "unmanaged-space", label: "Unmanaged Space" },
      { value: "coworking-shared", label: "Coworking Shared" },
      { value: "coworking-dedicated", label: "Coworking Dedicated" }
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
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{
           backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop')`
         }}>
      
      {/* Centered Content Container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl px-4 md:px-6 z-10">
        
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-3">
              {filterOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleFilterClick(option.name)}
                  className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-200 aspect-square ${
                    selectedFilter === option.name
                      ? "bg-blue-50 border-2 border-blue-500 rounded-xl p-1 md:p-2"
                      : "hover:bg-gray-50 rounded-xl p-1 md:p-2 border border-gray-100"
                  }`}
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 mb-1 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={option.icon}
                      alt={option.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-700 text-center leading-tight">
                    {option.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Box - Search Inputs */}
          <div className="bg-white rounded-3xl shadow-2xl p-2 w-11/12 max-w-3xl group/container mt-1 animate-slideDown animation-delay-200">
            <div className="flex flex-col md:flex-row gap-0 items-center">
              {/* Location Input */}
              <div className="flex-[2.5] w-full">
                <input
                  type="text"
                  placeholder="Search by Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 border-0 focus:outline-none focus:ring-0 text-gray-700 text-sm transition-all"
                />
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
              {(selectedFilter === "Managed Space" || selectedFilter === "Unmanaged Space" || selectedFilter === "Coworking Dedicated" || selectedFilter === "Coworking Shared") ? (
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
                    <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 bg-white rounded-lg shadow-2xl py-3 px-4 w-[calc(100vw-2rem)] max-w-[380px] z-50 border border-gray-200">
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
                className="hover:opacity-90 text-white px-3 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm overflow-hidden w-full md:w-auto mt-2 md:mt-0"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
