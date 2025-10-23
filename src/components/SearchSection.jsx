"use client";

import { useState } from "react";
import Image from "next/image";

export default function SearchSection() {
  const [selectedFilter, setSelectedFilter] = useState("Managed Space");
  const [location, setLocation] = useState("");
  const [managedSpace, setManagedSpace] = useState("");
  const [preferences, setPreferences] = useState("");

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
  };

  const handleSearch = () => {
    // Handle search functionality
    console.log("Search:", { location, managedSpace, preferences, selectedFilter });
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{
           backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop')`
         }}>
      
      {/* Centered Content Container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-6 z-10">
        
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white whitespace-nowrap">
            Embrace The Era of{" "}
            <span className="text-yellow-400">Brokerage Free Real</span> Estate
          </h1>
        </div>

        {/* Search Component - Two Separate Boxes */}
        <div className="w-full space-y-4">
          
          {/* Top Box - Filter Options */}
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex flex-wrap justify-center gap-4">
              {filterOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleFilterClick(option.name)}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    selectedFilter === option.name
                      ? "bg-blue-50 border-2 border-blue-500 rounded-xl p-3"
                      : "hover:bg-gray-50 rounded-xl p-3 border border-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <Image
                      src={option.icon}
                      alt={option.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {option.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Box - Search Inputs */}
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Location Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-700"
                />
              </div>

              {/* Managed Space Dropdown */}
              <div className="flex-1">
                <div className="relative">
                  <select
                    value={managedSpace}
                    onChange={(e) => setManagedSpace(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-700 appearance-none bg-white pr-10"
                  >
                    <option value="">Managed Space</option>
                    <option value="fully-managed">Fully Managed</option>
                    <option value="semi-managed">Semi Managed</option>
                    <option value="unmanaged">Unmanaged</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Preferences Dropdown */}
              <div className="flex-1">
                <div className="relative">
                  <select
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-700 appearance-none bg-white pr-10"
                  >
                    <option value="">Preferences</option>
                    <option value="near-metro">Near Metro</option>
                    <option value="parking">Parking Available</option>
                    <option value="cafeteria">Cafeteria</option>
                    <option value="gym">Gym</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
