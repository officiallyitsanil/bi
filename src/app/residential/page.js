"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  House,
  Tag,
  Hotel,
  Users,
  Search,
  ChevronDown,
  Award,
  Flower2,
  Shield,
  SquareParking,
  MapPin,
  Mail,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Bed,
  Square,
  Star,
  ShieldCheck,
  TicketX,
  Headset,
  TicketPercent,
  CircleCheckBig,
  MessageSquareQuote,
  BadgePercent,
  Building,
} from "lucide-react";
import { getLocationSuggestions } from "@/utils/indianCities";

const CITIES = [
  { name: "Mumbai", seed: "mumbai-icon" },
  { name: "Hyderabad", seed: "hyderabad-icon" },
  { name: "Bangalore", seed: "bangalore-icon" },
  { name: "Chennai", seed: "chennai-icon" },
  { name: "Pune", seed: "pune-icon" },
  { name: "Noida", seed: "noida-icon" },
  { name: "Delhi", seed: "delhi-icon" },
  { name: "Indore", seed: "indore-icon" },
  { name: "Ahmedabad", seed: "ahmedabad-icon" },
  { name: "Jaipur", seed: "jaipur-icon" },
  { name: "Kerala", seed: "kerala-icon" },
  { name: "Chandigarh", seed: "chandigarh-icon" },
  { name: "Kolkata", seed: "kolkata-icon" },
  { name: "Goa", seed: "goa-icon" },
  { name: "Bhubaneswar", seed: "bhubaneswar-icon" },
  { name: "Uttar Pradesh", seed: "up-icon" },
  { name: "Lucknow", seed: "lucknow-icon" },
];

const FILTER_OPTIONS = [
  { id: "Rent", name: "Rent", icon: House },
  { id: "Sale", name: "Sale", icon: Tag },
  { id: "PG/Hostel", name: "PG/Hostel", icon: Hotel },
  { id: "Flatmates", name: "Flatmates", icon: Users },
];

const AMENITIES = [
  {
    icon: Award,
    title: "Quality Construction",
    desc: "Homes built with the finest materials and superior craftsmanship for lasting value.",
  },
  {
    icon: Flower2,
    title: "Lush Landscaping",
    desc: "Beautifully designed green spaces and gardens for a serene living environment.",
  },
  {
    icon: Users,
    title: "Community Hall",
    desc: "Spacious halls for social gatherings, events, and community activities.",
  },
  {
    icon: House,
    title: "Modern Clubhouse",
    desc: "Featuring a gym, swimming pool, and indoor games for recreation.",
  },
  {
    icon: Shield,
    title: "24/7 Security",
    desc: "Advanced security systems and personnel to ensure a safe and secure community.",
  },
  {
    icon: SquareParking,
    title: "Ample Parking",
    desc: "Convenient and spacious parking facilities for residents and visitors.",
  },
];

