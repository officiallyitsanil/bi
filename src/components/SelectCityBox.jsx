"use client";

import { useState } from "react";
import Image from "next/image";

export default function SelectCityBox({ title = "Select by City", cities = [] }) {
  const [hoveredCity, setHoveredCity] = useState(cities.length > 0 ? cities[0].name : "");

  const currentCity = cities.find(city => city.name === hoveredCity);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - City Icons */}
      <div className="w-1/2 bg-blue-50 p-12">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              {title}
            </h1>
            <div className="w-20 h-1 rounded" style={{ backgroundColor: '#f9c12f' }}></div>
          </div>

          {/* City Grid */}
          <div className="flex-1 grid grid-cols-6 gap-6">
            {cities.map((city, index) => (
              <div
                key={city.name}
                className="flex flex-col items-center space-y-4 cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredCity(city.name)}
              >
                <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center bg-white transition-all duration-200 hover:scale-110" style={{ borderColor: '#f9c12f' }}>
                  <Image
                    src={city.image}
                    alt={city.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-contain transition-transform duration-200 hover:scale-110"
                  />
                </div>
                <span className={`text-sm font-medium text-center ${hoveredCity === city.name ? 'font-semibold' : 'text-gray-700'}`} style={{ color: hoveredCity === city.name ? '#f9c12f' : undefined }}>
                  {city.name}
                </span>
              </div>
            ))}
            
            {/* More Cities Button */}
            <div className="flex flex-col items-center space-y-4 cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-white font-bold text-xs text-center">
                  See<br/>All
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                More Cities
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div className="w-1/2 relative">
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
    </div>
  );
}
