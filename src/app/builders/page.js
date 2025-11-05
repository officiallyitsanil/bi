"use client";

import { useState } from 'react';
import { ArrowLeft, RefreshCw, Grid3x3, Circle, Download, Share2, Info, Home, Building2, Calendar, Star, ChevronRight, MoreVertical, Users, Eye, Bed, Bath, SquareIcon, Search, Phone, ExternalLink } from 'lucide-react';

export default function BuildersPage() {
  const [showBuilderDetails, setShowBuilderDetails] = useState(false);

  if (!showBuilderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-8">
            Builders Lists
          </h1>
          <button
            onClick={() => setShowBuilderDetails(true)}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-xl font-semibold rounded-xl transition-colors shadow-lg"
          >
            Next Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-4xl font-semibold text-gray-900">
                Estate Management
              </h1>
            </div>

            {/* Right: Stats Cards */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto">
              {/* Active Leads Card */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Active Leads</span>
                </div>
                <div className="flex items-end gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-semibold text-gray-900">120</span>
                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded mb-0.5 sm:mb-1">
                    +12%
                  </span>
                </div>
              </div>

              {/* Total Closed Card */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Total Closed</span>
                </div>
                <div className="flex items-end gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-semibold text-gray-900">42</span>
                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded mb-0.5 sm:mb-1">
                    +12%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Prestige Group Logo */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 sm:mb-4">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Prestige</h2>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">GROUP</h3>
                  <p className="text-xs sm:text-sm text-gray-500 italic">Add Prestige to your life</p>
                </div>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Projects Completed */}
              <div className="bg-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">280+</div>
                  <div className="text-xs sm:text-sm opacity-90">Projects Completed</div>
                </div>
              </div>

              {/* Ongoing Projects */}
              <div className="bg-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">45</div>
                  <div className="text-xs sm:text-sm opacity-90">Ongoing Projects</div>
                </div>
              </div>
            </div>

            {/* Upcoming Projects */}
            <div className="bg-green-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-3xl sm:text-5xl font-bold">25</div>
                <div className="text-base sm:text-xl font-medium">Upcoming Projects</div>
              </div>
            </div>

            {/* Experience and Cities */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Years of Experience */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <div className="text-3xl sm:text-5xl font-bold text-purple-500 mb-1 sm:mb-2">37+</div>
                <div className="text-xs sm:text-sm text-gray-500">Years of Experience</div>
              </div>

              {/* Cities Presence */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <div className="text-3xl sm:text-5xl font-bold text-blue-500 mb-1 sm:mb-2">12</div>
                <div className="text-xs sm:text-sm text-gray-500">Cities Presence</div>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 text-center">Our Mission</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                To create exceptional spaces that enhance lifestyles and contribute to sustainable urban development through innovation and excellence.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 text-center">Our Vision</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                To be the most trusted and preferred real estate brand, setting benchmarks in quality and customer satisfaction across India.
              </p>
            </div>
          </div>

          {/* Right Column - Property Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
              {/* Property Images */}
              <div className="relative">
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-1.5 sm:p-2">
                  {/* Main large image */}
                  <div className="col-span-3 row-span-2">
                    <div className="relative h-full rounded-lg sm:rounded-xl overflow-hidden min-h-[180px] sm:min-h-[250px]">
                      <img
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
                        alt="The Prestige City Hyderabad"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Small images on right */}
                  <div className="col-span-1">
                    <div className="rounded-lg sm:rounded-xl h-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"
                        alt="Property view 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 relative">
                    <div className="rounded-lg sm:rounded-xl h-full overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop"
                        alt="Property view 3"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-xl sm:text-3xl font-bold text-white">+8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">The Prestige City Hyderabad</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Villa, Apartment</p>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Units</div>
                    <div className="text-base sm:text-xl font-semibold text-gray-900">405</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Project Size</div>
                    <div className="text-base sm:text-xl font-semibold text-gray-900">4 Acre</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Launch Date</div>
                    <div className="text-base sm:text-xl font-semibold text-gray-900">Aug 2024</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full">3 BHK</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full">4 BHK</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full">5 BHK</span>
                </div>

                {/* Deals Section */}
                <div className="border-t pt-4 sm:pt-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">Deals</h4>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="bg-green-500 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                        <div className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">42</div>
                        <div className="text-xs sm:text-sm opacity-90">Closed Deals</div>
                      </div>
                    </div>
                    <div className="flex-1 text-right px-2 sm:px-4">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">132</div>
                      <div className="text-xs sm:text-sm text-gray-500">In Progress</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-xs">Possession</div>
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">Sep 2028</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-xs">Plot</div>
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">1,200 - 3,000 sqft</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-400 fill-orange-400 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-xs">Propscope</div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 fill-orange-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Range</div>
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">₹1.18 Cr - ₹2.91 Cr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About the Builder Section */}
        <div className="mt-4 sm:mt-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
              {/* Left Column - About Text */}
              <div className="lg:col-span-5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">About the Builder</h2>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed text-justify">
                  <p>
                    Prestige Group is one of India&apos;s leading real estate developers with over three decades of excellence in creating iconic residential and commercial spaces. Founded in 1986, the company has consistently delivered world-class projects that redefine urban living.
                  </p>
                  <p>
                    With a strong presence across South India, Prestige Group has developed over 280 projects covering more than 150 million square feet. The company&apos;s commitment to quality, innovation, and customer satisfaction has made it a trusted name in the real estate industry.
                  </p>
                  <p>
                    From luxury apartments and villas to commercial complexes and retail spaces, Prestige Group continues to shape skylines and create communities that enhance the quality of life for thousands of families.
                  </p>
                </div>
              </div>

              {/* Middle Column - Profile Image */}
              <div className="lg:col-span-3 flex items-start justify-center">
                <div className="text-center">
                  <div className="w-32 h-40 sm:w-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 bg-gradient-to-br from-gray-100 to-gray-200 mx-auto">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop"
                      alt="Irfan Razack"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Irfan Razack</h3>
                  <p className="text-xs text-gray-600 mb-2 sm:mb-3">Chairman & Managing Director</p>
                  <p className="text-xs text-gray-500 italic leading-relaxed px-2">
                    &quot;At Prestige, we are engineering commitment to quality and our ability to anticipate and exceed customer expectations. Through innovative structures, we create experiences.&quot;
                  </p>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="lg:col-span-4">
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2">
                    Unlock October discounts tailored for your business needs
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 sm:mb-4">
                    Get free registration powered with myHQ
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-teal-700 mb-4 sm:mb-6">
                    <span>✓ Lowest Price Guarantee</span>
                    <span>✓ 24/7 Enterprise Support</span>
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <input
                      type="email"
                      placeholder="Email ID"
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="+91"
                        className="w-14 sm:w-16 px-2 py-2 sm:px-3 sm:py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>
                    <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm">
                      Contact Now
                    </button>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-teal-100">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-1 sm:mb-1.5 mx-auto border-2 border-white">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                          alt="Swapnashree Saha"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-700">Swapnashree Saha</p>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-1 sm:mb-1.5 mx-auto border-3 border-teal-500">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                          alt="Amit Patel"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-800 font-semibold">Amit Patel</p>
                      <p className="text-xs text-teal-600">Sales Lead</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-1 sm:mb-1.5 mx-auto border-2 border-white">
                        <img
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
                          alt="Priya Sharma"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-700">Priya Sharma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Segments Section */}
        <div className="mt-4 sm:mt-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">OPERATIONAL SEGMENTS</h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-teal-600">Projects</h3>
            </div>

            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm overflow-x-auto pb-2">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg font-medium whitespace-nowrap">RESIDENTIAL</button>
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">COMMERCIAL</button>
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">HOSPITALITY</button>
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">RETAIL</button>
            </div>

            {/* Project Icons Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-6">
              {[
                { name: 'Prestige Lakeside', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&h=150&fit=crop' },
                { name: 'Prestige Glenbrook', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&h=150&fit=crop' },
                { name: 'Prestige Sunrise Park', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=150&h=150&fit=crop' },
                { name: 'Prestige Falcon City', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&h=150&fit=crop' },
                { name: 'Prestige Tranquility', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=150&h=150&fit=crop' },
                { name: 'Prestige Ivy Terrace', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=150&h=150&fit=crop' },
                { name: 'Prestige White Meadows', img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=150&h=150&fit=crop' },
                { name: 'Prestige Jade Pavilion', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=150&h=150&fit=crop' },
                { name: 'Prestige Silver Oak', img: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=150&h=150&fit=crop' },
                { name: 'Prestige Primrose Hills', img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=150&h=150&fit=crop' },
                { name: 'Prestige Misty Waters', img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=150&h=150&fit=crop' },
                { name: 'Prestige Royal Gardens', img: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=150&h=150&fit=crop' },
              ].map((project, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto mb-1.5 sm:mb-2 border-2 border-gray-200 hover:border-teal-500 transition-colors cursor-pointer">
                    <img
                      src={project.img}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-600 leading-tight">{project.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals, Reminder, and Property Stats Section */}
        <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Goals Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Goals</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Circular Progress Chart */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="440"
                    strokeDashoffset="110"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#fbbf24"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="440"
                    strokeDashoffset="330"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">$32,021</div>
                  <div className="text-xs text-gray-500">Total Income</div>
                </div>
              </div>

              {/* Income Details */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">From January</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">$12,167</div>
                </div>
                <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">From June</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">$14,900</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Reminder</h3>
                <button className="text-sm text-red-500 hover:text-red-600">×</button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Follow-Ups */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Follow-Ups</h4>
                    <p className="text-xs text-gray-500">5 Clients need to be followed up</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                          <img
                            src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?w=50&h=50&fit=crop`}
                            alt={`Client ${i}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                        +4
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 flex-shrink-0" />
                </div>

                {/* Visits */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Visits</h4>
                    <p className="text-xs text-gray-500">2 Properties and 3 Leads visit today</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 flex-shrink-0" />
                </div>

                {/* Expire Listings */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Expire Listings</h4>
                    <p className="text-xs text-gray-500">2 Listings are about to expire in 3 days</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* The Somerset Property Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">The Somerset</h3>
                  <p className="text-xs sm:text-sm text-gray-500">House</p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Deals Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Deals</h4>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">175</div>
                  <div className="text-xs text-gray-500">Sold</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">125</div>
                  <div className="text-xs text-gray-500">Rented</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">2K+</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="sm:col-span-2 col-span-3 flex items-center justify-between gap-2">
                  <div className="flex-1 bg-green-500 text-white rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">42</div>
                    <div className="text-xs opacity-90">Closed Deals</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">132</div>
                    <div className="text-xs text-gray-500">On-Progress</div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">5 Bed</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">3 Bath</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">44 m2 Area</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">2025 Build</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Listing, Contact Cards, and Appointments Section */}
        <div className="mt-4 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Active Listing Table */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Active Listing</h3>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                    />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Property Name</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Type</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Units</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Cost</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Active Leads</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Views</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Maison Sterling */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=60&h=60&fit=crop"
                            alt="Maison Sterling"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Maison Sterling</div>
                            <div className="text-xs text-gray-500">New York, Albany</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">House</td>
                      <td className="py-4 px-2 text-sm text-gray-700">12</td>
                      <td className="py-4 px-2 text-sm font-semibold text-gray-900">$ 1.13M</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {[1, 2].map((i) => (
                              <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                                <img
                                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?w=50&h=50&fit=crop`}
                                  alt={`Lead ${i}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">+32</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">125</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-teal-50 text-teal-600 text-xs rounded-full font-medium">
                          80% Occupied
                        </span>
                      </td>
                    </tr>

                    {/* The Orchid */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=60&h=60&fit=crop"
                            alt="The Orchid"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">The Orchid</div>
                            <div className="text-xs text-gray-500">Ohio, Columbus</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">Villa</td>
                      <td className="py-4 px-2 text-sm text-gray-700">8500</td>
                      <td className="py-4 px-2 text-sm font-semibold text-gray-900">$ 520K</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {[3, 4].map((i) => (
                              <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                                <img
                                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?w=50&h=50&fit=crop`}
                                  alt={`Lead ${i}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">+5</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">950</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                          Available
                        </span>
                      </td>
                    </tr>

                    {/* Echelon West */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&h=60&fit=crop"
                            alt="Echelon West"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Echelon West</div>
                            <div className="text-xs text-gray-500">Ohio, Columbus</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">House</td>
                      <td className="py-4 px-2 text-sm text-gray-700">25</td>
                      <td className="py-4 px-2 text-sm font-semibold text-gray-900">$ 700K</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {[5, 6].map((i) => (
                              <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                                <img
                                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?w=50&h=50&fit=crop`}
                                  alt={`Lead ${i}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">+40</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">305</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                          Available
                        </span>
                      </td>
                    </tr>

                    {/* La Residence */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=60&h=60&fit=crop"
                            alt="La Residence"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">La Residence</div>
                            <div className="text-xs text-gray-500">Ohio, Columbus</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">Apartment</td>
                      <td className="py-4 px-2 text-sm text-gray-700">17</td>
                      <td className="py-4 px-2 text-sm font-semibold text-gray-900">$ 700K</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {[7, 8].map((i) => (
                              <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                                <img
                                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?w=50&h=50&fit=crop`}
                                  alt={`Lead ${i}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">+18</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700">425</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full font-medium">
                          Sold Out
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Cards and Appointments */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {/* Contact Card 1 - Kristian Wu */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                      alt="Kristian Wu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">Kristian Wu</h4>
                    <p className="text-xs sm:text-sm text-gray-500">House - Buy</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xl sm:text-3xl font-bold text-gray-900">$1,560,400</div>
                  <div className="text-xs text-gray-500 mt-1">Last Contacted: 1 Jun 2025</div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white text-xs sm:text-sm rounded-lg font-medium inline-block">
                    Closed Won
                  </span>
                  <div className="text-xs text-green-600 mt-2">● Active Listing</div>
                </div>
              </div>
            </div>

            {/* Contact Card 2 - Kristina M. */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
                      alt="Kristina M."
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">Kristina M.</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Apartment - Buy</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xl sm:text-3xl font-bold text-gray-900">$500K - $650K</div>
                  <div className="text-xs text-gray-500 mt-1">Last Contacted: 1 Jun 2025</div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-teal-500 text-white text-xs sm:text-sm rounded-lg font-medium inline-block">
                    New Lead
                  </span>
                  <div className="text-xs text-teal-600 mt-2 flex items-center justify-start sm:justify-end gap-1">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    See Suggestion
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Upcoming Appointments</h3>

              {/* Mini Calendar */}
              <div className="mb-4 sm:mb-6">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-xs font-semibold text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                  {[8, 9, 10, 11, 12, 13, 14].map((date) => (
                    <div
                      key={date}
                      className={`p-1.5 sm:p-2 text-xs sm:text-sm rounded-lg ${date === 10
                        ? 'bg-teal-500 text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4 border-b overflow-x-auto">
                <button className="pb-2 text-xs sm:text-sm font-semibold text-teal-600 border-b-2 border-teal-600 whitespace-nowrap">
                  All
                </button>
                <button className="pb-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
                  Assigned
                </button>
                <button className="pb-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
                  My Schedule
                </button>
              </div>

              {/* Appointments List */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Visit Client Michael Reynolds
                  </h4>
                  <p className="text-xs text-gray-500">742 Oak Street, Denver, CO 80230</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Visit Client Sarah Thompson
                  </h4>
                  <p className="text-xs text-gray-500">1563 Maple Ave, Austin, TX 78704</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Follow Up: Aadiyah Loretto
                  </h4>
                  <p className="text-xs text-gray-500">contact@aadiyah.com | (325) 555-0198</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-4 sm:mt-8">
          {/* Purple Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-t-xl sm:rounded-t-2xl p-6 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Building2 className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-600" />
              </div>

              {/* Company Info */}
              <div className="text-white text-center sm:text-left">
                <h2 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-3">Prestige Group</h2>
                <p className="text-base sm:text-xl italic mb-4 sm:mb-6 opacity-90">&quot;Building Dreams, Creating Landmarks&quot;</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                    <div className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Founded</div>
                    <div className="text-xl sm:text-2xl font-bold">1986</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                    <div className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Headquarters</div>
                    <div className="text-xl sm:text-2xl font-bold">Bangalore</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* White About Section */}
          <div className="bg-white rounded-b-xl sm:rounded-b-2xl p-6 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
              {/* Left - About Text */}
              <div className="lg:col-span-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">About the Builder</h3>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                  <p>
                    Prestige Group is one of India&apos;s leading real estate developers with over three decades of excellence in creating iconic residential and commercial spaces. Founded in 1986, the company has consistently delivered world-class projects that redefine urban living.
                  </p>
                  <p>
                    With a strong presence across South India, Prestige Group has developed over 280 projects covering more than 150 million square feet. The company&apos;s commitment to quality, innovation, and customer satisfaction has made it a trusted name in the real estate industry.
                  </p>
                  <p>
                    From luxury apartments and villas to commercial complexes and retail spaces, Prestige Group continues to shape skylines and create communities that enhance the quality of life for thousands of families.
                  </p>
                </div>
              </div>

              {/* Right - Profile Card */}
              <div className="lg:col-span-4">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop"
                      alt="Irfan Razack"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">Irfan Razack</h4>
                  <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-4 sm:mb-6">Chairman & Managing Director</p>
                  <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                    &quot;Our success lies in our unwavering commitment to quality and our ability to anticipate and exceed customer expectations. We don&apos;t just build structures; we create experiences.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
