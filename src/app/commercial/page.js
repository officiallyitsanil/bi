"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  Building2,
  User,
  Users,
  Wallet,
  Columns2,
  LayoutGrid,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Wifi,
  Armchair,
  Printer,
  Coffee,
  SquareParking,
  MapPin,
  Mail,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Star,
  ShieldCheck,
  TicketX,
  Headset,
  TicketPercent,
  CircleCheckBig,
  MessageSquareQuote,
  BadgePercent,
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
  { id: "managed", name: "Managed Space", icon: Building },
  { id: "unmanaged", name: "Unmanaged Space", icon: Building2 },
  { id: "coworking-dedicated", name: "Coworking Dedicated", icon: User },
  { id: "coworking-shared", name: "Coworking Shared", icon: Users },
  { id: "price-desk", name: "Price Per Desk", icon: Wallet },
  { id: "price-sqft", name: "Price Per Sqft", icon: Columns2 },
  { id: "seats", name: "No. Of Seats", icon: LayoutGrid },
];

const AMENITIES = [
  {
    icon: Wifi,
    title: "High Speed WiFi",
    desc: "High-Speed Wifi, HDTVs everything you need to do your best work.",
  },
  {
    icon: Armchair,
    title: "Comfy Workstation",
    desc: "Connect with other people and share your skills for better and quick growth.",
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    desc: "Come up with great ideas and engage in valuable discussions in meeting rooms.",
  },
  {
    icon: Printer,
    title: "Printer",
    desc: "Printing and scanning facilities available without any extra cost.",
  },
  {
    icon: Coffee,
    title: "Pantry",
    desc: "Lounge, kitchen, breakout rooms, and more. mix of both work tables and lounge seating.",
  },
  {
    icon: SquareParking,
    title: "Parking",
    desc: "Avoid morning hassle with easy and convenient parking area availability.",
  },
];