const TOP_CITIES_RENT = [
  { city: "Bangalore", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1080&q=80", span: true },
  { city: "Hyderabad", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1080&q=80" },
  { city: "Mumbai", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1080&q=80" },
  { city: "Pune", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1080&q=80" },
  { city: "Delhi", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1080&q=80" },
  { city: "Chennai", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&q=80" },
  { city: "Kolkata", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&q=80" },
];

const BANGALORE_PROJECTS = [
  { name: "Prestige Falcon City", location: "Kanakapura Road, Bengaluru", bhk: "2, 3, 4 BHK", sqft: "1204-2720 sq.ft.", price: "₹1.25 Cr*", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&q=80" },
  { name: "Sobha Dream Acres", location: "Panathur, Bengaluru", bhk: "1, 2 BHK", sqft: "645-1210 sq.ft.", price: "₹65 Lac*", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1080&q=80" },
  { name: "Godrej Eternity", location: "Kanakapura Road, Bengaluru", bhk: "2, 3 BHK", sqft: "1000-1900 sq.ft.", price: "₹90 Lac*", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&q=80" },
  { name: "Brigade Exotica", location: "Old Madras Road, Bengaluru", bhk: "3, 4, 5 BHK", sqft: "2640-5930 sq.ft.", price: "₹3.5 Cr*", img: "https://images.unsplash.com/photo-1593714649714-55a7b310b1a0?w=1080&q=80" },
];

const MUMBAI_RENTALS = [
  { name: "Elegant 3BHK Apartment", location: "Koramangala, Bengaluru", bhk: "3 BHK", sqft: "1500 sq.ft.", price: "₹1.5 Cr", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1080&q=80" },
  { name: "Modern Villa", location: "Indiranagar, Bengaluru", bhk: "4 BHK", sqft: "3000 sq.ft.", price: "₹3 Cr", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1080&q=80" },
  { name: "Cozy 2BHK Flat", location: "HSR Layout, Bengaluru", bhk: "2 BHK", sqft: "1200 sq.ft.", price: "₹90 Lac", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1080&q=80" },
  { name: "Spacious Penthouse", location: "Whitefield, Bengaluru", bhk: "5 BHK", sqft: "4000 sq.ft.", price: "₹5 Cr", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1080&q=80" },
];

export default function ResidentialPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("Rent");
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const projectsRef = useRef(null);
  const rentalsRef = useRef(null);

  const scrollCarousel = (ref, direction) => {
    if (!ref?.current) return;
    const cardWidth = ref.current.querySelector("[data-carousel-card]")?.offsetWidth || 256;
    const scrollAmount = direction === "next" ? cardWidth + 12 : -(cardWidth + 12);
    ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = getLocationSuggestions(value, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSearch = () => {
    if (!location?.trim()) {
      alert("Please enter a location to search");
      return;
    }
    const category = "residential";
    const type = selectedFilter || "Rent";
    const city = location.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Proper route: /properties-search/[city]/[category]/[type]
    router.push(`/properties-search/${city}/${category}/${encodeURIComponent(type.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  const handleCityClick = (city) => {
    const cityName = city.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/properties-search/${cityName}/residential/rent`);
  };

  return (
    <main className="pt-10 flex-grow">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center text-center text-white">
        <Image
          src="https://images.unsplash.com/photo-1565402170291-8491f14678db?w=1920&q=80"
          alt="Modern living room"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-bold font-headline">
            Embrace The Era of{" "}
            <span className="text-amber-400">Brokerage Free</span> Real Estate
          </h1>
          <div className="mt-5 bg-white/20 backdrop-blur-sm rounded-xl p-3 max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-1.5">
              {FILTER_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedFilter(opt.id)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors text-white ${
                      isSelected ? "bg-blue-600/80" : "bg-black/20 hover:bg-black/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span className="text-[10px] sm:text-xs text-center leading-tight">{opt.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-1.5 items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md">
              <div className="relative md:col-span-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by Location"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => location && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="flex h-8 w-full rounded-md border-0 bg-white dark:bg-gray-900 px-2.5 py-1.5 pl-9 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-48 overflow-y-auto text-xs">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setLocation(s.text);
                          setShowSuggestions(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {s.displayText}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex h-8 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-amber-400 hover:text-gray-900"
                >
                  <span>{selectedFilter}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 w-8 bg-amber-400 hover:bg-amber-500 text-gray-900 shrink-0"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-10 bg-gray-100/50 dark:bg-gray-900/50" id="cities">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid lg:grid-cols-2 gap-5 items-center">
            <div>
              <h2 className="text-2xl font-bold font-headline mb-1.5">Select by City</h2>
              <div className="w-16 h-1 bg-amber-400 mb-5" />
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-x-3 gap-y-4">
                {CITIES.map((city) => (
                  <div
                    key={city.name}
                    className="flex flex-col items-center gap-1.5 text-center cursor-pointer group"
                    onClick={() => handleCityClick(city)}
                  >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-amber-400 transition-all duration-300 transform group-hover:scale-110">
                      <Image
                        src={`https://picsum.photos/seed/${city.seed}/100/100`}
                        alt={city.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-amber-500">
                      {city.name}
                    </p>
                  </div>
                ))}
                <div
                  className="flex flex-col items-center gap-1.5 text-center cursor-pointer group"
                  onClick={() => handleCityClick(CITIES[0])}
                >
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                    <span className="text-white text-[10px] sm:text-xs font-bold text-center px-0.5">See All</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600">
                    More Cities
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-full min-h-[280px] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1554435493-93422e8220c8?w=1080&q=80"
                alt="Modern building"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-8">
            {AMENITIES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <Icon className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <div>
                    <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Cities for Property for Rent */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <h2 className="text-2xl font-bold font-headline">Top Cities for Property for Rent in India</h2>
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400/30 rounded-full -z-10" />
            </div>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-1.5" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-4">
            {TOP_CITIES_RENT.map((item, idx) => (
              <Link
                key={item.city}
                href={`/properties-search/${item.city.toLowerCase().replace(/\s+/g, '-')}/residential/rent`}
                className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                  item.span ? "md:col-span-2 md:row-span-3 h-full min-h-[280px] md:min-h-0" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={item.img}
                  alt={`Residential property in ${item.city}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes={item.span ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-semibold text-sm">{item.city}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Find Dream Home CTA */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="space-y-3 p-5 md:p-8">
                <h2 className="text-2xl font-bold font-headline text-gray-900 dark:text-gray-100">
                  Find your Dream Home with BuildersInfo
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Just drop us an email with your requirements – Property Type, Location, Budget… and
                  our team will connect back with you within 24 Hrs with the best possible options.
                </p>
                <a
                  href="mailto:support@buildersinfo.in"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600"
                >
                  <Mail className="h-4 w-4" />
                  <span>support@buildersinfo.in</span>
                </a>
              </div>
              <div className="relative h-48 md:h-full w-full min-h-[220px]">
                <Image
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1080&q=80"
                  alt="Modern house"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Projects in Bengaluru Carousel */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full -z-10" />
              <h2 className="text-2xl font-bold font-headline">Top Projects in Bengaluru</h2>
            </div>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-1.5" />
          </div>
          <div className="relative w-full">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth -mx-3 px-3 sm:-mx-4 sm:px-4" ref={projectsRef}>
              <div className="flex gap-3 -ml-3 sm:-ml-4 w-max min-w-full">
                {BANGALORE_PROJECTS.map((project) => (
                  <div key={project.name} data-carousel-card className="w-64 md:w-72 shrink-0">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group h-full flex flex-col shadow-sm">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={project.img}
                          alt={project.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm">{project.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {project.location}
                        </p>
                        <div className="my-3 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Bed className="h-3.5 w-3.5" />
                            <span>{project.bhk}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Square className="h-3.5 w-3.5" />
                            <span>{project.sqft}</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-500">Starting from</p>
                            <p className="font-bold text-sm text-blue-600">{project.price}</p>
                          </div>
                          <Link
                            href="/properties-search/bangalore/residential/sale"
                            className="flex items-center text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Explore More <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => scrollCarousel(projectsRef, "prev")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollCarousel(projectsRef, "next")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Get Perfect Property for Rent CTA */}
      <section className="relative">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80"
            alt="Residential property"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent md:from-white md:via-white/90 md:to-transparent" />
        </div>
        <div className="relative container mx-auto px-3 sm:px-4 py-10 md:py-14">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-2xl font-bold font-headline mb-3 text-gray-900 dark:text-gray-100">
              Get the Perfect Property for Rent in your City
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
              Bangalore | Hyderabad | Mumbai | Pune | Delhi | Noida | Gurgaon & More...
            </p>
            <Link
              href="/properties-search/all/residential/rent"
              className="inline-flex items-center justify-center h-9 rounded-md px-5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 hover:text-gray-900 text-xs font-medium"
            >
              Enquire Now
            </Link>
          </div>
        </div>
      </section>

      {/* Top Properties for Rent in Mumbai Carousel */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full -z-10" />
              <h2 className="text-2xl font-bold font-headline">Top Properties for Rent in Mumbai</h2>
            </div>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-1.5" />
          </div>
          <div className="relative w-full">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth -mx-3 px-3 sm:-mx-4 sm:px-4" ref={rentalsRef}>
              <div className="flex gap-3 -ml-3 sm:-ml-4 w-max min-w-full">
                {MUMBAI_RENTALS.map((item) => (
                  <div key={item.name} data-carousel-card className="w-64 md:w-72 shrink-0">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group h-full flex flex-col shadow-sm">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={item.img}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {item.location}
                        </p>
                        <div className="my-3 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Bed className="h-3.5 w-3.5" />
                            <span>{item.bhk}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Square className="h-3.5 w-3.5" />
                            <span>{item.sqft}</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-500">Starting from</p>
                            <p className="font-bold text-sm text-blue-600">{item.price}</p>
                          </div>
                          <Link
                            href="/properties-search/mumbai/residential/rent"
                            className="flex items-center text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Explore More <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => scrollCarousel(rentalsRef, "prev")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollCarousel(rentalsRef, "next")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* What You Get From Us */}
      <section className="py-10 relative overflow-hidden bg-gray-100/50 dark:bg-gray-900/50">
        <div className="absolute -top-16 -left-16 w-52 h-52 bg-amber-400/10 dark:bg-amber-900/20 rounded-full -z-0" />
        <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-amber-400/10 dark:bg-amber-900/20 rounded-full -z-0" />
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative flex justify-center">
              <div className="w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] relative rounded-full overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"
                  alt="Happy family in their new home"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            </div>
            <div>
              <div className="inline-block relative mb-5">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400/50 rounded-full -z-10" />
                <h2 className="text-2xl font-bold font-headline relative z-10">
                  What You Get From Us
                </h2>
                <div className="absolute -bottom-1.5 left-0 w-16 h-0.5 bg-blue-600" />
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Star, text: "Exclusive pricing for BuildersInfo members" },
                  { icon: ShieldCheck, text: "Verified Spaces and Trusted Partners" },
                  { icon: TicketX, text: "No booking service fee" },
                  { icon: Headset, text: "100% offline support" },
                  { icon: TicketPercent, text: "Exclusive Brand Coupon Codes" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md bg-blue-600/10">
                        <Icon className="h-4 w-4 text-blue-600" strokeWidth={2} />
                      </div>
                      <span className="font-medium text-sm text-gray-600 dark:text-gray-400">
                        {item.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BuildersInfo Advantages */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 md:p-8">
            <div className="grid md:grid-cols-4 gap-8 items-center">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold font-headline text-gray-900 dark:text-gray-100">
                  BuildersInfo Advantages
                </h2>
              </div>
              <div className="md:col-span-3 grid sm:grid-cols-3 gap-5">
                <div className="space-y-3">
                  <div className="h-9 w-9 relative">
                    <Building className="h-7 w-7 text-gray-900 dark:text-gray-100" strokeWidth={2} />
                    <CircleCheckBig className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-amber-400 rounded-full text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-base">100,000+ Spaces</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                    Get access to 100,000+ spaces with easy availability and convenience anytime and
                    anywhere. Space Search Made Simple with BuildersInfo
                  </p>
                </div>
                <div className="space-y-3">
                  <BadgePercent className="h-9 w-9 text-gray-900 dark:text-gray-100" strokeWidth={2} />
                  <h3 className="font-bold text-base">Zero Brokerage</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                    BuildersInfo is India's fastest growing space discovery platform that doesn't
                    charge any brokerage from the customers.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-9 w-9 relative">
                    <Users className="h-7 w-7 text-gray-900 dark:text-gray-100" strokeWidth={2} />
                    <MessageSquareQuote className="absolute -bottom-0.5 -right-0.5 h-5 w-5 text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-base">100% Offline Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                    We provide you 100% offline support from giving you the various space options,
                    scheduling the site visit, booking the space to the after-sales support also.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
