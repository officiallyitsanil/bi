"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoginModal from "@/components/LoginModal";
import { loginUser } from "@/utils/auth";
import { calculatePrices } from "@/utils/priceUtils";
import {
  ChevronDown,
  ListFilter,
  LayoutList,
  LayoutGrid,
  Building,
  House,
  MapPin,
  Heart,
} from "lucide-react";
import { indianCities } from "@/utils/indianCities";

// Helper function to safely display database values
const safeDisplay = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (Array.isArray(value) && value.length === 0) return fallback;
  if (typeof value === "object" && Object.keys(value).length === 0) return fallback;
  return value;
};

// Build location string for property card
const getLocationString = (property) => {
  const addr = property.address || {};
  const parts = [
    addr.locality || addr.area || property.locality || property.area,
    addr.city || property.city,
    addr.state || property.state,
  ].filter(Boolean);
  if (parts.length) return `in ${parts.join(", ")}`;
  const fallback = property.displayAddress || property.addressDisplay || property.location;
  return fallback ? `in ${fallback}` : "";
};

// Get status badge (Available, For Rent, Ready to move, New Launch)
const getStatusBadge = (property) => {
  const cat = (property.propertyCategory || property.propertyType || "").toLowerCase();
  if (cat === "residential") {
    const type = (property.type || property.listingType || "").toLowerCase();
    if (type === "sale" || type === "new launch") return "New Launch";
    if (type === "rent") return "For Rent";
    if (property.readyToMove) return "Ready to move";
    return "Available";
  }
  if (property.availabilityStatus === "for_rent") return "For Rent";
  return property.statusBadge || "Available";
};