const TOP_CITIES_IMAGES = [
  { city: "Gurugram", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1080&q=80", span: true },
  { city: "Bangalore", img: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1080&q=80" },
  { city: "Mumbai", img: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1080&q=80" },
  { city: "Hyderabad", img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1080&q=80" },
  { city: "Pune", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1080&q=80" },
  { city: "Delhi", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080&q=80" },
  { city: "Ahmedabad", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1080&q=80" },
];

const BANGALORE_SPACES = [
  { name: "BHIVE Workspace", location: "HSR Layout, Bengaluru", price: "₹9999", img: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1080&q=80" },
  { name: "WeWork Galaxy", location: "Residency Road, Bengaluru", price: "₹25999", img: "https://images.unsplash.com/photo-1602595688238-9fffe12d5af3?w=1080&q=80" },
  { name: "91springboard", location: "Koramangala, Bengaluru", price: "₹18999", img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1080&q=80" },
  { name: "IndiQube", location: "Indiranagar, Bengaluru", price: "₹12500", img: "https://images.unsplash.com/photo-1590650153855-f155c424ddce?w=1080&q=80" },
];

const MUMBAI_SPACES = [
  { name: "Connekt", location: "Andheri East, Mumbai", price: "₹9999", img: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1080&q=80" },
  { name: "Innov8 Parinee Crescenzo", location: "BKC, Mumbai", price: "₹25999", img: "https://images.unsplash.com/photo-1602595688238-9fffe12d5af3?w=1080&q=80" },
  { name: "Awfis Parinee Crescenzo", location: "Bandra East, Mumbai", price: "₹18999", img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1080&q=80" },
  { name: "Another Space", location: "Juhu, Mumbai", price: "₹12500", img: "https://images.unsplash.com/photo-1590650153855-f155c424ddce?w=1080&q=80" },
];

export default function CommercialPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("managed");
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const bangaRef = useRef(null);
  const mumbaiRef = useRef(null);

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
    const category = "commercial";
    const type = FILTER_OPTIONS.find((f) => f.id === selectedFilter)?.name || "Managed Space";
    const city = location.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Proper route: /properties-search/[city]/[category]/[type]
    router.push(`/properties-search/${city}/${category}/${encodeURIComponent(type.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  const handleCityClick = (city) => {
    const cityName = city.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/properties-search/${cityName}/commercial`);
  };

  return (
    <main className="pt-10 flex-grow">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center text-center text-white">
        <Image
          src="https://images.unsplash.com/photo-1448630360428-65456885c650?w=1920&q=80"
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
            <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5">
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
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-1.5 items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md">
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
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-amber-400 hover:text-gray-900"
              >
                <span className="truncate">
                  {FILTER_OPTIONS.find((f) => f.id === selectedFilter)?.name || "Managed Space"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
              </button>
              <div className="flex items-center gap-1.5">
                <button className="inline-flex items-center gap-1 rounded-md text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2.5 py-1.5 h-8 w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-amber-400 hover:text-gray-900">
                  <SlidersHorizontal className="mr-1 h-3.5 w-3.5 shrink-0" />
                  Preferences
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
                src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1080&q=80"
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

      {/* Top Cities for Managed Space */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <h2 className="text-2xl font-bold font-headline">Top Cities for Managed Space in India</h2>
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400/30 rounded-full -z-10" />
            </div>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-1.5" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-4">
            {TOP_CITIES_IMAGES.map((item, idx) => (
              <Link
                key={item.city}
                href={`/properties-search/${item.city.toLowerCase().replace(/\s+/g, '-')}/commercial/managed-space`}
                className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                  item.span ? "md:col-span-2 md:row-span-3 h-full min-h-[280px] md:min-h-0" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={item.img}
                  alt={`Coworking space in ${item.city}`}
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

      {/* Find Office Space CTA */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="space-y-3 p-5 md:p-8">
                <h2 className="text-2xl font-bold font-headline text-gray-900 dark:text-gray-100">
                  Find your Office Space with BuildersInfo
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Just drop us an email with your Office Space requirements – Number of Seat, Location,
                  Start Date… and our team will connect back with you within 24 Hrs with the best
                  possible options.
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
                  src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1080&q=80"
                  alt="Email envelope"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Managed Spaces in Bengaluru Carousel */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full -z-10" />
              <h2 className="text-2xl font-bold font-headline">Top Managed Spaces in Bengaluru</h2>
            </div>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-1.5" />
          </div>
          <div className="relative w-full">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth -mx-3 px-3 sm:-mx-4 sm:px-4" ref={bangaRef}>
              <div className="flex gap-3 -ml-3 sm:-ml-4 w-max min-w-full">
                {BANGALORE_SPACES.map((space) => (
                  <div key={space.name} data-carousel-card className="w-64 md:w-72 shrink-0">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group h-full flex flex-col shadow-sm">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={space.img}
                          alt={space.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm">{space.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {space.location}
                        </p>
                        <div className="my-3 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Wifi className="h-3.5 w-3.5" />
                            <span>High speed WiFi</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Coffee className="h-3.5 w-3.5" />
                            <span>Coffee & Bar</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-500">Starting</p>
                            <p className="font-bold text-sm text-blue-600">{space.price}/-month</p>
                          </div>
                          <Link
                            href="/properties-search/bangalore/commercial/managed-space"
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
              onClick={() => scrollCarousel(bangaRef, "prev")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollCarousel(bangaRef, "next")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Get Perfect Managed Space CTA */}
      <section className="relative">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1920&q=80"
            alt="Coworking space"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-gray-900 via-white/90 dark:via-gray-900/90 to-transparent md:from-white md:via-white/90 md:to-transparent" />
        </div>
        <div className="relative container mx-auto px-3 sm:px-4 py-10 md:py-14">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-2xl font-bold font-headline mb-3 text-gray-900 dark:text-gray-100">
              Get the Perfect Managed Space in your City
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
              Bangalore | Hyderabad | Mumbai | Pune | Delhi | Noida | Gurgaon & More...
            </p>
            <Link
              href="/properties-search/all/commercial"
              className="inline-flex items-center justify-center h-9 rounded-md px-5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 hover:text-gray-900 text-xs font-medium"
            >
              Enquire Now
            </Link>
          </div>
        </div>
      </section>

      {/* Top Managed Spaces in Mumbai Carousel */}
      <section className="py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full -z-10" />
              <h2 className="text-2xl font-bold font-headline">Top Managed Spaces in Mumbai</h2>
            </div>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-1.5" />
          </div>
          <div className="relative w-full">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth -mx-3 px-3 sm:-mx-4 sm:px-4" ref={mumbaiRef}>
              <div className="flex gap-3 -ml-3 sm:-ml-4 w-max min-w-full">
                {MUMBAI_SPACES.map((space) => (
                  <div key={space.name} data-carousel-card className="w-64 md:w-72 shrink-0">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group h-full flex flex-col shadow-sm">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={space.img}
                          alt={space.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm">{space.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {space.location}
                        </p>
                        <div className="my-3 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Wifi className="h-3.5 w-3.5" />
                            <span>High speed WiFi</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Coffee className="h-3.5 w-3.5" />
                            <span>Coffee & Bar</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-500">Starting</p>
                            <p className="font-bold text-sm text-blue-600">{space.price}/-month</p>
                          </div>
                          <Link
                            href="/properties-search/mumbai/commercial/managed-space"
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
              onClick={() => scrollCarousel(mumbaiRef, "prev")}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-400 absolute -left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollCarousel(mumbaiRef, "next")}
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
                  src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&q=80"
                  alt="People working in a coworking space"
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
                  {
                    icon: Star,
                    text: "Exclusive pricing for BuildersInfo members",
                  },
                  {
                    icon: ShieldCheck,
                    text: "Verified Spaces and Trusted Partners",
                  },
                  {
                    icon: TicketX,
                    text: "No booking service fee",
                  },
                  {
                    icon: Headset,
                    text: "100% offline support",
                  },
                  {
                    icon: TicketPercent,
                    text: "Exclusive Brand Coupon Codes",
                  },
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
                    <MessageSquareQuote className="absolute -bottom-0.5 -right-0.5 h-5 w-5 text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full" />
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
