"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Building2, MapPin, Calendar, TrendingUp, Award, Crown, Droplets, Lightbulb, Wallet, Home, ExternalLink, Video, FileText, Phone, Mail, MessageCircle, ChevronRight, ChevronDown, List, LayoutGrid, Plus, Check, User } from 'lucide-react';
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

// Dummy filter options
const FILTER_LOCATIONS = ['All Locations', 'Bangalore', 'Mysore Road', 'Devanahalli', 'Varthur', 'Hebbal', 'Brookefield', 'Padmanabhanagar', 'Electronic City', 'Whitefield', 'Sarjapur'];
const FILTER_PRICES = ['By Price', 'Under ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr+'];
const FILTER_SEATS = ['By Seats', '10-50', '50-100', '100-500', '500+'];

import { BUILDERS_BY_ID } from '@/data/builders';

// Build list from shared data - matches reference UI
const DUMMY_BUILDER_SECTIONS = Object.values(BUILDERS_BY_ID);

// Contact & guarantee blocks (reused per builder)
const EXPERT_CONTACT = { name: 'Rohit', phone: '+91 89*****896', tag: 'Bhive Expert' };

// Compact builder card for grid view: logo, name, buttons, stats only
function BuilderGridCard({ section, router }) {
  const statItems = [
    { value: section.stats?.projects, label: 'Projects' },
    { value: section.stats?.cities, label: 'Cities' },
    { value: section.stats?.sqft, label: 'M Sq.Ft.' },
    { value: section.stats?.clients, label: 'Clients' },
    { value: section.stats?.experience, label: 'Experience' },
  ];
  return (
    <div
      onClick={() => section.id && router.push(`/builders/${section.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-[425px]:p-3 cursor-pointer hover:shadow-md transition-shadow mt-4 mx-2 sm:mx-3 max-[425px]:mx-2"
    >
      <div className="flex items-start gap-3 max-[425px]:gap-2">
        <div className="w-[48px] h-[52px] max-[425px]:w-[44px] max-[425px]:h-[48px] sm:w-[64px] sm:h-[70px] rounded-md flex-shrink-0 overflow-hidden flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm">
          {section.isBrigade ? (
            <div className="flex flex-col items-center justify-center p-1.5 w-full h-full">
              <div className="relative flex flex-col gap-0.5 items-start w-full pl-0.5">
                <div className="w-4 h-0.5 bg-blue-600 rounded" />
                <div className="w-3.5 h-0.5 bg-blue-600 rounded ml-0.5" />
                <div className="w-3 h-0.5 bg-blue-600 rounded ml-1" />
                <div className="w-2.5 h-0.5 bg-blue-600 rounded ml-1" />
                <div className="w-2 h-0.5 bg-blue-600 rounded ml-1.5" />
                <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <span className="text-[8px] font-semibold text-gray-900 uppercase leading-tight mt-1">BRIGADE</span>
            </div>
          ) : section.logo ? (
            <Image src={section.logo} alt={section.name} width={64} height={70} className="object-contain w-full h-full" />
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <Building2 className="w-5 h-5 text-gray-400 mb-0.5" />
              <span className="text-gray-500 text-[8px] text-center px-1">Builders info.in</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-1.5 max-[425px]:gap-1">
          <h2 className="text-base font-bold text-gray-900 max-[425px]:text-sm truncate">{section.name}</h2>
          <div className="flex flex-wrap gap-1 max-[425px]:gap-0.5">
            <a href="#" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 max-[425px]:px-1.5 max-[425px]:py-0.5 rounded-full bg-gray-100 border border-red-500 text-red-600 text-[9px] max-[425px]:text-[8px] font-medium hover:bg-gray-200 transition-colors">
              <ExternalLink className="w-2.5 h-2.5 max-[425px]:w-2 max-[425px]:h-2" /> Website
            </a>
            <a href="#" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 max-[425px]:px-1.5 rounded-full bg-gray-100 text-gray-900 text-[9px] max-[425px]:text-[8px] font-medium hover:bg-gray-200 transition-colors">
              <Video className="w-2.5 h-2.5 max-[425px]:w-2 max-[425px]:h-2" /> Watch Video
            </a>
            <a href="#" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 max-[425px]:px-1.5 rounded-full bg-gray-100 text-gray-900 text-[9px] max-[425px]:text-[8px] font-medium hover:bg-gray-200 transition-colors">
              <FileText className="w-2.5 h-2.5 max-[425px]:w-2 max-[425px]:h-2" /> Brochure
            </a>
          </div>
          <div className="flex items-stretch gap-0 mt-2 max-[425px]:mt-1.5 flex-wrap max-[425px]:overflow-x-auto max-[425px]:pb-1">
            {statItems.map((item, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <span className="w-px h-5 max-[425px]:h-4 bg-gray-200 self-center flex-shrink-0 mx-0.5 max-[425px]:mx-0" />}
                <div className="flex flex-col items-center justify-center px-1.5 max-[425px]:px-1 min-w-0">
                  <span className="text-[10px] max-[425px]:text-[9px] font-bold text-gray-800 leading-tight">{item.value}</span>
                  <span className="text-[8px] max-[425px]:text-[7px] text-gray-500 mt-0.5">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Single builder block: left = builder info, right = tabs + projects + contact + guarantees
const DESCRIPTION_PREVIEW_LENGTH = 200;

function BuilderSectionBlock({ section, expert, isVisible, delay, router }) {
  const [activeTab, setActiveTab] = useState('newLaunch');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterPrice, setFilterPrice] = useState('By Price');
  const [filterSeats, setFilterSeats] = useState('By Seats');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const selectStyle = 'border rounded-lg px-2 py-1 text-[10px] text-gray-700 appearance-none cursor-pointer pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 border-gray-200';
  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.35rem center',
    backgroundSize: '0.75rem',
  };

  // Filter by tab (type)
  const allProjects = section.projects || [];
  let filtered = allProjects.filter((p) => p.type === activeTab);
  // Filter by location
  if (filterLocation && filterLocation !== 'All Locations') {
    filtered = filtered.filter((p) => (p.location && String(p.location).includes(filterLocation)) || p.area === filterLocation);
  }
  // Filter by price range (price in Lakhs)
  if (filterPrice && filterPrice !== 'By Price') {
    const getPrice = (p) => (typeof p.price === 'number' ? p.price : 0);
    if (filterPrice === 'Under ₹50L') filtered = filtered.filter((p) => getPrice(p) < 50);
    else if (filterPrice === '₹50L - ₹1Cr') filtered = filtered.filter((p) => getPrice(p) >= 50 && getPrice(p) < 100);
    else if (filterPrice === '₹1Cr - ₹2Cr') filtered = filtered.filter((p) => getPrice(p) >= 100 && getPrice(p) < 200);
    else if (filterPrice === '₹2Cr+') filtered = filtered.filter((p) => getPrice(p) >= 200);
  }
  // Filter by seats
  if (filterSeats && filterSeats !== 'By Seats') {
    const getSeats = (p) => (typeof p.seats === 'number' ? p.seats : 0);
    if (filterSeats === '10-50') filtered = filtered.filter((p) => getSeats(p) >= 10 && getSeats(p) < 50);
    else if (filterSeats === '50-100') filtered = filtered.filter((p) => getSeats(p) >= 50 && getSeats(p) < 100);
    else if (filterSeats === '100-500') filtered = filtered.filter((p) => getSeats(p) >= 100 && getSeats(p) < 500);
    else if (filterSeats === '500+') filtered = filtered.filter((p) => getSeats(p) >= 500);
  }

  const newLaunchCount = section.projects.filter((p) => p.type === 'newLaunch').length;
  const upcomingCount = section.projects.filter((p) => p.type === 'upcoming').length;
  const readyToMoveCount = section.projects.filter((p) => p.type === 'readyToMove').length;

  const tabs = [
    { id: 'newLaunch', label: `New Launch (${newLaunchCount})` },
    { id: 'upcoming', label: `Upcoming (${upcomingCount})` },
    { id: 'readyToMove', label: `Ready to Move In (${readyToMoveCount})` },
  ];

  const showGrid = filtered.length > 3;
  const displayProjects = showGrid ? filtered.slice(0, 8) : filtered;

  const statItems = [
    { value: section.stats.projects, label: 'Projects' },
    { value: section.stats.cities, label: 'Cities' },
    { value: section.stats.sqft, label: 'MSq.Ft.' },
    { value: section.stats.clients, label: 'Clients' },
    { value: section.stats.experience, label: 'Experience' },
  ];

  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 max-[425px]:mb-4 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="p-4 sm:p-5 lg:p-6 max-[425px]:p-3">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 max-[425px]:gap-3">
          {/* Left section: profile card - Logo left, Name + Buttons + Stats right */}
          <div className="lg:w-[42%] lg:max-w-[420px] lg:flex-shrink-0 lg:min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 max-[425px]:p-3 hover:shadow-md transition-shadow flex flex-col">
            {/* Logo (left) | Right: Row1 Name, Row2 Buttons, Row3 Stats */}
            <div className="flex items-start gap-3 max-[425px]:gap-2 flex-shrink-0">
              <div className="w-[48px] h-[52px] max-[425px]:w-[44px] max-[425px]:h-[48px] sm:w-[64px] sm:h-[70px] rounded-md flex-shrink-0 overflow-hidden flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm">
                {section.isBrigade ? (
                  <div className="flex flex-col items-center justify-center p-1.5 w-full h-full">
                    <div className="relative flex flex-col gap-0.5 items-start w-full pl-0.5">
                      <div className="w-4 h-0.5 bg-blue-600 rounded" />
                      <div className="w-3.5 h-0.5 bg-blue-600 rounded ml-0.5" />
                      <div className="w-3 h-0.5 bg-blue-600 rounded ml-1" />
                      <div className="w-2.5 h-0.5 bg-blue-600 rounded ml-1" />
                      <div className="w-2 h-0.5 bg-blue-600 rounded ml-1.5" />
                      <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                    <span className="text-[8px] font-semibold text-gray-900 uppercase leading-tight mt-1">BRIGADE</span>
                  </div>
                ) : section.logo ? (
                  <Image src={section.logo} alt={section.name} width={64} height={70} className="object-contain w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <Building2 className="w-5 h-5 text-gray-400 mb-0.5" />
                    <span className="text-gray-500 text-[8px] text-center px-1">Builders info.in</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-1.5 max-[425px]:gap-1">
                {/* Row 1: Name */}
                <h2 className="text-base font-bold text-gray-900 max-[425px]:text-sm truncate">{section.name}</h2>
                {/* Row 2: Buttons - all in one row */}
                <div className="flex flex-wrap gap-1 max-[425px]:gap-0.5">
                  <a href="#" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 max-[425px]:px-1.5 rounded-full bg-gray-100 border border-red-500 text-red-600 text-[9px] max-[425px]:text-[8px] font-medium hover:bg-gray-200 transition-colors">
                    <ExternalLink className="w-2.5 h-2.5 max-[425px]:w-2 max-[425px]:h-2" /> Website
                  </a>
                  <a href="#" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 max-[425px]:px-1.5 rounded-full bg-gray-100 text-gray-900 text-[9px] max-[425px]:text-[8px] font-medium hover:bg-gray-200 transition-colors">
                    <Video className="w-2.5 h-2.5 max-[425px]:w-2 max-[425px]:h-2" /> Watch Video
                  </a>
                  <a href="#" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 max-[425px]:px-1.5 rounded-full bg-gray-100 text-gray-900 text-[9px] max-[425px]:text-[8px] font-medium hover:bg-gray-200 transition-colors">
                    <FileText className="w-2.5 h-2.5 max-[425px]:w-2 max-[425px]:h-2" /> Brochure
                  </a>
                </div>
                {/* Row 3: Stats - to right of logo */}
                <div className="flex items-stretch gap-0 flex-wrap max-[425px]:overflow-x-auto max-[425px]:pb-1">
                  {statItems.map((item, i) => (
                    <div key={i} className="flex items-center">
                      {i > 0 && <span className="w-px h-5 max-[425px]:h-4 bg-gray-200 self-center flex-shrink-0 max-[425px]:mx-0" />}
                      <div className="flex flex-col items-center justify-center px-1.5 max-[425px]:px-1 min-w-0">
                        <span className="text-[10px] max-[425px]:text-[9px] font-bold text-gray-800 leading-tight">{item.value}</span>
                        <span className="text-[8px] max-[425px]:text-[7px] text-gray-500 mt-0.5">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description + Read more: follows description, not bottom-aligned */}
            <div className="flex-1 min-h-0 mt-4 max-[425px]:mt-3">
              <p className="text-gray-600 text-xs max-[425px]:text-[11px] leading-relaxed" style={{ lineHeight: 1.5 }}>
                {descriptionExpanded || !section.description || section.description.length <= DESCRIPTION_PREVIEW_LENGTH
                  ? section.description
                  : `${section.description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`}
              </p>
              {section.description && section.description.length > DESCRIPTION_PREVIEW_LENGTH && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((prev) => !prev)}
                  className="text-blue-600 font-semibold text-xs hover:underline mt-1 inline-block text-left"
                >
                  {descriptionExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => section.id && router.push(`/builders/${section.id}`)}
              className="inline-flex items-center gap-1 text-blue-600 font-medium text-xs max-[425px]:text-[11px] hover:underline mt-auto pt-4 max-[425px]:pt-3 text-left cursor-pointer"
            >
              Interested in {section.name}? Connect with us <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* Right section */}
          <div className="lg:flex-1 lg:min-w-0 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 max-[425px]:p-3">
              {/* Tabs + Filters in one row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 max-[425px]:mb-3">
                <div className="flex gap-4 max-[425px]:gap-2 border-b border-gray-200 pb-2 overflow-x-auto max-[425px]:-mx-1 max-[425px]:px-1">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`pb-1.5 text-xs max-[425px]:text-[10px] font-medium border-b-2 transition-colors -mb-[2px] whitespace-nowrap shrink-0 ${
                        activeTab === t.id
                          ? 'text-gray-900 font-bold border-blue-600'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 max-[425px]:gap-1.5">
                  <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className={selectStyle} style={selectBg}>
                    {FILTER_PRICES.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select value={filterSeats} onChange={(e) => setFilterSeats(e.target.value)} className={selectStyle} style={selectBg}>
                    {FILTER_SEATS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className={selectStyle} style={selectBg}>
                    {FILTER_LOCATIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property cards: 3 per row on larger, 1–2 on small */}
              {displayProjects.length === 0 ? (
                <p className="text-gray-500 text-xs max-[425px]:text-[11px] py-4">No projects match your filters. Try different criteria.</p>
              ) : showGrid ? (
                <div className="grid grid-cols-1 max-[425px]:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 max-[425px]:mb-3">
                  {displayProjects.map((proj, i) => (
                    <div key={i} className="flex gap-3 bg-white rounded-lg border border-gray-100 shadow-sm p-2.5 max-[425px]:p-2 hover:shadow-md transition-shadow min-w-0">
                      <div className="w-14 h-14 max-[425px]:w-12 max-[425px]:h-12 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                        <Home className="w-7 h-7 max-[425px]:w-6 max-[425px]:h-6 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <p className="font-semibold text-gray-900 text-[10px] sm:text-xs max-[425px]:text-[10px] truncate">{proj.name}</p>
                        <p className="text-[9px] sm:text-[10px] max-[425px]:text-[9px] text-gray-500 truncate mt-0.5">{proj.location}</p>
                        <p className="text-blue-600 text-[9px] sm:text-[10px] font-bold mt-1">{proj.status}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => section.id && router.push(`/builders/${section.id}`)}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold text-sm max-[425px]:text-xs rounded-lg flex items-center justify-center min-h-[72px] max-[425px]:min-h-[60px] transition-colors shadow-sm min-w-0"
                  >
                    View All
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 max-[425px]:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 max-[425px]:mb-3">
                  {displayProjects.map((proj, i) => (
                    <div key={i} className="flex gap-3 bg-white rounded-lg border border-gray-100 shadow-sm p-3 max-[425px]:p-2 min-w-0">
                      <div className="w-14 h-14 max-[425px]:w-12 max-[425px]:h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <Home className="w-7 h-7 max-[425px]:w-6 max-[425px]:h-6 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-xs max-[425px]:text-[10px] truncate">{proj.name}</p>
                        <p className="text-[10px] max-[425px]:text-[9px] text-gray-500 truncate mt-0.5">{proj.location}</p>
                        <p className="text-blue-600 text-[10px] max-[425px]:text-[9px] font-bold mt-1">{proj.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Agent + Benefit cards - Contact = 1.5x one property card, rest = benefits, equal heights */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.5fr] gap-4 max-[425px]:gap-3 items-stretch">
                <div className="min-w-0">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 max-[425px]:p-2.5 h-full">
                    <div className="flex items-start gap-2 mb-2 max-[425px]:gap-1.5 max-[425px]:mb-1.5">
                      <div className="w-10 h-10 max-[425px]:w-9 max-[425px]:h-9 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
                        <User className="w-5 h-5 max-[425px]:w-4 max-[425px]:h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-xs max-[425px]:text-[11px]">Say Hi To {expert.name}</p>
                        <p className="text-[10px] max-[425px]:text-[9px] text-gray-600 font-medium mt-0.5">{expert.phone}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[9px] max-[425px]:text-[8px] font-medium">{expert.tag}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                        <button type="button" className="w-7 h-7 max-[425px]:w-6 max-[425px]:h-6 rounded-full border border-green-500 text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors" style={{ backgroundColor: '#dcfce7' }}>
                          <Phone className="w-3.5 h-3.5 max-[425px]:w-3 max-[425px]:h-3" />
                        </button>
                        <button type="button" className="w-7 h-7 max-[425px]:w-6 max-[425px]:h-6 rounded-full border border-green-500 text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors" style={{ backgroundColor: '#dcfce7' }}>
                          <Mail className="w-3.5 h-3.5 max-[425px]:w-3 max-[425px]:h-3" />
                        </button>
                        <button type="button" className="w-7 h-7 max-[425px]:w-6 max-[425px]:h-6 rounded-full border border-green-500 text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors" style={{ backgroundColor: '#dcfce7' }}>
                          <MessageCircle className="w-3.5 h-3.5 max-[425px]:w-3 max-[425px]:h-3" />
                        </button>
                      </div>
                    </div>
                    <button type="button" className="w-full bg-blue-600 text-white font-semibold text-xs max-[425px]:text-[11px] py-2 max-[425px]:py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                      Contact {expert.name}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-[425px]:gap-1.5 min-w-0">
                  <div className="flex items-start gap-2 max-[425px]:gap-1.5 rounded-lg border border-gray-200 p-2 max-[425px]:p-1.5 shadow-sm flex-1 min-h-0" style={{ backgroundColor: '#e2e9f7' }}>
                    <div className="w-8 h-8 max-[425px]:w-7 max-[425px]:h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm max-[425px]:text-xs">Z</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-[10px] max-[425px]:text-[9px]">Zero Brokerage</p>
                      <p className="text-[9px] max-[425px]:text-[8px] text-gray-600 leading-tight mt-0.5">100% Service, 0% Brokerage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 max-[425px]:gap-1.5 rounded-lg border border-gray-200 p-2 max-[425px]:p-1.5 shadow-sm flex-1 min-h-0" style={{ backgroundColor: '#e2e9f7' }}>
                    <div className="w-8 h-8 max-[425px]:w-7 max-[425px]:h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-[10px] max-[425px]:text-[9px]">Lowest Price Guaranteed</p>
                      <p className="text-[9px] max-[425px]:text-[8px] text-gray-600 leading-tight mt-0.5">Highly unlikely, but if you find a lower price anywhere, tell us and we will match it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [sortBy, setSortBy] = useState('Property');
  const [viewMode, setViewMode] = useState('list');

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

  // Sort builders by selected criterion
  const getExperienceNum = (section) => {
    const n = section.stats?.experienceNum;
    if (typeof n === 'number') return n;
    const str = section.stats?.experience || '';
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  const getProjectsNum = (section) => {
    const n = section.stats?.projectsNum;
    if (typeof n === 'number') return n;
    const str = section.stats?.projects || '';
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : (section.projects?.length ?? 0);
  };

  const sortedBuilders = [...DUMMY_BUILDER_SECTIONS].sort((a, b) => {
    if (sortBy === 'Property') return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
    if (sortBy === 'Experience') return getExperienceNum(b) - getExperienceNum(a); // desc: highest first
    if (sortBy === 'Total Projects') return getProjectsNum(b) - getProjectsNum(a); // desc: highest first
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url('/builders/builders-banner.png')` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
          <p className="text-white text-xs">Loading builders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - matches reference design exactly */}
      <section className="relative h-auto md:h-[500px] flex items-center justify-center text-white py-12 max-[425px]:py-8 md:py-0">
        <div className="absolute inset-0 z-0">
          <Image
            alt="City skyline"
            src="/builders/builders-banner.png"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/60 z-[1]" />
        <div className="relative z-10 container mx-auto px-4 max-[425px]:px-3 w-full max-w-full">
          <div className="grid md:grid-cols-2 gap-16 max-[425px]:gap-6 items-center">
            {/* Left: heading + search/filters box */}
            <div className="min-w-0">
              <div className="text-left mb-6 max-[425px]:mb-4">
                <p className="text-lg md:text-xl font-semibold max-[425px]:text-base">Bangalore</p>
                <h1 className="text-4xl md:text-5xl font-bold max-[425px]:text-2xl max-[425px]:leading-tight">Real Estate, Simplified</h1>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-md rounded-lg p-3 max-[425px]:p-2.5 space-y-2 max-w-4xl">
                <div className="flex flex-wrap items-center gap-2 max-[425px]:gap-1.5">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="flex items-center justify-between px-3 py-2 text-sm max-[425px]:text-xs h-11 max-[425px]:h-9 bg-white border-0 w-[160px] max-[425px]:w-full max-[425px]:min-w-0 rounded-md font-medium text-gray-800 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
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
                <div className="w-full md:w-[70%]">
                  <div className="inline-flex items-center justify-center w-full bg-gray-800/60 p-0 h-11 max-[425px]:h-9 rounded-md">
                    {[
                      { id: 'serviceProvider', label: 'Service Provider', icon: Crown },
                      { id: 'builders', label: 'Builders', icon: Building2 },
                      { id: 'interiorDesigner', label: 'Interior Designer', icon: Droplets },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedService(id)}
                        className={`inline-flex items-center justify-center whitespace-nowrap px-2 max-[425px]:px-1.5 py-1.5 flex-1 h-full rounded-md text-xs md:text-sm max-[425px]:text-[10px] gap-1 max-[425px]:gap-0.5 font-medium transition-all border-b-2 ${
                          selectedService === id
                            ? 'border-blue-500 bg-gray-700 text-white'
                            : 'border-transparent text-white/70 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 flex-shrink-0" />
                        <span className="max-[425px]:truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center bg-gray-800/60 rounded-md pr-1 max-w-[700px] max-[425px]:max-w-none">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search By - location / Provider name"
                    className="flex w-full min-w-0 rounded-lg border-0 px-3 py-2 max-[425px]:px-2 max-[425px]:py-1.5 text-white bg-transparent focus:outline-none focus:ring-0 h-11 max-[425px]:h-9 placeholder:text-gray-400 text-sm max-[425px]:text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm max-[425px]:text-xs font-medium px-4 py-2 max-[425px]:px-3 max-[425px]:py-1.5 bg-gray-700 text-white hover:bg-gray-600 shrink-0 m-1 h-9 max-[425px]:h-8 rounded-md"
                  >
                    Search
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-2 max-[425px]:gap-1.5">
                  <div className="flex items-center rounded-md w-full md:w-[160px] relative h-9 max-[425px]:h-8 bg-gray-800 border border-gray-600/50">
                    <Wallet className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 left-2 absolute shrink-0 text-white/90 pointer-events-none" />
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full h-full pl-8 max-[425px]:pl-7 pr-8 max-[425px]:pr-7 cursor-pointer appearance-none focus:outline-none focus:ring-0 text-xs max-[425px]:text-[11px] font-medium text-white bg-transparent text-center"
                    >
                      <option value="" className="bg-gray-800 text-white">Budget</option>
                      <option value="0-50" className="bg-gray-800 text-white">Under ₹50L</option>
                      <option value="50-100" className="bg-gray-800 text-white">₹50L - ₹1Cr</option>
                      <option value="100-200" className="bg-gray-800 text-white">₹1Cr - ₹2Cr</option>
                      <option value="200+" className="bg-gray-800 text-white">₹2Cr+</option>
                    </select>
                    <ChevronDown className="w-4 h-4 right-2 absolute shrink-0 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex items-center rounded-md w-full md:w-[160px] relative h-9 max-[425px]:h-8 bg-gray-800 border border-gray-600/50">
                    <Building2 className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 left-2 absolute shrink-0 text-white/90 pointer-events-none" />
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full h-full pl-8 max-[425px]:pl-7 pr-8 max-[425px]:pr-7 cursor-pointer appearance-none focus:outline-none focus:ring-0 text-xs max-[425px]:text-[11px] font-medium text-white bg-transparent text-center"
                    >
                      <option value="" className="bg-gray-800 text-white">Property Type</option>
                      <option value="apartment" className="bg-gray-800 text-white">Apartment</option>
                      <option value="villa" className="bg-gray-800 text-white">Villa</option>
                      <option value="plot" className="bg-gray-800 text-white">Plot</option>
                      <option value="independent" className="bg-gray-800 text-white">Independent House</option>
                    </select>
                    <ChevronDown className="w-4 h-4 right-2 absolute shrink-0 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex items-center rounded-md w-full md:w-[160px] relative h-9 max-[425px]:h-8 bg-gray-800 border border-gray-600/50">
                    <Home className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 left-2 absolute shrink-0 text-white/90 pointer-events-none" />
                    <select
                      value={possession}
                      onChange={(e) => setPossession(e.target.value)}
                      className="w-full h-full pl-8 max-[425px]:pl-7 pr-8 max-[425px]:pr-7 cursor-pointer appearance-none focus:outline-none focus:ring-0 text-xs max-[425px]:text-[11px] font-medium text-white bg-transparent text-center"
                    >
                      <option value="" className="bg-gray-800 text-white">Possession</option>
                      <option value="readyToMove" className="bg-gray-800 text-white">Ready to Move</option>
                      <option value="underConstruction" className="bg-gray-800 text-white">Under Construction</option>
                    </select>
                    <ChevronDown className="w-4 h-4 right-2 absolute shrink-0 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            {/* Right: 6 logo/profile placeholder boxes (icons only) */}
            <div className="hidden md:grid grid-cols-6 gap-0 self-center justify-items-center">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div
                  key={index}
                  className="h-20 w-20 rounded-md overflow-hidden bg-gray-800/60 flex items-center justify-center border border-white/10"
                >
                  <Building2 className="w-9 h-9 text-white/70" aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Builders Section - Two-column layout per builder */}
      <div className="bg-gray-100 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 max-[425px]:px-2 py-4 sm:py-6 max-[425px]:py-3">
          {/* Top bar: results + Sort by + view toggle — small */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 max-[425px]:mb-3">
            <p className="text-gray-700 text-xs max-[425px]:text-[11px] font-medium">{sortedBuilders.length} results found</p>
            <div className="flex items-center gap-2 max-[425px]:gap-1.5 flex-wrap">
              <span className="text-xs max-[425px]:text-[10px] text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 max-[425px]:px-2 max-[425px]:py-1.5 text-xs max-[425px]:text-[10px] font-medium text-gray-900 hover:bg-gray-50 transition-colors min-w-[120px] max-[425px]:min-w-[100px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '0.75rem',
                }}
              >
                <option value="Property">Property</option>
                <option value="Experience">Experience</option>
                <option value="Total Projects">Total Projects</option>
              </select>
              <button
                type="button"
                onClick={() => router.push('/builders/new')}
                className="w-8 h-8 max-[425px]:w-7 max-[425px]:h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
              </button>
              <div className="flex rounded-lg bg-gray-200 p-0.5 w-[72px] max-[425px]:w-[64px] overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 max-[425px]:w-7 max-[425px]:h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-100/50'}`}
                  title="List view"
                >
                  <List className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 max-[425px]:w-7 max-[425px]:h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-100/50'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3 pt-2 max-[425px]:pt-1">
              {sortedBuilders.map((section) => (
                <BuilderGridCard key={section.id} section={section} router={router} />
              ))}
            </div>
          ) : (
            sortedBuilders.map((section, idx) => (
              <BuilderSectionBlock key={section.id} section={section} expert={EXPERT_CONTACT} isVisible={isVisible} delay={idx * 100} router={router} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