// Dummy properties for demo - always show at least some results per city
const DUMMY_PROPERTIES = [
  { _id: "dummy-1", name: "WeWork Vaishnavi Signature", city: "Hyderabad", locality: "Bellandur", state: "Karnataka", propertyCategory: "commercial", priceDisplay: "4,00,000", statusBadge: "Available", img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80" },
  { _id: "dummy-2", name: "91Springboard", city: "Delhi", locality: "Jhandewalan", state: "Delhi", propertyCategory: "commercial", priceDisplay: "₹110/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1587702068694-a909ef4aa346?w=600&q=80" },
  { _id: "dummy-3", name: "Shop in Boduppal", city: "Hyderabad", locality: "Boduppal", state: "Telangana", propertyCategory: "commercial", priceDisplay: "₹95/sqft", statusBadge: "For Rent", img: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80" },
  { _id: "dummy-4", name: "Godown/Warehouse", city: "Hyderabad", locality: "Moula Ali", state: "Telangana", propertyCategory: "commercial", priceDisplay: "₹80/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1587497256464-b72dd7ce9c01?w=600&q=80" },
  { _id: "dummy-5", name: "Prestige Lakeside Habitat", city: "Bangalore", locality: "Koramangala", state: "Karnataka", propertyCategory: "residential", priceDisplay: "Starting from ₹1.2 Cr", statusBadge: "Ready to move", img: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=80" },
  { _id: "dummy-6", name: "Godrej Eternity", city: "Hyderabad", locality: "Jubilee Hills", state: "Telangana", propertyCategory: "residential", priceDisplay: "Starting from ₹95 Lakhs", statusBadge: "New Launch", img: "https://images.unsplash.com/photo-1610569244414-5e7453a447a8?w=600&q=80" },
  { _id: "dummy-7", name: "BHIVE Workspace", city: "Bangalore", locality: "HSR Layout", state: "Karnataka", propertyCategory: "commercial", priceDisplay: "₹90/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" },
  { _id: "dummy-8", name: "3BHK Apartment", city: "Mumbai", locality: "Bandra West", state: "Maharashtra", propertyCategory: "residential", priceDisplay: "₹2.5 Cr", statusBadge: "Available", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" },
  { _id: "dummy-9", name: "Regus Centre", city: "Noida", locality: "Sector 62", state: "Uttar Pradesh", propertyCategory: "commercial", priceDisplay: "₹85/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80" },
  { _id: "dummy-10", name: "Luxury Villa", city: "Noida", locality: "Sector 50", state: "Uttar Pradesh", propertyCategory: "residential", priceDisplay: "Starting from ₹3 Cr", statusBadge: "New Launch", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80" },
  { _id: "dummy-11", name: "Awfis Coworking", city: "Pune", locality: "Hinjawadi", state: "Maharashtra", propertyCategory: "commercial", priceDisplay: "₹75/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80" },
  { _id: "dummy-12", name: "Sobha Dream Acres", city: "Bangalore", locality: "Panathur", state: "Karnataka", propertyCategory: "residential", priceDisplay: "₹65 Lac*", statusBadge: "Available", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80" },
  { _id: "dummy-13", name: "Co-working Space", city: "Chennai", locality: "T Nagar", state: "Tamil Nadu", propertyCategory: "commercial", priceDisplay: "₹100/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80" },
  { _id: "dummy-14", name: "Elegant 3BHK", city: "Chennai", locality: "Adyar", state: "Tamil Nadu", propertyCategory: "residential", priceDisplay: "₹1.8 Cr", statusBadge: "Ready to move", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80" },
  { _id: "dummy-15", name: "Office Space", city: "Kolkata", locality: "Park Street", state: "West Bengal", propertyCategory: "commercial", priceDisplay: "₹70/sqft", statusBadge: "For Rent", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" },
  { _id: "dummy-16", name: "Family Home", city: "Kolkata", locality: "Salt Lake", state: "West Bengal", propertyCategory: "residential", priceDisplay: "₹1.5 Cr", statusBadge: "Available", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80" },
  { _id: "dummy-17", name: "Managed Office", city: "Mumbai", locality: "BKC", state: "Maharashtra", propertyCategory: "commercial", priceDisplay: "₹120/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=600&q=80" },
  { _id: "dummy-18", name: "Office Hub", city: "Delhi", locality: "Connaught Place", state: "Delhi", propertyCategory: "commercial", priceDisplay: "₹95/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" },
  { _id: "dummy-19", name: "Retail Space", city: "Pune", locality: "FC Road", state: "Maharashtra", propertyCategory: "commercial", priceDisplay: "₹80/sqft", statusBadge: "For Rent", img: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80" },
  { _id: "dummy-20", name: "2BHK Flat", city: "Pune", locality: "Koregaon Park", state: "Maharashtra", propertyCategory: "residential", priceDisplay: "₹85 Lac", statusBadge: "Available", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" },
  { _id: "dummy-21", name: "Coworking Space", city: "Gurgaon", locality: "DLF Phase 1", state: "Haryana", propertyCategory: "commercial", priceDisplay: "₹95/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80" },
  { _id: "dummy-22", name: "Apartment", city: "Gurgaon", locality: "Sector 29", state: "Haryana", propertyCategory: "residential", priceDisplay: "₹1.1 Cr", statusBadge: "Available", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80" },
  { _id: "dummy-23", name: "Office Tower", city: "Ahmedabad", locality: "Satellite", state: "Gujarat", propertyCategory: "commercial", priceDisplay: "₹65/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80" },
  { _id: "dummy-24", name: "Villa", city: "Ahmedabad", locality: "Bodakdev", state: "Gujarat", propertyCategory: "residential", priceDisplay: "₹2 Cr", statusBadge: "New Launch", img: "https://images.unsplash.com/photo-1610569244414-5e7453a447a8?w=600&q=80" },
  { _id: "dummy-25", name: "Workspace", city: "Indore", locality: "Vijay Nagar", state: "Madhya Pradesh", propertyCategory: "commercial", priceDisplay: "₹55/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80" },
  { _id: "dummy-26", name: "3BHK Flat", city: "Indore", locality: "Saket", state: "Madhya Pradesh", propertyCategory: "residential", priceDisplay: "₹75 Lac", statusBadge: "Available", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" },
  { _id: "dummy-27", name: "Retail Space", city: "Jaipur", locality: "C Scheme", state: "Rajasthan", propertyCategory: "commercial", priceDisplay: "₹60/sqft", statusBadge: "For Rent", img: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80" },
  { _id: "dummy-28", name: "Heritage Home", city: "Jaipur", locality: "Malviya Nagar", state: "Rajasthan", propertyCategory: "residential", priceDisplay: "₹1.4 Cr", statusBadge: "Ready to move", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80" },
  { _id: "dummy-29", name: "Co-working", city: "Lucknow", locality: "Gomti Nagar", state: "Uttar Pradesh", propertyCategory: "commercial", priceDisplay: "₹50/sqft", statusBadge: "Available", img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80" },
  { _id: "dummy-30", name: "Independent House", city: "Lucknow", locality: "Hazratganj", state: "Uttar Pradesh", propertyCategory: "residential", priceDisplay: "₹1.2 Cr", statusBadge: "Available", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80" },
];

const CITY_ALIASES = { gurugram: "Gurgaon", bengaluru: "Bangalore" };

const getDummyPropertiesForCity = (cityParam) => {
  const raw = (cityParam || "").trim().toLowerCase();
  if (!raw) return DUMMY_PROPERTIES;
  const matchCity = CITY_ALIASES[raw] || raw.charAt(0).toUpperCase() + raw.slice(1);
  const filtered = DUMMY_PROPERTIES.filter((p) => (p.city || "").toLowerCase() === matchCity.toLowerCase() || (p.city || "").toLowerCase() === raw);
  return filtered.length > 0 ? filtered : DUMMY_PROPERTIES;
};

// Skeleton Loader
function PropertyCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-gray-200" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-3" />
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-pulse">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-28" />
            <div className="h-10 bg-gray-200 rounded-lg w-36" />
            <div className="h-10 bg-gray-200 rounded-lg w-10" />
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertiesSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slugArray = params?.slug || [];
  
  // Try to find city/category in the slug array
  // Format: /properties-search/bangalore/commercial/managed-space
  const normalizeSlug = (s) => (s || "").replace(/-/g, " ").trim();
  const cityFromSlug = normalizeSlug(slugArray[0]);
  const categoryFromSlug = normalizeSlug(slugArray[1]);
  const typeFromSlug = normalizeSlug(slugArray[2]);

  const cityParam = useMemo(() => cityFromSlug || searchParams.get("city") || "", [cityFromSlug, searchParams]);
  const typeParam = useMemo(() => typeFromSlug || searchParams.get("type") || "", [typeFromSlug, searchParams]);
  const categoryParam = useMemo(() => categoryFromSlug || searchParams.get("Category") || "", [categoryFromSlug, searchParams]);
  
  const preferencesParam = useMemo(() => searchParams.get("preferences") || "", [searchParams]);
  const pricePerDeskParam = useMemo(() => searchParams.get("pricePerDesk") || "", [searchParams]);
  const pricePerSqftParam = useMemo(() => searchParams.get("pricePerSqft") || "", [searchParams]);
  const noOfSeatsParam = useMemo(() => searchParams.get("noOfSeats") || "", [searchParams]);
  const propertyTypeParam = useMemo(() => searchParams.get("propertyType") || "", [searchParams]);

  const [selectedBadge, setSelectedBadge] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState("");
  const [selectedFloorsOffered, setSelectedFloorsOffered] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("Relevance");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => {
      const userJson = localStorage.getItem("currentUser");
      setCurrentUser(userJson ? JSON.parse(userJson) : null);
    };
    syncUser();
    window.addEventListener("onAuthChange", syncUser);
    return () => window.removeEventListener("onAuthChange", syncUser);
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favoritesLocal = JSON.parse(localStorage.getItem("favorites") || "[]");
        const favoriteIds = favoritesLocal.map((fav) => fav._id || fav.id).filter(Boolean);
        setFavorites(favoriteIds);
        if (currentUser?.phoneNumber) {
          try {
            const res = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(currentUser.phoneNumber)}`);
            const data = await res.json();
            if (data.success) {
              const dbIds = data.data.map((f) => f.propertyId);
              setFavorites(dbIds);
              localStorage.setItem("favorites", JSON.stringify(dbIds.map((id) => ({ _id: id, id }))));
            }
          } catch (_) {}
        }
      } catch (_) {}
    };
    loadFavorites();
  }, [currentUser]);

  const capitalizeCity = (city) =>
    city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : "";

  const isPropertyNew = (property) => {
    if (!property.publishedAt) return false;
    try {
      let d;
      if (typeof property.publishedAt === "object" && property.publishedAt.$date) {
        d = new Date(property.publishedAt.$date);
      } else {
        d = new Date(property.publishedAt);
      }
      if (isNaN(d.getTime())) return false;
      const diffDays = Math.ceil((Date.now() - d) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    } catch {
      return false;
    }
  };

  const determineCategory = () => {
    if (categoryParam) return categoryParam.toLowerCase();
    const commercialTypes = ["Managed Space", "Unmanaged Space", "Coworking Dedicated", "Coworking Shared", "Price Per Desk", "Price Per Sqft", "No. Of Seats"];
    if (commercialTypes.includes(typeParam)) return "commercial";
    const residentialTypes = ["Rent", "Sale", "PG/Hostel", "Flatmates"];
    if (residentialTypes.includes(typeParam)) return "residential";
    return "";
  };

  const getPropertyTypeOptions = () => {
    const cat = determineCategory();
    if (cat === "commercial") return ["Techpark", "Standalone", "Villa"];
    if (cat === "residential") return ["Rent", "Sale", "PG/Hostel", "Flatmates"];
    return [];
  };

  const mapPropertyTypeToDB = (name) => {
    if (!name) return "";
    const m = { techpark: "techpark", standalone: "standalone", villa: "villa", rent: "rent", sale: "sale", "pg/hostel": "pg", flatmates: "flatmates" };
    return m[name.toLowerCase()] || name.toLowerCase();
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (cityParam) params.append("city", cityParam);
        if (typeParam) params.append("type", typeParam);
        if (preferencesParam) params.append("preferences", preferencesParam);
        if (pricePerDeskParam) params.append("pricePerDesk", pricePerDeskParam);
        if (pricePerSqftParam) params.append("pricePerSqft", pricePerSqftParam);
        if (noOfSeatsParam) params.append("noOfSeats", noOfSeatsParam);
        const cat = determineCategory();
        if (cat) params.append("Category", cat);
        if (selectedPropertyType) params.append("propertyType", mapPropertyTypeToDB(selectedPropertyType));
        if (selectedFloorsOffered) params.append("floorsOffered", selectedFloorsOffered);
        if (selectedFacilities) params.append("facilities", selectedFacilities);
        params.append("_t", Date.now().toString());

        const res = await fetch(`/api/properties-filtered?${params}`);
        const result = await res.json();

        if (result.success && result.data) {
          const confirmed = result.data.filter((p) => p.verificationStatus === "confirmed");
          const calculateBadge = (p) => {
            if (p.isPremium === true) return "premium";
            if (isPropertyNew(p) && p.isPremium === false) return "new";
            return "";
          };
          const props = confirmed.map((p) => {
            const prices = calculatePrices(p);
            return {
              ...p,
              _id: p._id || p.id,
              id: p._id || p.id,
              originalPrice: p.originalPrice ?? prices.originalPrice ?? null,
              discountedPrice: p.discountedPrice ?? prices.discountedPrice ?? null,
              badge: calculateBadge(p),
            };
          });
          setAllProperties(props);
          setFilteredProperties(props);
        } else {
          setAllProperties([]);
          setFilteredProperties([]);
        }
      } catch (err) {
        setAllProperties([]);
        setFilteredProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [cityParam, typeParam, preferencesParam, pricePerDeskParam, pricePerSqftParam, noOfSeatsParam, categoryParam, selectedPropertyType, selectedFloorsOffered, selectedFacilities]);

  const badges = ["new", "premium"];
  const propertyTypes = getPropertyTypeOptions();
  const facilities = ["Parking", "4W Parking", "2W Parking", "Conference Room", "Elevator", "Cafeteria", "Gym"];
  const floorsOffered = Array.from({ length: 12 }, (_, i) => (i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th`));
  const sortByOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Newest First"];

  useEffect(() => {
    let filtered = [...allProperties];
    if (selectedBadge) {
      filtered = filtered.filter((p) => {
        if (selectedBadge === "premium") return p.isPremium === true;
        if (selectedBadge === "new") return isPropertyNew(p) && p.isPremium === false;
        return true;
      });
    }
    if (selectedSortBy && selectedSortBy !== "Relevance") {
      const parsePrice = (s) => (s && s !== "₹XX" ? parseInt(String(s).replace(/[₹,]/g, "")) || 0 : 0);
      if (selectedSortBy === "Price: Low to High") filtered.sort((a, b) => parsePrice(a.discountedPrice) - parsePrice(b.discountedPrice));
      else if (selectedSortBy === "Price: High to Low") filtered.sort((a, b) => parsePrice(b.discountedPrice) - parsePrice(a.discountedPrice));
      else if (selectedSortBy === "Newest First") {
        filtered.sort((a, b) => {
          const dA = a.date_added ? new Date(a.date_added) : new Date(0);
          const dB = b.date_added ? new Date(b.date_added) : new Date(0);
          return dB - dA;
        });
      }
    }
    setFilteredProperties(filtered);
  }, [selectedSortBy, selectedBadge, allProperties]);

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdown]);

  const clearAllFilters = () => {
    setSelectedBadge("");
    setSelectedPropertyType("");
    setSelectedFacilities("");
    setSelectedFloorsOffered("");
    setSelectedSortBy("Relevance");
    setShowFilterPanel(false);
  };

  const toggleFavorite = async (e, property) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const pid = property._id || property.id;
    const isFav = favorites.includes(pid);
    const next = !isFav;
    setFavorites((prev) => (isFav ? prev.filter((id) => id !== pid) : [...prev, pid]));
    try {
      const local = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (next) {
        if (!local.some((f) => (f._id || f.id) === pid)) {
          local.push({ _id: pid, id: pid });
          localStorage.setItem("favorites", JSON.stringify(local));
        }
      } else {
        localStorage.setItem("favorites", JSON.stringify(local.filter((f) => (f._id || f.id) !== pid)));
      }
    } catch (_) {}
    if (currentUser.phoneNumber) {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPhoneNumber: currentUser.phoneNumber,
            propertyId: pid,
            propertyType: property.propertyType || "commercial",
            action: next ? "add" : "remove",
          }),
        });
        const data = await res.json();
        if (!data.success) setFavorites((prev) => (next ? prev.filter((id) => id !== pid) : [...prev, pid]));
      } catch (_) {
        setFavorites((prev) => (next ? prev.filter((id) => id !== pid) : [...prev, pid]));
      }
    }
  };

  const handleCityChange = (city) => {
    if (!city) {
      router.push(`/properties-search`);
    } else {
      const cityName = city.toLowerCase().replace(/\s+/g, '-');
      const cat = categoryParam || "commercial";
      router.push(`/properties-search/${cityName}/${cat}`);
    }
    setOpenDropdown(null);
  };

  const handleLoginSuccess = (userData) => {
    loginUser(userData);
    setIsLoginOpen(false);
  };

  const displayType = typeParam || (categoryParam === "residential" ? "Rent" : "Properties");
  const displayCity = capitalizeCity(cityParam) || "All Cities";

  // Use API results, or fallback to dummy properties for demo (always show something per city)
  const propertiesToShow = filteredProperties.length > 0 ? filteredProperties : getDummyPropertiesForCity(cityParam);

  if (isLoading) return <SearchPageSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        {/* Header row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {displayType} in {displayCity}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{propertiesToShow.length} results found</p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            {/* City dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown("city");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 flex-1 md:flex-initial"
              >
                {displayCity}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </button>
              {openDropdown === "city" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleCityChange("")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    All Cities
                  </div>
                  {indianCities.slice(0, 30).map((c) => (
                    <div
                      key={c}
                      onClick={() => handleCityChange(c)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Sort by */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown("sort");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 flex-1 md:flex-initial"
              >
                Sort by: {selectedSortBy}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </button>
              {openDropdown === "sort" && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {sortByOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedSortBy(opt);
                        setOpenDropdown(null);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Filter button */}
            <button
              type="button"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`inline-flex items-center justify-center rounded-lg text-sm font-medium border h-10 w-10 shrink-0 ${
                showFilterPanel || selectedBadge || selectedPropertyType || selectedFacilities || selectedFloorsOffered
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <ListFilter className="h-4 w-4" />
            </button>
            {/* Layout toggle - hidden on mobile */}
            <div className="hidden md:flex items-center bg-gray-200 rounded-lg p-1 ml-auto md:ml-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"
                }`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel (collapsible) */}
        {showFilterPanel && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 border border-red-200 text-red-600 rounded-full hover:bg-red-50 text-xs sm:text-sm"
              >
                Clear all
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("badge");
                  }}
                  className={`px-3 py-1.5 border rounded-full hover:bg-gray-50 text-xs sm:text-sm ${
                    selectedBadge ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  {selectedBadge || "Badge"}
                </button>
                {openDropdown === "badge" && (
                  <div className="absolute top-full left-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                    {badges.map((b) => (
                      <div key={b} onClick={() => { setSelectedBadge(b); setOpenDropdown(null); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {propertyTypes.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown("propType");
                    }}
                    className={`px-3 py-1.5 border rounded-full hover:bg-gray-50 text-xs sm:text-sm ${
                      selectedPropertyType ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    {selectedPropertyType || "Property Type"}
                  </button>
                  {openDropdown === "propType" && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                      {propertyTypes.map((t) => (
                        <div key={t} onClick={() => { setSelectedPropertyType(t); setOpenDropdown(null); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("fac");
                  }}
                  className={`px-3 py-1.5 border rounded-full hover:bg-gray-50 text-xs sm:text-sm ${
                    selectedFacilities ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  {selectedFacilities || "Facilities"}
                </button>
                {openDropdown === "fac" && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {facilities.map((f) => (
                      <div key={f} onClick={() => { setSelectedFacilities(f); setOpenDropdown(null); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("floors");
                  }}
                  className={`px-3 py-1.5 border rounded-full hover:bg-gray-50 text-xs sm:text-sm ${
                    selectedFloorsOffered ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  {selectedFloorsOffered || "Floors"}
                </button>
                {openDropdown === "floors" && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {floorsOffered.map((f) => (
                      <div key={f} onClick={() => { setSelectedFloorsOffered(f); setOpenDropdown(null); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Property cards grid */}
        <div className={`grid gap-6 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {propertiesToShow.map((property) => {
            const isResidential = (property.propertyCategory || property.propertyType || "").toLowerCase() === "residential";
            const propType = property.propertyType || typeParam || "commercial";
            
            // Clean URL: /property-details/[property-name]?id=[id]&type=[type]
            // We still need [id] if propertyName is not unique, but we can make the link look better
            const cleanSlug = property.name ? property.name.toLowerCase().replace(/\s+/g, '-') : (property.propertyName ? property.propertyName.toLowerCase().replace(/\s+/g, '-') : 'property');
            const detailUrl = `/property-details/${cleanSlug}`;
            const priceStr = property.priceDisplay || (property.pricePerSqft
              ? `₹${String(property.pricePerSqft).replace(/[₹,]/g, "")}/sqft`
              : (property.discountedPrice || property.originalPrice || "Contact for price"));
            const locStr = getLocationString(property);
            const statusBadge = getStatusBadge(property);
            const isFav = favorites.includes(property._id || property.id);

            return (
              <div
                key={property._id || property.id}
                className={`rounded-lg border bg-white text-gray-900 shadow-sm overflow-hidden transition-shadow duration-300 group h-full flex ${
                  viewMode === "list" ? "flex-row" : "flex-col"
                }`}
              >
                <Link href={detailUrl} className={`block shrink-0 ${viewMode === "list" ? "w-64" : "w-full"}`}>
                  <div className={`relative shrink-0 w-full overflow-hidden ${viewMode === "list" ? "h-48" : "aspect-[4/3]"}`}>
                    <img
                      src={property.featuredImageUrl || property.images?.[0] || property.img || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80"}
                      alt={safeDisplay(property.name)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="flex-1 flex flex-col p-4 min-w-0">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold capitalize mb-2 ${
                          isResidential
                            ? "border-transparent bg-blue-600 text-white"
                            : "border-transparent bg-gray-200 text-gray-800"
                        }`}
                      >
                        {isResidential ? <House className="h-3 w-3 mr-1" /> : <Building className="h-3 w-3 mr-1" />}
                        {isResidential ? "Residential" : "Commercial"}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(e, property)}
                        className="inline-flex items-center justify-center h-8 w-8 -mt-1 -mr-1 rounded-lg hover:bg-gray-100"
                      >
                        <Heart
                          className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`}
                          strokeWidth={isFav ? 0 : 2}
                        />
                      </button>
                    </div>
                    <Link href={detailUrl}>
                      <h3 className="font-bold text-base md:text-lg leading-tight truncate group-hover:underline">
                        {safeDisplay(property.name)}
                      </h3>
                    </Link>
                    {locStr && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {locStr}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-base md:text-lg text-blue-600">{safeDisplay(priceStr)}</p>
                    <span className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold text-gray-700 border-gray-200">
                      {statusBadge}
                    </span>
                  </div>
                  <Link
                    href={detailUrl}
                    className="items-center justify-center gap-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full mt-4 hidden md:inline-flex"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {!isLoading && propertiesToShow.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No properties found. Try adjusting your filters.</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onProceed={handleLoginSuccess} />}
    </div>
  );
}

export default function PropertiesSearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <PropertiesSearchContent />
    </Suspense>
  );
}
