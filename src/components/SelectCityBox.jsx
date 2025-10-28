"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function SelectCityBox({ title = "Select by City", cities = [] }) {
  const [hoveredCity, setHoveredCity] = useState(cities.length > 0 ? cities[0].name : "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const currentCity = cities.find(city => city.name === hoveredCity);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setIsModalOpen(true);
  };

  const handleCategorySelect = (category) => {
    console.log(`Selected ${category} for ${selectedCity.name}`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" ref={sectionRef}>
      {/* Left Panel - City Icons */}
      <div className="w-full md:w-1/2 bg-blue-50 p-6 md:p-12">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`mb-6 md:mb-12 ${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`}>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
              {title}
            </h1>
            <div className="w-20 h-1 rounded" style={{ backgroundColor: '#f9c12f' }}></div>
          </div>

          {/* City Grid */}
          <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {cities.map((city, index) => (
              <div
                key={city.name}
                className={`flex flex-col items-center space-y-2 cursor-pointer transition-all duration-200 ${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`}
                style={{ animationDelay: isVisible ? `${index * 0.05}s` : '0s' }}
                onMouseEnter={() => setHoveredCity(city.name)}
                onClick={() => handleCityClick(city)}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 overflow-hidden bg-white transition-all duration-200 hover:scale-110" style={{ borderColor: '#f9c12f' }}>
                  <Image
                    src={city.image}
                    alt={city.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                  />
                </div>
                <span className={`text-xs font-medium text-center ${hoveredCity === city.name ? 'font-semibold' : 'text-gray-700'}`} style={{ color: hoveredCity === city.name ? '#f9c12f' : undefined }}>
                  {city.name}
                </span>
              </div>
            ))}

            {/* More Cities Button */}
            <div className={`flex flex-col items-center space-y-2 cursor-pointer ${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`} style={{ animationDelay: isVisible ? `${cities.length * 0.05}s` : '0s' }}>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-white font-bold text-xs text-center">
                  See<br />All
                </span>
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">
                More Cities
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: `url(${currentCity?.backgroundImage})`
          }}
        >
          {/* Gradient overlay from left to blend with blue panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Select Category for {selectedCity?.name}
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => handleCategorySelect("Managed Space")}
                className="w-full py-3 px-6 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#ff9d4d' }}
              >
                Managed Space
              </button>

              <button
                onClick={() => handleCategorySelect("Unmanaged Space")}
                className="w-full py-3 px-6 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#ff9d4d' }}
              >
                Unmanaged Space
              </button>

              <button
                onClick={() => handleCategorySelect("Coworking Dedicated")}
                className="w-full py-3 px-6 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#ff9d4d' }}
              >
                Coworking Dedicated
              </button>

              <button
                onClick={() => handleCategorySelect("Coworking Shared")}
                className="w-full py-3 px-6 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#ff9d4d' }}
              >
                Coworking Shared
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
