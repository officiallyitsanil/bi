"use client";

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Home, Building2, Calendar, Star } from 'lucide-react';

export default function BuilderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const builderId = params.id;

  // Mock data - in real app, fetch based on builderId
  const builderData = {
    name: 'Prestige Group',
    tagline: 'Building Dreams, Creating Landmarks',
    founded: '1986',
    headquarters: 'Bangalore',
    projectsCompleted: '280+',
    ongoingProjects: '45',
    upcomingProjects: '25',
    experience: '37+',
    cities: '12',
    ceoName: 'Irfan Razack',
    ceoTitle: 'Chairman & Managing Director',
    ceoQuote: 'Our success lies in our unwavering commitment to quality and our ability to anticipate and exceed customer expectations. We don\'t just build structures; we create experiences.',
    about: [
      'Prestige Group is one of India\'s leading real estate developers with over three decades of excellence in creating iconic residential and commercial spaces. Founded in 1986, the company has consistently delivered world-class projects that redefine urban living.',
      'With a strong presence across South India, Prestige Group has developed over 280 projects covering more than 150 million square feet. The company\'s commitment to quality, innovation, and customer satisfaction has made it a trusted name in the real estate industry.',
      'From luxury apartments and villas to commercial complexes and retail spaces, Prestige Group continues to shape skylines and create communities that enhance the quality of life for thousands of families.'
    ],
    mission: 'To create exceptional spaces that enhance lifestyles and contribute to sustainable urban development through innovation and excellence.',
    vision: 'To be the most trusted and preferred real estate brand, setting benchmarks in quality and customer satisfaction across India.',
    featuredProject: {
      name: 'The Prestige City Hyderabad',
      type: 'Villa, Apartment',
      totalUnits: '405',
      projectSize: '4 Acre',
      launchDate: 'Aug 2024',
      possession: 'Sep 2028',
      plotSize: '1,200 - 3,000 sqft',
      priceRange: '₹1.18 Cr - ₹2.91 Cr',
      closedDeals: '42',
      inProgress: '132',
      bhkTypes: ['3 BHK', '4 BHK', '5 BHK']
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
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
            {/* Builder Logo */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 sm:mb-4">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{builderData.name.split(' ')[0]}</h2>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">{builderData.name.split(' ')[1]}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 italic">{builderData.tagline}</p>
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
                  <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">{builderData.projectsCompleted}</div>
                  <div className="text-xs sm:text-sm opacity-90">Projects Completed</div>
                </div>
              </div>

              {/* Ongoing Projects */}
              <div className="bg-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">{builderData.ongoingProjects}</div>
                  <div className="text-xs sm:text-sm opacity-90">Ongoing Projects</div>
                </div>
              </div>
            </div>

            {/* Upcoming Projects */}
            <div className="bg-green-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-3xl sm:text-5xl font-bold">{builderData.upcomingProjects}</div>
                <div className="text-base sm:text-xl font-medium">Upcoming Projects</div>
              </div>
            </div>

            {/* Experience and Cities */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Years of Experience */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <div className="text-3xl sm:text-5xl font-bold text-purple-500 mb-1 sm:mb-2">{builderData.experience}</div>
                <div className="text-xs sm:text-sm text-gray-500">Years of Experience</div>
              </div>

              {/* Cities Presence */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <div className="text-3xl sm:text-5xl font-bold text-blue-500 mb-1 sm:mb-2">{builderData.cities}</div>
                <div className="text-xs sm:text-sm text-gray-500">Cities Presence</div>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 text-center">Our Mission</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                {builderData.mission}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 text-center">Our Vision</h3>
              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                {builderData.vision}
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
                        alt={builderData.featuredProject.name}
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
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">{builderData.featuredProject.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{builderData.featuredProject.type}</p>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Units</div>
                    <div className="text-base sm:text-xl font-semibold text-gray-900">{builderData.featuredProject.totalUnits}</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Project Size</div>
                    <div className="text-base sm:text-xl font-semibold text-gray-900">{builderData.featuredProject.projectSize}</div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Launch Date</div>
                    <div className="text-base sm:text-xl font-semibold text-gray-900">{builderData.featuredProject.launchDate}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  {builderData.featuredProject.bhkTypes.map((type) => (
                    <span key={type} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{type}</span>
                  ))}
                </div>

                {/* Deals Section */}
                <div className="border-t pt-4 sm:pt-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">Deals</h4>
                  </div>

                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="bg-green-500 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                        <div className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{builderData.featuredProject.closedDeals}</div>
                        <div className="text-xs sm:text-sm opacity-90">Closed Deals</div>
                      </div>
                    </div>
                    <div className="flex-1 text-right px-2 sm:px-4">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">{builderData.featuredProject.inProgress}</div>
                      <div className="text-xs sm:text-sm text-gray-500">In Progress</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-xs">Possession</div>
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">{builderData.featuredProject.possession}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-xs">Plot</div>
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">{builderData.featuredProject.plotSize}</div>
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
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">{builderData.featuredProject.priceRange}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About the Builder Section */}
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
                <h2 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-3">{builderData.name}</h2>
                <p className="text-base sm:text-xl italic mb-4 sm:mb-6 opacity-90">&quot;{builderData.tagline}&quot;</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                    <div className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Founded</div>
                    <div className="text-xl sm:text-2xl font-bold">{builderData.founded}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                    <div className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Headquarters</div>
                    <div className="text-xl sm:text-2xl font-bold">{builderData.headquarters}</div>
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
                  {builderData.about.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Right - Profile Card */}
              <div className="lg:col-span-4">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop"
                      alt={builderData.ceoName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">{builderData.ceoName}</h4>
                  <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-4 sm:mb-6">{builderData.ceoTitle}</p>
                  <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                    &quot;{builderData.ceoQuote}&quot;
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
