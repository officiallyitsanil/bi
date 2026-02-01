"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Building2, MapPin, Calendar, TrendingUp, Award, Crown, Droplets, Lightbulb, Wallet, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

// Subscriber images for hero cards fallback
const SUBSCRIBER_IMAGES = [
  '/builders/subscribers/subscriber-1.png',
  '/builders/subscribers/subscriber-2.png',
  '/builders/subscribers/subscriber-3.png',
  '/builders/subscribers/subscriber-4.png',
  '/builders/subscribers/subscriber-5.png',
  '/builders/subscribers/subscriber-6.png',
];

export default function BuildersPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('Bangalore');
  const [selectedService, setSelectedService] = useState('builders'); // 'serviceProvider' | 'builders' | 'interiorDesigner'
  const [budget, setBudget] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [possession, setPossession] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsVisible(true);
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/builders');
      const data = await response.json();

      if (data.success) {
        // Transform MongoDB data to match UI structure
        const transformedBuilders = data.data.map((builder, index) => ({
          id: builder._id,
          name: builder.builderName || 'N/A',
          tagline: builder.tagline || '',
          founded: builder.foundedYear || 'N/A',
          headquarters: builder.headquarters || 'N/A',
          projectsCompleted: builder.projectsCompleted?.toString() || '0',
          ongoingProjects: builder.ongoingProjects?.toString() || '0',
          upcomingProjects: builder.upcomingProjects?.toString() || '0',
          experience: builder.yearsOfExperience ? `${builder.yearsOfExperience}+` : 'N/A',
          cities: builder.citiesPresence || 'N/A',
          logo: builder.builderLogo?.url || SUBSCRIBER_IMAGES[index % SUBSCRIBER_IMAGES.length],
          gradient: ['from-emerald-500 via-teal-500 to-cyan-600', 'from-blue-500 via-indigo-500 to-purple-600', 'from-orange-500 via-red-500 to-pink-600'][index % 3],
          accentColor: ['emerald', 'blue', 'orange'][index % 3],
        }));
        setBuilders(transformedBuilders);
      }
    } catch (err) {
      console.error('Error fetching builders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAccentColors = (color) => {
    const colors = {
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        hover: 'hover:bg-emerald-600',
        border: 'border-emerald-200',
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-600',
        border: 'border-blue-200',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-600',
        border: 'border-orange-200',
      },
    };
    return colors[color];
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.append('city', selectedLocation);
    if (searchQuery) params.append('q', searchQuery);
    if (budget) params.append('budget', budget);
    if (propertyType) params.append('propertyType', propertyType);
    if (possession) params.append('possession', possession);
    router.push(`/properties-search?${params.toString()}`);
  };

  // Always exactly 6 cards for hero: use real builders or placeholders
  const HERO_CARD_COUNT = 6;
  const heroCards = Array.from({ length: HERO_CARD_COUNT }, (_, i) =>
    builders[i] ?? { id: `placeholder-${i}`, name: 'Builders Info.in', tagline: '', experience: null, projectsCompleted: null }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url('/builders/builders-banner.png')` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading builders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Top (styled like reference images) */}
      <section
        className="relative min-h-[520px] min-[435px]:min-h-[600px] lg:min-h-[550px] flex flex-col justify-end min-[435px]:justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/builders/builders-banner.png')` }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-0">
            {/* Mobile Top Section (max 435px) - Design from image */}
            <div className="max-[435px]:absolute max-[435px]:inset-0 max-[435px]:flex max-[435px]:flex-col max-[435px]:justify-between max-[435px]:p-4 min-[435px]:hidden">
              {/* Hero text overlapping at top */}
              <div className="pt-4">
                <p className="text-white/90 text-sm font-medium">Bangalore</p>
                <h1 className="text-2xl font-bold text-white">Real Estate, Simplified</h1>
              </div>

              {/* Dark card - rounded top */}
              <div className="bg-gray-900/70 backdrop-blur-md rounded-t-3xl flex flex-col pt-4 pb-6 px-4 border border-white/5">
                {/* Row 1: Location */}
                <div className="mb-3">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-white text-gray-900 pl-4 pr-10 py-2.5 rounded-xl appearance-none cursor-pointer font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem',
                    }}
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                {/* Row 2: Tabs */}
                <div className="flex gap-1 mb-3">
                  {[
                    { id: 'serviceProvider', label: 'Service Provider', icon: Crown },
                    { id: 'builders', label: 'Builders', icon: Building2 },
                    { id: 'interiorDesigner', label: 'Interior Designer', icon: Lightbulb },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedService(id)}
                      className={`flex-1 min-w-0 flex items-center justify-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        selectedService === id
                          ? 'bg-gray-700/80 text-white border-b-2 border-blue-500'
                          : 'bg-transparent text-gray-400 hover:text-gray-300 border-b-2 border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Row 3: Search input + Search button */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 min-w-0 bg-gray-800/60 text-white placeholder-gray-400 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-xl text-sm shrink-0"
                  >
                    Search
                  </button>
                </div>

                {/* Row 4: Vertical filter stack */}
                <div className="space-y-2">
                  {[
                    { value: budget, setter: setBudget, label: 'Budget', icon: Wallet, options: [
                      { value: '', label: 'Budget' },
                      { value: '0-50', label: 'Under ₹50L' },
                      { value: '50-100', label: '₹50L - ₹1Cr' },
                      { value: '100-200', label: '₹1Cr - ₹2Cr' },
                      { value: '200+', label: '₹2Cr+' },
                    ]},
                    { value: propertyType, setter: setPropertyType, label: 'Property Type', icon: Building2, options: [
                      { value: '', label: 'Property Type' },
                      { value: 'apartment', label: 'Apartment' },
                      { value: 'villa', label: 'Villa' },
                      { value: 'plot', label: 'Plot' },
                      { value: 'independent', label: 'Independent House' },
                    ]},
                    { value: possession, setter: setPossession, label: 'Possession', icon: Home, options: [
                      { value: '', label: 'Possession' },
                      { value: 'readyToMove', label: 'Ready to Move' },
                      { value: 'underConstruction', label: 'Under Construction' },
                    ]},
                  ].map(({ value, setter, label, icon: Icon, options }) => (
                    <div key={label} className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2.5 border border-white/10">
                      <Icon className="w-4 h-4 text-white/80 shrink-0" />
                      <select
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        className="flex-1 bg-transparent text-white text-sm appearance-none cursor-pointer focus:outline-none pr-6 min-w-0"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0 center',
                          backgroundSize: '1rem',
                        }}
                      >
                        {options.map((o) => (
                          <option key={o.value} value={o.value} className="bg-gray-800 text-white">{o.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop/Tablet: Left - Title + Search Interface (hidden on mobile) */}
            <div className="hidden min-[435px]:block lg:flex-none lg:min-w-0">
              <p className="text-white/90 text-sm mb-1 font-medium">Bangalore</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 lg:mb-8">
                Real Estate, Simplified
              </h1>

              {/* Search & Filter Container - Dark translucent */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10">
                {/* Location Dropdown */}
                <div className="mb-4">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-xl appearance-none cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem',
                    }}
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                {/* Service Type Tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'serviceProvider', label: 'Service Provider', icon: Crown },
                    { id: 'builders', label: 'Builders', icon: Building2 },
                    { id: 'interiorDesigner', label: 'Interior Designer', icon: Droplets },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedService(id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                        selectedService === id
                          ? 'bg-blue-600/80 text-white border border-blue-400/50'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Search input + Search button */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 min-w-0 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl shrink-0"
                  >
                    Search
                  </button>
                </div>

                {/* Filter Row */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="flex-1 bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 appearance-none cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem',
                    }}
                  >
                    <option value="">Budget</option>
                    <option value="0-50">Under ₹50L</option>
                    <option value="50-100">₹50L - ₹1Cr</option>
                    <option value="100-200">₹1Cr - ₹2Cr</option>
                    <option value="200+">₹2Cr+</option>
                  </select>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="flex-1 bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 appearance-none cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem',
                    }}
                  >
                    <option value="">Property Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                    <option value="independent">Independent House</option>
                  </select>
                  <select
                    value={possession}
                    onChange={(e) => setPossession(e.target.value)}
                    className="flex-1 bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 appearance-none cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem',
                    }}
                  >
                    <option value="">Possession</option>
                    <option value="readyToMove">Ready to Move</option>
                    <option value="underConstruction">Under Construction</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Center: always 6 small builder cards – same space from left and right */}
            <div className="hidden lg:flex flex-1 min-w-0 justify-center items-center overflow-hidden px-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {heroCards.map((builder, index) => (
                  <div
                    key={builder?.id || index}
                    onClick={() => builder?.id && !String(builder.id).startsWith('placeholder') && router.push(`/builders/${builder.id}`)}
                    className="flex-shrink-0 w-[72px] min-h-[80px] bg-white/25 backdrop-blur-sm rounded-[16px] flex flex-col items-center justify-center p-1.5 cursor-pointer hover:bg-white/35 transition-all border border-white/15 shadow-sm"
                  >
                    {builder?.logo ? (
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-white/95 flex items-center justify-center mb-1 flex-shrink-0">
                        <Image
                          src={builder.logo.startsWith('/') ? builder.logo : builder.logo}
                          alt={builder.name}
                          width={32}
                          height={32}
                          className="object-contain w-full h-full"
                          unoptimized={!builder.logo.startsWith('/')}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-white/95 flex items-center justify-center mb-1 flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <span className="text-white/95 text-[8px] font-medium text-center leading-tight truncate w-full">
                      {builder?.name || 'Builders Info.in'}
                    </span>
                    {((builder?.experience && builder.experience !== 'N/A') || (builder?.projectsCompleted != null && builder.projectsCompleted !== '0')) && (
                      <span className="text-white/80 text-[7px] text-center truncate w-full">
                        {builder.experience && builder.experience !== 'N/A' ? `${builder.experience} yrs` : `${builder.projectsCompleted} projects`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: always 6 small builder cards, centered (hidden on very small screens to match design) */}
            <div className="hidden min-[435px]:flex lg:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide justify-center">
              <div className="flex gap-2 justify-center">
                {heroCards.map((builder, index) => (
                  <div
                    key={builder?.id || index}
                    onClick={() => builder?.id && !String(builder.id).startsWith('placeholder') && router.push(`/builders/${builder.id}`)}
                    className="flex-shrink-0 w-[64px] min-h-[72px] bg-white/25 backdrop-blur-sm rounded-[14px] flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-white/35 transition-all border border-white/15 shadow-sm"
                  >
                    {builder?.logo ? (
                      <div className="w-6 h-6 rounded overflow-hidden bg-white/95 flex items-center justify-center mb-0.5 flex-shrink-0">
                        <Image
                          src={builder.logo.startsWith('/') ? builder.logo : builder.logo}
                          alt={builder.name}
                          width={24}
                          height={24}
                          className="object-contain w-full h-full"
                          unoptimized={!builder.logo.startsWith('/')}
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded bg-white/95 flex items-center justify-center mb-0.5 flex-shrink-0">
                        <Building2 className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                    <span className="text-white/95 text-[7px] font-medium text-center leading-tight truncate w-full">
                      {builder?.name || 'Builders Info.in'}
                    </span>
                    {((builder?.experience && builder.experience !== 'N/A') || (builder?.projectsCompleted != null && builder.projectsCompleted !== '0')) && (
                      <span className="text-white/80 text-[6px] text-center truncate w-full">
                        {builder.experience && builder.experience !== 'N/A' ? builder.experience : `${builder.projectsCompleted}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Builders Grid - Shifted to Bottom */}
      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
        {builders.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No builders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {builders.map((builder, index) => {
            const colors = getAccentColors(builder.accentColor);
            return (
              <div
                key={builder.id}
                className={`group transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                  }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                  {/* Builder Header with Gradient */}
                  <div className={`bg-gradient-to-br ${builder.gradient} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Building2 className={`w-10 h-10 ${colors.text}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-center mb-2 drop-shadow-md">{builder.name}</h2>
                      <p className="text-sm text-center opacity-95 font-light italic">&quot;{builder.tagline}&quot;</p>
                    </div>
                  </div>

                  {/* Builder Stats */}
                  <div className="p-6">
                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className={`text-center p-4 ${colors.bg} rounded-xl border ${colors.border} transition-all hover:scale-105`}>
                        <Calendar className={`w-5 h-5 ${colors.text} mx-auto mb-2`} />
                        <div className="text-xs text-gray-500 mb-1">Founded</div>
                        <div className={`text-xl font-bold ${colors.text}`}>{builder.founded}</div>
                      </div>
                      <div className={`text-center p-4 ${colors.bg} rounded-xl border ${colors.border} transition-all hover:scale-105`}>
                        <MapPin className={`w-5 h-5 ${colors.text} mx-auto mb-2`} />
                        <div className="text-xs text-gray-500 mb-1">Headquarters</div>
                        <div className={`text-xl font-bold ${colors.text}`}>{builder.headquarters}</div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700 font-medium">Completed</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{builder.projectsCompleted}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                          <span className="text-sm text-gray-700 font-medium">Ongoing</span>
                        </div>
                        <span className="text-xl font-bold text-amber-600">{builder.ongoingProjects}</span>
                      </div>
                    </div>

                    {/* More Details Button */}
                    <button
                      onClick={() => router.push(`/builders/${builder.id}`)}
                      className={`w-full bg-gradient-to-r ${builder.gradient} ${colors.hover} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group`}
                    >
                      <span>View Details</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
