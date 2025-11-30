"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SelectCityBox({ title = "Select by City", cities = [], isCommercial = false }) {
  const [hoveredCity, setHoveredCity] = useState(cities.length > 0 ? cities[0].name : "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const sectionRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);



  const currentCity = cities.find((city) => city.name === hoveredCity);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setIsModalOpen(true);
  };

  const handleCategorySelect = (category) => {
    if (!selectedCity) return;

    const params = new URLSearchParams({
      city: selectedCity.name,
      type: category,
    });
    
    // Add Category based on isCommercial prop (instead of propertyType)
    if (isCommercial) {
      params.append('Category', 'commercial');
    } else {
      params.append('Category', 'residential');
    }

    router.push(`/properties-search?${params.toString()}`);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row relative" ref={sectionRef}>
      {/* Mobile View */}
      <div className="max-[425px]:block hidden w-full py-8 mb-11">
        <div className="w-full px-4">
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
              {cities.map((city) => (
                <div
                  key={city.name}
                  className="flex flex-col items-center space-y-2 cursor-pointer transition-all duration-200 flex-shrink-0"
                  onClick={() => handleCityClick(city)}
                >
                  <div
                    className="w-16 h-16 rounded-full border-2 overflow-hidden bg-white transition-all duration-200 hover:scale-110"
                    style={{ borderColor: "#f9c12f" }}
                  >
                    <Image
                      src={city.image}
                      alt={city.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                    {city.name}
                  </span>
                </div>
              ))}

              <div 
                className="flex flex-col items-center space-y-2 cursor-pointer flex-shrink-0"
                onClick={() => setIsSeeAllModalOpen(true)}
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <span className="text-white font-bold text-xs text-center">
                    See<br />All
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                  More Cities
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="max-[425px]:hidden flex flex-col md:flex-row w-full">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 bg-blue-50 p-6 md:p-12">
          <div className="h-full flex flex-col">
            <div className={`mb-6 md:mb-12 ${isVisible ? "animate-slideInLeft" : "opacity-0"}`}>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h1>
              <div className="w-20 h-1 rounded" style={{ backgroundColor: "#f9c12f" }}></div>
            </div>

            <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {cities.map((city, index) => (
                <div
                  key={city.name}
                  className={`flex flex-col items-center space-y-2 cursor-pointer transition-all duration-200 ${
                    isVisible ? "animate-slideInLeft" : "opacity-0"
                  }`}
                  style={{ animationDelay: isVisible ? `${index * 0.05}s` : "0s" }}
                  onMouseEnter={() => setHoveredCity(city.name)}
                  onClick={() => handleCityClick(city)}
                >
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 overflow-hidden bg-white transition-all duration-200 hover:scale-110"
                    style={{ borderColor: "#f9c12f" }}
                  >
                    <Image
                      src={city.image}
                      alt={city.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                    />
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      hoveredCity === city.name ? "font-semibold" : "text-gray-700"
                    }`}
                    style={{ color: hoveredCity === city.name ? "#f9c12f" : undefined }}
                  >
                    {city.name}
                  </span>
                </div>
              ))}

              <div
                className={`flex flex-col items-center space-y-2 cursor-pointer ${
                  isVisible ? "animate-slideInLeft" : "opacity-0"
                }`}
                style={{ animationDelay: isVisible ? `${cities.length * 0.05}s` : "0s" }}
                onClick={() => setIsSeeAllModalOpen(true)}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <span className="text-white font-bold text-xs text-center">
                    See<br />All
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">More Cities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[600px]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{
              backgroundImage: `url(${currentCity?.backgroundImage})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Select Category for {selectedCity?.name}
            </h2>

            <div className="space-y-2">
              {(isCommercial ? [
                "Managed Space",
                "Unmanaged Space",
                "Coworking Dedicated",
                "Coworking Shared",
              ] : [
                "Rent",
                "Sale",
                "PG/Hostel",
                "Flatmates",
              ]).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="w-full py-2 px-4 rounded-lg text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#ff9d4d" }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* See All Cities Modal */}
      {isSeeAllModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={() => setIsSeeAllModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Select a City
              </h2>
              <button
                onClick={() => setIsSeeAllModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cities Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {cities.map((city) => (
                  <div
                    key={city.name}
                    className="flex flex-col items-center space-y-2 cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      setIsSeeAllModalOpen(false);
                      handleCityClick(city);
                    }}
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border-3 overflow-hidden bg-white shadow-md transition-all duration-200"
                      style={{ borderColor: "#ff9d4d", borderWidth: "3px" }}
                    >
                      <Image
                        src={city.image}
                        alt={city.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center">
                      {city.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
